"""
Anomaly Specialist Agent
Scans for unusual spending patterns and high-severity expense outliers
using Isolation Forest and Statistical Z-Score modeling.
"""

from typing import List, Dict, Any
from ml.anomaly_detection import detector

class AnomalyAgent:
    def __init__(self):
        self.name = "Anomaly Agent"
        self.role = "Outlier expense detection, variance scoring, and purchase review"

    def execute(self, user_id: int, query: str, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        anomalies = detector.detect_anomalies(transactions)
        
        return {
            "agent": self.name,
            "status": "SUCCESS",
            "anomalies_detected": len(anomalies),
            "flagged_transactions": anomalies,
            "has_high_severity": any(a["severity"] == "HIGH" for a in anomalies),
            "verified_by_python": True
        }

anomaly_agent = AnomalyAgent()
