const { scheduleMatches } = require("../../../team-service/src/controllers/KafkaController");
const kafka = require("./kafka");

const consumer = kafka.consumer({ groupId: "tornamentService-group" });

async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: "tournament-match-schng", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const data = message.value;
        console.log("Received message:", data);

        switch (topic) {
          case 'tournament-match-schedg':
            await scheduleMatches(data);
            break;
          case 'delete-request':
            await handleDeleteRequest(data);
            break;
          case 'approve-request':
            await handleApproveRequest(data);
            break;
          default:
            console.warn(`No handler for topic ${topic}`);
        }

      } catch (error) {
        console.error(`Error processing message from topic ${topic}:`, error);
      }
    },
  });
}

module.exports = startConsumer;
