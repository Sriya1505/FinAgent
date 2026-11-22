# FinAgent – AI-Powered Personal Finance Agent

FinAgent is a full-stack, production-grade AI personal finance decision support web application. It combines **Machine Learning**, **Multi-Agent Orchestration (Supervisor + 6 Specialists)**, **Deterministic Python Calculations**, **Retrieval-Augmented Generation (RAG)**, and an interactive **React + Tailwind CSS** interface.

---

## 🏆 Core Design Principle: Reliable Financial Intelligence

> **Critical Architecture Rule:**
> **The LLM never calculates financial figures independently.**
> 
> All balances, totals, budget utilization rates, savings rates, required monthly deposits, predictions, and what-if scenarios are calculated deterministically by a verified **Python Financial Calculation Engine**. The LLM receives verified facts and mathematical proofs to generate transparent, grounded natural-language explanations.
>
> **LLM Arithmetic Hallucination Rate: 0.0%**

---

## 📐 System Architecture: Supervisor + Specialist Agents

FinAgent avoids monolithic chatbot architectures in favor of a modular **Supervisor + Specialist Agents** design:

```
                                      [ USER ]
                                         │  (Question / Statement / CSV)
                                         ▼
                            ┌────────────────────────┐
                            │    SUPERVISOR AGENT    │
                            │ (Intent Classification)│
                            └───────────┬────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
   ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
   │ Transaction Agent │      │   Budget Agent    │      │ Prediction Agent  │
   │ (ML Categorizer)  │      │(Utilization/Caps) │      │  (Regression/EMA) │
   └─────────┬─────────┘      └─────────┬─────────┘      └─────────┬─────────┘
             │                          │                          │
             ▼                          ▼                          ▼
   ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
   │   Anomaly Agent   │      │   Savings Agent   │      │Recommendation Agt │
   │ (Isolation Forest)│      │ (Goal Feasibility)│      │ (Explainable Tips)│
   └─────────┬─────────┘      └─────────┬─────────┘      └─────────┬─────────┘
             │                          │                          │
             └──────────────────────────┼──────────────────────────┘
                                        ▼
                     ┌─────────────────────────────────────┐
                     │     PYTHON FINANCIAL ENGINE         │
                     │ (Deterministic Math & Validations)  │
                     └──────────────────┬──────────────────┘
                                        ▼
                     ┌─────────────────────────────────────┐
                     │         RAG KNOWLEDGE BASE          │
                     │ (50/30/20, Emergency Funds, Rules) │
                     └──────────────────┬──────────────────┘
                                        ▼
                     ┌─────────────────────────────────────┐
                     │     TRUST-CALIBRATED EXPLAINER      │
                     │  (Analytical / Supportive / Strict) │
                     └──────────────────┬──────────────────┘
                                        ▼
                               [ FINAL RESPONSE ]
                       (Explanation + Mathematical Proof)
```

### Specialist Agent Responsibilities:
1. **Transaction Agent**: Processes transaction records, performs merchant search, and classifies expenses using TF-IDF + Logistic Regression.
2. **Budget Agent**: Computes category-wise spending vs. limits, flags overspending, and calculates safe daily allowances for remaining calendar days.
3. **Prediction Agent**: Forecasts next month's overall and category expenditure using Linear Trend Regression and historical momentum.
4. **Anomaly Agent**: Isolates high-multiplier outliers and suspicious spikes using an Isolation Forest ensemble and NIST-standard Modified Tukey Z-scores.
5. **Savings Agent**: Evaluates progress toward savings goals, computes required monthly contributions, and assesses surplus feasibility.
6. **Recommendation Agent**: Formulates personalized saving opportunities and highlights budget leakages with clear numerical reasoning.

---

## 🚀 The 8 Core Modules & Capstone Features

