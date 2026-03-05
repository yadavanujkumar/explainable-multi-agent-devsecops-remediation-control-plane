package domain

import "time"

// TelemetryEvent represents an incoming CI/CD event.
type TelemetryEvent struct {
	ID        string    `json:"id"`
	Pipeline  string    `json:"pipeline"`
	Repo      string    `json:"repo"`
	Payload   string    `json:"payload"`
	Timestamp time.Time `json:"timestamp"`
}

// Remediation represents a detected vulnerability and its proposed patch.
type Remediation struct {
	ID             string    `json:"id"`
	EventID        string    `json:"event_id"`
	Vulnerability  string    `json:"vulnerability"`
	ProposedPatch  string    `json:"proposed_patch"`
	XAIExplanation string    `json:"xai_explanation"`
	Status         string    `json:"status"` // pending, approved, rejected
	CreatedAt      time.Time `json:"created_at"`
}
