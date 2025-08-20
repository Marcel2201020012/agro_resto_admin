import { useNavigate } from "react-router-dom";

export const EditMenuListBox = ({ img, title, route, category }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(route, { state: category })}
            className="snap-center cursor-pointer border rounded-3xl flex flex-col items-center gap-4 bg-white p-8 min-w-[240px] transition-all duration-200 hover:scale-105 hover:shadow-xl"
        >
            <img src={img} alt={title} className="w-32 h-32 object-contain" />
            <span className="font-bold text-2xl text-agro-color text-center">{title}</span>
        </div>
    );
}