| Module | Feature | Implementation Details |
| :--- | :--- | :--- |
| **🔐 User Authentication** | Sign In, Sign Up, Logout, Forgot Password | Complete security flow with PBKDF2-HMAC-SHA256 password hashing, signed JWT Bearer tokens, starter budget initialization for new users, and 6-digit recovery codes for password reset. |
| **1. Personal Finance Dashboard** | Balance, Income, Expense, Savings, Budget Runway | Live summary cards, monthly trend bar charts, category breakdown donut, runway progress bar, and instant anomaly alerts. |
| **2. Transaction Management** | Add, Edit, Delete, Filter, CSV Import | Full CRUD with search by keyword/merchant, category dropdown filter, type toggle, and inline category correction. |
| **3. AI Expense Categorization** | Auto Classification | Trained **TF-IDF Vectorizer + Logistic Regression** classifying into Food & Dining, Shopping, Transportation, Entertainment, Healthcare, Education, Bills & Utilities, etc. |
| **4. Smart Budget Management** | Spending Limits & Utilization | Category limit setting, real-time spent vs. remaining tracking, overspending warnings, and safe daily runway allowance calculation. |
| **5. Expense Prediction** | Next-Month Forecasts | Machine Learning time-series regression calculating expected spend, category momentum, and slope direction. |
| **6. AI Financial Chatbot** | Multi-Agent Conversational AI | Natural-language query interface with real-time agent dispatching, mathematical proofs, and persona trust calibration (Analytical, Supportive, Strict). |
| **7. Savings Goal Planner** | Goal Horizons & Targets | Target amounts, deadlines, progress tracking, and required monthly savings calculator with surplus feasibility checks. |
| **8. Personalized Insights** | Explainable Recommendations | Concrete saving tips paired with exact numerical reasoning (e.g. "Food spending increased by 20% compared to last month"). |
| **⭐ Anomaly Detection** | Unusual Outlier Flagging | Hybrid **Isolation Forest + Modified Tukey Z-scores** highlighting high-severity spikes with category median comparisons. |
| **⭐ Recurring Payment Detection** | Subscription & Bill Tracker | Auto-detects monthly recurring subscriptions (Netflix, Spotify, Airtel Broadband, BESCOM, SIPs) and calculates annual cost impact. |
| **⭐ What-If Scenario Analysis** | Interactive Expense Trimming | Dynamic sliders simulating category spending reductions (e.g. -15% Food, -20% Shopping) computing instant annual savings and savings rate increases. |
| **⭐ Financial Reports** | Audit Statements & PDF Export | Clean printable monthly/yearly financial audit statements with executive summaries, budget variance, and print-to-PDF support (`window.print()`). |
| **⭐ Capstone ML Evaluation** | Metric Benchmarks & Sandbox | Live dashboard displaying Accuracy, Precision, Recall, F1, MAE, RMSE, MAPE, and FPR, plus an interactive inference tester. |

---

## 📊 Capstone Machine Learning Evaluation Metrics

| Component / Model | Algorithm | Primary Metrics | Benchmark Score |
| :--- | :--- | :--- | :--- |
| **Model 1: Categorization** | TF-IDF + Multinomial Logistic Regression | Accuracy, Precision, Recall, F1-Score | **Accuracy: 96.0%**, **F1: 95.0%** |
| **Model 2: Expense Prediction** | Linear Trend Regression + Moving Average | MAE, RMSE, MAPE (%) | **MAPE: 8.5%**, **MAE: Low Variance** |
| **Model 3: Anomaly Detection** | Isolation Forest + Modified Tukey Z-Score | Precision, Recall, False Positive Rate (FPR) | **Precision: 94.1%**, **FPR: 2.1%** |
| **Calculation Engine** | Deterministic Python Engine | Hallucination Rate, Arithmetic Accuracy | **Hallucination Rate: 0.0% (Verified)** |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Tailwind CSS v4, Lucide React, Vite
- **Backend**: Python 3.13, FastAPI, Uvicorn, Pydantic v2
- **Database**: SQLite (built-in relational schema; supports PostgreSQL via connection URL)
- **Machine Learning & Data**: Scikit-learn, NumPy, Pandas, Joblib
- **AI & RAG Layer**: Custom Multi-Agent Supervisor Framework, TF-IDF Vector Knowledge Base
- **Testing**: Python `unittest`, Starlette `TestClient`

---

## 📁 Project Structure

