import express from "express";
const app = express();
import { userRouter } from "./routes/user";
import { zapRouter } from "./routes/zap";
import cors from "cors";
app.use(express.json());
app.use(cors());
app.use("/api/v1/user",userRouter);
app.use("/api/v1/zap",zapRouter);

app.listen(3001,()=>{
    console.log("server started on port 3000");
});