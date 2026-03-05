package main

import (
	"log"
	"net/http"
	"os"

	"github.com/enterprise/devsecops-control-plane/backend/internal/api"
	"github.com/enterprise/devsecops-control-plane/backend/internal/kafka"
)

func main() {
	// Initialize Redpanda/Kafka consumer in the background
	brokers := os.Getenv("REDPANDA_BROKERS")
	if brokers == "" {
		brokers = "localhost:9092"
	}

	consumer, err := kafka.NewConsumer(brokers, "telemetry-events")
	if err != nil {
		log.Printf("Warning: failed to start kafka consumer: %v", err)
	} else {
		go consumer.Start()
	}

	// Initialize Gin Router
	router := api.SetupRouter()

	log.Println("Starting Backend API Server on :8080...")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
