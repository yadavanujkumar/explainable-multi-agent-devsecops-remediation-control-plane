package api

import (
	"net/http"
	"time"

	"github.com/enterprise/devsecops-control-plane/backend/internal/domain"
	"github.com/gin-gonic/gin"
)

// SetupRouter configures the API routes.
func SetupRouter() *gin.Engine {
	r := gin.Default()

	v1 := r.Group("/api/v1")
	{
		v1.GET("/health", HealthCheck)
		v1.GET("/remediations", GetRemediations)
		v1.POST("/remediations/:id/approve", ApproveRemediation)
		v1.POST("/remediations/:id/reject", RejectRemediation)
	}

	return r
}

// seedRemediations returns a representative set of mock remediations.
func seedRemediations() []domain.Remediation {
	now := time.Now()
	return []domain.Remediation{
		{
			ID:              "rem-001",
			EventID:         "evt-101",
			Vulnerability:   "SQL Injection in User Login",
			Severity:        "critical",
			ConfidenceScore: 0.97,
			ProposedPatch:   "Replace string-concatenated query with a parameterized prepared statement.",
			XAIExplanation:  "Unsanitised user input is concatenated directly into a SQL statement. The patch enforces parameterized queries, eliminating the injection surface.",
			Status:          "pending",
			CreatedAt:       now.Add(-2 * time.Hour),
		},
		{
			ID:              "rem-002",
			EventID:         "evt-102",
			Vulnerability:   "Stored XSS in Comment Field",
			Severity:        "high",
			ConfidenceScore: 0.91,
			ProposedPatch:   "Encode all user-supplied content with html.EscapeString before rendering.",
			XAIExplanation:  "User-controlled data is written to the DOM without encoding, allowing script injection. The patch adds output encoding at every render point.",
			Status:          "pending",
			CreatedAt:       now.Add(-90 * time.Minute),
		},
		{
			ID:              "rem-003",
			EventID:         "evt-103",
			Vulnerability:   "Hard-coded AWS Secret Key",
			Severity:        "critical",
			ConfidenceScore: 0.99,
			ProposedPatch:   "Remove credential from source, rotate the key, and read it from an environment variable or secrets manager.",
			XAIExplanation:  "A long-term AWS secret key was detected in plain text in the source tree. Exposure via VCS history creates an uncontrolled blast radius; the fix migrates secrets to runtime injection.",
			Status:          "approved",
			CreatedAt:       now.Add(-3 * time.Hour),
		},
		{
			ID:              "rem-004",
			EventID:         "evt-104",
			Vulnerability:   "Insecure Direct Object Reference in /api/orders",
			Severity:        "high",
			ConfidenceScore: 0.88,
			ProposedPatch:   "Verify that the authenticated user owns the requested resource before returning it.",
			XAIExplanation:  "The endpoint accepts a user-supplied order ID without confirming ownership, allowing horizontal privilege escalation. The patch adds an ownership check against the session's subject claim.",
			Status:          "pending",
			CreatedAt:       now.Add(-45 * time.Minute),
		},
		{
			ID:              "rem-005",
			EventID:         "evt-105",
			Vulnerability:   "Missing HSTS Header",
			Severity:        "medium",
			ConfidenceScore: 0.82,
			ProposedPatch:   "Add Strict-Transport-Security: max-age=63072000; includeSubDomains; preload to all HTTPS responses.",
			XAIExplanation:  "Absence of HSTS enables protocol-downgrade attacks. The patch injects the header at the middleware layer, enforcing TLS across all sub-domains.",
			Status:          "rejected",
			CreatedAt:       now.Add(-5 * time.Hour),
		},
		{
			ID:              "rem-006",
			EventID:         "evt-106",
			Vulnerability:   "Dependency with Known CVE: lodash 4.17.20 (CVE-2021-23337)",
			Severity:        "medium",
			ConfidenceScore: 0.95,
			ProposedPatch:   "Upgrade lodash to >= 4.17.21 in package.json.",
			XAIExplanation:  "lodash 4.17.20 contains a command-injection vulnerability via the template function. Upgrading to 4.17.21 applies the upstream fix.",
			Status:          "pending",
			CreatedAt:       now.Add(-20 * time.Minute),
		},
	}
}

// HealthCheck returns server status.
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "healthy"})
}

// GetRemediations returns mock remediations, optionally filtered by status or severity.
func GetRemediations(c *gin.Context) {
	statusFilter := c.Query("status")
	severityFilter := c.Query("severity")

	all := seedRemediations()

	result := make([]domain.Remediation, 0, len(all))
	for _, r := range all {
		if statusFilter != "" && r.Status != statusFilter {
			continue
		}
		if severityFilter != "" && r.Severity != severityFilter {
			continue
		}
		result = append(result, r)
	}

	c.JSON(http.StatusOK, result)
}

// ApproveRemediation handles the human-in-the-loop approval.
func ApproveRemediation(c *gin.Context) {
	id := c.Param("id")
	// In production this would update the database record and trigger the deployment pipeline.
	c.JSON(http.StatusOK, gin.H{"message": "Remediation approved successfully", "id": id})
}

// RejectRemediation handles the human-in-the-loop rejection.
func RejectRemediation(c *gin.Context) {
	id := c.Param("id")
	// In production this would mark the remediation as rejected and notify the agent.
	c.JSON(http.StatusOK, gin.H{"message": "Remediation rejected", "id": id})
}
