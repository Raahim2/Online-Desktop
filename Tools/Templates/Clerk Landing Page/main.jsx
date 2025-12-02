"use client";

import React, { useState } from 'react';

// --- Icons (Inline SVGs to remove external dependencies) ---
const Icons = {
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
  ),
  ArrowRight: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
  ),
  Play: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
  ),
  Google: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
  ),
  Github: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
  ),
  Building: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line><line x1="12" y1="22" x2="12" y2="22.01"></line><line x1="12" y1="2" x2="12" y2="22"></line><line x1="4" y1="10" x2="20" y2="10"></line><line x1="4" y1="16" x2="20" y2="16"></line></svg>
  ),
  ChevronDown: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
  ),
  Bolt: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
  ),
  ReactLogo: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.83a10 10 0 0 1 0 14.15m-14.14 0a10 10 0 0 1 0-14.15"></path></svg>
  ),
  VueLogo: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 22 22 22 12 2"></polygon><polyline points="2 2 12 12 22 2"></polyline></svg>
  ),
  Twitter: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
  ),
  Discord: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
  ),
  Aws: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.986 16.536c.266-.342.399-.785.399-1.33 0-.583-.162-1.026-.486-1.33-.323-.304-.954-.456-1.892-.456-.475 0-.97.028-1.485.085v3.314c.533.057.999.086 1.398.086.837 0 1.551-.123 2.066-.369zm-1.892-6.505c.609 0 1.056.124 1.341.371.285.247.428.618.428 1.113 0 .438-.133.79-.399 1.056-.266.266-.723.399-1.37.399h-1.227V10.03h1.227zM18.865 14.538c0 .894-.323 1.636-.97 2.226-.647.59-1.493.885-2.54.885-.59 0-1.17-.038-1.741-.114v-2.055c.628.076 1.132.114 1.513.114.361 0 .637-.086.827-.257.19-.171.285-.437.285-.799v-.285c-.951.19-1.826.285-2.625.285-1.123 0-1.993-.2-2.611-.6-.618-.4-.927-.99-.927-1.769 0-.856.314-1.503.942-1.94.628-.438 1.512-.656 2.654-.656.495 0 1.056.038 1.684.114V9.603c0-.304-.076-.552-.228-.742-.152-.19-.466-.285-.942-.285-.399 0-.865.048-1.398.143v-1.94c.647-.114 1.322-.171 2.026-.171 1.084 0 1.931.257 2.54.77.609.514.913 1.246.913 2.197v5.023h-.029v-.062zM7.18 17.506c-.856 0-1.513-.304-1.969-.913-.457-.609-.685-1.465-.685-2.568 0-1.046.228-1.864.685-2.454.457-.59 1.113-.885 1.969-.885.514 0 .97.067 1.37.2v6.421a2.88 2.88 0 0 1-1.37.2zm4.394-7.876h2.283v8h-2.283v-8zm-5.764 0h2.254v6.279c0 .761-.095 1.313-.285 1.655-.38.704-1.075 1.056-2.083 1.056-.99 0-1.731-.333-2.226-.999-.495-.666-.742-1.569-.742-2.711 0-1.236.247-2.183.742-2.839.495-.656 1.208-.984 2.14-.984.723 0 1.351.181 1.884.542l.028-1.997h.002z"/></svg>
  )
};

