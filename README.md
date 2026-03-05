# Explainable Multi-Agent DevSecOps Remediation Control Plane

A zero-trust, enterprise-grade multi-agent system that real-time ingests CI/CD telemetry, detects anomalies and vulnerabilities, automatically generates and tests patches in ephemeral Kubernetes sandboxes, and leverages eXplainable AI (XAI) to seek human-in-the-loop approval via Slack before merging fixes.

## Architecture

- **Frontend (React/TypeScript):** Control plane dashboard for security engineers to view pending remediations, read XAI explanations, and approve/reject patches.
- **Backend (Go):** High-performance API Gateway and Event Consumer. Listens to CI/CD telemetry via Redpanda, stores state, and coordinates with the Agent service.
- **Agents (Python/LangGraph):** The brain of the operation. A LangGraph-based multi-agent workflow that:
  1. Analyzes telemetry for vulnerabilities.
  2. Generates patches.
  3. Tests patches in ephemeral k8s sandboxes.
  4. Generates XAI explanations.
  5. Requests human approval via Slack.
- **Event Streaming (Redpanda):** Real-time Kafka-compatible telemetry ingestion.
- **Deployment (Kubernetes):** Designed to run entirely on K8s.

## Setup Instructions

### Prerequisites
- Docker & Docker Compose
- Go 1.21+
- Python 3.11+
- Node.js 18+

### Local Development (Docker Compose)
1. Clone the repository.
2. Run `docker-compose up --build` at the root.
3. Access the Frontend at `http://localhost:3000`.
4. Access the Go Backend API at `http://localhost:8080`.
5. Access the Python Agent API at `http://localhost:8000`.

### API Documentation

**Backend (Go)**
- `GET /api/v1/health`: Service health check.
- `GET /api/v1/remediations`: List all pending remediations.
- `POST /api/v1/remediations/{id}/approve`: Approve a specific remediation patch.

**Agent Service (Python)**
- `POST /api/v1/trigger`: Manually trigger the LangGraph analysis workflow with a telemetry payload.
