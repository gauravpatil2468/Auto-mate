import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { Kafka } from "kafkajs";
import { parse } from "./parser";
import { sendEmail } from "./email";
import { sendSol } from "./solana";

const prismaClient = new PrismaClient();
const TOPIC_NAME = "zap-events";

const kafka = new Kafka({
    clientId: "outbox-processor-2",
    brokers: ["localhost:9092"]
});

async function main() {
    const consumer = kafka.consumer({ groupId: "main-worker-2" });
    await consumer.connect();
    const producer = kafka.producer();
    await producer.connect();

    await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

    await consumer.run({
        autoCommit: false,
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                partition,
                offset: message.offset,
                value: message.value?.toString(),
            });

            const rawMessage = message.value?.toString() || ""; // Ensure string

            let parsedValue;
            try {
                parsedValue = JSON.parse(rawMessage);
            } catch (error) {
                console.error("Invalid JSON received:", rawMessage, error);
                return; // Skip processing this message
            }

            const zapRunId = parsedValue.zapRunId;
            const stage = parsedValue.stage;

            if (!zapRunId || stage === undefined) {
                console.error("Invalid message format, missing zapRunId or stage.");
                return;
            }

            const zapRunDetails = await prismaClient.zapRun.findFirst({
                where: { id: zapRunId },
                include: {
                    zap: {
                        include: {
                            actions: { include: { type: true } }
                        }
                    }
                }
            });

            if (!zapRunDetails) {
                console.error(`No zapRun found for ID: ${zapRunId}`);
                return;
            }

            const currentAction = zapRunDetails.zap.actions.find(x => x.sortingOrder === stage);

            if (!currentAction) {
                console.error(`No action found for stage ${stage}`);
                return;
            }

            const zapRunMetadata = zapRunDetails.metadata ?? {}; // ✅ Ensure metadata is always an object

            if (currentAction.type.id === "email") {
                const body = parse((currentAction.metadata as JsonObject)?.body as string || "", zapRunMetadata);
                const to = parse((currentAction.metadata as JsonObject)?.email as string || "", zapRunMetadata);

                if (!to || !body) {
                    console.error("Email parameters missing!");
                    return;
                }

                console.log(`Sending email to ${to} with body: ${body}`);
                await sendEmail(to, body);
            }

            if (currentAction.type.id === "send-sol") {
                const amount = parse((currentAction.metadata as JsonObject)?.amount as string || "", zapRunMetadata);
                const address = parse((currentAction.metadata as JsonObject)?.address as string || "", zapRunMetadata);

                if (!amount || !address) {
                    console.error("Solana transaction parameters missing!");
                    return;
                }

                console.log(`Sending SOL of ${amount} to address ${address}`);
                await sendSol(address, amount);
            }

            await new Promise(r => setTimeout(r, 500));

            const lastStage = (zapRunDetails.zap.actions.length || 1) - 1;
            if (lastStage !== stage) {
                console.log("Pushing back to the queue");
                await producer.send({
                    topic: TOPIC_NAME,
                    messages: [{
                        value: JSON.stringify({
                            stage: stage + 1,
                            zapRunId
                        })
                    }]
                });
            }

            console.log("Processing done");

            // ✅ Commit offsets safely
            await consumer.commitOffsets([{
                topic: TOPIC_NAME,
                partition: partition,
                offset: (parseInt(message.offset) + 1).toString()
            }]);
        }
    });
}

main();
