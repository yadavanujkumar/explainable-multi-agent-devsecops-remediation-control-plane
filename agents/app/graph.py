from typing import TypedDict, Dict
from langgraph.graph import Graph, END

# Define Agent State
class DevSecOpsState(TypedDict):
    event_id: str
    vulnerability: str
    severity: str          # critical, high, medium, low
    confidence_score: float
    patch: str
    sandbox_result: str
    explanation: str
    slack_notified: bool

# --- Nodes ---

def analyze_vulnerability(state: DevSecOpsState) -> DevSecOpsState:
    """
    Classify the vulnerability by severity and attach a confidence score.
    In production this calls an LLM or a dedicated CVSS-scoring service.
    """
    vuln = state["vulnerability"].lower()
    if any(kw in vuln for kw in ["sql injection", "rce", "remote code", "secret", "credential"]):
        state["severity"] = "critical"
        state["confidence_score"] = 0.97
    elif any(kw in vuln for kw in ["xss", "ssrf", "idor", "privilege"]):
        state["severity"] = "high"
        state["confidence_score"] = 0.91
    elif any(kw in vuln for kw in ["cve", "dependency", "csrf", "header"]):
        state["severity"] = "medium"
        state["confidence_score"] = 0.85
    else:
        state["severity"] = "low"
        state["confidence_score"] = 0.70
    return state

def generate_patch(state: DevSecOpsState) -> DevSecOpsState:
    """
    Generate a code patch for the detected vulnerability.
    In production this calls an LLM via LangChain to generate diff-formatted code.
    """
    state["patch"] = f"// Auto-generated patch for [{state['severity'].upper()}]: {state['vulnerability']}"
    return state

def test_in_sandbox(state: DevSecOpsState) -> DevSecOpsState:
    """
    Validate the patch inside an ephemeral Kubernetes pod.
    In production this triggers a k8s Job and polls for completion.
    """
    state["sandbox_result"] = "Tests Passed"
    return state

def generate_explanation(state: DevSecOpsState) -> DevSecOpsState:
    """
    Produce an XAI narrative explaining the vulnerability and the fix.
    In production this uses SHAP / LIME or an LLM explainer chain.
    """
    state["explanation"] = (
        f"Detected {state['vulnerability']} (severity: {state['severity']}, "
        f"confidence: {state['confidence_score']:.0%}). "
        "Applied secure coding pattern via automated patch generation."
    )
    return state

def notify_slack(state: DevSecOpsState) -> DevSecOpsState:
    """
    Post a human-in-the-loop approval request to the configured Slack channel.
    In production this uses the Slack Web API with an interactive Block Kit message.
    """
    state["slack_notified"] = True
    return state

# --- Graph definition ---

workflow = Graph()

workflow.add_node("analyzer", analyze_vulnerability)
workflow.add_node("patcher", generate_patch)
workflow.add_node("sandbox", test_in_sandbox)
workflow.add_node("explainer", generate_explanation)
workflow.add_node("notifier", notify_slack)

workflow.set_entry_point("analyzer")
workflow.add_edge("analyzer", "patcher")
workflow.add_edge("patcher", "sandbox")
workflow.add_edge("sandbox", "explainer")
workflow.add_edge("explainer", "notifier")
workflow.set_finish_point("notifier")

# Compile into a runnable graph
app = workflow.compile()

def run_workflow(initial_state: DevSecOpsState) -> Dict:
    return app.invoke(initial_state)
