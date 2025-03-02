
import { ReactNode } from 'react'
export const SecondaryButton = ({children,onClick,size="small"}:
    {children: ReactNode,
        onClick: ()=> void,
        size?:"big" | "small"}) => {
    return (
        <div className={`${size=="small"?"text-sm":"text-xl"}
        ${size=="small"?"px-8 py-2":"px-14 py-3"} cursor-pointer flex flex-col justify-center hover:shadow-md border border-black rounded-full`} onClick={onClick}> 
            {children}
        </div>
        )
    }