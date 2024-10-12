import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

// password logic
app.post('/hooks/catch/:userId/:zapId', async (req, res) => {
  const userId = req.params.userId;
  const zapId = req.params.zapId;
  const body = req.body;
  console.log('webhook reached here')

  // store in db a new trigger 
  await prisma.$transaction( async tx =>{
    const run = await tx.zapRun.create({
      data: {
        zapId : zapId,
        metadata: body
      },
    });
    await tx.zapRunOutbox.create({
      data: {
        zapRunId : run.id,
      },
    });
  });
  res.json({
    message: 'webhook received successfully',
  })
  

  // push in to queue (kafka/redis)

});


app.listen(3000, () => {
  console.log('Server running on port 3000');
});
