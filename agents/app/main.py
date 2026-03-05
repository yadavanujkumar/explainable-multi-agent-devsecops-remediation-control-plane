from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.graph import run_workflow

app = FastAPI(title="DevSecOps Agent Control Plane")

class TelemetryPayload(BaseModel):
    event_id: str
    pipeline: str
    repository: str
    vulnerability_details: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/v1/trigger")
def trigger_agent_workflow(payload: TelemetryPayload):
    try:
        # Start LangGraph workflow
        result = run_workflow({
            "event_id": payload.event_id,
            "vulnerability": payload.vulnerability_details,
            "patch": "",
            "sandbox_result": "",
            "explanation": "",
            "slack_notified": False
        })
        return {"status": "Workflow Completed", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
