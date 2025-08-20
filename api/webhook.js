import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export default async function handler(req, res) {
    const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    try {
        // Parse body manually
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const rawBody = Buffer.concat(chunks).toString();
        console.log("Raw body:", rawBody);

        let body;
        try {
            body = JSON.parse(rawBody);
        } catch (e) {
            console.error("Failed to parse JSON:", e);
            return res.status(400).json({ error: "Invalid JSON" });
        }

        console.log("Parsed body:", body);

        const { order_id, transaction_status } = body;

        console.log("Looking for order id:", order_id);

        if (transaction_status === 'expire') {
            const orderRef = doc(db, 'transaction_id', order_id);
            await updateDoc(orderRef, { status: 'Order Canceled' });
        }

        return res.status(200).json({ received: "ok" });
    } catch (err) {
        console.error("Handler error:", err);
        res.status(500).json({ error: err.message });
    }
}