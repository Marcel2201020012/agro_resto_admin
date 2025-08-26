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
            if (firstLoad.current) {
                if (!snapshot.empty) {
                    lastOrderId.current = snapshot.docs[0].id;
                }
                firstLoad.current = false;
                return;
            }

            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    const newDocId = change.doc.id;
                    if (snapshot.docs[0].id === newDocId) {
                        audioRef.current.play().catch(err => console.warn("Failed to play:", err));
                        toast.info(`New order: ${newDocId}`, {
                            autoClose: false,
                            closeOnClick: false,
                            closeButton: false,
                            draggable: false,
                            onClick: () => {
                                audioRef.current.pause();
                                audioRef.current.currentTime = 0;
                                navigate(`/orderDetail/${newDocId}`);
                                toast.dismiss();
                            }
                        });
                        lastOrderId.current = newDocId;
                    }
                }
            });
        });

        return () => unsub();
    }, []);

    return null;
}