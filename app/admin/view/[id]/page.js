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
    const [previewImage, setPreviewImage] = useState(null); // Base64 image
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    // Helper: Turn "My Tool" into "my-tool"
    const slugify = (text) => {
        return text.toString().toLowerCase().trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-');
    };

    useEffect(() => {
        const fetchDetail = async () => {
            const payload = {
                API_KEY,
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
            if (data?.length > 0) {
                setSubmission(data[0]);
                setCode(data[0].code || "");
            }
        };
        fetchDetail();
    }, [id]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Remove the data:image/png;base64, prefix for GitHub
                const base64String = reader.result.split(',')[1];
                setPreviewImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    // Generic function to commit to GitHub
    const githubCommit = async (path, content, message, sha = null) => {
        const repoOwner = "Raahim2";
        const repoName = "CrazyTools";
        const res = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                content,
                sha
            })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(`GitHub Error (${path}): ${err.message}`);
        }
        return await res.json();
    };

    const handleDeploy = async () => {
        if (!githubToken) return alert("Please enter GitHub Token");
        if (!previewImage) return alert("Please upload a preview image");

        setLoading(true);
        try {
            const repoOwner = "Raahim2";
            const repoName = "CrazyTools";
            const category = submission.category;
            const toolTitle = submission.title;
            const folderName = toolTitle; // Using original title for folder to match your registry style
            const toolSlug = slugify(toolTitle);

            // 1. UPLOAD main.jsx
            setStatus("Uploading main.jsx...");
            const jsxPath = `Tools/${category}/${folderName}/main.jsx`;
            await githubCommit(jsxPath, btoa(unescape(encodeURIComponent(code))), `Add ${toolTitle} code`);

            // 2. UPLOAD preview.png
            setStatus("Uploading preview.png...");
            const imgPath = `Tools/${category}/${folderName}/preview.png`;
            await githubCommit(imgPath, previewImage, `Add ${toolTitle} preview image`);

            // 3. UPDATE registry.js
            setStatus("Updating Registry...");
            const registryPath = "lib/registry.js";
            
            // Fetch current registry file
            const regFetch = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${registryPath}`, {
                headers: { 'Authorization': `token ${githubToken}` }
            });
            const regData = await regFetch.json();
            const currentRegistryContent = decodeURIComponent(escape(atob(regData.content)));

            // Prepare new line
            const newEntry = `  '${category}/${toolSlug}': dynamic(() => import('../Tools/${category}/${folderName}/main')),`;

            // Check if already exists to prevent duplicates
            if (currentRegistryContent.includes(`'${category}/${toolSlug}'`)) {
                setStatus("Tool already in registry. Skipping registry update...");
            } else {
                // Insert the new entry right after the opening brace of toolRegistry
                const updatedContent = currentRegistryContent.replace(
                    /export const toolRegistry = \{/,
                    `export const toolRegistry = {\n${newEntry}`
                );
                await githubCommit(registryPath, btoa(unescape(encodeURIComponent(updatedContent))), `Register tool ${toolTitle}`, regData.sha);
            }

            // 4. UPDATE DATABASE STATUS
            setStatus("Finalizing DB status...");
            await fetch(`${BASE_URL}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    API_KEY,
                    db_name: DB_NAME,
                    collection_name: COLLECTION,
                    filter_condition: { _id: id },
                    update_data: { status: 'approved' }
                })
            });

            alert("Full Deployment Successful!");
            router.push('/admin');

        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
            setStatus("");
        }
    };

    if (!submission) return <div className="p-20 text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-gray-200 p-6 lg:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-white font-bold text-xs tracking-widest">
                        <i className="fa-solid fa-arrow-left mr-2"></i> ABORT MISSION
                    </button>
                    <h2 className="text-sm font-black text-purple-500 tracking-[5px]">MODERATOR EDITOR</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    {/* Left Panel */}
                    <div className="space-y-6">
                        <div className="bg-gray-900/50 border border-white/10 p-8 rounded-[2.5rem]">
                            <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Deploying to</p>
                            <h1 className="text-2xl font-black text-white">{submission.title}</h1>
                            <p className="text-xs text-purple-400 font-bold mt-1">{submission.category}</p>
                        </div>

                        {/* Image Upload Box */}
                        <div className="bg-gray-900/50 border border-white/10 p-8 rounded-[2.5rem]">
                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-4">Preview Image (preview.png)</label>
                            <div className="relative group">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center group-hover:border-purple-500 transition-all">
                                    {previewImage ? (
                                        <p className="text-emerald-400 text-[10px] font-bold">Image Selected ✓</p>
                                    ) : (
                                        <p className="text-gray-500 text-[10px]">Click to upload preview.png</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Token Box */}
                        <div className="bg-gray-900/50 border border-white/10 p-8 rounded-[2.5rem]">
                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-4">GitHub Secret Key</label>
                            <input 
                                type="password" 
                                value={githubToken}
                                onChange={(e) => setGithubToken(e.target.value)}
                                placeholder="ghp_..."
                                className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none"
                            />
                        </div>

                        <button 
                            disabled={loading}
                            onClick={handleDeploy}
                            className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-purple-500 hover:text-white transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                        >
                            {loading ? status.toUpperCase() : "PUSH TO PRODUCTION"}
                        </button>
                    </div>

                    {/* Editor Area */}
                    <div className="lg:col-span-3 h-[75vh] bg-[#050507] border border-white/5 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
                        <div className="bg-white/[0.02] px-10 py-5 border-b border-white/5 flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Main.jsx Editor</span>
                            <span className="text-[10px] text-gray-700">Read-Write Access</span>
                        </div>
                        <textarea 
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="flex-1 bg-transparent p-12 font-mono text-sm text-gray-300 outline-none resize-none leading-relaxed"
                            spellCheck="false"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}