import express from "express";
const app = express();
import { userRouter } from "./routes/user";
import { zapRouter } from "./routes/zap";
import cors from "cors";
import { actionRouter } from "./routes/action";
import { triggerRouter } from "./routes/trigger";
app.use(express.json());
app.use(cors());
app.use("/api/v1/user",userRouter);
app.use("/api/v1/zap",zapRouter);
app.use("/api/v1/action",actionRouter)
app.use("/api/v1/trigger",triggerRouter)

app.listen(3001,()=>{
    console.log("server started on port 3001");
});