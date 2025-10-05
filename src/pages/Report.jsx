import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

const Report = () => {
  const API = import.meta.env.VITE_API_URL;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(""); // masuk/keluar
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Sorting & pagination
  const [sorting, setSorting] = useState([{ id: "tanggal", desc: true }]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);

  // Fetch data
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        search: search || undefined,
        type: typeFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      const res = await axios.get(`${API}/api/stock-logs`, {
        params,
      });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, typeFilter, startDate, endDate]);

  // Columns for table
  const columns = useMemo(
    () => [
      { accessorKey: "item.kode", header: "Kode" },
      { accessorKey: "item.nama", header: "Nama" },
      { accessorKey: "type", header: "Tipe" },
      { accessorKey: "jumlah", header: "Jumlah" },
      {
        accessorKey: "tanggal",
        header: "Tanggal",
        cell: (info) => new Date(info.getValue()).toLocaleDateString("id-ID"),
      },
    ],
    []
  );

  const table = useReactTable({
    data: logs,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize } },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportCSV = () => {
    const headers = columns.map((c) => c.header);
    const rows = table
      .getRowModel()
      .rows.map((row) => row.getVisibleCells().map((cell) => cell.getValue()));
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report_stock.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Report Stock Masuk/Keluar", 14, 16);

    const rows = logs.map((log) => [
      log.item?.kode || "",
      log.item?.nama || "",
      log.type,
      log.jumlah,
      new Date(log.tanggal).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [["Nama Part", "Kode Part", "Tipe", "Jumlah", "Tanggal"]],
      body: rows,
      startY: 20,
    });

    doc.save("report_stock.pdf");
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="font-bold text-xl mb-4">Report Stock Masuk/Keluar</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search kode/nama..."
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Semua Tipe</option>
          <option value="masuk">Masuk</option>
          <option value="keluar">Keluar</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={exportCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>
        <button
          onClick={exportPDF}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border px-4 py-2 cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header}
                    {{
                      asc: " ▲",
                      desc: " ▼",
                    }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="border px-4 py-2">
                      {cell.renderValue()}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  Belum ada transaksi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          disabled={!table.getCanPreviousPage()}
          onClick={() => setPageIndex((old) => Math.max(old - 1, 0))}
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>
        <span className="px-2 py-1">
          Page {pageIndex + 1} / {table.getPageCount()}
        </span>
        <button
          disabled={!table.getCanNextPage()}
          onClick={() =>
            setPageIndex((old) => Math.min(old + 1, table.getPageCount() - 1))
          }
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Report;
