"""
Valkyrie Threat Warning System™ - Alert Classifier
Implements 15+ trigger type classifications with explanations
"""

import logging
from typing import Dict, Any
from .valkyrie_schema import ValkyrieTrigger

logger = logging.getLogger(__name__)


class AlertClassifier:
    """
    Classifies alerts into 15+ trigger types with detailed explanations
    """
    
    TRIGGER_TYPES = [
        "Manipulation Spike",
        "Coordinated Actor Signature",
        "High-Risk Entity",
        "Syndicate Behavior",
        "Chain Pressure",
        "Volatility Surge",
        "Actor Escalation",
        "Ring Formation",
        "Cross-Chain Synchronization",
        "High-Entropy Behavior",
        "Insider Pattern",
        "Dormant Activation",
        "Ghost Signatures",
        "Predator Signature",
        "Arbitrage Cluster",
        "Whale Movement",
        "Pump-Dump Pattern",
        "Wash Trading Detection"
    ]
    
    def __init__(self):
        """Initialize classifier"""
        logger.info("[Valkyrie] AlertClassifier initialized")
    
    def classify(self, trigger: ValkyrieTrigger) -> str:
        """
        Classify trigger into specific type based on metadata
        
        Args:
            trigger: ValkyrieTrigger object
            
        Returns:
            Classified trigger type string
        """
        try:
            metadata = trigger.metadata
            
            actor = metadata.get("actor", {})
            actor_type = actor.get("actor_type", "")
            
            if actor_type == "PREDATOR":
                return "Predator Signature"
            elif actor_type == "SYNDICATE":
                return "Syndicate Behavior"
            elif actor_type == "GHOST":
                return "Ghost Signatures"
            elif actor_type == "INSIDER":
                return "Insider Pattern"
            elif actor_type == "WHALE":
                return "Whale Movement"
            elif actor_type == "MANIPULATOR":
                return "Manipulation Spike"
            elif actor_type == "ARBITRAGE BOT":
                return "Arbitrage Cluster"
            
            fusion = metadata.get("fusion", {})
            if fusion:
                manipulation_mode = fusion.get("manipulation_mode", "")
                if manipulation_mode == "pump_dump":
                    return "Pump-Dump Pattern"
                elif manipulation_mode == "wash_trading":
                    return "Wash Trading Detection"
                elif fusion.get("manipulation_detected"):
                    return "Manipulation Spike"
            
            correlation = metadata.get("correlation", {})
            if correlation:
                cluster_size = correlation.get("cluster_size", 0)
                if cluster_size >= 5:
                    return "Coordinated Actor Signature"
                elif cluster_size >= 3:
                    return "Ring Formation"
            
            radar = metadata.get("radar", {})
            if radar:
                manipulation_score = radar.get("manipulation_score", 0)
                if manipulation_score >= 0.7:
                    return "Chain Pressure"
            
            dna = metadata.get("dna", {})
            if dna:
                archetype = dna.get("archetype", "")
                burstiness = dna.get("burstiness", 0)
                
                if burstiness >= 0.7:
                    return "High-Entropy Behavior"
                
                if archetype in ["PREDATOR", "MANIPULATOR"]:
                    return "High-Entropy Behavior"
            
            prediction = metadata.get("prediction", {})
            if prediction:
                volatility = prediction.get("volatility_score", 0)
                if volatility >= 0.7:
                    return "Volatility Surge"
            
            chain = metadata.get("chain", {})
            if chain:
                chain_count = chain.get("chain_count", 0)
                if chain_count >= 3:
                    return "Cross-Chain Synchronization"
            
            history = metadata.get("history", {})
            if history:
                dormancy = history.get("dormancy_period_days", 0)
                if dormancy >= 30:
                    return "Dormant Activation"
            
            if trigger.score >= 0.7:
                return "High-Risk Entity"
            elif trigger.score >= 0.5:
                return "Actor Escalation"
            else:
                return "Coordinated Actor Signature"
            
        except Exception as e:
            logger.error(f"[Valkyrie] Error classifying trigger: {e}")
            return "High-Risk Entity"
    
    def explain(self, trigger: ValkyrieTrigger) -> str:
        """
        Generate detailed explanation for trigger type
        
        Args:
            trigger: ValkyrieTrigger object
            
        Returns:
            Detailed explanation string
        """
        try:
            trigger_type = self.classify(trigger)
            
            explanations = {
                "Manipulation Spike": "Detected sudden increase in manipulation indicators across multiple domains. This pattern suggests coordinated market manipulation attempts with elevated risk of price distortion.",
                
                "Coordinated Actor Signature": "Multiple entities exhibiting synchronized behavior patterns. This coordination suggests potential collusion or organized manipulation activity requiring immediate monitoring.",
                
                "High-Risk Entity": "Entity displaying multiple high-risk indicators across intelligence domains. Elevated threat level warrants enhanced surveillance and risk mitigation protocols.",
                
                "Syndicate Behavior": "Large-scale coordinated cluster activity detected. This pattern indicates organized syndicate operations with potential for significant market impact.",
                
                "Chain Pressure": "Elevated manipulation pressure detected on blockchain. This indicates systematic attempts to influence chain-level metrics and market conditions.",
                
                "Volatility Surge": "Abnormal volatility patterns detected with high prediction risk. This suggests potential market instability or manipulation-induced price movements.",
                
                "Actor Escalation": "Threat actor behavior escalating beyond normal parameters. This pattern indicates increasing aggression or coordination requiring immediate attention.",
                
                "Ring Formation": "Circular transaction patterns detected among coordinated entities. This classic manipulation technique suggests wash trading or artificial volume generation.",
                
                "Cross-Chain Synchronization": "Synchronized activity detected across multiple blockchains. This sophisticated pattern indicates advanced coordination capabilities.",
                
                "High-Entropy Behavior": "Chaotic, aggressive behavior patterns detected. This indicates predatory or manipulative intent with unpredictable risk characteristics.",
                
                "Insider Pattern": "Low-frequency, high-precision timing patterns detected. This suggests potential insider information exploitation with strategic positioning.",
                
                "Dormant Activation": "Previously dormant entity suddenly activated with burst activity. This pattern often precedes significant market events or coordinated operations.",
                
                "Ghost Signatures": "Stealth actor patterns detected with dormant-burst characteristics. This sophisticated behavior suggests advanced threat actor capabilities.",
                
                "Predator Signature": "Aggressive predatory behavior patterns detected. This indicates high-risk manipulation attempts with potential for rapid market impact.",
                
                "Arbitrage Cluster": "High-frequency precision trading patterns detected. While potentially legitimate, this activity warrants monitoring for manipulation indicators.",
                
                "Whale Movement": "Large-value entity activity detected. Significant capital movements may indicate market-moving intentions requiring close observation.",
                
                "Pump-Dump Pattern": "Classic pump-and-dump manipulation pattern detected. This coordinated scheme involves artificial price inflation followed by rapid sell-off.",
                
                "Wash Trading Detection": "Self-trading patterns detected to create artificial volume. This manipulation technique falsely inflates trading activity metrics."
            }
            
            return explanations.get(trigger_type, "Threat pattern detected requiring investigation.")
            
        except Exception as e:
            logger.error(f"[Valkyrie] Error explaining trigger: {e}")
            return "Threat pattern detected requiring investigation."
    
    def quick_summary(self, trigger: ValkyrieTrigger) -> str:
        """
        Generate quick one-line summary for trigger
        
        Args:
            trigger: ValkyrieTrigger object
            
        Returns:
            Quick summary string
        """
        try:
            trigger_type = self.classify(trigger)
            score = trigger.score
            
            summaries = {
                "Manipulation Spike": f"Manipulation indicators spiking (risk: {score:.2f})",
                "Coordinated Actor Signature": f"Coordinated cluster detected (risk: {score:.2f})",
                "High-Risk Entity": f"High-risk entity identified (risk: {score:.2f})",
                "Syndicate Behavior": f"Syndicate operations detected (risk: {score:.2f})",
                "Chain Pressure": f"Chain manipulation pressure elevated (risk: {score:.2f})",
                "Volatility Surge": f"Abnormal volatility detected (risk: {score:.2f})",
                "Actor Escalation": f"Threat actor escalating (risk: {score:.2f})",
                "Ring Formation": f"Ring pattern detected (risk: {score:.2f})",
                "Cross-Chain Synchronization": f"Multi-chain coordination (risk: {score:.2f})",
                "High-Entropy Behavior": f"Aggressive behavior detected (risk: {score:.2f})",
                "Insider Pattern": f"Insider timing detected (risk: {score:.2f})",
                "Dormant Activation": f"Dormant entity activated (risk: {score:.2f})",
                "Ghost Signatures": f"Ghost actor detected (risk: {score:.2f})",
                "Predator Signature": f"Predator behavior detected (risk: {score:.2f})",
                "Arbitrage Cluster": f"Arbitrage activity detected (risk: {score:.2f})",
                "Whale Movement": f"Whale activity detected (risk: {score:.2f})",
                "Pump-Dump Pattern": f"Pump-dump scheme detected (risk: {score:.2f})",
                "Wash Trading Detection": f"Wash trading detected (risk: {score:.2f})"
            }
            
            return summaries.get(trigger_type, f"Threat detected (risk: {score:.2f})")
            
        except Exception as e:
            logger.error(f"[Valkyrie] Error generating summary: {e}")
            return f"Threat detected (risk: {trigger.score:.2f})"
    
    def get_all_trigger_types(self) -> list:
        """
        Get list of all supported trigger types
        
        Returns:
            List of trigger type strings
        """
        return self.TRIGGER_TYPES.copy()
