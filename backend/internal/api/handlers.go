package api

import (
	"net/http"

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
	}

	return r
}

// HealthCheck returns server status.
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "healthy"})
}

// GetRemediations returns a mocked list of pending remediations for the UI.
func GetRemediations(c *gin.Context) {
	// In a real application, this would fetch from a database repository.
	mockData := []domain.Remediation{
		{
			ID:             "rem-123",
			EventID:        "evt-456",
			Vulnerability:  "SQL Injection in User Login",
			ProposedPatch:  "Use parameterized queries instead of string formatting.",
			XAIExplanation: "The model detected unsanitized input concatenated directly into a SQL statement. The generated patch uses prepared statements, neutralizing the injection risk.",
			Status:         "pending",
		},
	}

	c.JSON(http.StatusOK, mockData)
}

// ApproveRemediation handles the human-in-the-loop approval.
func ApproveRemediation(c *gin.Context) {
	id := c.Param("id")
	// Here we would trigger the agent or deployment pipeline to merge the patch.
	c.JSON(http.StatusOK, gin.H{"message": "Remediation approved successfully", "id": id})
}
