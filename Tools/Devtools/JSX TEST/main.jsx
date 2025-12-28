import React, { useState } from 'react';
import { Menu, X, Check, ArrowRight, Star, Zap, Shield, Smartphone } from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* --- Navigation --- */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TechFlow
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 transition">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition">Pricing</a>
              <a href="#testimonials" className="text-slate-600 hover:text-blue-600 transition">Testimonials</a>
              <button className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4">
            <a href="#features" className="block text-slate-600">Features</a>
            <a href="#pricing" className="block text-slate-600">Pricing</a>
            <button className="w-full bg-blue-600 text-white px-5 py-2 rounded-lg font-medium">
              Get Started
            </button>
          </div>
        )}
      </nav>

      {/* --- Hero Section --- */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Build your workflow <br />
            <span className="text-blue-600">faster than ever.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
            The all-in-one platform to manage your projects, track your progress, 
            and collaborate with your team in real-time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center">
              Start Free Trial <ArrowRight className="ml-2" size={20} />
            </button>
            <button className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all">
              View Demo
            </button>
          </div>
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-full max-w-4xl mx-auto h-64"></div>
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80" 
              alt="Dashboard Preview" 
              className="relative rounded-2xl shadow-2xl border border-slate-200 mx-auto"
            />
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to scale</h2>
            <p className="text-slate-600">Powerful tools designed to help your business grow.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="text-yellow-500" />, title: "Lightning Fast", desc: "Built with performance in mind, ensuring sub-second load times." },
              { icon: <Shield className="text-green-500" />, title: "Secure by Default", desc: "Enterprise-grade security to keep your data safe and private." },
              { icon: <Smartphone className="text-blue-500" />, title: "Fully Responsive", desc: "Access your dashboard from any device, anywhere in the world." }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:border-blue-200 transition-colors">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Pricing Section --- */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-600">Choose the plan that's right for you.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-xl mb-2">Basic</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2"><Check size={18} className="text-green-500"/> 1 Project</li>
                <li className="flex items-center gap-2"><Check size={18} className="text-green-500"/> 5GB Storage</li>
                <li className="flex items-center gap-2"><Check size={18} className="text-green-500"/> Community Support</li>
              </ul>
              <button className="w-full py-3 rounded-lg border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition">Get Started</button>
            </div>

            {/* Pro - Popular */}
            <div className="bg-white p-8 rounded-2xl border-2 border-blue-600 shadow-xl scale-105 relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">POPULAR</div>
              <h3 className="font-bold text-xl mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2"><Check size={18} className="text-green-500"/> Unlimited Projects</li>
                <li className="flex items-center gap-2"><Check size={18} className="text-green-500"/> 50GB Storage</li>
                <li className="flex items-center gap-2"><Check size={18} className="text-green-500"/> Priority Support</li>
                <li className="flex items-center gap-2"><Check size={18} className="text-green-500"/> Analytics</li>
              </ul>
              <button className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">Try Pro Now</button>
            </div>

            {/* Enterprise */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-xl mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2"><Check size={18} className="text-green-500"/> Custom Domains</li>
                <li className="flex items-center gap-2"><Check size={18} className="text-green-500"/> 500GB Storage</li>
                <li className="flex items-center gap-2"><Check size={18} className="text-green-500"/> 24/7 Phone Support</li>
              </ul>
              <button className="w-full py-3 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl font-bold text-white mb-4 block">TechFlow</span>
            <p className="text-sm">Building the future of productivity, one task at a time.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Features</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
              <li><a href="#" className="hover:text-white transition">Guide</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-sm text-center">
          © {new Date().getFullYear()} TechFlow Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;