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
          className={`px-3 py-1 rounded-full border transition-colors duration-150 text-sm select-none focus:outline-none focus:ring-2 focus:ring-purple-400 
            ${selected.includes(cat)
              ? "bg-purple-600 text-white border-purple-600"
              : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-purple-100"}
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
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Manage Judges</h1>
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 p-4 bg-white dark:bg-gray-800 rounded shadow">
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            value={form.email}
            required
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={form.name}
            required
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            value={form.password}
            required
            minLength={6}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Categories</label>
          <CategoryTagSelector
            categories={CATEGORIES}
            selected={form.categories}
            onChange={cats => setForm(f => ({ ...f, categories: cats }))}
          />
          <span className="text-xs text-gray-500">Tap to select one or more categories</span>
        </div>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Judge"}
        </button>
      </form>
      <h2 className="text-xl font-semibold mb-2">Existing Judges</h2>
      <ul className="bg-white dark:bg-gray-800 rounded shadow p-4">
        {loadingJudges ? (
          Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="mb-2 border-b pb-2 animate-pulse">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
              <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            </li>
          ))
        ) : (
          <>
            {judges.length === 0 && <li className="text-gray-500">No judges found.</li>}
            {judges.map(j => (
              <li key={j._id} className="mb-2 border-b pb-2">
                <span className="font-medium">{j.name}</span> (<span>{j.email}</span>) - <span>{Array.isArray(j.categories) ? j.categories.join(', ') : (j.category || '')}</span>
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
}
