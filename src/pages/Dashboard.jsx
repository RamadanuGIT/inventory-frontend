import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/analytics/dashboard`).then((res) => {
      const formatted = res.data.transactions.map((t) => ({
        ...t,
        month: new Date(t.month).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
      }));
      setData({ ...res.data, transactions: formatted });
    });
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-4 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Items" value={data.totalItems} />
        <StatCard title="Total Stock" value={data.totalStock} />
        <StatCard title="Low Stock Items" value={data.lowStock} />
      </div>

      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Transactions (12 months)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data.transactions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="total_in"
              stroke="#82ca9d"
              name="Stock In"
            />
            <Line
              type="monotone"
              dataKey="total_out"
              stroke="#8884d8"
              name="Stock Out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 text-center">
      <p className="text-gray-500">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