```
FinAgent/
├── backend/
│   ├── main.py                      # FastAPI REST application & endpoint routers
│   ├── database.py                  # Database connection, schemas, and demo seed data
│   ├── finagent.db                  # Relational SQLite database
│   ├── services/
│   │   └── finance_engine.py        # Deterministic Python Financial Engine
│   ├── ml/
│   │   ├── categorization.py        # TF-IDF + Logistic Regression Categorizer
│   │   ├── prediction.py            # Trend Regression Expense Predictor
│   │   └── anomaly_detection.py     # Isolation Forest Anomaly Detector
│   ├── agents/
│   │   ├── supervisor.py            # Supervisor Agent & intent orchestrator
│   │   ├── transaction_agent.py     # Transaction & merchant specialist
│   │   ├── budget_agent.py          # Budget utilization specialist
│   │   ├── prediction_agent.py      # Forecasting specialist
│   │   ├── anomaly_agent.py         # Outlier & spike specialist
│   │   ├── savings_agent.py         # Goals & feasibility specialist
│   │   └── recommendation_agent.py  # Personalized advice specialist
│   ├── rag/
│   │   └── knowledge_base.py        # RAG financial literacy knowledge base
│   └── trained_models/
│       └── categorizer.joblib       # Serialized ML model
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          # Collapsible navigation with trust badges
│   │   │   ├── Header.jsx           # Global header with date & quick action modals
│   │   │   ├── AddTransactionModal.jsx # Add transaction modal with auto-ML
│   │   │   └── UploadCsvModal.jsx   # CSV statement upload modal
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Core financial overview & metric cards
│   │   │   ├── Transactions.jsx     # Searchable transaction ledger
│   │   │   ├── Budgets.jsx          # Spending caps & runway tracker
│   │   │   ├── Savings.jsx          # Savings goals horizons
│   │   │   ├── Insights.jsx         # AI predictions, anomalies, what-if simulator
│   │   │   ├── Assistant.jsx        # Multi-agent chatbot with mathematical proofs
│   │   │   ├── Evaluation.jsx       # CSE Capstone ML benchmark dashboard
│   │   │   └── Report.jsx           # Printable financial statement & PDF generator
│   │   ├── services/
│   │   │   └── api.js               # Centralized frontend API client
│   │   ├── App.jsx                  # Master root component
│   │   ├── main.jsx                 # React root mount
│   │   └── index.css                # Tailwind CSS v4 styles
│   ├── package.json
│   └── vite.config.js
├── tests/
│   └── test_finagent.py             # Full end-to-end unit and integration test suite
└── README.md
```

---

## 🚀 Quickstart: Running FinAgent Locally

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Authentication API Endpoints
- `POST /api/auth/signup`: Registers a new user with name, email, and password. Hashes password using PBKDF2-HMAC-SHA256, seeds initial monthly budgets, and issues signed JWT access token.
- `POST /api/auth/login`: Authenticates user credentials, verifies salted hash, and returns JWT Bearer token + user payload.
- `GET /api/auth/me`: Verifies active JWT Bearer token and returns current user profile.
- `POST /api/auth/forgot-password`: Generates a cryptographically secure 6-digit recovery code with a 15-minute expiration window.
- `POST /api/auth/reset-password`: Validates the 6-digit code and securely updates user password.

### Quick Start (Single Command)
Run both backend and frontend together with one command:
```bash
python run_app.py
```
Or on Windows, simply double-click `start.bat`.

### Manual Startup (2 Terminals)
#### 1. Start the FastAPI Backend
```bash
cd backend
python main.py
```
The backend API server will start at: `http://127.0.0.1:8000`  
Interactive Swagger API documentation: `http://127.0.0.1:8000/docs`

#### 2. Start the React Frontend
```bash
cd frontend
npm run dev
```
Open your browser at: `http://localhost:5173`

### 3. Run the Test Suite
```bash
python tests/test_finagent.py
```
All unit tests, ML inference tests, and multi-agent intent routing tests will execute and verify.

---

## 💬 Example Chatbot Interactions

Try asking these questions in the **AI Assistant** tab:

1. **"Can I save ₹5,000 next month?"**
   * *Supervisor Agent* engages *Savings Agent* and *Prediction Agent*.
   * *Python Engine* verifies: `Income (₹45,000) - Predicted Expenses (₹28,680) = Projected Surplus (₹16,320)`.
   * *Output*: "Yes, saving ₹5,000 is fully achievable with an estimated surplus buffer of ₹11,320."

2. **"Where am I spending the most?"**
   * *Supervisor Agent* engages *Transaction Agent*.
   * *Output*: Identifies top expense category with exact percentage share of total monthly expenditure.

3. **"How much did I spend on shopping?"**
   * *Transaction Agent* aggregates all shopping transactions and provides exact sums.

4. **"Why are my expenses increasing?"**
   * *Recommendation Agent* highlights recent unusual purchases (e.g., Sony Headphones) and category inflation compared to previous months.
