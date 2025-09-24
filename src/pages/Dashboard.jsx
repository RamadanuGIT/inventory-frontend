import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  LabelList,
} from "recharts";

const API = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("daily");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItems, setModalItems] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async (start, end) => {
    try {
      const res = await axios.get(`${API}/api/analytics/dashboard`, {
        params: { startDate: start, endDate: end },
      });
      setData(res.data);
    } catch (err) {
      console.error("Fetch dashboard error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!data) return <p>Loading...</p>;

  const aggregateTransactions = (transactions, filter) => {
    const grouped = {};
    transactions.forEach((t) => {
      const date = new Date(t.date);
      let key = "";
      if (filter === "daily") {
        key = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      } else if (filter === "weekly") {
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const week = Math.ceil(
          ((date.getTime() - startOfYear.getTime()) / 86400000 +
            startOfYear.getDay() +
            1) /
            7
        );
        key = `${date.getFullYear()}-W${week}`;
      } else if (filter === "monthly") {
        key = date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      }
      if (!grouped[key]) grouped[key] = { key, total_in: 0, total_out: 0 };
      grouped[key].total_in += t.total_in;
      grouped[key].total_out += t.total_out;
    });
    return Object.values(grouped);
  };

  const openModal = (title, items) => {
    setModalTitle(title);
    setModalItems(items);
    setModalOpen(true);
  };

  const handleDateFilter = () => {
    if (startDate && endDate) fetchData(startDate, endDate);
  };

  return (
    <div className="p-4 space-y-8">
      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Items" value={data.totalItems} />
        <StatCard title="Total Stock" value={data.totalStock} />
        <StatCard
          title="Low Stock"
          value={data.lowStock}
          onClick={() => openModal("Low Stock Items", data.lowStockItems)}
          highlight="red"
        />
        <StatCard
          title="Stagnant Items (3M)"
          value={data.stagnantItemsCount}
          onClick={() => openModal("Stagnant Items", data.stagnantItems)}
          highlight="yellow"
        />
      </div>

      {/* Date Range Filter */}
      <div className="flex gap-2 items-center mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <span>to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button
          onClick={handleDateFilter}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          Apply
        </button>
      </div>

      {/* Filter transaksi */}
      <div className="flex gap-2 mb-4">
        {["daily", "weekly", "monthly"].map((f) => (
          <button
            key={f}
            className={`px-4 py-2 rounded ${
              filter === f ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Transaksi */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Transactions</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={aggregateTransactions(data.transactions, filter)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="key" />
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

      {/* Top Sales */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">
          Top 10 Sales (Last 1 Month)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.salesRanking}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nama" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_out" fill="#8884d8" name="Total Sold" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Modal Low Stock / Stagnant */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 max-h-[80vh] overflow-auto p-6">
            <h3 className="text-xl font-bold mb-4">{modalTitle}</h3>
            <ul className="space-y-2">
              {modalItems.map((item) => (
                <li key={item.id} className="border-b pb-1">
                  {item.nama}
                </li>
              ))}
            </ul>
            <button
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={() => setModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// StatCard component
function StatCard({ title, value, onClick, highlight }) {
  const highlightClasses =
    highlight === "red"
      ? "bg-red-500 text-white hover:bg-red-600"
      : highlight === "yellow"
      ? "bg-yellow-500 text-white hover:bg-yellow-600"
      : "bg-gray-400 text-gray-800 hover:bg-gray-500";

  return (
    <div
      className={`rounded-2xl shadow p-6 text-center cursor-pointer ${highlightClasses}`}
      onClick={onClick}
    >
      <p className="text-gray-200">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
