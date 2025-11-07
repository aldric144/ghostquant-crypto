# GhostQuant Insights & IQ Meter - Operations Runbook

## Overview

Phase 10 adds AI-powered natural language interpretation and learning confidence visualization to GhostQuant-Crypto. This runbook covers the AI Insight Panel and IQ Meter Dashboard components.

## Components

### 1. AI Insight Panel

**Purpose**: Slide-in panel that interprets market signals in plain language by combining AlphaBrain and Ecoscan data.

**Location**: Right-side overlay accessible from any page via "Insights" button in navigation bar.

**Features**:
- Natural language market summaries (3-5 sentences)
- Real-time data from AlphaBrain + Ecoscan APIs
- Speech synthesis for audio playback
- Framer Motion slide-in animation
- Glass-blur background with gold accent border

**Data Sources**:
- `/alphabrain/summary` - Macro regime, top assets, confidence
- `/ecoscan/summary` - Ecosystem momentum, whale activity, WCF

### 2. IQ Meter Dashboard

**Purpose**: Visualize GhostQuant's learning confidence, signal accuracy, and reward metrics.

**Location**: `/iqmeter` page accessible from navigation bar.

**Features**:
- Confidence gauge (0-100% arc visualization)
- Signal accuracy bar (7-day rolling accuracy)
- Reward rate display (reinforcement learning metrics)
- Training statistics (iterations, last update, status)
- Institutional IQ Mode (triggered when confidence > 80%)
- Animated progress bars with emerald→gold gradients
- Auto-refresh every 30 seconds

**Data Source**:
- `/metrics/learning` - Learning confidence and performance metrics

## API Endpoints

### GET /metrics/learning

Returns GhostQuant's learning confidence and performance metrics.

**Endpoint**: `http://localhost:8080/metrics/learning`

**Response Schema**:
```json
{
  "model_confidence_avg": 0.77,
  "reward_rate": 0.05,
  "signal_accuracy_7d": 0.73,
  "training_iterations": 2564,
  "last_update": "2025-11-07T20:15:30.123Z"
}
```

**Fields**:
- `model_confidence_avg` (float 0-1): Average confidence across all models
- `reward_rate` (float): Recent reward rate from reinforcement learning
- `signal_accuracy_7d` (float 0-1): 7-day rolling signal accuracy
- `training_iterations` (int): Total training iterations completed
- `last_update` (ISO 8601 timestamp): Last model update time

**Example**:
```bash
curl http://localhost:8080/metrics/learning
```

## Confidence Levels

The IQ Meter Dashboard displays different states based on `model_confidence_avg`:

| Confidence Range | Level | Color | Glow Effect | Description |
|-----------------|-------|-------|-------------|-------------|
| 0.0 - 0.6 | Learning | Blue | No | Model is actively learning patterns |
| 0.6 - 0.8 | Adapting | Yellow | No | Model is adapting to market conditions |
| 0.8 - 1.0 | Institutional IQ Mode | Emerald | Yes | High confidence, institutional-grade signals |

**Institutional IQ Mode**:
- Triggered when `model_confidence_avg > 0.8`
- Displays emerald glow effect with pulsing animation
- Indicates GhostQuant is operating at peak performance
- Signals align across AlphaBrain + Ecoscan + WhaleFlows

## Natural Language Generation

The Insight Panel generates natural language summaries using a local stub (replaceable with OpenAI/LLM API).

**Summary Structure**:
1. **Regime Assessment**: Bullish/Bearish/Neutral based on AlphaBrain regime
2. **Top Asset**: Strongest signal from AlphaBrain portfolio
3. **Ecosystem Momentum**: EMI score and top ecosystem from Ecoscan
4. **Whale Activity**: Accumulation/Distribution based on WCF
5. **Confidence Level**: AlphaFusion confidence percentage
6. **Recommendation**: Bullish bias or cautious positioning

**Example Output**:
```
Market regime is bullish with ETH showing strongest signals. Arbitrum ecosystem 
displays strong momentum (EMI: 78.5). Whale inflows suggest smart money is 
accumulating with WCF at 65.2. AlphaFusion High confidence: 82% - Bullish bias 
confirmed.
```

## Data Flow

### Insight Panel Data Flow

```
┌─────────────────┐
│  User clicks    │
│  "Insights"     │
│  button         │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  InsightPanel.tsx                       │
│  - Fetch /alphabrain/summary            │
│  - Fetch /ecoscan/summary               │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Extract Key Data                       │
│  - Regime (risk_on/risk_off/neutral)    │
│  - Top asset from portfolio             │
│  - AlphaFusion confidence               │
│  - Top ecosystem by EMI                 │
│  - Whale activity (accumulation/dist)   │
│  - WCF score                            │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Generate Natural Language Summary      │
│  - Regime text (bullish/bearish)        │
│  - Whale text (accumulation/dist)       │
│  - EMI text (strong/moderate/weak)      │
│  - Confidence text (high/moderate/low)  │
│  - Compose 3-5 sentence summary         │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Display in Panel                       │
│  - Slide-in animation (x: 400→0)        │
│  - Show summary with lightbulb icon     │
│  - Display key metrics with progress    │
│  - Enable "Speak Insight" button        │
└─────────────────────────────────────────┘
```

