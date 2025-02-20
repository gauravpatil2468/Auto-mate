import { Router } from "express";
import { authMiddleware } from "../middleware";
import { ZapCreateSchema } from "../types";
import { prismaClient } from "../db";
const router = Router();

router.post("/",authMiddleware,async (req, res) => {
    //@ts-ignore
    const id:string = req.id;
    const data = req.body;
    const parsedData = ZapCreateSchema.safeParse(data);
    if(!parsedData.success){
        res.status(411).json({message: "Invalid data", errors: parsedData.error});
        return;
    }

    const zapId  = await prismaClient.$transaction(async (tx) => {
        const zap = await tx.zap.create({
            data: {
                userId: parseInt(id), 
                triggerId: "", 
                actions: {
                    create: parsedData.data.actions?.map((x, index) => ({
                        actionId: x.availableActionId,
                        sortingOrder: index,
                    })) || [] // Fallback to empty array if actions are undefined
                }
            }
        });
    
        const trigger = await tx.trigger.create({
            data: {
                zapId: zap.id,
                triggerId: parsedData.data.availableTriggerId,
            }
        });
    
        await tx.zap.update({
            where: { id: zap.id },
            data: { triggerId: trigger.id }
        });

        return zap.id;
    }); 

    res.json({zapId});

        
});

router.get("/:zapId",authMiddleware,async (req, res) => {
    //@ts-ignore
    const id = req.id;
    const zapId = req.params.zapId;
    const zap = await prismaClient.zap.findFirst({
        where: {
            id: zapId,  
            userId: parseInt(id),
        },
        include: {
            actions: {
                include: {
                    type: true
                }
            },
            trigger:{
                include: {
                    type: true
                }
            }
        }
    });
    res.json({zap});
});

router.get("/",authMiddleware,async  (req, res) => {
    //@ts-ignore
    const id = req.id;
    const zaps = await prismaClient.zap.findMany({
        where: {
            userId: parseInt(id),
        },
        include: {
            actions: {
                include: {
                    type: true
                }
            },
            trigger:{
                include: {
                    type: true
                }
            }
        }
    });

    res.json({zaps});
    
});


export const zapRouter = router;