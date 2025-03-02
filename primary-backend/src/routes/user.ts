import { Router, Request, Response, NextFunction } from "express";
import { authMiddleware } from "../middleware";
import { SigninSchema, SignupSchema } from "../types";
import { prismaClient } from "../db";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";

const router = Router();

// Signup Route
router.post("/signup", async (req: Request, res: Response) => {
    try {
        // Fix: Validate the whole `req.body` instead of just `username`
        const parsedData = SignupSchema.safeParse(req.body);

        if (!parsedData.success) {
            res.status(411).json({ message: "Incorrect inputs" });
            return;
        }

        const userExists = await prismaClient.user.findFirst({
            where: { email: parsedData.data.username },
        });

        if (userExists) {
            res.status(403).json({ message: "User already exists" });
            return;
        }

        await prismaClient.user.create({
            data: {
                email: parsedData.data.username,
                password: parsedData.data.password,
                name: parsedData.data.name,
            },
        });

        res.json({ message: "Please verify your account" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Signin Route
router.post("/signin",async (req: Request, res: Response) => {
    try {
        const parsedData = SigninSchema.safeParse(req.body);

        if (!parsedData.success) {
            res.status(411).json({ message: "Incorrect inputs" });
            return;
        }

        const user = await prismaClient.user.findFirst({
            where: {
                email: parsedData.data.username,
                password: parsedData.data.password,
            },
         });

         if(!user){
             res.status(403).json({message: "Incorrect credentials"});
             return;
         }

         const token = jwt.sign({
            id: user.id
        },JWT_PASSWORD);
        res.json({
            token:token,
        })
        
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        
    }
});

// Get User Route (with auth middleware)
router.get("/", authMiddleware, async (req: Request, res: Response) => {
   //TODO: fix the type
   //@ts-ignore
   const id = req.id;
   const user = await prismaClient.user.findFirst({
       where: {
           id: id,
       },
       select: {
        name: true,
        email: true,
       }
   });
    res.json(user);
});

export const userRouter = router;