### IQ Meter Data Flow

```
┌─────────────────┐
│  User visits    │
│  /iqmeter       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  IQMeterPage.tsx                        │
│  - Fetch /metrics/learning              │
│  - Auto-refresh every 30s               │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Process Metrics                        │
│  - Calculate confidence level           │
│  - Determine accuracy color gradient    │
│  - Check for Institutional IQ Mode      │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Render Dashboard                       │
│  - Confidence arc gauge (SVG)           │
│  - Animated progress bars               │
│  - Training statistics grid             │
│  - Glow effect if confidence > 0.8      │
└─────────────────────────────────────────┘
```

## Update Schedule

### Real-time Updates

- **Insight Panel**: Fetches fresh data on each open (user-triggered)
- **IQ Meter**: Auto-refreshes every 30 seconds when page is active

### Backend Update Frequency

- **Learning Metrics** (`/metrics/learning`): Updated every 60 seconds by signals service
- **AlphaBrain Summary**: Updated every 5 minutes by AlphaBrain service
- **Ecoscan Summary**: Updated every 5 minutes by Ecoscan service

## Configuration

### Environment Variables

No additional environment variables required. Uses existing API base URLs:

```bash
# Web service (.env)
NEXT_PUBLIC_API_BASE=http://localhost:8080
NEXT_PUBLIC_ALPHABRAIN_API=http://localhost:8081
```

### Mock Data Mode

The `/metrics/learning` endpoint currently returns mock data. To integrate with real AlphaBrain metrics:

1. Update `/api/app/routers/metrics.py`
2. Query AlphaBrain database tables:
   - `regime_history` - For model confidence
   - `portfolio_allocations` - For signal accuracy
   - `alphabrain_reports` - For reward rate

**Example Integration**:
```python
# In /api/app/routers/metrics.py
from app.db import get_db_pool

@router.get("/learning")
async def get_learning_metrics():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Get latest AlphaBrain confidence
        confidence = await conn.fetchval(
            "SELECT AVG(confidence) FROM regime_history WHERE ts > NOW() - INTERVAL '1 hour'"
        )
        
        # Get signal accuracy from backtests
        accuracy = await conn.fetchval(
            "SELECT AVG(CASE WHEN pnl > 0 THEN 1.0 ELSE 0.0 END) "
            "FROM trades WHERE ts > NOW() - INTERVAL '7 days'"
        )
        
        # Return real metrics
        return {
            "model_confidence_avg": confidence or 0.5,
            "reward_rate": 0.05,  # From RL agent
            "signal_accuracy_7d": accuracy or 0.5,
            "training_iterations": 2564,
            "last_update": datetime.utcnow().isoformat() + "Z"
        }
```

## Framer Motion Animations

### Insight Panel Animations

**Slide-in Animation**:
```typescript
initial={{ x: 400, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
exit={{ x: 400, opacity: 0 }}
transition={{ type: 'spring', damping: 25, stiffness: 200 }}
```

**Backdrop Fade**:
```typescript
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
```

### IQ Meter Animations

**Confidence Arc**:
```typescript
strokeDasharray="251.2"
initial={{ strokeDashoffset: 251.2 }}
animate={{ strokeDashoffset: 251.2 - (251.2 * confidence) }}
transition={{ duration: 1.5, ease: "easeOut" }}
```

**Progress Bars**:
```typescript
initial={{ width: 0 }}
animate={{ width: `${percentage}%` }}
transition={{ duration: 1.2, ease: "easeOut" }}
```

**Glow Pulse** (Institutional IQ Mode):
```typescript
animate={{ opacity: [0.3, 0.6, 0.3] }}
transition={{ duration: 2, repeat: Infinity }}
```

## Troubleshooting

### Insight Panel Not Opening

**Symptom**: Clicking "Insights" button does nothing.

**Diagnosis**:
1. Check browser console for React errors
2. Verify Framer Motion is installed: `npm list framer-motion`
3. Check layout.tsx has InsightPanel component imported

**Solution**:
```bash
cd /home/ubuntu/ghostquant-crypto/web
npm install framer-motion
docker compose up -d --build web
```

### No Data in Insight Panel

**Symptom**: Panel opens but shows "Unable to fetch market insights".

**Diagnosis**:
1. Check AlphaBrain service is running: `docker compose ps alphabrain`
2. Check Ecoscan service is running: `docker compose ps ecoscan`
3. Test endpoints manually:
   ```bash
   curl http://localhost:8081/alphabrain/summary
   curl http://localhost:8082/ecoscan/summary
   ```

**Solution**:
```bash
# Restart services
docker compose restart alphabrain ecoscan

# Check logs
docker compose logs alphabrain
docker compose logs ecoscan
```

### IQ Meter Shows Loading Forever

**Symptom**: IQ Meter page shows spinner indefinitely.

**Diagnosis**:
1. Check API service is running: `docker compose ps api`
2. Test metrics endpoint:
   ```bash
   curl http://localhost:8080/metrics/learning
   ```