export default function ClerkLanding() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
  <div className="font-sans text-[#1c1c1f] bg-white antialiased h-screen overflow-y-auto overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        
        body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        .text-gradient {
          background: linear-gradient(135deg, #1c1c1f 0%, #5E5F6E 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

        .grid-pattern {
          background-image: radial-gradient(#E2E2E4 1px, transparent 1px);
          background-size: 24px 24px;
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
      `}</style>

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#E2E2E4]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Left Nav */}
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-6 h-6 bg-[#6C47FF] rounded-md flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Icons.Check />
              </div>
              <span className="font-bold text-lg tracking-tight">Clerk</span>
            </a>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5E5F6E]">
              {['Product', 'Solutions', 'Docs', 'Pricing', 'Company'].map((item) => (
                <a key={item} href="#" className="hover:text-[#6C47FF] transition-colors">{item}</a>
              ))}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <a href="#" className="hidden sm:block text-sm font-medium text-[#5E5F6E] hover:text-[#1c1c1f] transition-colors">Sign in</a>
            <a href="#" className="bg-[#131316] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:shadow-gray-300">
              Get started
            </a>
            <button 
                className="md:hidden text-[#1c1c1f]"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Icons.Menu />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-16 lg:pt-48 lg:pb-32 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-40">
          <div className="absolute top-20 left-[20%] w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-20 right-[20%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-32 left-[40%] w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <a href="#" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E2E2E4] shadow-sm text-xs font-medium text-[#5E5F6E] mb-8 hover:border-[#6C47FF]/50 transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#6C47FF] animate-pulse"></span>
            Clerk raises $50M Series C
            <Icons.ArrowRight />
          </a>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]">
            More than authentication. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C47FF] to-blue-600">Complete User Management.</span>
          </h1>

          <p className="text-lg md:text-xl text-[#5E5F6E] max-w-2xl mx-auto mb-10 leading-relaxed">
            Need more than sign-in? Clerk gives you full stack auth and user management — so you can launch faster, scale easier, and stay focused on building your business.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-[#6C47FF] hover:bg-[#5638cc] text-white rounded-full font-semibold text-sm transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2">
              Start building for free
              <Icons.ArrowRight />
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#1c1c1f] border border-[#E2E2E4] rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <span className="text-[#5E5F6E]"><Icons.Play /></span>
              Watch demo <span className="text-[#5E5F6E] font-normal text-xs ml-1">2 min</span>
            </button>
          </div>
        </div>
      </main>

      {/* Trusted By Logos */}
      <section className="border-y border-[#E2E2E4]/40 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-center text-xs font-semibold text-[#5E5F6E] uppercase tracking-wider mb-8">Trusted by fast-growing companies around the world</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="text-xl font-bold font-mono">VERCEL</div>
            <div className="text-xl font-bold font-serif italic">Stripe</div>
            <div className="text-xl font-bold tracking-widest">HONEY</div>
            <div className="text-xl font-bold flex items-center gap-1"><Icons.Aws /> AWS</div>
            <div className="text-xl font-bold font-mono">Replit</div>
          </div>
        </div>
      </section>

      {/* Interactive Component Showcase */}
      <section className="py-24 bg-[#FAFAFA] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Clerk Components</h2>
            <p className="text-[#5E5F6E] text-lg max-w-2xl mx-auto">
              Drop-in UI components for authentication, profile management, organization management, and billing. Match to your brand with any CSS library.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1: Sign In */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_0_1px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_0_1px_rgba(0,0,0,0.1)] transition-shadow border border-[#E2E2E4] relative overflow-hidden group">
              <div className="absolute inset-0 grid-pattern opacity-30"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">User Authentication</h3>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-[#5E5F6E]">&lt;SignIn /&gt;</span>
                </div>
                <p className="text-sm text-[#5E5F6E] mb-6 h-10">Add user Sign Up and Sign In, provide account access, and manage security settings.</p>
                
                {/* Fake UI Component */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 max-w-[280px] mx-auto transform group-hover:scale-105 transition-transform duration-300">
                  <div className="text-center mb-4">
                    <h4 className="font-bold text-gray-900">Sign in</h4>
                    <p className="text-xs text-gray-500">to continue to App</p>
                  </div>
                  <div className="space-y-2">
                    <button className="w-full py-1.5 px-3 border rounded text-xs flex items-center justify-center gap-2 hover:bg-gray-50">
                      <Icons.Google /> Google
                    </button>
                    <button className="w-full py-1.5 px-3 border rounded text-xs flex items-center justify-center gap-2 hover:bg-gray-50">
                      <Icons.Github /> GitHub
                    </button>
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                      <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-gray-500">or</span></div>
                    </div>
                    <input type="email" placeholder="Email address" className="w-full border rounded px-2 py-1.5 text-xs bg-gray-50" readOnly />
                    <button className="w-full bg-[#131316] text-white rounded py-1.5 text-xs font-medium">Continue</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: User Profile */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_0_1px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_0_1px_rgba(0,0,0,0.1)] transition-shadow border border-[#E2E2E4] relative overflow-hidden group">
              <div className="absolute inset-0 grid-pattern opacity-30"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">User Profile</h3>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-[#5E5F6E]">&lt;UserProfile /&gt;</span>
                </div>
                <p className="text-sm text-[#5E5F6E] mb-6 h-10">Allow users to manage their profile info, security settings, and connected accounts.</p>
                
                {/* Fake UI Component */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transform group-hover:scale-105 transition-transform duration-300 max-w-[280px] mx-auto">
                  <div className="flex border-b text-[10px]">
                    <div className="p-2 w-1/3 bg-gray-50 border-r space-y-2">
                      <div className="h-1.5 w-12 bg-gray-300 rounded"></div>
                      <div className="h-1.5 w-8 bg-gray-200 rounded"></div>
                      <div className="h-1.5 w-10 bg-gray-200 rounded"></div>
                    </div>
                    <div className="p-3 w-2/3 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#6C47FF]/20"></div>
                        <div>
                          <div className="h-2 w-16 bg-gray-800 rounded mb-1"></div>
                          <div className="h-1.5 w-24 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                      <div className="h-px bg-gray-100"></div>
                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-gray-100 rounded"></div>
                        <div className="h-1.5 w-3/4 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Organization */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_0_1px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_0_1px_rgba(0,0,0,0.1)] transition-shadow border border-[#E2E2E4] relative overflow-hidden group">
              <div className="absolute inset-0 grid-pattern opacity-30"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">B2B Organizations</h3>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-[#5E5F6E]">&lt;OrgSwitcher /&gt;</span>
                </div>
                <p className="text-sm text-[#5E5F6E] mb-6 h-10">Enable multi-tenancy with organization creation, switching, and member management.</p>
                
                {/* Fake UI Component */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 max-w-[280px] mx-auto transform group-hover:scale-105 transition-transform duration-300 flex flex-col justify-center min-h-[140px]">
                  <div className="border rounded-lg p-2 flex items-center justify-between shadow-sm cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-black text-white flex items-center justify-center text-[10px]">
                        <Icons.Building />
                      </div>
                      <div className="text-xs font-semibold">Acme Corp</div>
                    </div>
                    <div className="text-[#a3a3a3]">
                        <Icons.ChevronDown />
                    </div>
                  </div>
                  
                  <div className="mt-2 pl-2 space-y-2 border-l-2 border-gray-100 ml-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-500"></div>
                      <div className="h-1.5 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-purple-500"></div>
                      <div className="h-1.5 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          <div className="mt-12 text-center">
            <a href="#" className="inline-flex items-center gap-2 text-[#6C47FF] font-medium hover:underline">
              Explore all components <Icons.ArrowRight />
            </a>
          </div>
        </div>
      </section>

      {/* Code/DX Section */}
      <section className="py-24 bg-[#131316] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-900/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Build with SDKs for modern frameworks</h2>
            <p className="text-gray-400 text-lg mb-8">
              Clerk keeps developer experience front-and-center by providing helpful SDKs for most modern frameworks on web and mobile.
            </p>
            <div className="flex flex-wrap gap-4 mb-8 text-sm">
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/5 hover:bg-white/20 cursor-pointer transition">
                <Icons.ReactLogo /> React
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/5 hover:bg-white/20 cursor-pointer transition">
                <span className="font-bold">N</span> Next.js
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/5 hover:bg-white/20 cursor-pointer transition">
                <Icons.Bolt /> Remix
              </span>
               <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/5 hover:bg-white/20 cursor-pointer transition">
                <Icons.VueLogo /> Vue
              </span>
            </div>
            <a href="#" className="text-white border-b border-white hover:border-transparent transition-all">View all frameworks</a>
          </div>

          {/* Code Block Visual */}
          <div className="bg-[#1e1e24] rounded-xl border border-white/10 shadow-2xl overflow-hidden font-mono text-sm relative group">
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-4 text-xs text-gray-500">middleware.ts</span>
            </div>
            <div className="p-6 text-gray-300 overflow-x-auto whitespace-pre">
              <p><span className="text-purple-400">import</span> {'{ authMiddleware }'} <span className="text-purple-400">from</span> <span className="text-green-400">"@clerk/nextjs"</span>;</p>
              <br />
              <p><span className="text-gray-500">// This example protects all routes including api/trpc routes</span></p>
              <p><span className="text-gray-500">// Please edit this to allow other routes to be public as needed.</span></p>
              <p><span className="text-gray-500">// See clerk.com/docs for more information</span></p>
              <p><span className="text-purple-400">export default</span> <span className="text-blue-400">authMiddleware</span>({'{}'});</p>
              <br />
              <p><span className="text-purple-400">export const</span> config = {'{'}</p>
              <p className="pl-4">matcher: [<span className="text-green-400">"/((?!.*\\..*|_next).+)"</span>, <span className="text-green-400">"/"</span>, <span className="text-green-400">"/(api|trpc)(.*)"</span>],</p>
              <p>{'};'}</p>
            </div>
            {/* Glow Effect */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#6C47FF] rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Trusted by startups and enterprises</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Guillermo Rauch", role: "CEO, Vercel", bg: "000", quote: "\"The best practices built-in to their SignIn and UserProfile components would take months to implement in-house, yet no sacrifice is made in terms of customization.\"" },
              { name: "Colin Sidoti", role: "CEO, Clerk (Self)", bg: "blue", quote: "\"Clerk feels like the first time I booted my computer with an SSD. It's so much faster and simpler that it changed how I do things.\"" },
              { name: "Sarah Drasner", role: "Engineering, Google", bg: "purple", quote: "\"We were able to ship MFA, SSO, and SAML for our customers in a fraction of the time. Now, we have improved security and must-haves for enterprise.\"" }
            ].map((t, i) => (
              <div key={i} className="p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://ui-avatars.com/api/?name=${t.name}&background=${t.bg}&color=fff`} alt={t.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-[#5E5F6E]">{t.role}</div>
                  </div>
                </div>
                <p className="text-[#5E5F6E] leading-relaxed">{t.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Start now, no strings attached</h2>
          <p className="text-[#5E5F6E] text-lg mb-10">
            Integrate complete user management in minutes. Free for your first 10,000 monthly active users. No credit card required.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-3.5 bg-[#6C47FF] hover:bg-[#5638cc] text-white rounded-full font-semibold shadow-lg shadow-purple-500/30">
              Start building
            </button>
            <button className="px-8 py-3.5 bg-white border border-[#E2E2E4] text-[#1c1c1f] hover:bg-gray-50 rounded-full font-semibold">
              Contact sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-[#6C47FF] rounded flex items-center justify-center text-white">
                  <Icons.Check />
                </div>
                <span className="font-bold text-sm">Clerk</span>
              </div>
              <div className="flex gap-4 text-gray-400">
                <a href="#" className="hover:text-[#6C47FF]"><Icons.Twitter /></a>
                <a href="#" className="hover:text-[#6C47FF]"><Icons.Github /></a>
                <a href="#" className="hover:text-[#6C47FF]"><Icons.Discord /></a>
              </div>
            </div>
            
            {[
              { title: "Product", links: ["Authentication", "Components", "Pricing"] },
              { title: "Resources", links: ["Documentation", "Changelog", "Support"] },
              { title: "Company", links: ["About", "Careers", "Blog"] },
              { title: "Legal", links: ["Privacy Policy", "Terms", "Security"] }
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-3 text-sm text-[#5E5F6E]">
                  {col.links.map(link => (
                    <li key={link}><a href="#" className="hover:text-[#6C47FF]">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
            <p>&copy; 2025 Clerk, Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span>System Status: <span className="text-green-500 font-bold">● Operational</span></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}