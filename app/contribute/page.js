"use client";
import React, { useState } from 'react';
import Link from 'next/link';

// --- API CONFIGURATION ---
const BASE_URL = "https://projects-api-three.vercel.app/DBMS";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY; 
const DB_NAME = "ToolDB"; 
const COLLECTION = "submissions";

const Contribute = () => {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        email: '',
        file: null
    });

    const [status, setStatus] = useState('idle'); 
    const categories = ['Game', 'Templates', 'Creativity', 'Agentic', 'DevTools'];

    // --- API LOGIC ---
    async function addData(document) {
        const endpoint = `${BASE_URL}/add_data`;
        const payload = {
            API_KEY: API_KEY,
            db_name: DB_NAME,
            collection_name: COLLECTION,
            document: document
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return await response.json();
        } catch (error) {
            console.error("Error adding data:", error);
            throw error;
        }
    }

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, file: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.file) {
            alert("Please upload a source file.");
            return;
        }

        setStatus('loading');

        try {
            // Read file content as string (for HTML/JSX hosting in DB)
            const fileContent = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = (err) => reject(err);
                
                // If it's a zip, we store the name, if it's code, we store the text
                if (formData.file.name.endsWith('.zip')) {
                    resolve("Binary ZIP File - See Link for Filename");
                } else {
                    reader.readAsText(formData.file);
                }
            });

            const documentToSave = {
                title: formData.title,
                category: formData.category,
                description: formData.description,
                email: formData.email || "anonymous",
                isHosted: false, // Always false now
                link: formData.file.name, // The filename
                code: fileContent,
                status: "pending",
                submittedAt: new Date().toLocaleString()
            };

            await addData(documentToSave);
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-[#0f0e1a] flex items-center justify-center p-6 text-center">
                <div className="max-w-md bg-gray-900/50 p-10 rounded-3xl border border-emerald-500/30 backdrop-blur-xl">
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl animate-bounce">
                        <i className="fa-solid fa-check"></i>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Submission Sent!</h2>
                    <p className="text-gray-400 mb-8">Source code received. Our admins will review your code before hosting it live.</p>
                    <Link href="/">
                        <button className="bg-[#6d28d9] text-white px-8 py-3 rounded-full font-bold hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-900/40">
                            Back to Home
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-y-scroll bg-[#0f0e1a] text-gray-200 py-12 px-6 lg:py-20">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12">
                    <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 transition-colors group w-fit">
                        <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i> Back to Gallery
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                        Submit <span className="text-[#6d28d9]">Source Code</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl">
                        To maintain security and ownership, we only accept direct code submissions. Upload your project files below.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {/* Title & Category */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Project Name</label>
                                    <input 
                                        required name="title" value={formData.title} onChange={handleChange} 
                                        placeholder="e.g. My Custom Game" 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#6d28d9] transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Category</label>
                                    <div className="relative">
                                        <select 
                                            required name="category" value={formData.category} onChange={handleChange} 
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#6d28d9] appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Select category</option>
                                            {categories.map(cat => <option key={cat} value={cat.toLowerCase()} className="bg-[#0f0e1a]">{cat}</option>)}
                                        </select>
                                        <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs"></i>
                                    </div>
                                </div>
                            </div>

                            {/* MANDATORY FILE UPLOAD */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Project Files</label>
                                <div className="relative group border-2 border-dashed border-[#6d28d9]/30 hover:border-[#6d28d9] rounded-2xl p-12 flex flex-col items-center justify-center transition-all bg-[#6d28d9]/5">
                                    <input 
                                        required
                                        type="file" 
                                        name="file"
                                        onChange={handleChange}
                                        accept=".zip,.html,.jsx"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                    />
                                    <div className="w-20 h-20 bg-[#6d28d9]/20 text-[#6d28d9] rounded-full flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform">
                                        <i className="fa-solid fa-file-code"></i>
                                    </div>
                                    <p className="text-white font-bold text-lg mb-1">
                                        {formData.file ? formData.file.name : "Upload Project Code"}
                                    </p>
                                    <p className="text-sm text-gray-500 text-center max-w-xs">
                                        Drag & drop your <b>.html</b>, <b>.jsx</b>, or <b>.zip</b> folder here.
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Functionality & Instructions</label>
                                <textarea 
                                    required name="description" value={formData.description} onChange={handleChange} rows="4" 
                                    placeholder="Explain how your tool works..." 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#6d28d9] resize-none transition-all" 
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Contact Email</label>
                                <input 
                                    type="email" name="email" value={formData.email} onChange={handleChange} 
                                    placeholder="your@email.com" 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#6d28d9]" 
                                />
                            </div>

                            <button 
                                disabled={status === 'loading'}
                                className="w-full md:w-auto bg-[#6d28d9] hover:bg-[#7c3aed] text-white px-12 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-50"
                            >
                                {status === 'loading' ? (
                                    <><i className="fa-solid fa-spinner animate-spin"></i> Processing Code...</>
                                ) : (
                                    <><i className="fa-solid fa-upload"></i> Submit for Review</>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
                            <h3 className="text-xl font-bold text-white mb-6">Submission Rules</h3>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="bg-red-500/20 text-red-400 h-6 w-6 rounded flex items-center justify-center shrink-0"><i className="fa-solid fa-xmark text-[10px]"></i></div>
                                    <p className="text-sm text-gray-400"><b>No External Links:</b> We no longer accept hosted URLs to prevent spam and link rot.</p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="bg-emerald-500/20 text-emerald-400 h-6 w-6 rounded flex items-center justify-center shrink-0"><i className="fa-solid fa-check text-[10px]"></i></div>
                                    <p className="text-sm text-gray-400"><b>Direct Hosting:</b> We will host your HTML/JSX code directly on our secure servers.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contribute;