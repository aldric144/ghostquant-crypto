"""
GhostQuant Voice Copilot - Demo Backend Endpoint
Provides synthetic but realistic GhostQuant responses for the Voice Copilot
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
import random


class CopilotAnswerResponse(BaseModel):
    """Response model for copilot answers - mirrors frontend CopilotAnswer interface"""
    text: str
    category: str = Field(description="Category: hydra, constellation, analytics, whales, widb, demo, ecoscan, onboarding, investor, general")
    context_summary: Optional[str] = None
    suggested_actions: Optional[List[str]] = None
    mode: str = Field(description="Mode: informational, navigation, explanation")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    demo_mode: bool = True


class CopilotQuestionRequest(BaseModel):
    """Request model for copilot questions"""
    question: str
    current_path: Optional[str] = "/"
    selected_address: Optional[str] = None
    selected_cluster_id: Optional[str] = None


# Knowledge base for demo responses
DEMO_KNOWLEDGE = {
    "hydra": {
        "keywords": ["hydra", "multi-head", "detection", "threat", "heads", "manipulation"],
        "responses": [
            "Hydra is GhostQuant's multi-head threat detection engine. It uses parallel analysis streams to detect different types of market manipulation simultaneously, including wash trading, spoofing, and coordinated pump-and-dump schemes.",
            "The Hydra engine currently has 5 active detection heads monitoring the market. Each head specializes in a specific threat pattern and provides real-time confidence scores for detected anomalies.",
            "Hydra's multi-head architecture allows us to process millions of transactions in real-time. Current detection rate is 94.7% with a false positive rate below 2%.",
        ],
    },
    "constellation": {
        "keywords": ["constellation", "fusion", "entity", "cluster", "network", "graph"],
        "responses": [
            "Constellation is our entity fusion engine that maps relationships between wallets, exchanges, and entities across multiple blockchains. It reveals hidden connections and coordinated behavior patterns.",
            "The Constellation engine has identified 847 active entity clusters in the current market. 23 of these clusters show signs of coordinated activity that warrant monitoring.",
            "Constellation uses advanced graph analysis to detect when seemingly unrelated wallets are controlled by the same entity. This is crucial for identifying manipulation networks.",
        ],
    },
    "analytics": {
        "keywords": ["analytics", "dashboard", "metrics", "risk", "market", "trends"],
        "responses": [
            "The Analytics Dashboard provides real-time market intelligence including global risk indices, whale activity metrics, entity classifications, and AI-generated narrative summaries.",
            "Current global risk index is at 47, indicating moderate market conditions. Whale activity is 12% above the 30-day average, with net positive flows into major assets.",
            "Our analytics show elevated activity in DeFi protocols over the past 24 hours. The manipulation pressure index has increased by 8 points since yesterday.",
        ],
    },
    "whales": {
        "keywords": ["whale", "large holder", "big wallet", "whale tracking"],
        "responses": [
            "GhostQuant's Whale Intelligence system tracks large cryptocurrency holders and their movements. We currently monitor over 2,400 whale wallets across major chains.",
            "Whale activity in the past 24 hours shows accumulation patterns in BTC and ETH. Three major whale clusters have moved a combined $847M in the last 6 hours.",
            "Our whale tracking algorithms have detected unusual movement patterns from a known accumulation wallet. This could signal upcoming market volatility.",
        ],
    },
    "general": {
        "keywords": ["ghostquant", "platform", "what", "how", "explain", "help"],
        "responses": [
            "GhostQuant is a private crypto-native research and signal platform providing institutional-grade market intelligence, threat detection, and entity analysis.",
            "I can help you understand any GhostQuant feature. Try asking about Hydra, Constellation, whale tracking, or the Analytics Dashboard.",
            "GhostQuant combines real-time blockchain analysis with advanced machine learning to detect market manipulation and assess entity risk.",
        ],
    },
    "investor": {
        "keywords": ["investor", "pitch", "briefing", "presentation"],
        "responses": [
            "Here's your intelligence briefing: GhostQuant is monitoring elevated market activity with Hydra detecting multiple coordination patterns. Whale movements are above average with significant accumulation in major assets. Overall market risk is moderate.",
            "GhostQuant is the Bloomberg Terminal for crypto intelligence. We help institutions navigate cryptocurrency markets with confidence through real-time threat detection and entity analysis.",
            "Our platform processes millions of transactions daily, providing actionable intelligence that helps clients make informed decisions and maintain regulatory compliance.",
        ],
    },
}

# Context-aware templates
CONTEXT_TEMPLATES = {
    "/terminal/hydra": "You're viewing the Hydra Console, our multi-head threat detection engine.",
    "/terminal/constellation": "You're on the Constellation page, showing entity relationships and cluster analysis.",
    "/terminal/analytics": "You're viewing the Analytics Dashboard with real-time market intelligence.",
    "/terminal/whales": "You're on the Whale Intelligence page, tracking large holder movements.",
    "/terminal/whale-intel": "You're viewing the Whale Intelligence Database with entity profiles.",
    "/terminal/graph": "You're on the Influence Graph, visualizing entity connections.",
    "/terminal/map": "You're viewing the Global Threat Map with geographic risk distribution.",
}


def classify_question(question: str) -> str:
    """Classify the question into a category"""
    lower_question = question.lower()
    
    for category, data in DEMO_KNOWLEDGE.items():
        if any(keyword in lower_question for keyword in data["keywords"]):
            return category
    
    return "general"


def get_context_response(path: str) -> str:
    """Get context-aware response based on current path"""
    return CONTEXT_TEMPLATES.get(path, "You're using the GhostQuant Intelligence Terminal.")


def get_demo_copilot_answer(request: CopilotQuestionRequest) -> CopilotAnswerResponse:
    """
    Generate a demo copilot answer based on the question and context
    """
    question = request.question.lower()
    category = classify_question(request.question)
    
    # Handle context queries
    if any(phrase in question for phrase in ["this screen", "this page", "where am i", "what am i looking at"]):
        context_text = get_context_response(request.current_path or "/")
        if request.selected_address:
            context_text += f" You're examining address {request.selected_address[:10]}..."
        if request.selected_cluster_id:
            context_text += f" Cluster {request.selected_cluster_id} is selected."
        
        return CopilotAnswerResponse(
            text=context_text,
            category="general",
            context_summary=request.current_path,
            mode="informational",
        )
    
    # Handle briefing requests
    if "briefing" in question or "30 second" in question:
        return CopilotAnswerResponse(
            text=DEMO_KNOWLEDGE["investor"]["responses"][0],
            category="investor",
            mode="informational",
            suggested_actions=["View Analytics Dashboard", "Check Whale Activity"],
        )
    
    # Handle feature queries
    if "feature" in question or "capabilities" in question:
        knowledge = DEMO_KNOWLEDGE.get(category, DEMO_KNOWLEDGE["general"])
        return CopilotAnswerResponse(
            text=random.choice(knowledge["responses"]),
            category=category,
            mode="informational",
        )
    
    # Handle navigation requests
    if any(phrase in question for phrase in ["show me", "go to", "navigate"]):
        destination = ""
        path = ""
        
        if "analytics" in question or "dashboard" in question:
            destination = "Analytics Dashboard"
            path = "/terminal/analytics"
        elif "hydra" in question:
            destination = "Hydra Console"
            path = "/terminal/hydra"
        elif "whale" in question:
            destination = "Whale Intelligence"
            path = "/terminal/whales"
        elif "constellation" in question or "graph" in question:
            destination = "Constellation Graph"
            path = "/terminal/constellation"
        
        if destination:
            return CopilotAnswerResponse(
                text=f"I'll take you to the {destination}. You can find it in the terminal sidebar.",
                category=category,
                mode="navigation",
                suggested_actions=[f"Navigate to {path}"],
            )
    
    # Default: return a response from the appropriate category
    knowledge = DEMO_KNOWLEDGE.get(category, DEMO_KNOWLEDGE["general"])
    response_text = random.choice(knowledge["responses"])
    
    return CopilotAnswerResponse(
        text=response_text,
        category=category,
        context_summary=get_context_response(request.current_path or "/"),
        mode="informational",
    )
