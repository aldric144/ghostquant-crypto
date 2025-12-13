"""
STT Proxy Router - Server-side proxy for ElevenLabs Speech-to-Text

This module provides a WebSocket proxy that:
1. Accepts audio streams from the browser
2. Forwards them to ElevenLabs Realtime STT API
3. Returns transcription events back to the browser

This eliminates domain restrictions and secures the API key server-side.

Logging prefix: [STTProxy]
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import websockets
import json
import base64
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stt", tags=["STT Proxy"])

# ElevenLabs STT WebSocket URL
ELEVENLABS_STT_URL = "wss://api.elevenlabs.io/v1/speech-to-text/realtime"

# Default configuration
DEFAULT_MODEL_ID = "scribe_v2_realtime"
DEFAULT_SAMPLE_RATE = 16000
DEFAULT_LANGUAGE_CODE = "en"


def get_elevenlabs_api_key() -> str | None:
    """Get ElevenLabs API key from environment."""
    return os.getenv("ELEVENLABS_API_KEY")


@router.websocket("/stream")
async def stt_stream_proxy(websocket: WebSocket):
    """
    WebSocket proxy for ElevenLabs Speech-to-Text.
    
    Protocol:
    1. Client connects to this endpoint
    2. Client sends initial config message (optional):
       {"type": "config", "language": "en", "model": "scribe_v2_realtime"}
    3. Client sends raw PCM16 audio bytes (16kHz mono)
    4. Server forwards audio to ElevenLabs
    5. Server forwards transcript events back to client:
       - {"message_type": "session_started", "session_id": "..."}
       - {"message_type": "partial_transcript", "text": "..."}
       - {"message_type": "committed_transcript", "text": "..."}
       - {"message_type": "error", "error": "..."}
    """
    await websocket.accept()
    logger.info("[STTProxy] Client connected")
    
    api_key = get_elevenlabs_api_key()
    if not api_key:
        logger.error("[STTProxy] No ELEVENLABS_API_KEY configured")
        await websocket.send_json({
            "message_type": "error",
            "error": "Server STT not configured - missing API key"
        })
        await websocket.close(code=1011, reason="Server STT misconfigured")
        return
    
    # Default config - can be overridden by client's first message
    config = {
        "model_id": DEFAULT_MODEL_ID,
        "language_code": DEFAULT_LANGUAGE_CODE,
        "sample_rate": DEFAULT_SAMPLE_RATE,
    }
    
    eleven_ws = None
    client_to_eleven_task = None
    eleven_to_client_task = None
    
    try:
        # Wait for optional config message or first audio
        try:
            first_message = await asyncio.wait_for(
                websocket.receive(),
                timeout=5.0
            )
            
            if "text" in first_message:
                # JSON config message
                try:
                    config_data = json.loads(first_message["text"])
                    if config_data.get("type") == "config":
                        config["language_code"] = config_data.get("language", DEFAULT_LANGUAGE_CODE)
                        config["model_id"] = config_data.get("model", DEFAULT_MODEL_ID)
                        config["sample_rate"] = config_data.get("sample_rate", DEFAULT_SAMPLE_RATE)
                        logger.info(f"[STTProxy] Config received: {config}")
                except json.JSONDecodeError:
                    pass
            elif "bytes" in first_message:
                # First audio chunk - will be processed after connection
                pass
        except asyncio.TimeoutError:
            # No config message, use defaults
            pass
        
        # Build ElevenLabs WebSocket URL with query parameters
        params = {
            "model_id": config["model_id"],
            "language_code": config["language_code"],
            "audio_format": f"pcm_{config['sample_rate']}",
            "commit_strategy": "vad",
            "vad_silence_threshold_secs": "1.5",
        }
        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        eleven_url = f"{ELEVENLABS_STT_URL}?{query_string}"
        
        logger.info(f"[STTProxy] Connecting to ElevenLabs: {eleven_url}")
        
        # Connect to ElevenLabs with API key header
        eleven_ws = await websockets.connect(
            eleven_url,
            additional_headers={"xi-api-key": api_key},
        )
        logger.info("[STTProxy] Connected to ElevenLabs")
        
        # Notify client that we're ready
        await websocket.send_json({
            "message_type": "proxy_ready",
            "config": config
        })
        
        async def client_to_eleven():
            """Forward audio from browser to ElevenLabs."""
            try:
                while True:
                    message = await websocket.receive()
                    
                    if "bytes" in message:
                        # Raw PCM audio bytes from browser
                        audio_bytes = message["bytes"]
                        
                        # Base64 encode and wrap in ElevenLabs format
                        b64_audio = base64.b64encode(audio_bytes).decode("ascii")
                        eleven_message = {
                            "message_type": "input_audio_chunk",
                            "audio_base_64": b64_audio,
                            "commit": False,
                            "sample_rate": config["sample_rate"],
                        }
                        await eleven_ws.send(json.dumps(eleven_message))
                        
                    elif "text" in message:
                        # Control message from browser
                        try:
                            data = json.loads(message["text"])
                            if data.get("type") == "commit":
                                # Manual commit request
                                await eleven_ws.send(json.dumps({
                                    "message_type": "commit_audio"
                                }))
                            elif data.get("type") == "stop":
                                # Stop signal
                                logger.info("[STTProxy] Stop signal received")
                                break
                        except json.JSONDecodeError:
                            pass
                            
            except WebSocketDisconnect:
                logger.info("[STTProxy] Client disconnected")
            except Exception as e:
                logger.error(f"[STTProxy] client_to_eleven error: {e}")
        
        async def eleven_to_client():
            """Forward transcripts from ElevenLabs to browser."""
            try:
                async for message in eleven_ws:
                    try:
                        data = json.loads(message)
                        msg_type = data.get("message_type", "")
                        
                        # Forward relevant events to client
                        if msg_type in [
                            "session_started",
                            "partial_transcript", 
                            "committed_transcript",
                            "committed_transcript_with_timestamps",
                            "error"
                        ]:
                            await websocket.send_json(data)
                            
                            if msg_type == "partial_transcript":
                                text = data.get("text", "")
                                if text:
                                    logger.debug(f"[STTProxy] Partial: {text[:50]}...")
                            elif msg_type in ["committed_transcript", "committed_transcript_with_timestamps"]:
                                text = data.get("text", "")
                                if text:
                                    logger.info(f"[STTProxy] Final: {text}")
                            elif msg_type == "error":
                                logger.error(f"[STTProxy] ElevenLabs error: {data}")
                                
                    except json.JSONDecodeError:
                        logger.warning(f"[STTProxy] Invalid JSON from ElevenLabs: {message[:100]}")
                        
            except websockets.exceptions.ConnectionClosed:
                logger.info("[STTProxy] ElevenLabs connection closed")
            except Exception as e:
                logger.error(f"[STTProxy] eleven_to_client error: {e}")
        
        # Run both directions concurrently
        client_to_eleven_task = asyncio.create_task(client_to_eleven())
        eleven_to_client_task = asyncio.create_task(eleven_to_client())
        
        # Wait for either task to complete
        done, pending = await asyncio.wait(
            [client_to_eleven_task, eleven_to_client_task],
            return_when=asyncio.FIRST_COMPLETED
        )
        
        # Cancel pending tasks
        for task in pending:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
                
    except websockets.exceptions.InvalidStatusCode as e:
        logger.error(f"[STTProxy] ElevenLabs connection failed: {e}")
        try:
            await websocket.send_json({
                "message_type": "error",
                "error": f"ElevenLabs connection failed: {e}"
            })
        except Exception:
            pass
    except Exception as e:
        logger.error(f"[STTProxy] Proxy error: {e}")
        try:
            await websocket.send_json({
                "message_type": "error",
                "error": str(e)
            })
        except Exception:
            pass
    finally:
        # Cleanup
        if eleven_ws:
            try:
                await eleven_ws.close()
            except Exception:
                pass
        
        try:
            await websocket.close()
        except Exception:
            pass
            
        logger.info("[STTProxy] Connection closed")


@router.get("/health")
async def stt_health():
    """Check if STT proxy is configured and ready."""
    api_key = get_elevenlabs_api_key()
    return {
        "status": "ok" if api_key else "not_configured",
        "api_key_present": bool(api_key),
        "elevenlabs_url": ELEVENLABS_STT_URL,
    }
