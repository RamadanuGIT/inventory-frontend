import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function KeluarStok() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [kodeInput, setKodeInput] = useState("");
  const [jumlah, setJumlah] = useState(1);
  const [matchedItems, setMatchedItems] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const jumlahRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/items`)
      .then((res) =>
        setItems(Array.isArray(res.data) ? res.data : res.data.items || [])
      )
      .catch((err) => console.log(err));
  }, []);

  // Update matchedItems saat kodeInput berubah
  useEffect(() => {
    if (!kodeInput) return setMatchedItems([]);
    const matches = items
      .filter(
        (i) =>
          i.kode.toLowerCase().includes(kodeInput.toLowerCase()) ||
          i.nama.toLowerCase().includes(kodeInput.toLowerCase())
      )
      .slice(0, 5); // batasi 5 item
    setMatchedItems(matches);
    setHighlightIndex(0);
  }, [kodeInput, items]);

  const selectItem = (item) => {
    setKodeInput(item.kode);
    setMatchedItems([]);
    setTimeout(() => jumlahRef.current?.focus(), 0);
  };

  const addToCart = () => {
    const item = items.find((i) => i.kode === kodeInput);
    if (!item || jumlah < 1) return alert("Item tidak valid");

    const existing = cart.find((c) => c.itemId === item.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.itemId === item.id ? { ...c, jumlah: c.jumlah + jumlah } : c
        )
      );
    } else {
      setCart([
        ...cart,
        { itemId: item.id, nama: item.nama, jumlah, price: item.price },
      ]);
    }

    setKodeInput("");
    setJumlah(1);
  };

  const removeFromCart = (itemId) =>
    setCart(cart.filter((c) => c.itemId !== itemId));
  const changeQuantity = (itemId, value) => {
    setCart(
      cart.map((c) =>
        c.itemId === itemId ? { ...c, jumlah: Math.max(1, value) } : c
      )
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang kosong");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/stock/out/batch`, {
        items: cart.map((c) => ({
          itemId: c.itemId,
          jumlah: c.jumlah,
          price: c.price,
        })),
      });
      alert("Transaksi berhasil");
      setCart([]);
      setKodeInput("");
      setJumlah(1);
    } catch (err) {
      alert(err.response?.data?.message || "Terjadi error");
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (matchedItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % matchedItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex(
        (prev) => (prev - 1 + matchedItems.length) % matchedItems.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectItem(matchedItems[highlightIndex]);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Mini-Market POS (Smart Autocomplete)
      </h2>

      {/* Input kode */}
      <div className="flex flex-col mb-4 relative">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Masukkan kode atau nama item..."
            value={kodeInput}
            onChange={(e) => setKodeInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border p-2 flex-1"
          />
          <input
            type="number"
            min="1"
            ref={jumlahRef}
            value={jumlah}
            onChange={(e) => setJumlah(Number(e.target.value))}
            className="border p-2 w-24"
          />
          <button
            onClick={addToCart}
            className="bg-green-500 text-white px-4 rounded hover:bg-green-600 "
          >
            Tambah
          </button>
        </div>

        {/* Autocomplete list */}
        {matchedItems.length > 0 && (
          <div className="absolute top-full left-0 mt-1 border bg-white shadow w-full z-10 max-h-48 overflow-y-auto">
            {matchedItems.map((item, index) => (
              <div
                key={item.id}
                className={`p-2 cursor-pointer ${
                  highlightIndex === index ? "bg-blue-100" : ""
                }`}
                onClick={() => selectItem(item)}
              >
                <p className="font-semibold">{item.nama}</p>
                <p className="text-sm text-gray-600">
                  Kode: {item.kode} | Stok: {item.stockAwal} | Price:{" "}
                  {item.price}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Keranjang */}
      {cart.length > 0 && (
        <div className="border p-3 rounded bg-gray-50 shadow">
          <h3 className="font-bold mb-2">Keranjang</h3>
          <table className="w-full mb-2">
            <thead>
              <tr className="border-b">
                <th className="p-1 text-left">Nama</th>
                <th className="p-1 text-center">Jumlah</th>
                <th className="p-1 text-center">HET</th>
                <th className="p-1">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((c) => (
                <tr key={c.itemId} className="border-b">
                  <td className="p-1">{c.nama}</td>
                  <td className="p-1 text-center">
                    <input
                      type="number"
                      min="1"
                      value={c.jumlah}
                      onChange={(e) =>
                        changeQuantity(c.itemId, Number(e.target.value))
                      }
                      className="w-16 border p-1 text-center"
                    />
                  </td>
                  <td className="p-1 text-center">
                    {new Intl.NumberFormat("en-SG", {
                      style: "currency",
                      currency: "SGD",
                    }).format(c.price * c.jumlah)}
                  </td>
                  <td className="p-1 text-center">
                    <button
                      onClick={() => removeFromCart(c.itemId)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-2">
            <span className="font-semibold">
              Total Item: {cart.reduce((sum, c) => sum + c.jumlah, 0)}
            </span>
            <span className="font-semibold">
              Total Harga:{" "}
              {new Intl.NumberFormat("en-SG", {
                style: "currency",
                currency: "SGD",
              }).format(cart.reduce((sum, c) => sum + c.price * c.jumlah, 0))}
            </span>
            <button
              onClick={handleCheckout}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
