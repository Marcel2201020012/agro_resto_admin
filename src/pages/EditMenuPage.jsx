import { useEffect, useState } from "react";
import { EditMenuBox } from "../components/EditMenuBox";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";

export const EditMenuPage = () => {
    const navigate = useNavigate();
    const [order, setOrder] = useState([]);
    const location = useLocation();
    const category = location.state;

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "menu_makanan"), (snapshot) => {
            const orderData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrder(orderData);
            setIsLoading(false);
        })

        return () => unsub();
    }, []);

    const getOrderByCategory = (category) => {
        return order
            .filter(item => item.category === category && item.createdAt)
            .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
    };

    const orders = getOrderByCategory(category);

    if (!order.every(item => item.createdAt) || isLoading) {
        return (
            <div className="container min-h-screen flex justify-center items-center">
                <p className="text-lg font-semibold">Loading Menu List...</p>
            </div>
        );
    }

    return (
        <div className="container min-h-screen overflow-x-hidden">
            <div className="text-left mt-8 font-bold text-4xl">
                {category} Menu List
            </div>

            <div className="grid grid-cols-2 items-center justify-center gap-8 mt-8 mb-8">
                {orders.length === 0 ? (
                    <div className="text-left text-red-500">Menu is empty</div>
                ) : (
                    orders.map(order => (
                        <EditMenuBox
                            key={order.id}
                            id={order.id}
                            img={order.image}
                            name={order.name}
                            cn={order.cn}
                            desc={order.desc}
                            price={order.price}
                            promotion={order.promotion}
                            stocks={order.stocks}
                        />
                    ))
                )}
            </div>

            <div onClick={() => navigate(-1)} className="bg-agro-color rounded-full px-6 py-2 w-45 mb-8">
                <span className="text-white">
                    Back
                </span>
            </div>
        </div>
    );
}