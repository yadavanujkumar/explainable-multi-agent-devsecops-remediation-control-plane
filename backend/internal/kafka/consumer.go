package kafka

import (
	"fmt"
	"log"

	"github.com/confluentinc/confluent-kafka-go/kafka"
)

// Consumer wraps the Redpanda/Kafka consumer
type Consumer struct {
	client *kafka.Consumer
	topic  string
}

// NewConsumer initializes a new Kafka consumer connected to Redpanda
func NewConsumer(brokers, topic string) (*Consumer, error) {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": brokers,
		"group.id":          "devsecops-ingestion-group",
		"auto.offset.reset": "earliest",
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create consumer: %w", err)
	}

	err = c.SubscribeTopics([]string{topic}, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to subscribe to topic: %w", err)
	}

	return &Consumer{client: c, topic: topic}, nil
}

// Start begins listening to the telemetry stream
func (c *Consumer) Start() {
	for {
		msg, err := c.client.ReadMessage(-1)
		if err == nil {
			log.Printf("Received Telemetry Event on %s: %s\n", msg.TopicPartition, string(msg.Value))
			// Here: Trigger the Python Agents via gRPC or HTTP API to process the telemetry
		} else {
			log.Printf("Consumer error: %v (%v)\n", err, msg)
		}
	}
}
