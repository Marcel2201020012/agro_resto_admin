import midtransClient from 'midtrans-client';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    //   try {
    //     const coreApi = new midtransClient.CoreApi({
    //       isProduction: false,
    //       serverKey: process.env.MIDTRANS_SERVER_KEY_SANDBOX,
    //       clientKey: process.env.MIDTRANS_CLIENT_KEY_SANDBOX,
    //     });

    //     // const statusResponse = await coreApi.transaction.notification(req.body);
    //     const statusResponse = req.body;

    //     const orderId = statusResponse.order_id;
    //     const transactionStatus = statusResponse.transaction_status;

    //     if (transactionStatus === 'expire') {
    //       const orderRef = doc(db, 'transaction_id', orderId);
    //       await updateDoc(orderRef, { status: 'Order Canceled' });
    //     }
    try {
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const body = JSON.parse(Buffer.concat(chunks).toString());

        console.log("Incoming body:", body);

        const { order_id, transaction_status } = body;

        if (transaction_status === 'expire') {
            const orderRef = doc(db, 'transaction_id', order_id);
            await updateDoc(orderRef, { status: 'Order Canceled' });
        }

        res.status(200).send('OK');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}