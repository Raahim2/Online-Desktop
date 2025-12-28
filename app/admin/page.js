"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Inside AdminPanel component:

// --- API CONFIGURATION ---
const BASE_URL = "https://projects-api-three.vercel.app/DBMS";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY; 
const DB_NAME = "ToolDB";       
const COLLECTION = "submissions";

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null); // Tracks which row is currently saving

  // --- 1. FETCH DATA FROM DB ---
  const fetchSubmissions = async () => {
    setLoading(true);
    const endpoint = `${BASE_URL}/fetch`;
    const payload = {
      API_KEY: API_KEY,
      db_name: DB_NAME,
      collection_name: COLLECTION,
      filter_condition: {} 
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      // Handling the array response
      const actualData = Array.isArray(data) ? data : (data.data || []);
      setSubmissions(actualData);
      
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Run fetch automatically once logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchSubmissions();
    }
  }, [isLoggedIn]);

  // --- 2. LOGIN HANDLER ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (
      credentials.username === process.env.NEXT_PUBLIC_ADMIN_USERNAME && 
      credentials.password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    ) {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid credentials. Access Denied.');
    }
  };

  // --- 3. MODERATION LOGIC (DATABASE UPDATE) ---
  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id); // Show loading state for this specific row
    console.log(`Updating ${id} to ${newStatus}...`);
    const endpoint = `${BASE_URL}/update`;

    const payload = {
        API_KEY: API_KEY,
        db_name: DB_NAME,
        collection_name: COLLECTION,
        filter_condition: {_id: id }, // Target the specific document
        update_data: { status: newStatus } // Update the status field
    };

    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log("Update Response:", response);

        if (response.ok) {
            // Only update the local UI state if the Database update was successful
            setSubmissions(prev => prev.map(sub => 
              sub._id === id ? { ...sub, status: newStatus } : sub
            ));
            console.log(`Successfully updated ${id} to ${newStatus}`);
        } else {
            const errorData = await response.text();
            alert("Failed to update database: " + errorData);
        }
    } catch (err) {
        console.error("Update Error:", err);
        alert("Network error while updating status.");
    } finally {
        setUpdatingId(null);
    }
  };

  const previewCode = (code) => {
    const win = window.open("", "_blank");
    win.document.write(code); 
    win.document.close();
  };

  const handleDownload = (link) => {
    window.open(link, "_blank");
  };

  const router = useRouter();


  // --- VIEW: LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="h-screen bg-[#0f0e1a] flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-gray-900/50 border border-white/10 p-10 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#6d28d9]/10 text-[#6d28d9] mb-6 text-3xl border border-[#6d28d9]/20">
              <i className="fa-solid fa-unlock-keyhole"></i>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
            <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-bold">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <input 
                required
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#6d28d9] transition-all"
                placeholder="Username"
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            />
            <input 
                required
                type="password" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#6d28d9] transition-all"
                placeholder="Password"
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
            <button className="w-full bg-[#6d28d9] hover:bg-[#7c3aed] text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95">
              SIGN IN
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- VIEW: DASHBOARD ---
  return (
    <div className="h-screen overflow-y-scroll bg-[#0f0e1a] text-gray-200">
      <nav className="border-b border-white/5 bg-gray-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-[#6d28d9] h-10 w-10 flex items-center justify-center rounded-xl text-white shadow-lg">
                <i className="fa-solid fa-screwdriver-wrench"></i>
            </div>
            <span className="font-black text-xl text-white uppercase tracking-tighter">Control Center</span>
          </div>
          <div className="flex items-center gap-8">
            <button onClick={fetchSubmissions} className="text-gray-400 hover:text-white transition-all">
                <i className={`fa-solid fa-arrows-rotate ${loading ? 'animate-spin' : ''}`}></i>
            </button>
            <button onClick={() => setIsLoggedIn(false)} className="text-xs font-black text-red-400 hover:text-red-300 uppercase tracking-widest border-b border-red-400/0 hover:border-red-400 transition-all">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
                <h2 className="text-4xl font-black text-white">Project Submissions</h2>
                <p className="text-gray-500 mt-1">Reviewing community contributions for approval.</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <div className="flex-1 md:w-32 bg-gray-900 border border-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-500 uppercase">Inbox</p>
                    <p className="text-2xl font-bold text-white">{submissions.length}</p>
                </div>
                <div className="flex-1 md:w-32 bg-gray-900 border border-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-500 uppercase">Pending</p>
                    <p className="text-2xl font-bold text-orange-400">{submissions.filter(s => s.status === 'pending').length}</p>
                </div>
            </div>
        </div>

        <div className="bg-gray-900/40 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-[3px] font-black border-b border-white/5">
                  <th className="px-8 py-6">Tool & Submitter</th>
                  <th className="px-8 py-6">Category</th>
                  <th className="px-8 py-6">Source Type</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {submissions.length === 0 && !loading && (
                    <tr><td colSpan="5" className="text-center py-24 text-gray-500 font-medium italic">No submissions found in database.</td></tr>
                )}
                {submissions.map((sub) => (
                  <tr key={sub._id} className={`group hover:bg-white/[0.03] transition-all ${updatingId === sub._id ? 'opacity-50 pointer-events-none' : ''}`}>
                    <td className="px-8 py-6">
                      <div className="font-bold text-lg text-white group-hover:text-[#6d28d9] transition-colors">{sub.title}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <i className="fa-solid fa-envelope-open text-[10px]"></i> {sub.email}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                        <span className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-black text-gray-300 border border-white/10 uppercase tracking-tighter">
                            {sub.category}
                        </span>
                    </td>
                    <td className="px-8 py-6">
                      {sub.code ? (
                         <button 
                            onClick={() => previewCode(sub.code)}
                            className="text-orange-400 hover:text-orange-300 text-xs font-black flex items-center gap-2"
                        >
                          <i className="fa-solid fa-eye"></i> Preview HTML
                        </button>
                      ) : (
                        <button 
                            onClick={() => handleDownload(sub.link)}
                            className="text-pink-400 hover:text-pink-300 text-xs font-black flex items-center gap-2"
                        >
                          <i className="fa-solid fa-link text-[10px]"></i> External Link
                        </button>
                      )}
                    </td>
                    <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            sub.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 
                            sub.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 
                            'bg-orange-500/10 text-orange-400'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                sub.status === 'approved' ? 'bg-emerald-500' : 
                                sub.status === 'rejected' ? 'bg-red-500' : 'bg-orange-500 animate-pulse'
                            }`}></span>
                            {sub.status}
                        </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {sub.status === 'pending' ? (
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => router.push(`/admin/view/${sub._id}`)} // Redirect to editor
                            className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                            title="Review & Deploy"
                          >
                            <i className="fa-solid fa-code-branch"></i>
                          </button>
                          <button 
                             onClick={() => updateStatus(sub._id, 'rejected')}
                            className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20"
                            title="Reject"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => updateStatus(sub._id, 'pending')} 
                          className="text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest border-b border-gray-500/40"
                        >
                            Reset Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;