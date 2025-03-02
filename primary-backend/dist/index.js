"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const user_1 = require("./routes/user");
const zap_1 = require("./routes/zap");
const cors_1 = __importDefault(require("cors"));
const action_1 = require("./routes/action");
const trigger_1 = require("./routes/trigger");
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/v1/user", user_1.userRouter);
app.use("/api/v1/zap", zap_1.zapRouter);
app.use("/api/v1/action", action_1.actionRouter);
app.use("/api/v1/trigger", trigger_1.triggerRouter);
app.listen(3001, () => {
    console.log("server started on port 3001");
});
