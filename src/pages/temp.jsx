const dayKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
};

export const Closing = () => {
    const [orders, setOrder] = useState([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const formatIDR = new Intl.NumberFormat("id-ID");
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalTransactions: 0,
    });

    const to = useMemo(() => new Date(), []);

    const STATUS_PRIORITY = {
        'Waiting For Payment On Cashier': 1,
        'Preparing Food': 2,
        'Order Canceled': 3,
        'Order Finished': 4
    };

    const now = new Date();
    const hour = now.getHours();

    const shiftDocRef = doc(db, "app_state", "shift");
    const [lastClosed, setIsLastClosed] = useState(null);
    const [shiftType, setShiftType] = useState(null);
    const summaryTitle = shiftType === "morning" ? "Morning Shift" : "Night Shift";
    const shiftTitle = shiftType === "morning" ? "Shift Closing" : "Cashier Closing";

    //fetch shiftType and lastClosed from firestore
    useEffect(() => {
        const unsub = onSnapshot(shiftDocRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setShiftType(data.type);
                setIsLastClosed(data?.lastClosed?.toDate ? data.lastClosed.toDate() : new Date(0));

            }
        }, (err) => {
            console.error("Error listening to shift doc:", err);
        });

        return () => unsub();
    }, []);

    //set allowed logic (for when user are allowed to press the close button)
    useEffect(() => {
        const checkTime = () => {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            let allowed = false;

            // Shift windows in minutes
            const morningStart = 11 * 60 + 35; // 11:35
            const morningEnd = 20 * 60 + 35;   // 20:35
            const nightStart = 20 * 60 + 35;   // 20:35
            const nightEnd = 11 * 60 + 35;     // 11:35 next day

            const isInInterval = (start, end, time) => {
                if (start <= end) return time >= start && time < end;
                return time >= start || time < end; // wraps around midnight
            };

            if (shiftType === "morning") {
                allowed = isInInterval(morningStart, morningEnd, currentMinutes);
            } else if (shiftType === "night") {
                allowed = isInInterval(nightStart, nightEnd, currentMinutes);
            }

            // Check lastClosed
            if (lastClosed instanceof Date) {
                const lastClosedMinutes = lastClosed.getHours() * 60 + lastClosed.getMinutes();
                let lastClosedInShift = false;

                if (shiftType === "morning") {
                    // Only check today
                    if (lastClosed.toDateString() === now.toDateString()) {
                        lastClosedInShift = isInInterval(morningStart, morningEnd, lastClosedMinutes);
                    }
                } else if (shiftType === "night") {
                    // Night shift may start yesterday
                    const nightStartDate = new Date(now);
                    nightStartDate.setHours(20, 35, 0, 0);
                    const nightEndDate = new Date(nightStartDate);
                    nightEndDate.setDate(nightStartDate.getDate() + 1);
                    nightEndDate.setHours(6, 0, 0, 0);

                    lastClosedInShift = lastClosed >= nightStartDate && lastClosed < nightEndDate;
                }

                if (lastClosedInShift) allowed = false;
            }

            setIsAllowed(allowed);
        };

        //keep checking the time
        checkTime();
        const interval = setInterval(checkTime, 60000);

        return () => clearInterval(interval);
    }, [shiftType, lastClosed]);

    //calculate summary data from the lastClosed time to current date
    useEffect(() => {
        if (!lastClosed) return;
        (async () => {
            try {
                const qRef = query(
                    collection(db, "transaction_id"),
                    orderBy("createdAt", "asc"),
                    where("createdAt", ">=", Timestamp.fromDate(lastClosed)),
                    where("createdAt", "<=", Timestamp.fromDate(to))
                );

                const snap = await getDocs(qRef);
                const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

                let income = 0;
                const perDay = new Map();

                for (const t of rows) {
                    const created = t.createdAt?.toDate ? t.createdAt.toDate() : null;
                    if (!created) continue;

                    const key = dayKey(created);
                    const totalNum = t.status === "Order Finished" ? Number(t.total) || 0 : 0;
                    income += totalNum;

                    const dEntry = perDay.get(key) || { date: created, income: 0, count: 0 };
                    dEntry.income += totalNum;
                    dEntry.count += 1;
                    perDay.set(key, dEntry);
                }

                setSummary({ totalIncome: income, totalTransactions: rows.length });
            } catch (e) {
                console.error(e);
            }
        })();
    }, [lastClosed, to]);

    //fetch order data from fireStore
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "transaction_id"), (snapshot) => {
            const orderData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrder(orderData);
            setIsLoading(false)
        });
        return () => unsub();
    }, []);

    //filter order from lastClosed to current date
    const filteredSortedOrders = useMemo(() => {
        return orders
            .filter(order => {
                const createdAt = order.createdAt?.toDate();
                if (!createdAt) return false;
                return createdAt >= lastClosed && createdAt <= to;
            })
            .sort((a, b) => {
                const statusComparison = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
                if (statusComparison !== 0) return statusComparison;
                return b.createdAt.toDate() - a.createdAt.toDate();
            });
    }, [orders, lastClosed, to]);

    const getOrdersByStatus = status => {
        const statusOrders = filteredSortedOrders.filter(order => order.status === status);

        let heightClass = "";
        if (statusOrders.length > 0 && statusOrders.length < 2) heightClass = "h-32";
        else if (statusOrders.length < 4) heightClass = "h-40";
        else if (statusOrders.length >= 6) heightClass = "h-96";

        return { orders: statusOrders, heightClass };
    };

    const { orders: waitingOrders, heightClass: waitingHeight } = getOrdersByStatus("Waiting For Payment On Cashier");
    const { orders: preparingOrders, heightClass: preparingHeight } = getOrdersByStatus("Preparing Food");
    const { orders: finishedOrders, heightClass: finishedHeight } = getOrdersByStatus("Order Finished");
    const { orders: canceledOrders, heightClass: canceledHeight } = getOrdersByStatus("Order Canceled");

    const handleShiftClose = () => {
        setShowModal(true);
    }

    //handle close shift button logic
    const handleShiftClosing = async () => {
        if (!isAllowed) return;
        setIsProcessing(true);

        const closingShift = shiftType;
        const newShift = shiftType === "morning" ? "night" : "morning";

        try {
            const q = query(
                collection(db, "transaction_id"),
                where("createdAt", ">=", lastClosed),
                where("createdAt", "<=", to)
            );

            const snapshot = await getDocs(q);
            const batch = writeBatch(db);

            //add shiftType into every transactions
            snapshot.docs.forEach(docSnap => {
                // Always add shiftType to each transaction
                batch.update(docSnap.ref, { shiftType: closingShift });

                // Auto-update statuses
                const { status } = docSnap.data();
                if (status === "Waiting For Payment On Cashier") {
                    batch.update(docSnap.ref, { status: "Order Canceled" });
                } else if (status === "Preparing Food") {
                    batch.update(docSnap.ref, { status: "Order Finished" });
                }
            });

            // Update the shift type document
            batch.update(shiftDocRef, { type: newShift, lastClosed: serverTimestamp() });
            
            await batch.commit();
            setShiftType(newShift);
            console.log(`Shift closed: ${closingShift} → ${newShift}`);
        } catch (error) {
            console.log("Error updating pending status: ", error)
        }

        await signOut(auth);
    };
}