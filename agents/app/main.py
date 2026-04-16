from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.graph import run_workflow

app = FastAPI(
    title="DevSecOps Agent Control Plane",
    description="LangGraph-powered multi-agent pipeline for automated vulnerability remediation with XAI explanations and human-in-the-loop approval.",
    version="1.0.0",
)

class TelemetryPayload(BaseModel):
    event_id: str
    pipeline: str
    repository: str
    vulnerability_details: str

class WorkflowResponse(BaseModel):
    status: str
    event_id: str
    severity: str
    confidence_score: float
    patch: str
    sandbox_result: str
    explanation: str
    slack_notified: bool

@app.get("/health", tags=["Ops"])
def health_check():
    return {"status": "ok"}

@app.post("/api/v1/trigger", response_model=WorkflowResponse, tags=["Agent"])
def trigger_agent_workflow(payload: TelemetryPayload):
    """
    Trigger the full LangGraph remediation workflow for a given telemetry event.

    The pipeline executes the following nodes in order:
    1. **analyzer** – classify severity and confidence score.
    2. **patcher** – generate a code patch via LLM.
    3. **sandbox** – validate the patch in an ephemeral Kubernetes pod.
    4. **explainer** – produce an XAI narrative.
    5. **notifier** – post a human-in-the-loop approval request to Slack.
    """
    try:
        result = run_workflow({
            "event_id": payload.event_id,
            "vulnerability": payload.vulnerability_details,
            "severity": "",
            "confidence_score": 0.0,
            "patch": "",
            "sandbox_result": "",
            "explanation": "",
            "slack_notified": False,
        })
        return WorkflowResponse(
            status="Workflow Completed",
            event_id=result["event_id"],
            severity=result["severity"],
            confidence_score=result["confidence_score"],
            patch=result["patch"],
            sandbox_result=result["sandbox_result"],
            explanation=result["explanation"],
            slack_notified=result["slack_notified"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
