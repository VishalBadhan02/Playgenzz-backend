
const { scheduleMatches } = require("../controllers/KafkaController");
const { kafka } = require("./kafka");

const consumer = kafka.consumer({ groupId: "teamService-group" });

async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topics: ['tournament-match-scheduling'], fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const messageValue = message.value.toString();

        const data = JSON.parse(messageValue);

        switch (topic) {
          case 'tournament-match-scheduling':
            console.log("Tournament match scheduling topic received", data);
            // await handleApproveRequest(data);
            break;
          default:
            console.warn(`No handler for topic ${topic}`);
        }

        // Manually commit the offset after processing
        await consumer.commitOffsets([
          { topic, partition, offset: (Number(message.offset) + 1).toString() },
        ]);
      } catch (error) {
        console.error(`Error processing message from topic ${topic}:`, error);
        // Handle processing errors appropriately
      }
    },
  });

}

// Handle graceful shutdown
const shutdown = async () => {
  console.log("Disconnecting consumer...");
  try {
    // Synchronously commit offsets before shutting down
    await consumer.commitOffsets();
  } catch (error) {
    console.error("Error during synchronous commit:", error);
  } finally {
    await consumer.disconnect();
    process.exit(0);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

module.exports = startConsumer




// const { kafka } = require("./kafka");

// const consumer = kafka.consumer({ groupId: "teamService-group" });

// async function startConsumer() {
//   await consumer.connect();
//   await consumer.subscribe({ topic: ['tournament-match-scheduling'], fromBeginning: true });

//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       try {
//         const data = JSON.parse(message.value.toString()); // ✅ Properly parse buffer to JSON
//         console.log("Received message:", data);

//         switch (topic) {
//           case 'tournament-match-scheduling':
//             await scheduleMatches(data);
//             break;
//           default:
//             console.warn(`No handler for topic ${topic}`);
//         }

//         await consumer.commitOffsets([
//           { topic, partition, offset: (Number(message.offset) + 1).toString() },
//         ]);

//       } catch (error) {
//         console.error(`Error processing message from topic ${topic}:`, error);
//       }
//     },
//   });
// }

// module.exports = startConsumer;