3. Check browser console for CORS errors

**Solution**:
```bash
# Restart API service
docker compose restart api

# Check API logs
docker compose logs api

# Verify CORS is enabled in /api/app/main.py
```

### Animations Not Working

**Symptom**: Components appear instantly without smooth animations.

**Diagnosis**:
1. Check Framer Motion version: `npm list framer-motion`
2. Verify browser supports CSS animations
3. Check for conflicting CSS transitions

**Solution**:
```bash
# Update Framer Motion
cd /home/ubuntu/ghostquant-crypto/web
npm install framer-motion@latest
docker compose up -d --build web
```

### Speech Synthesis Not Working

**Symptom**: "Speak Insight" button does nothing or shows error.

**Diagnosis**:
1. Check browser supports Web Speech API
2. Verify browser permissions for speech synthesis
3. Check browser console for errors

**Solution**:
- Use Chrome/Edge (best support for Web Speech API)
- Grant microphone permissions if prompted
- Note: Speech synthesis is a browser feature, not server-side

## Performance Optimization

### Caching Strategy

**Insight Panel**:
- Data fetched on-demand (user opens panel)
- No automatic background refresh
- User can manually refresh with "Refresh Insights" button

**IQ Meter**:
- Auto-refresh every 30 seconds
- Uses React useEffect cleanup to prevent memory leaks
- Pauses refresh when user navigates away

### Network Optimization

**Parallel Requests**:
```typescript
// Insight Panel fetches AlphaBrain + Ecoscan in parallel
const [alphaBrainRes, ecoscanRes] = await Promise.all([
  fetch('/alphabrain/summary'),
  fetch('/ecoscan/summary')
])
```

**Error Handling**:
- Graceful degradation if one service is down
- Displays partial data if available
- Shows user-friendly error messages

## Security Considerations

### Data Privacy

- No user authentication required (as per Phase 10 scope)
- No personal data collected or stored
- All data is aggregated market metrics

### API Security

- CORS enabled for localhost development
- No sensitive credentials exposed in frontend
- API keys stored in backend .env files only

### XSS Prevention

- All user-facing text is sanitized
- React automatically escapes JSX content
- No `dangerouslySetInnerHTML` used

## Monitoring

### Health Checks

**API Service**:
```bash
curl http://localhost:8080/health
curl http://localhost:8080/metrics/learning
```

**AlphaBrain Service**:
```bash
curl http://localhost:8081/health
curl http://localhost:8081/alphabrain/summary
```

**Ecoscan Service**:
```bash
curl http://localhost:8082/health
curl http://localhost:8082/ecoscan/summary
```

### Logs

**View Insight Panel Errors**:
```bash
# Browser console (F12 in Chrome/Firefox)
# Look for fetch errors or React warnings
```

**View API Logs**:
```bash
docker compose logs api | grep metrics
docker compose logs alphabrain | grep summary
docker compose logs ecoscan | grep summary
```

## Future Enhancements

### LLM Integration

Replace local natural language stub with OpenAI/Anthropic API:

```typescript
// In InsightPanel.tsx
const generateInsight = async (alphaBrain, ecoscan) => {
  const prompt = `Analyze this crypto market data and provide a 3-5 sentence summary:
    Regime: ${alphaBrain.regime}
    Top Asset: ${alphaBrain.top_asset}
    Confidence: ${alphaBrain.confidence}
    Ecosystem: ${ecoscan.top_ecosystem}
    EMI: ${ecoscan.emi_score}
    Whale Activity: ${ecoscan.whale_activity}
    WCF: ${ecoscan.wcf}`
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    })
  })
  
  const data = await response.json()
  return data.choices[0].message.content
}
```

### Voice Integration

Replace browser speech synthesis with ElevenLabs API:

```typescript
// In InsightPanel.tsx
const handleSpeak = async () => {
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/voice-id', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: insight,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    })
  })
  
  const audioBlob = await response.blob()
  const audioUrl = URL.createObjectURL(audioBlob)
  const audio = new Audio(audioUrl)
  audio.play()
}
```

### Historical Confidence Tracking

Add confidence trend chart to IQ Meter:

```typescript
// Fetch historical confidence data
const [history, setHistory] = useState([])

useEffect(() => {
  fetch('/metrics/learning/history?lookback_hours=24')
    .then(res => res.json())
    .then(data => setHistory(data))
}, [])

// Render with Plotly or Chart.js
<LineChart
  data={history}
  x="timestamp"
  y="model_confidence_avg"
  title="24h Confidence Trend"
/>
```

## Support

For issues or questions:
1. Check this runbook first
2. Review browser console for errors
3. Check service logs: `docker compose logs [service]`
4. Verify all services are healthy: `docker compose ps`
5. Refer to main README.md for general troubleshooting

## Related Documentation

- [Main README](../README.md)
- [AlphaBrain Runbook](RUNBOOK_ALPHABRAIN.md)
- [Ecoscan Runbook](RUNBOOK_ECOSCAN.md)
- [API Documentation](http://localhost:8080/docs)
