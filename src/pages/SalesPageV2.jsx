import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Receipt } from "lucide-react";

const toStartOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
};

const toEndOfDay = (d) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
};

const dayKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
};

const formatIDR = new Intl.NumberFormat("id-ID");

export const SalesPage = () => {
    const navigate = useNavigate();
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    const [from, setFrom] = useState(weekAgo.toISOString().slice(0, 10));
    const [to, setTo] = useState(today.toISOString().slice(0, 10));
    const [isLoading, setisLoading] = useState(true);

    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalTransactions: 0,
        foods: [],
    });
    const [chartData, setChartData] = useState([]);
    const [foodsChartData, setFoodsChartData] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const start = toStartOfDay(new Date(from));
                const end = toEndOfDay(new Date(to));

                const qRef = query(
                    collection(db, "transaction_id"),
                    where("createdAt", ">=", Timestamp.fromDate(start)),
                    where("createdAt", "<=", Timestamp.fromDate(end)),
                    orderBy("createdAt", "asc")
                );

                const snap = await getDocs(qRef);
                const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

                let income = 0;
                const foodsMap = new Map();
                const perDay = new Map();

                for (const t of rows) {
                    const created = t.createdAt?.toDate ? t.createdAt.toDate() : null;
                    if (!created) continue;

                    const key = dayKey(created);
                    const totalNum = Number(t.total) || 0;
                    income += totalNum;

                    const dEntry = perDay.get(key) || { date: created, income: 0, count: 0 };
                    dEntry.income += totalNum;
                    dEntry.count += 1;
                    perDay.set(key, dEntry);

                    const items = Array.isArray(t.orderDetails)
                        ? t.orderDetails
                        : Object.values(t.orderDetails || {});

                    for (const it of items) {
                        const name = it?.name ?? "Unknown";
                        const qty = Number(it?.jumlah) || 0;
                        foodsMap.set(name, (foodsMap.get(name) || 0) + qty);
                    }
                }

                const foods = [...foodsMap.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, qty]) => ({ name, qty }));

                const chart = [...perDay.entries()]
                    .sort((a, b) => a[1].date - b[1].date)
                    .map(([key, v]) => ({ date: key, income: v.income, count: v.count }));

                setSummary({ totalIncome: income, totalTransactions: rows.length, foods });
                setChartData(chart);
                setFoodsChartData(foods);
            } catch (e) {
                console.error(e);
            } finally {
                setisLoading(false);
            }
        })();
    }, [from, to]);

    if (isLoading) return <div className="container min-h-screen flex justify-center items-center">
        <p className="text-lg font-semibold">Loading Sales Data...</p>
    </div>;

    return (
        <div className="container min-h-screen overflow-x-hidden p-6 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="text-left">
                    <div onClick={() => navigate("/", { replace: true })} className="text-agro-color font-medium cursor-pointer">
                        AGRO RESTO
                    </div>
                    <div className="text-4xl font-bold">
                        Sales
                    </div>
                </div>

                <div className="flex gap-6">
                    <div>
                        <label className="block text-left text-sm text-gray-600">From</label>
                        <input
                            type="date"
                            className="border bg-white rounded-xl px-3 py-2"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-left text-sm text-gray-600">To</label>
                        <input
                            type="date"
                            className="border bg-white rounded-xl px-3 py-2"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </div>
                </div>
                {isLoading && <div className="text-sm text-gray-500">Loading…</div>}
            </div>

            <div className="bg-white shadow-md rounded-2xl p-6 space-y-6">
                <h2 className="text-xl font-semibold mb-4">Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mx-auto mt-6">
                    <div className="flex gap-4 justify-center items-center jusigap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm font-medium">Total Income</div>
                            <div className="text-xs text-gray-400 italic">*Before Tax</div>
                            <div className="text-2xl font-bold text-gray-800">
                                Rp {formatIDR.format(summary.totalIncome)}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center items-center gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                            <Receipt size={24} />
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm font-medium">Total Transactions</div>
                            <div className="text-2xl font-bold text-gray-800">
                                {summary.totalTransactions}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-left text-xl font-semibold mb-4">Items Sold</div>
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={foodsChartData} margin={{ left: 12, right: 12, top: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis className="text-xs" dataKey="name" interval={0} angle={-30} textAnchor="end" height={80} />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="qty" name="Quantity" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white shadow-md rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Transaction Volume</h2>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart
                        data={chartData}
                        margin={{ left: 50, right: 20, top: 10, bottom: 0 }} // increase left margin
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis className="text-xs" dataKey="date" />
                        <YAxis
                            className="text-xs"
                            tickMargin={10} // adds spacing between axis line and labels
                            tickFormatter={(value) =>
                                new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                }).format(value)
                            }
                        />
                        <Tooltip
                            formatter={(value) =>
                                new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                }).format(value)
                            }
                            labelFormatter={(label) => label}
                        />
                        <Area
                            className="text-xs"
                            type="monotone"
                            dataKey="income"
                            name="Income"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-10 mb-8 text-left">
                <button onClick={() => navigate(-1)} className="bg-agro-color rounded-full p-2 w-24 text-white">
                    Back
                </button>
            </div>
        </div>
    );
}