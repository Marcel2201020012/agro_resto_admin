import { useNavigate } from "react-router-dom";

export const EditMenuListBox = ({img, title, route, category}) => {
    const navigate = useNavigate();

    return(
        <div onClick={() => navigate(route, {state: category})} className="Border rounded-4xl flex flex-col items-center gap-2 bg-white p-12 hover:scale-[1.02] hover:shadow-lg min-w-60">
            <img src={img} alt={title} className="w-32 h-32"></img>
            <span className="font-bold text-2xl text-agro-color">{title}</span>
        </div>
    );
}