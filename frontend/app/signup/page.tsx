"use client";
import AppBar from "@/components/AppBar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { CheckFeature } from "@/components/CheckFeature";
import { Input } from "@/components/Input";
import axios from "axios";
import { useState } from "react";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState("");
    const router = useRouter();
    return (
        <div>
            <AppBar />
            <div className="flex justify-center items-center pt-10 px-4 md:pt-20">
                <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg max-w-5xl w-full p-6 md:p-8 border">
                    <div className="flex-1 px-4 md:mr-5 text-center md:text-left">
                        <div className="font-bold text-2xl md:text-3xl pb-4">
                            Join to automate your work from anywhere using Auto-Mate.
                        </div>
                        <div className="pt-4 space-y-2">
                            <CheckFeature title="Automate Fast" />
                            <CheckFeature title="No Coding" />
                            <CheckFeature title="App Support" />
                        </div>
                    </div>
                    <div className="flex-1 p-6 md:p-10 mt-6 md:mt-0 border rounded-lg shadow-md bg-gray-50 flex flex-col items-center">
                        <Input label="Name" placeholder="Enter your name" onChange={e => { 
                            setName(e.target.value);
                        }} />
                        <Input label="Email" placeholder="Enter your email" onChange={e => {
                            setEmail(e.target.value);
                         }} />
                        <Input label="Password" placeholder="Enter your password" onChange={e => {
                            setPassword(e.target.value);
                         }} type="password" />
                        <div className="pt-4 flex justify-center w-full">
                            <PrimaryButton onClick={async() => {
                                const res = await axios.post(`${BACKEND_URL}/api/v1/user/signup`,{
                                    username: email,
                                    password,
                                    name
                                })
                                if(res.data.success){
                                    alert("Signup successful")
                                }
                                router.push("/login");

                             }} size="big">Sign Up</PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
