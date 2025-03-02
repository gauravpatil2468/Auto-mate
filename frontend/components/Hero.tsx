"use client";
import { PrimaryButton } from "./buttons/PrimaryButton"
import { SecondaryButton } from "./buttons/SecondaryButton";
import { Feature } from "./Feature";
import { useRouter } from "next/navigation";

export const Hero = () => {
    const router  = useRouter();
    return (
        <div className="px-4 text-center">
            <div className="flex justify-center items-center">
                <div className="text-3xl md:text-5xl font-semibold pt-8 max-w-lg">
                    Automate Faster Than You Can Click
                </div>
            </div>
            <div className="flex justify-center items-center">
                <div className="text-lg md:text-xl font-normal pt-6 max-w-2xl">
                    Auto-Mate lets you build and deploy workflows as smart bots—effortless automation, no coding needed. Save time and let automation do the heavy lifting for you.
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center pt-8 gap-4">
                <PrimaryButton onClick={() => {
                    router.push("/signup")
                 }} size="big">Get Started</PrimaryButton>
                <SecondaryButton onClick={() => { }} size="big">Learn More</SecondaryButton>
            </div>

            <div className="flex flex-wrap justify-center gap-4 p-4 mt-6">
                <Feature title="Automate Fast" subtitle="Drag, drop, done." />
                <Feature title="No Coding" subtitle="Build & deploy easily." />
                <Feature title="App Support" subtitle="Works with Sheets, Email & more." />
            </div>
        </div>
    )
}
