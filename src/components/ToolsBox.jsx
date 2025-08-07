import { useNavigate } from "react-router-dom";

export const ToolsBox = ({img, title, route}) => {
    const navigate = useNavigate();

    return(
        <div onClick={() => navigate(route)} className="Border rounded-4xl flex flex-col gap-2 bg-white p-12 hover:scale-[1.02] hover:shadow-lg">
            <img src={img} alt={title} className="w-32 h-32"></img>
            <span className="font-bold text-2xl text-agro-color">{title}</span>
        </div>
    );
}