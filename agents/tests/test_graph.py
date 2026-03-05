import pytest
from app.graph import run_workflow, DevSecOpsState

def test_agent_workflow():
    initial_state: DevSecOpsState = {
        "event_id": "test-123",
        "vulnerability": "XSS in Input Form",
        "patch": "",
        "sandbox_result": "",
        "explanation": "",
        "slack_notified": False
    }

    result = run_workflow(initial_state)
    
    assert "patch" in result
    assert result["sandbox_result"] == "Tests Passed"
    assert result["slack_notified"] is True
    assert "XSS in Input Form" in result["explanation"]
