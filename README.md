# Explainable Multi-Agent DevSecOps Remediation Control Plane

A zero-trust, enterprise-grade multi-agent system that real-time ingests CI/CD telemetry, detects anomalies and vulnerabilities, automatically generates and tests patches in ephemeral Kubernetes sandboxes, and leverages eXplainable AI (XAI) to seek human-in-the-loop approval via Slack before merging fixes.

---

## Architecture Overview

```
  CI/CD Pipeline
       │  telemetry events
       ▼
  ┌─────────────┐     Kafka / Redpanda      ┌───────────────────────┐
  │  Backend API │◄────────────────────────►│  Event Consumer (Go)  │
  │    (Go/Gin)  │                           └───────────────────────┘
  └──────┬───────┘
         │  HTTP (trigger)
         ▼
  ┌──────────────────────────────────────────────────────────┐
  │              LangGraph Agent Pipeline (Python)           │
  │                                                          │
  │  [analyzer] → [patcher] → [sandbox] → [explainer]        │
  │                                            │             │
  │                                        [notifier]        │
  └──────────────────────────────────────────────────────────┘
         │  Slack approval request
         ▼
  ┌──────────────────┐
  │ Security Engineer│  (human-in-the-loop)
  └────────┬─────────┘
           │  approve / reject
           ▼
  ┌──────────────────┐
  │  Frontend (React)│  Control Plane Dashboard
  └──────────────────┘
```

### Components

| Component | Stack | Port | Responsibility |
|-----------|-------|------|----------------|
| **Frontend** | React 18, TypeScript, Vite | `3000` | Dashboard: view remediations, read XAI explanations, approve/reject patches |
| **Backend** | Go 1.21, Gin | `8080` | REST API gateway, Redpanda consumer, state coordination |
| **Agents** | Python 3.11, FastAPI, LangGraph | `8000` | Multi-agent remediation pipeline |
| **Redpanda** | Kafka-compatible | `9092` | Real-time CI/CD telemetry ingestion |

### Agent Pipeline Nodes

1. **analyzer** – Classifies the vulnerability by severity (`critical / high / medium / low`) and attaches a confidence score.
2. **patcher** – Calls an LLM to generate a diff-formatted code patch.
3. **sandbox** – Spins up an ephemeral Kubernetes Job to run the patched code's test suite.
4. **explainer** – Uses XAI techniques (SHAP / LIME / LLM chain) to produce a human-readable narrative.
5. **notifier** – Posts an interactive Block Kit approval request to Slack.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Docker & Docker Compose | ≥ 24 |
| Go | ≥ 1.21 |
| Python | ≥ 3.11 |
| Node.js | ≥ 18 |

---

## Local Development

### Docker Compose (recommended)

```bash
# Copy and edit environment variables
cp .env.example .env          # set OPENAI_API_KEY, SLACK_BOT_TOKEN, etc.

docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Agent API | http://localhost:8000 |
| Redpanda Admin | http://localhost:8081 |

### Running Services Individually

**Backend (Go)**
```bash
cd backend
go mod download
REDPANDA_BROKERS=localhost:9092 go run ./cmd/api
```

**Agent Service (Python)**
```bash
cd agents
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend (React)**
```bash
cd frontend
npm install
npm run dev          # starts Vite dev server on http://localhost:5173
```

---

## Environment Variables

| Variable | Component | Description | Default |
|----------|-----------|-------------|---------|
| `REDPANDA_BROKERS` | Backend | Kafka/Redpanda broker address | `localhost:9092` |
| `OPENAI_API_KEY` | Agents | API key for LLM patch generation & XAI | — |
| `SLACK_BOT_TOKEN` | Agents | Slack Bot OAuth token for notifications | — |
| `SLACK_CHANNEL_ID` | Agents | Target Slack channel for approval requests | — |

---

## API Reference

### Backend (Go — port 8080)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Service health check |
| `GET` | `/api/v1/remediations` | List remediations (supports `?status=pending&severity=critical`) |
| `POST` | `/api/v1/remediations/{id}/approve` | Approve a remediation patch |
| `POST` | `/api/v1/remediations/{id}/reject` | Reject a remediation patch |

**Query parameters for `GET /api/v1/remediations`**

| Parameter | Values | Description |
|-----------|--------|-------------|
| `status` | `pending`, `approved`, `rejected` | Filter by remediation status |
| `severity` | `critical`, `high`, `medium`, `low` | Filter by vulnerability severity |

### Agent Service (Python — port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health check |
| `POST` | `/api/v1/trigger` | Trigger the full LangGraph pipeline with a telemetry payload |

**`POST /api/v1/trigger` — Request body**

```json
{
  "event_id":             "evt-001",
  "pipeline":             "github-actions",
  "repository":           "org/service-name",
  "vulnerability_details":"SQL Injection in login handler"
}
```

**Response**

```json
{
  "status":           "Workflow Completed",
  "event_id":         "evt-001",
  "severity":         "critical",
  "confidence_score": 0.97,
  "patch":            "// Auto-generated patch for [CRITICAL]: SQL Injection...",
  "sandbox_result":   "Tests Passed",
  "explanation":      "Detected SQL Injection ... (severity: critical, confidence: 97%)",
  "slack_notified":   true
}
```

---

## Running Tests

**Backend**
```bash
cd backend
go test ./...
```

**Agents**
```bash
cd agents
pytest
```

**Frontend**
```bash
cd frontend
npm test
```

---

## Kubernetes Deployment

Apply the bundled manifests to any cluster:

```bash
kubectl apply -f k8s/manifests.yaml
```

The manifest deploys the backend as a `Deployment` with 2 replicas and exposes it via a `Service`.  
Add equivalent manifests for the agent service and frontend as you promote the project to production.

