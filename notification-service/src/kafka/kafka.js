const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "notification-service", // Service name as clientId
  brokers: ["0.0.0.0:9092"], // Kafka broker address
});

module.exports = kafka;
