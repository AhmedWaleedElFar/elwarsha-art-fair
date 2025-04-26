"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";

const CATEGORIES = [
  "Photography",
  "Paintings",
  "Digital Painting",
  "Drawing",
];

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
  const [editedOrders, setEditedOrders] = useState({}); // { artworkId: newOrder }

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

  // Group and sort artworks by category and orderWithinCategory
  const groupedArtworks = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = artworks
      .filter(a => (!filterCategory || a.category === filterCategory) && (!filterArtist || a.artistName.toLowerCase().includes(filterArtist.toLowerCase())) && a.category === cat)
      .sort((a, b) => a.orderWithinCategory - b.orderWithinCategory);
    return acc;
  }, {});

  async function swapOrder(a, b) {
    // Swap orderWithinCategory between a and b
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
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Manage Artworks</h1>
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded font-semibold ${showAdd ? 'bg-gray-300' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
          onClick={() => setShowAdd(false)}
        >
          Manage Existing Artworks
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold ${showAdd ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-300'}`}
          onClick={() => setShowAdd(true)}
        >
          Add New Artwork
        </button>
      </div>
      {showAdd ? (
        <form onSubmit={handleAdd} className="mb-8 space-y-4 p-4 bg-white dark:bg-gray-800 rounded shadow">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input type="text" className="w-full p-2 border rounded" value={form.title} required onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea className="w-full p-2 border rounded" value={form.description} required onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <select className="w-full p-2 border rounded" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Artist Name</label>
            <input type="text" className="w-full p-2 border rounded" value={form.artistName} required onChange={e => setForm(f => ({ ...f, artistName: e.target.value }))} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Artwork Code</label>
            <input type="text" className="w-full p-2 border rounded" value={form.artworkCode} required onChange={e => setForm(f => ({ ...f, artworkCode: e.target.value }))} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Image URL</label>
            <input type="text" className="w-full p-2 border rounded" value={form.imageUrl} required onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Order Within Category</label>
            <input type="number" className="w-full p-2 border rounded" value={form.orderWithinCategory} min={0} required onChange={e => setForm(f => ({ ...f, orderWithinCategory: Number(e.target.value) }))} />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Add Artwork</button>
        </form>
      ) : (
        <div>
          <div className="flex gap-4 mb-4">
            <select className="border rounded p-2" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input type="text" className="border rounded p-2" placeholder="Filter by artist name..." value={filterArtist} onChange={e => setFilterArtist(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
              <thead>
                <tr>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Artist</th>
                  <th className="px-3 py-2">Artwork Code</th>
                  <th className="px-3 py-2">Order</th>
                  <th className="px-3 py-2">Image</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.filter(cat => !filterCategory || cat === filterCategory).map(cat => {
                  return (
                    <React.Fragment key={cat}>
                      {groupedArtworks[cat].length > 0 && (
                        <tr key={cat + "-header"} className="bg-gray-100 dark:bg-gray-700">
                          <td colSpan={7} className="font-bold py-2">{cat}</td>
                        </tr>
                      )}
                      {groupedArtworks[cat].map((a, idx, arr) => {
                        const editedValue = editedOrders[a._id];
                        return (
                          <tr key={a._id} className="border-t border-gray-200 dark:border-gray-700">
                            <td className="px-3 py-2">{a.title}</td>
                            <td className="px-3 py-2">{a.category}</td>
                            <td className="px-3 py-2">{a.artistName}</td>
                            <td className="px-3 py-2">{a.artworkCode}</td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                className={`w-16 border rounded mr-2 ${editedValue !== undefined && editedValue !== a.orderWithinCategory ? 'border-yellow-500' : ''}`}
                                value={editedValue !== undefined ? editedValue : a.orderWithinCategory}
                                min={0}
                                onChange={e => handleOrderChange(a._id, Number(e.target.value))}
                              />
                              <button
                                className="px-2 text-lg font-bold text-gray-600 hover:text-purple-700"
                                disabled={idx === 0}
                                title="Move Up"
                                onClick={() => swapOrder(a, arr[idx - 1])}
                              >↑</button>
                              <button
                                className="px-2 text-lg font-bold text-gray-600 hover:text-purple-700"
                                disabled={idx === arr.length - 1}
                                title="Move Down"
                                onClick={() => swapOrder(a, arr[idx + 1])}
                              >↓</button>
                            </td>
                            <td className="px-3 py-2"><img src={a.imageUrl} alt={a.title} className="w-16 h-16 object-cover rounded" /></td>
                            <td className="px-3 py-2">-</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          {Object.keys(editedOrders).length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold"
                onClick={handleSaveOrders}
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
