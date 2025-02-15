import express from "express";
import { PrismaClient } from "@prisma/client";
const client = new PrismaClient();
const app = express()
app.use(express.json())

//https://hooks.zapier.com/hooks/catch/21587862/2atu476/

app.post('/hooks/catch/:userId/:zapId',async (req,res)=>{
    const userId = req.params.userId
    const zapId = req.params.zapId
    const body  = req.body
    await client.$transaction(async tx=>{
       const run = await tx.zapRun.create({
              data:{
                zapId:zapId,
                metadata:body,
              }
       });
       await tx.zapRunOutbox.create({
         data:{
            zapRunId:run.id,
         }
       })

    })
    res.json({message:"success"})
    
})

app.listen(3000,()=>{
    console.log("Server is running on port 3000")
})
