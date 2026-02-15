import { Loader2 } from "lucide-react";

function Loading () {
    return (
        <div className="absolute top-0 left-0 bg-black/60 w-full h-full">
            <div className="flex items-center flex-col justify-center h-full">
                <Loader2 size={50} className="animate-spin text-emerald-600" />
                <p className="text-white text-2xl font-bold">Generating Questions...</p>
            </div>
        </div>
    )
}

export default Loading;
