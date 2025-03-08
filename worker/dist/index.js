"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const kafkajs_1 = require("kafkajs");
const parser_1 = require("./parser");
const email_1 = require("./email");
const solana_1 = require("./solana");
const prismaClient = new client_1.PrismaClient();
const TOPIC_NAME = "zap-events";
const kafka = new kafkajs_1.Kafka({
    clientId: "outbox-processor-2",
    brokers: ["localhost:9092"]
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const consumer = kafka.consumer({ groupId: "main-worker-2" });
        yield consumer.connect();
        const producer = kafka.producer();
        yield producer.connect();
        yield consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });
        yield consumer.run({
            autoCommit: false,
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ topic, partition, message }) {
                var _b, _c, _d, _e, _f, _g, _h;
                console.log({
                    partition,
                    offset: message.offset,
                    value: (_b = message.value) === null || _b === void 0 ? void 0 : _b.toString(),
                });
                const rawMessage = ((_c = message.value) === null || _c === void 0 ? void 0 : _c.toString()) || ""; // Ensure string
                let parsedValue;
                try {
                    parsedValue = JSON.parse(rawMessage);
                }
                catch (error) {
                    console.error("Invalid JSON received:", rawMessage, error);
                    return; // Skip processing this message
                }
                const zapRunId = parsedValue.zapRunId;
                const stage = parsedValue.stage;
                if (!zapRunId || stage === undefined) {
                    console.error("Invalid message format, missing zapRunId or stage.");
                    return;
                }
                const zapRunDetails = yield prismaClient.zapRun.findFirst({
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
                const zapRunMetadata = (_d = zapRunDetails.metadata) !== null && _d !== void 0 ? _d : {}; // ✅ Ensure metadata is always an object
                if (currentAction.type.id === "email") {
                    const body = (0, parser_1.parse)(((_e = currentAction.metadata) === null || _e === void 0 ? void 0 : _e.body) || "", zapRunMetadata);
                    const to = (0, parser_1.parse)(((_f = currentAction.metadata) === null || _f === void 0 ? void 0 : _f.to) || "", zapRunMetadata);
                    console.log(to);
                    if (!to || !body) {
                        console.error("Email parameters missing!");
                        return;
                    }
                    console.log(`Sending email to ${to} with body: ${body}`);
                    yield (0, email_1.sendEmail)(to, body);
                }
                if (currentAction.type.id === "send-sol") {
                    const amount = (0, parser_1.parse)(((_g = currentAction.metadata) === null || _g === void 0 ? void 0 : _g.amount) || "", zapRunMetadata);
                    const address = (0, parser_1.parse)(((_h = currentAction.metadata) === null || _h === void 0 ? void 0 : _h.to) || "", zapRunMetadata);
                    if (!amount || !address) {
                        console.error("Solana transaction parameters missing!");
                        return;
                    }
                    console.log(`Sending SOL of ${amount} to address ${address}`);
                    yield (0, solana_1.sendSol)(address, amount);
                }
                yield new Promise(r => setTimeout(r, 500));
                const lastStage = (zapRunDetails.zap.actions.length || 1) - 1;
                if (lastStage !== stage) {
                    console.log("Pushing back to the queue");
                    yield producer.send({
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
                yield consumer.commitOffsets([{
                        topic: TOPIC_NAME,
                        partition: partition,
                        offset: (parseInt(message.offset) + 1).toString()
                    }]);
            })
        });
    });
}
main();
