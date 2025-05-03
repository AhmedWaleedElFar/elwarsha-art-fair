"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState, memo, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import LoadingButton from "@/app/components/ui/LoadingButton";

const PdfImagePreview = dynamic(() => import('@/app/components/PdfImagePreview'), { ssr: false });

const CATEGORIES = [
  "Photography",
  "Paintings",
  "Digital Painting",
  "Drawing",
];

function isGoogleDriveLink(url) {
  return /drive\.google\.com\/file\/d\//.test(url) || /drive\.google\.com\/open\?id=/.test(url);
}
function isPdfUrl(url) {
  return url?.toLowerCase().endsWith('.pdf');
}

const ArtPreview = memo(function ArtPreview({ url, title, size = 64 }) {
  if (isGoogleDriveLink(url) || isPdfUrl(url)) {
    return <PdfImagePreview url={url} width={size} height={size} />;
  }
  return (
    <Image
      src={url}
      alt={title}
      width={size}
      height={size}
      style={{ objectFit: "cover", borderRadius: 8, background: "#f9f9f9" }}
      className="object-cover rounded"
      loading="lazy"
    />
  );
});

const BulkCSVUpload = memo(function BulkCSVUpload({ fetchArtworks }) {
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
    setResults(null);
    setError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setResults(null);
    setError("");
    try {
      const formData = new FormData();
      formData.append("csv", csvFile);
      const res = await fetch("/api/artworks/bulk-upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk upload failed");
      setResults(data.results);
      if (fetchArtworks) fetchArtworks();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-8 p-6 bg-[#1e1e1e] rounded-lg shadow-lg">
      <h2 className="text-lg font-medium mb-4 text-gray-300">Bulk Add Artworks via CSV</h2>
      <form onSubmit={handleUpload} className="flex flex-col gap-3">
        <div className="mb-2">
          <label htmlFor="csv-upload" className="inline-block bg-[#93233B] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[#7a1d31] transition-colors text-sm font-medium">
            {csvFile ? "Change CSV File" : "Choose CSV File"}
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            required
            className="hidden"
          />
          {csvFile && <span className="ml-3 text-gray-300">{csvFile.name}</span>}
        </div>
        <LoadingButton
          type="submit"
          isLoading={uploading}
          disabled={!csvFile}
          className="bg-[#93233B] text-white px-4 py-2 rounded-md hover:bg-[#7a1d31] transition-colors disabled:opacity-60 text-sm font-medium"
        >
          Upload CSV
        </LoadingButton>
      </form>
      {error && <div className="text-[#ff6b6b] mt-3">{error}</div>}
      {results && (
        <div className="mt-5">
          <h3 className="font-medium mb-3 text-gray-300">Upload Results:</h3>
          <div className="bg-[#2a2a2a] rounded-md overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Artwork Code</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Title</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-t border-gray-600">
                    <td className="px-4 py-2 text-sm text-gray-300">{r.artworkCode}</td>
                    <td className="px-4 py-2 text-sm text-gray-300">{r.title}</td>
                    <td className="px-4 py-2 text-sm">{r.success ? <span className="text-green-400">✅ Success</span> : <span className="text-[#ff6b6b]">❌ Failed</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="text-xs text-gray-400 mt-4">
        CSV columns: title, description, category, artistName, artworkCode, imageUrl, orderWithinCategory
      </div>
    </div>
  );
});

export default function ManageArtworksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    artistName: "",
    artworkCode: "",
    imageUrl: "",
    orderWithinCategory: 0,
  });
  const [filterCategory, setFilterCategory] = useState("");
  const [filterArtist, setFilterArtist] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editedOrders, setEditedOrders] = useState({});

  const groupedArtworks = useMemo(() => {
    const groups = {};
    CATEGORIES.forEach(cat => {
      groups[cat] = artworks
        .filter(a =>
          (!filterCategory || a.category === filterCategory) &&
          (!filterArtist || a.artistName.toLowerCase().includes(filterArtist.toLowerCase())) &&
          a.category === cat
        )
        .sort((a, b) => a.orderWithinCategory - b.orderWithinCategory);
    });
    return groups;
  }, [artworks, filterCategory, filterArtist]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/login");
    } else {
      fetchArtworks();
    }
  }, [session, status]);

  async function fetchArtworks() {
    setLoading(true);
    const res = await fetch("/api/artworks");
    const data = await res.json();
    setArtworks(data.artworks || []);
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add artwork");
      setSuccess("Artwork added successfully!");
      setForm({ title: "", description: "", category: CATEGORIES[0], artistName: "", artworkCode: "", imageUrl: "", orderWithinCategory: 0 });
      fetchArtworks();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleOrderChange(id, newOrder) {
    setEditedOrders(prev => ({ ...prev, [id]: newOrder }));
  }

  async function swapOrder(a, b) {
    await Promise.all([
      fetch(`/api/artworks/${a._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderWithinCategory: b.orderWithinCategory }),
      }),
      fetch(`/api/artworks/${b._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderWithinCategory: a.orderWithinCategory }),
      })
    ]);
    fetchArtworks();
  }

  async function handleSaveOrders() {
    setError("");
    setSuccess("");
    try {
      const updates = Object.entries(editedOrders).map(([id, newOrder]) =>
        fetch(`/api/artworks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderWithinCategory: newOrder }),
        })
      );
      await Promise.all(updates);
      setEditedOrders({});
      setSuccess("Order updated successfully!");
      fetchArtworks();
    } catch (err) {
      setError("Failed to update order.");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Manage Artworks</h1>
        
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (window.location.pathname !== '/admin') {
                router.push('/admin');
              }
            }}
            className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a] flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
          <button
            onClick={() => {
              if (window.location.pathname !== '/') {
                router.push('/');
              }
            }}
            className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a] flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Home
          </button>
        </div>
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-md font-medium text-sm ${showAdd ? 'bg-gray-700 text-gray-300' : 'bg-[#93233B] text-white hover:bg-[#7a1d31] transition-colors'}`}
            onClick={() => setShowAdd(false)}
          >
            Manage Existing Artworks
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium text-sm ${showAdd ? 'bg-[#93233B] text-white hover:bg-[#7a1d31] transition-colors' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setShowAdd(true)}
          >
            Add New Artwork
          </button>
        </div>
        {showAdd ? (
          <div>
            <form onSubmit={handleAdd} className="mb-8 space-y-4 p-6 bg-[#1e1e1e] rounded-lg shadow-lg">
              <div>
                <label className="block mb-2 font-medium text-gray-300">Title</label>
                <input type="text" className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#93233B]" value={form.title} required onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-300">Description</label>
                <textarea className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#93233B]" value={form.description} required onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-300">Category</label>
                <select className="w-full p-2 bg-[#1e1e1e] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#93233B]" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-300">Artist Name</label>
                <input type="text" className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#93233B]" value={form.artistName} required onChange={e => setForm(f => ({ ...f, artistName: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-300">Artwork Code</label>
                <input type="text" className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#93233B]" value={form.artworkCode} required onChange={e => setForm(f => ({ ...f, artworkCode: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-300">Image URL</label>
                <input type="text" className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#93233B]" value={form.imageUrl} required onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-300">Order Within Category</label>
                <input type="number" className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#93233B]" value={form.orderWithinCategory} min={0} required onChange={e => setForm(f => ({ ...f, orderWithinCategory: Number(e.target.value) }))} />
              </div>
              {error && <div className="text-[#ff6b6b] mt-2">{error}</div>}
              {success && <div className="text-green-400 mt-2">{success}</div>}
              <LoadingButton type="submit" className="bg-[#93233B] text-white px-4 py-2 rounded-md hover:bg-[#7a1d31] transition-colors text-sm font-medium">Add Artwork</LoadingButton>
            </form>
          </div>
        ) : (
          <div>
            <BulkCSVUpload fetchArtworks={fetchArtworks} />
            <div className="overflow-x-auto">
              <div className="bg-[#1e1e1e] rounded-lg shadow-lg p-6">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Artist</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Artwork Code</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Order</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Image</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="animate-pulse border-t border-gray-700">
                          <td className="px-4 py-3"><div className="w-20 h-4 bg-gray-700 rounded" /></td>
                          <td className="px-4 py-3"><div className="w-16 h-4 bg-gray-700 rounded" /></td>
                          <td className="px-4 py-3"><div className="w-24 h-4 bg-gray-700 rounded" /></td>
                          <td className="px-4 py-3"><div className="w-24 h-4 bg-gray-700 rounded" /></td>
                          <td className="px-4 py-3"><div className="w-12 h-4 bg-gray-700 rounded" /></td>
                          <td className="px-4 py-3"><div className="w-16 h-8 bg-gray-700 rounded" /></td>
                          <td className="px-4 py-3"><div className="w-16 h-4 bg-gray-700 rounded" /></td>
                        </tr>
                      ))
                    ) : (
                      CATEGORIES.filter(cat => !filterCategory || cat === filterCategory).map(cat => (
                        <Fragment key={cat}>
                          {groupedArtworks[cat].length > 0 && (
                            <tr key={cat + "-header"} className="bg-[#1e1e1e]">
                              <td colSpan={7} className="font-bold py-2 px-4 text-[#93233B]">{cat}</td>
                            </tr>
                          )}
                          {groupedArtworks[cat].map((a, idx, arr) => (
                            <tr key={a._id} className="border-t border-gray-600 hover:bg-[#1e1e1e]">
                              <td className="px-4 py-3 font-medium text-white">{a.title}</td>
                              <td className="px-4 py-3 text-gray-300">{a.category}</td>
                              <td className="px-4 py-3 text-gray-300">{a.artistName}</td>
                              <td className="px-4 py-3 text-gray-300">{a.artworkCode}</td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  className={`w-16 bg-[#1e1e1e] border border-gray-600 rounded-md mr-2 text-white focus:outline-none focus:ring-2 focus:ring-[#93233B] ${editedOrders[a._id] !== undefined && editedOrders[a._id] !== a.orderWithinCategory ? 'border-yellow-500' : ''}`}
                                  value={editedOrders[a._id] !== undefined ? editedOrders[a._id] : a.orderWithinCategory}
                                  min={0}
                                  onChange={e => handleOrderChange(a._id, Number(e.target.value))}
                                />
                                <button
                                  className="px-2 text-lg font-bold text-gray-400 hover:text-[#93233B] transition-colors"
                                  disabled={idx === 0}
                                  title="Move Up"
                                  onClick={() => swapOrder(a, arr[idx - 1])}
                                >↑</button>
                                <button
                                  className="px-2 text-lg font-bold text-gray-400 hover:text-[#93233B] transition-colors"
                                  disabled={idx === arr.length - 1}
                                  title="Move Down"
                                  onClick={() => swapOrder(a, arr[idx + 1])}
                                >↓</button>
                              </td>
                              <td className="px-4 py-3">
                                <ArtPreview url={a.imageUrl} title={a.title} size={64} />
                              </td>
                              <td className="px-4 py-3 text-gray-400">-</td>
                            </tr>
                          ))}
                        </Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {Object.keys(editedOrders).length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="bg-[#93233B] text-white px-6 py-2 rounded-md hover:bg-[#7a1d31] transition-colors font-medium text-sm"
                  onClick={handleSaveOrders}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}