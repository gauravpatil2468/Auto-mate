"use client";
export const Input = ({label,placeholder,onChange,type="text"}:{
    label: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: "text" | "password";
}) => {
    return(
        <div className="flex flex-col gap-2">
            <div className="text-sm font-semibold">
                * <label>{label}</label>
                 </div>
            <input className="border rounded px-4 py-2 w-full border-black" type={type} placeholder={placeholder} onChange={onChange}/>
        </div>
    )
}