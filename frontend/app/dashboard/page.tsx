"use client"
import AppBar from "@/components/AppBar";
import { DarkButton } from "@/components/buttons/DarkButton";
import { LinkButton } from "@/components/buttons/LinkButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";

interface ActionType {
    id: string;
    name: string;
}

interface Action {
    id: string;
    zapId: string;
    actionId: string;
    sortingOrder: number;
    type: ActionType;
}

interface TriggerType {
    id: string;
    name: string;
}

interface Trigger {
    id: string;
    zapId: string;
    triggerId: string;
    type: TriggerType;
}

interface Zap {
    id: string;
    triggerId: string;
    userId: number;
    actions: Action[];
    trigger: Trigger;
}

function useZaps() {
    const [loading, setLoading] = useState(true);
    const [zaps, setZaps] = useState<Zap[]>([]);
    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/zap`, {
            headers: {
                Authorization: `${localStorage.getItem("token")}`
            }
        })
            .then(res => {
                setZaps(res.data.zaps)
                setLoading(false);
            })
    }, [])
    return { loading, zaps }
}

export default function () {
    const { loading, zaps } = useZaps();
    const router = useRouter();
    return (
        <div>
            <AppBar />
            <div className="flex justify-center pt-8">
                <div className="border bg-white shadow-lg rounded-lg max-w-screen-lg w-full p-8">
                    <div className="flex flex-col">
                        <div className="flex justify-between p-4">
                            <div className="text-2xl font-semibold">My Flows</div>
                            <DarkButton onClick={() => {
                                router.push("/zap/create")
                             }}>Create</DarkButton>
                        </div>
                        <div>
                            {loading ? <div>Loading...</div> : <ZapList zaps={zaps} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
function ZapList({ zaps }: { zaps: Zap[] }) {
    const router = useRouter();
    return (
        <div className="mt-4">
            {/* Header Row */}
            <div className="flex bg-gray-200 font-semibold text-center py-3 rounded-t-lg">
                <div className="w-2/5 text-left px-4">Trigger & Actions</div>
                <div className="w-1/5 text-left px-4">Name</div>
                <div className="w-1/5 text-left px-4">Last Edited</div>
                <div className="w-1/5 text-center px-4">Go</div>
            </div>
            
            {/* Data Rows */}
            {zaps.map(z => (
                <div key={z.id} className="flex border-b border-gray-300 py-3 items-center">
                    <div className="w-2/5 px-4">{z.trigger.type.name}, {z.actions.map(action => action.type.name).join(", ")}</div>
                    <div className="w-1/5 px-4 truncate">{z.id}</div>
                    <div className="w-1/5 px-4">2024-03-02</div>
                    <div className="w-1/5 flex justify-center">
                        <LinkButton onClick={() => router.push("/zap/" + z.id)}>Go</LinkButton>
                    </div>
                </div>
            ))}
        </div>
    );
}
