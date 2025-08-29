import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export const ToolsBox = ({ img, title, route, canClose }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(route)}
            className={`snap-center cursor-pointer border rounded-3xl flex flex-col items-center gap-4 bg-white p-8 min-w-[240px] transition-all duration-200 hover:scale-105 hover:shadow-xl ${canClose ? 'shadow-[0_0_20px_red] animate-blinking' : ''
                }`}
        >
            {/* Image container with relative positioning */}
            <div className="relative w-32 h-32">
                <img
                    src={img}
                    alt={title}
                    className="w-full h-full object-contain"
                />

                {/* Warning icon overlay */}
                {canClose && (
                    <AlertTriangle className="absolute top-0 right-0 w-12 h-12 text-red-600 animate-pulse" />
                )}
            </div>

            <span className="font-bold text-2xl text-agro-color text-center">
                {title}
            </span>
        </div>
    );
};