import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { useEffect, useRef } from "react";
import { db } from "../../firebase/firebaseConfig";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

export default function OrderListener() {
    const lastOrderId = useRef(null);
    const firstLoad = useRef(true);
    const audioRef = useRef(new Audio("/agro_resto_notification.mp3"));
    const navigate = useNavigate();

    useEffect(() => {
        audioRef.current.loop = true;
    }, []);

    useEffect(() => {
        const q = query(collection(db, "transaction_id"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snapshot) => {
            if(!snapshot.empty){
                const latestOrder = snapshot.docs[0];
                const latestOrderId = latestOrder.id;

                if(firstLoad.current){
                    lastOrderId.current = latestOrderId;
                    firstLoad.current = false;
                    return;
                }

                if(latestOrderId !== lastOrderId.current){
                    audioRef.current.play().catch((err) => {
                        console.warn("Failed to play notification:", err);
                    });

                    toast.info(`New order: ${latestOrderId}`, {
                        autoClose: false,
                        closeOnClick: false,
                        closeButton: false,
                        draggable: false,
                        onClick: () => {
                            audioRef.current.pause();
                            audioRef.current.currentTime = 0;
                            navigate(`/orderDetail/${latestOrderId}`);
                            toast.dismiss();
                        }
                    });
                }

                lastOrderId.current = latestOrderId;
            }
        });
        return () => unsub();
    }, []);

    return null;
}