import { PrismaClient } from "@prisma/client";
import {Kafka} from "kafkajs";


const prisma = new PrismaClient();
const TOPIC_NAME = "zap-events";
const kafka:any = new Kafka({
  clientId: 'outbox-processor',
  brokers: ['localhost:9092']
})

async function main() {
  const producer = kafka.producer()
  await producer.connect();
  // Create a new user
  while(1){
    
    const pendingRows = await prisma.zapRunOutbox.findMany({
      where:{},
      take: 10,
    });
    console.log('pendingRows ', pendingRows);
    producer.send(
      {
        topic: TOPIC_NAME,
        messages: pendingRows.map(row => ({
          value: row.zapRunId,
        })),
      }
    )
    await prisma.zapRunOutbox.deleteMany(
      {
        where: {
          id: {
            in: pendingRows.map(row => row.id)
          }
        },
      },
    )
    await new Promise(r => setTimeout(r,1000));
  }
}

main();