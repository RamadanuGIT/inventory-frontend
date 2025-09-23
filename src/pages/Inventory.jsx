import React, { useEffect, useState } from "react";
import axios from "axios";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    kode: "",
    nama: "",
    satuan: "",
    stockAwal: 0,
  });
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("kode");
  const [sortAsc, setSortAsc] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [stockModal, setStockModal] = useState({
    open: false,
    itemId: null,
    type: "masuk",
    jumlah: 0,
  });

  // Fetch items
  const fetchItems = async () => {
    try {
      const res = await axios.get(
        "https://inventory-backend-production-b369.up.railway.app/api/items"
      );
      setItems(res.data.items);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Submit Add/Edit item
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(
          `https://inventory-backend-production-b369.up.railway.app/api/items/${form.id}`,
          form
        );
        setEditMode(false);
      } else {
        await axios.post(
          "https://inventory-backend-production-b369.up.railway.app/api/items",
          form
        );
      }
      setForm({ kode: "", nama: "", satuan: "", stockAwal: 0 });
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    if (!id) return;
    try {
      await axios.delete(
        `https://inventory-backend-production-b369.up.railway.app/api/items/${id}`
      );
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus item");
    }
  };

  // Edit item
  const handleEdit = (item) => {
    setForm(item);
    setEditMode(true);
    setModalOpen(true);
  };

  // Stock Masuk/Keluar
  const handleStockSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://inventory-backend-production-b369.up.railway.app/api/items/stock",
        stockModal
      );
      setStockModal({ open: false, itemId: null, type: "masuk", jumlah: 0 });
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Gagal update stock");
    }
  };

  // Sorting
  const sortedItems = [...items]
    .filter(
      (item) =>
        item.kode.toLowerCase().includes(search.toLowerCase()) ||
        item.nama.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
      return 0;
    });

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header + Search + Add */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <input
          className="border p-2 rounded"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => {
            setModalOpen(true);
            setEditMode(false);
            setForm({ kode: "", nama: "", satuan: "", stockAwal: 0 });
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Tambah Item
        </button>
      </div>

      {/* Modal Add/Edit Item */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded w-80">
            <h2 className="text-lg font-bold mb-2">
              {editMode ? "Edit Item" : "Tambah Item"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                className="border p-2 rounded"
                placeholder="Kode"
                value={form.kode}
                onChange={(e) => setForm({ ...form, kode: e.target.value })}
                required
              />
              <input
                className="border p-2 rounded"
                placeholder="Nama"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required
              />
              <input
                className="border p-2 rounded"
                placeholder="Satuan"
                value={form.satuan}
                onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                required
              />
              <input
                className="border p-2 rounded"
                type="number"
                placeholder="Stock Awal"
                value={form.stockAwal}
                onChange={(e) =>
                  setForm({ ...form, stockAwal: Number(e.target.value) })
                }
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded border"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Modal */}
      {stockModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded w-72">
            <h2 className="text-lg font-bold mb-2">
              Stock {stockModal.type === "masuk" ? "Masuk" : "Keluar"}
            </h2>
            <form onSubmit={handleStockSubmit} className="flex flex-col gap-2">
              <input
                type="number"
                className="border p-2 rounded"
                placeholder="Jumlah"
                value={stockModal.jumlah}
                onChange={(e) =>
                  setStockModal({
                    ...stockModal,
                    jumlah: Number(e.target.value),
                  })
                }
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() =>
                    setStockModal({
                      open: false,
                      itemId: null,
                      type: "masuk",
                      jumlah: 0,
                    })
                  }
                  className="px-4 py-2 rounded border"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              {["kode", "nama", "satuan", "stockAwal"].map((key) => (
                <th
                  key={key}
                  className="border border-gray-300 px-4 py-2 cursor-pointer"
                  onClick={() => handleSort(key)}
                >
                  {key === "stockAwal"
                    ? "Stock"
                    : key.charAt(0).toUpperCase() + key.slice(1)}
                  {sortKey === key ? (sortAsc ? " ▲" : " ▼") : ""}
                </th>
              ))}
              <th className="border border-gray-300 px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  {item.kode}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.nama}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.satuan}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.stockAwal}
                </td>
                <td className="border border-gray-300 px-4 py-2 flex gap-2">
                  <button
                    className="bg-yellow-400 px-2 py-1 rounded"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={() =>
                      setStockModal({
                        open: true,
                        itemId: item.id,
                        type: "masuk",
                        jumlah: 0,
                      })
                    }
                  >
                    Masuk
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() =>
                      setStockModal({
                        open: true,
                        itemId: item.id,
                        type: "keluar",
                        jumlah: 0,
                      })
                    }
                  >
                    Keluar
                  </button>
                  <button
                    className="bg-gray-500 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(item.id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {sortedItems.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Data tidak ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
