const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "tournament-service", // Service name as clientId
  brokers: ['localhost:9092'], // Kafka broker address
});

const admin = kafka.admin();

const checkConnection = async () => {
  try {
    await admin.connect();
    console.log('✅ Successfully connected to the Kafka broker.');
  } catch (error) {
    console.error('Failed to connect to the Kafka broker:', error);
  } finally {
    await admin.disconnect();
  }
};

checkConnection();

module.exports = { kafka };
