import { useState } from "react";
import axios from "axios";

export default function StockOut() {
  const API = import.meta.env.VITE_API_URL;
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [processing, setProcessing] = useState(false);

  // 🔹 Ambil semua item
  const fetchAllItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/items`);
      setItems(res.data.items || []);
      setShowAll(true);
    } catch (err) {
      console.error("Gagal fetch semua item:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cari berdasarkan keyword
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);
    setShowAll(false);

    if (value.trim() === "") {
      setItems([]);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/items/search?q=${value}`);
      setItems(res.data.items || []);
    } catch (err) {
      console.error("Gagal mencari item:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Tambah atau update ke daftar keluar
  const handleAddToSelected = (item) => {
    const qty = Number(quantities[item.id]);
    if (!qty || qty <= 0) {
      alert("Masukkan jumlah keluar yang valid!");
      return;
    }

    setSelectedItems((prev) => {
      const exist = prev.find((i) => i.id === item.id);
      if (exist) {
        return prev.map((i) => (i.id === item.id ? { ...i, jumlah: qty } : i));
      }
      return [...prev, { ...item, jumlah: qty }];
    });

    // kosongkan input setelah ditambahkan
    setQuantities((prev) => ({ ...prev, [item.id]: "" }));
  };

  // 🔹 Hapus dari daftar keluar
  const handleRemoveSelected = (id) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
  };

  // 🔹 Proses batch keluar
  const handleBatchOut = async () => {
    if (selectedItems.length === 0) {
      alert("Tidak ada item yang dipilih!");
      return;
    }

    const itemsToProcess = selectedItems.map(({ id, jumlah }) => ({
      itemId: id,
      jumlah,
    }));

    try {
      setProcessing(true);
      await axios.post(`${API}/api/stock/out/batch`, {
        items: itemsToProcess,
      });

      alert("✅ Semua stok berhasil dikurangi!");
      setSelectedItems([]);
      if (showAll) fetchAllItems();
      else if (search) handleSearch({ target: { value: search } });
    } catch (err) {
      console.error(err);
      alert("❌ Gagal mengurangi stok.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ===================== LEFT SIDE ===================== */}
      <div>
        <h1 className="text-xl font-bold mb-4">📦 Semua Item</h1>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Cari item berdasarkan kode / nama..."
            className="border border-gray-300 rounded-lg px-4 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={fetchAllItems}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Tampilkan Semua
          </button>
        </div>

        {loading && <p>Loading data...</p>}

        {!loading && items.length > 0 && (
          <div className="overflow-x-auto border rounded-lg max-h-[70vh] overflow-y-auto">
            <table className="min-w-full border-collapse text-sm text-center">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border px-3 py-2">No</th>
                  <th className="border px-3 py-2">Nama</th>
                  <th className="border px-3 py-2">Kode</th>
                  <th className="border px-3 py-2">Qty Stok</th>
                  <th className="border px-3 py-2">Keluar</th>
                  <th className="border px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const selected = selectedItems.find((i) => i.id === item.id);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">{index + 1}</td>
                      <td className="border px-3 py-2">{item.nama}</td>
                      <td className="border px-3 py-2">{item.kode}</td>
                      <td className="border px-3 py-2">{item.quantity}</td>
                      <td className="border px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          value={quantities[item.id] || ""}
                          onChange={(e) =>
                            setQuantities((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          className="border rounded px-2 py-1 w-20 text-center"
                        />
                      </td>
                      <td className="border px-3 py-2">
                        <button
                          onClick={() => handleAddToSelected(item)}
                          className={`px-3 py-1 rounded text-white ${
                            selected
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {selected ? "Update" : "Tambah"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================== RIGHT SIDE ===================== */}
      <div>
        <h1 className="text-xl font-bold mb-4">🧾 Daftar Barang Keluar</h1>

        {selectedItems.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada item yang dipilih.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg max-h-[70vh] overflow-y-auto">
            <table className="min-w-full border-collapse text-sm text-center">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border px-3 py-2">No</th>
                  <th className="border px-3 py-2">Nama</th>
                  <th className="border px-3 py-2">Kode</th>
                  <th className="border px-3 py-2">Keluar</th>
                  <th className="border px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{index + 1}</td>
                    <td className="border px-3 py-2">{item.nama}</td>
                    <td className="border px-3 py-2">{item.kode}</td>
                    <td className="border px-3 py-2">{item.jumlah}</td>
                    <td className="border px-3 py-2">
                      <button
                        onClick={() => handleRemoveSelected(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                      >
                        ❌ Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedItems.length > 0 && (
          <button
            onClick={handleBatchOut}
            disabled={processing}
            className={`mt-4 w-full px-4 py-2 rounded-lg text-white transition ${
              processing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {processing ? "Memproses..." : "Proses Semua Barang Keluar"}
          </button>
        )}
      </div>
    </div>
  );
}
