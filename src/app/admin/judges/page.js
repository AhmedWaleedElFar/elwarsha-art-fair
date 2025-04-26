"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Photography",
  "Paintings",
  "Digital Painting",
  "Drawing",
];

export default function AdminJudgesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [judges, setJudges] = useState([]);
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    category: CATEGORIES[0],
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
      const res = await fetch("/api/judges");
      const data = await res.json();
      setJudges(data.judges || []);
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
      setForm({ email: "", name: "", password: "", category: CATEGORIES[0] });
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
          <label className="block mb-1 font-medium">Category</label>
          <select
            className="w-full p-2 border rounded"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
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
        {judges.length === 0 && <li className="text-gray-500">No judges found.</li>}
        {judges.map(j => (
          <li key={j._id} className="mb-2 border-b pb-2">
            <span className="font-medium">{j.name}</span> (<span>{j.email}</span>) - <span>{j.category}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
