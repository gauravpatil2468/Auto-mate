"use client";
import { LinkButton } from "./buttons/LinkButton"
import { useRouter } from "next/navigation";
import { PrimaryButton } from "./buttons/PrimaryButton";

const AppBar = () => {
    const router = useRouter();
    return(
        <div className="flex flex-wrap border-b justify-between items-center px-4 py-2">
            <div className="text-2xl font-extrabold">Auto-Mate</div>
            <div className="flex space-x-4">
                <LinkButton onClick={()=>{}}>Contact</LinkButton>
                <LinkButton onClick={()=>{
                    router.push("/login");
                }}>Login</LinkButton>
                <PrimaryButton onClick={()=>{
                    router.push("/signup");}}>Sign Up</PrimaryButton>
            </div>
        </div>
    ) 
}


    export default AppBar;