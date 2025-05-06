"use client";

import { useEffect, useState, memo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingButton from "@/app/components/ui/LoadingButton";
import LoadingLink from "@/app/components/ui/LoadingLink";

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
    username: "",
    firstName: "",
    name: "",
    password: "",
    categories: [CATEGORIES[0]],
  });
  const [editMode, setEditMode] = useState(false);
  const [currentJudgeId, setCurrentJudgeId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/login");
    }
  }, [session, status, router]);

  // Function to fetch judges
  async function fetchJudges() {
    setLoadingJudges(true);
    try {
      const res = await fetch("/api/judges");
      const data = await res.json();
      setJudges(data.judges || []);
    } catch (err) {
      console.error("Error fetching judges:", err);
    } finally {
      setLoadingJudges(false);
    }
  }

  // Fetch judges on component mount
  useEffect(() => {
    fetchJudges();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let url = "/api/judges";
      let method = "POST";
      let successMessage = "Judge created successfully!";
      
      // If in edit mode, use PUT method and include judge ID
      if (editMode && currentJudgeId) {
        url = `/api/judges/${currentJudgeId}`;
        method = "PUT";
        successMessage = "Judge updated successfully!";
      }
      
      const formData = {...form};
      // Don't send empty password when editing
      if (editMode && !formData.password) {
        delete formData.password;
      }
      
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save judge");
      }

      setSuccess(successMessage);
      setForm({ username: "", firstName: "", name: "", password: "", categories: [CATEGORIES[0]] });
      setEditMode(false);
      setCurrentJudgeId(null);
      fetchJudges();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(judge) {
    setCurrentJudgeId(judge._id);
    setForm({
      username: judge.username || "",
      firstName: judge.firstName || "",
      name: judge.name || "",
      password: "", // Don't populate password
      categories: Array.isArray(judge.categories) && judge.categories.length > 0 ? judge.categories : [CATEGORIES[0]],
    });
    setEditMode(true);
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  function cancelEdit() {
    setForm({ username: "", firstName: "", name: "", password: "", categories: [CATEGORIES[0]] });
    setEditMode(false);
    setCurrentJudgeId(null);
    setError("");
    setSuccess("");
  }
  
  async function handleDelete(judgeId) {
    if (!confirm("Are you sure you want to remove this judge?")) return;
    
    try {
      const res = await fetch(`/api/judges/${judgeId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete judge");
      }
      
      setSuccess("Judge removed successfully!");
      fetchJudges();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Manage Judges</h1>
        <div className="flex items-center justify-between mb-4">
          <LoadingLink 
            href="/admin" 
            onClick={(e) => {
              if (window.location.pathname === '/admin') {
                e.preventDefault();
              }
            }}
            className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a] flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </LoadingLink>
          {/* <LoadingLink 
            href="/" 
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
              }
            }}
            className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a] flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Home
          </LoadingLink> */}
        </div>
        <form onSubmit={handleSubmit} className="mb-8 space-y-4 p-6 bg-[#1e1e1e] rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-300">{editMode ? 'Edit Judge' : 'Create New Judge'}</h2>
          <div>
            <label className="block mb-2 font-medium text-gray-300">Username</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#93233B]"
              value={form.username}
              required
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-300">First Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#93233B]"
              value={form.firstName}
              required
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
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
            <label className="block mb-2 font-medium text-gray-300">Password {editMode && '(leave empty to keep current)'}</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#93233B]"
              value={form.password}
              required={!editMode}
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
          <div className="flex gap-2">
            <LoadingButton
              type="submit"
              isLoading={loading}
              className="bg-[#93233B] text-white px-4 py-2 rounded-md hover:bg-[#7a1d31] transition-colors text-sm font-medium"
            >
              {editMode ? 'Save Changes' : 'Create Judge'}
            </LoadingButton>
            {editMode && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            )}
          </div>
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
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-white">{j.firstName} - {j.name}</span> 
                    <span className="text-gray-400 ml-2">@{j.username}</span>
                    <div>
                      <span className="text-[#93233B] text-sm">{Array.isArray(j.categories) ? j.categories.join(', ') : (j.category || '')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(j)}
                      className="text-gray-300 hover:text-[#93233B] transition-colors px-2 py-1 rounded hover:bg-[#2a2a2a]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(j._id)}
                      className="text-gray-300 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-[#2a2a2a]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </>
        )}
      </ul>
      </div>
    </div>
  );
}
