"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const BASE_URL = "https://projects-api-three.vercel.app/DBMS";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const DB_NAME = "ToolDB";
const COLLECTION = "submissions";

export default function ViewSubmission() {
    const { id } = useParams();
    const router = useRouter();
    
    const [submission, setSubmission] = useState(null);
    const [code, setCode] = useState("");
    const [githubToken, setGithubToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    // 1. Fetch the specific submission
    useEffect(() => {
        const fetchDetail = async () => {
            const payload = {
                API_KEY: API_KEY,
                db_name: DB_NAME,
                collection_name: COLLECTION,
                filter_condition: { _id: id }
            };
            const res = await fetch(`${BASE_URL}/fetch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data && data.length > 0) {
                setSubmission(data[0]);
                setCode(data[0].code || "");
            }
        };
        fetchDetail();
    }, [id]);

    // 2. GitHub Commit Logic
    const handleDeploy = async () => {
        if (!githubToken) return alert("Please enter your GitHub Personal Access Token");
        setLoading(true);
        setStatus("Committing to GitHub...");

        const repoOwner = "Raahim2";
        const repoName = "CrazyTools";
        // Clean the title for folder naming
        const folderName = submission.title.replace(/\s+/g, '-').toLowerCase();
        const fileName = submission.category === 'JSX' ? 'index.jsx' : 'index.html';
        const path = `Tools/${folderName}/${fileName}`;

        try {
            // A. Push to GitHub
            const ghResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Add tool: ${submission.title}`,
                    content: btoa(unescape(encodeURIComponent(code))), // Safe Base64 encoding
                })
            });

            if (!ghResponse.ok) throw new Error("GitHub Upload Failed");

            // B. Update Database Status to Approved
            setStatus("Updating Database...");
            const dbPayload = {
                API_KEY: API_KEY,
                db_name: DB_NAME,
                collection_name: COLLECTION,
                filter_condition: { _id: id },
                update_data: { status: 'approved' }
            };

            await fetch(`${BASE_URL}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbPayload)
            });

            alert("Successfully Deployed and Approved!");
            router.push('/admin'); // Go back to dashboard

        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
            setStatus("");
        }
    };

    if (!submission) return <div className="p-20 text-white">Loading Submission...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-gray-200 p-6 lg:p-12">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => router.back()} className="mb-8 text-gray-500 hover:text-white transition-colors">
                    <i className="fa-solid fa-arrow-left mr-2"></i> Back to Dashboard
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Metadata & Token */}
                    <div className="space-y-6">
                        <div className="bg-gray-900/50 border border-white/10 p-6 rounded-3xl">
                            <h1 className="text-2xl font-black text-white mb-2">{submission.title}</h1>
                            <p className="text-sm text-gray-400 mb-4">By {submission.email}</p>
                            <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase">
                                {submission.category}
                            </span>
                        </div>

                        <div className="bg-gray-900/50 border border-white/10 p-6 rounded-3xl">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">GitHub Authorization</label>
                            <input 
                                type="password" 
                                value={githubToken}
                                onChange={(e) => setGithubToken(e.target.value)}
                                placeholder="ghp_xxxxxxxxxxxx"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all"
                            />
                            <p className="text-[9px] text-gray-500 mt-2 italic">Your token is not stored. It is only used for this session.</p>
                        </div>

                        <button 
                            disabled={loading}
                            onClick={handleDeploy}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/20"
                        >
                            {loading ? status : "APPROVE & DEPLOY TO GITHUB"}
                        </button>
                    </div>

                    {/* Right: Code Editor */}
                    <div className="lg:col-span-2 bg-gray-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[70vh]">
                        <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Source Code Editor</span>
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-orange-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                            </div>
                        </div>
                        <textarea 
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="flex-1 bg-transparent p-6 font-mono text-sm text-emerald-400 outline-none resize-none leading-relaxed"
                            spellCheck="false"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}