import pytest
from app.graph import run_workflow, DevSecOpsState

def test_agent_workflow_xss():
    initial_state: DevSecOpsState = {
        "event_id": "test-001",
        "vulnerability": "XSS in Input Form",
        "severity": "",
        "confidence_score": 0.0,
        "patch": "",
        "sandbox_result": "",
        "explanation": "",
        "slack_notified": False,
    }

    result = run_workflow(initial_state)

    assert result["patch"] != ""
    assert result["sandbox_result"] == "Tests Passed"
    assert result["slack_notified"] is True
    assert "XSS in Input Form" in result["explanation"]
    assert result["severity"] == "high"
    assert result["confidence_score"] > 0

def test_agent_workflow_sql_injection_is_critical():
    initial_state: DevSecOpsState = {
        "event_id": "test-002",
        "vulnerability": "SQL Injection in login endpoint",
        "severity": "",
        "confidence_score": 0.0,
        "patch": "",
        "sandbox_result": "",
        "explanation": "",
        "slack_notified": False,
    }

    result = run_workflow(initial_state)

    assert result["severity"] == "critical"
    assert result["confidence_score"] >= 0.95

def test_agent_workflow_dependency_cve_is_medium():
    initial_state: DevSecOpsState = {
        "event_id": "test-003",
        "vulnerability": "Dependency CVE-2021-23337 in lodash",
        "severity": "",
        "confidence_score": 0.0,
        "patch": "",
        "sandbox_result": "",
        "explanation": "",
        "slack_notified": False,
    }

    result = run_workflow(initial_state)

    assert result["severity"] == "medium"

def test_agent_workflow_explanation_contains_severity():
    initial_state: DevSecOpsState = {
        "event_id": "test-004",
        "vulnerability": "Hard-coded credential in source",
        "severity": "",
        "confidence_score": 0.0,
        "patch": "",
        "sandbox_result": "",
        "explanation": "",
        "slack_notified": False,
    }

    result = run_workflow(initial_state)

    assert result["severity"] in result["explanation"]
    assert str(result["confidence_score"]) or "%" in result["explanation"]
