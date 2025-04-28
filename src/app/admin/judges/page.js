"use client";

import { useEffect, useState, memo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Photography",
  "Paintings",
  "Digital Painting",
  "Drawing",
];

const CategoryTagSelector = memo(function CategoryTagSelector({ categories, selected, onChange }) {
  const toggleCategory = (cat) => {
    if (selected.includes(cat)) {
      onChange(selected.filter(c => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2 mt-2 mb-1">
      {categories.map(cat => (
        <button
          type="button"
          key={cat}
          onClick={() => toggleCategory(cat)}
          className={`px-3 py-1 rounded-full border transition-colors duration-150 text-sm select-none focus:outline-none focus:ring-2 focus:ring-[#93233B] 
            ${selected.includes(cat)
              ? "bg-[#93233B] text-white border-[#93233B]"
              : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"}
          `}
        >
          {cat}
        </button>
      ))}
    </div>
  );
});

export default function AdminJudgesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [judges, setJudges] = useState([]);
  const [loadingJudges, setLoadingJudges] = useState(true);
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    categories: [CATEGORIES[0]],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    async function fetchJudges() {
      setLoadingJudges(true);
      const res = await fetch("/api/judges");
      const data = await res.json();
      setJudges(data.judges || []);
      setLoadingJudges(false);
    }
    fetchJudges();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/judges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create judge");
      setSuccess("Judge created successfully!");
      setForm({ email: "", name: "", password: "", categories: [CATEGORIES[0]] });
      setJudges((prev) => [...prev, data.judge]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Manage Judges</h1>
        <form onSubmit={handleSubmit} className="mb-8 space-y-4 p-6 bg-[#1e1e1e] rounded-lg shadow-lg">
          <div>
            <label className="block mb-2 font-medium text-gray-300">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#93233B]"
              value={form.email}
              required
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-300">Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#93233B]"
              value={form.name}
              required
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-300">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#93233B]"
              value={form.password}
              required
              minLength={6}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-300">Categories</label>
            <CategoryTagSelector
              categories={CATEGORIES}
              selected={form.categories}
              onChange={cats => setForm(f => ({ ...f, categories: cats }))}
            />
            <span className="text-xs text-gray-400">Tap to select one or more categories</span>
          </div>
          {error && <div className="text-[#ff6b6b] mt-2">{error}</div>}
          {success && <div className="text-green-400 mt-2">{success}</div>}
          <button
            type="submit"
            className="bg-[#93233B] text-white px-4 py-2 rounded-md hover:bg-[#7a1d31] transition-colors text-sm font-medium"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Judge"}
          </button>
        </form>
        <h2 className="text-xl font-medium mb-4 text-gray-300">Existing Judges</h2>
        <ul className="bg-[#1e1e1e] rounded-lg shadow-lg p-6">
        {loadingJudges ? (
          Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="mb-3 border-b border-gray-600 pb-3 animate-pulse">
              <div className="h-4 w-32 bg-[#2a2a2a] rounded mb-2" />
              <div className="h-3 w-48 bg-[#2a2a2a] rounded" />
            </li>
          ))
        ) : (
          <>
            {judges.length === 0 && <li className="text-gray-400">No judges found.</li>}
            {judges.map(j => (
              <li key={j._id} className="mb-3 border-b border-gray-600 pb-3 hover:bg-[#2a2a2a] rounded-md px-3 py-2">
                <span className="font-medium text-white">{j.name}</span> <span className="text-gray-400">({j.email})</span>                <span className="text-[#93233B]">{Array.isArray(j.categories) ? j.categories.join(', ') : (j.category || '')}</span>
              </li>
            ))}
          </>
        )}
      </ul>
      </div>
    </div>
  );
}
