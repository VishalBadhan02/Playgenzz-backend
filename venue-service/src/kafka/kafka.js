const { Kafka } = require("kafkajs");
const Config = require("../config");

const kafka = new Kafka({
  clientId: "kafka", // Service name as clientId
  brokers: [Config.KAFKA_BROKERS], // Kafka broker address
});

module.exports = kafka;
