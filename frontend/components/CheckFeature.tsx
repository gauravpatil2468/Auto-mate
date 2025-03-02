export const CheckFeature = ({ title }: { title: string }) => {
    return (
        <div className="flex gap-2 items-center">
            <CheckMark />
            <div className="font-semibold">
                {title}
            </div>
        </div>
    )
}

function CheckMark(){
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="green" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    )
}