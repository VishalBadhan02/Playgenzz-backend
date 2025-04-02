const { Kafka } = require("kafkajs");
const { Config } = require("../config/index.js")

const kafka = new Kafka({
  clientId: "user-service", // Service name as clientId
  brokers: [`localhost:9092`], // Kafka broker address
});

module.exports = kafka;
