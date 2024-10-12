import {Kafka} from "kafkajs";

const TOPIC_NAME = "zap-events";
const kafka:any = new Kafka({
  clientId: 'outbox-processor',
  brokers: ['localhost:9092']
})

async function main() {
  const consumer = kafka.consumer({groupId:'main-worker'});
  await consumer.connect();
  // Create a new user

  await consumer.subscribe({ topic: TOPIC_NAME ,fromBeginning: true });
  await consumer.run({
    autoCommit:false,
    // @ts-ignore
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Received message from ${topic} [${partition}] at ${message.timestamp}:`);
      console.log(message.value);
      // Process the message here
      console.log('processing done');
      await new Promise(r => setTimeout(r,100));
      await consumer.commitOffsets([
        { topic: TOPIC_NAME,
           partition:partition,
            offset: (parseInt(message.offset) +1).toString()
       }
      ]);
    }
  });
}

main();