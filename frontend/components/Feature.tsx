export const Feature = ({ title, subtitle }: { title: string; subtitle: string; }) => {
    return (
        <div className="flex flex-col md:flex-row justify-center items-center text-center md:text-left space-x-2">
            <Check />
            <div className="font-bold">
                {title}
            </div>
            <div className="font-normal">
                {subtitle}
            </div>
        </div>
    )
}

function Check(){
    return(
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
    )
}