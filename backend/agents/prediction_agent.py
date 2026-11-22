"""
Prediction Specialist Agent
Forecasts future monthly spending and category trends using ML regression models.
"""

from typing import List, Dict, Any
from ml.prediction import predictor

class PredictionAgent:
    def __init__(self):
        self.name = "Prediction Agent"
        self.role = "Expense forecasting, spending trend analysis, and pattern projection"

    def execute(self, user_id: int, query: str, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        forecast_data = predictor.forecast_next_month(transactions)
        
        return {
            "agent": self.name,
            "status": "SUCCESS",
            "predicted_total_expense": forecast_data["predicted_total"],
            "trend_direction": forecast_data["trend_direction"],
            "confidence_score": forecast_data["confidence_score"],
            "category_forecasts": forecast_data["category_forecasts"],
            "evaluation_metrics": forecast_data["metrics"],
            "verified_by_python": True
        }

prediction_agent = PredictionAgent()
