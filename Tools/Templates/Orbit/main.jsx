"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Play, Check, Menu, X, ArrowDown } from 'lucide-react';

export default function OrbitLandingPage() {
  const canvasRef = useRef(null);
  const navbarRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // --- 1. Starfield Engine ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    const numStars = 400;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    class Star {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 2 + 0.5;
        this.size = Math.random() * 1.5;
        this.opacity = Math.random();
      }
      update() {
        this.y -= this.z * 0.2;
        if (this.y < 0) this.reset();
      }
      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      resize();
      stars = Array.from({ length: numStars }, () => new Star());
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        star.update();
        star.draw();
      });
      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    init();
    animate();

    return () => window.removeEventListener('resize', resize);
  }, []);

  // --- 2. Scroll Logic (Navbar & Reveal) ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal-trigger').forEach((el) => observer.observe(el));
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="h-screen overflow-y-auto bg-[#030510] text-white font-sans selection:bg-indigo-500 selection:text-white min-h-screen overflow-x-hidden">
      {/* CSS Styles injection */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@200;400;600&display=swap');
        
        .font-serif { font-family: 'Cinzel', serif; }
        .font-sans { font-family: 'Montserrat', sans-serif; }

        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .text-gradient {
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .planet-glow {
          box-shadow: inset -10px -10px 50px rgba(0,0,0,0.8), 0 0 50px rgba(79, 70, 229, 0.3);
        }

        .reveal-trigger {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .reveal-active {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out 3s infinite; }
      `}</style>

      {/* Canvas Background */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />

      {/* Navigation */}
      <nav 
        ref={navbarRef}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled ? 'bg-black/80 backdrop-blur-md py-4 border-b border-white/5' : 'py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
            <span className="font-serif text-2xl tracking-widest font-bold uppercase">Orbit</span>
          </div>
          
          <div className="hidden md:flex gap-10 text-[10px] tracking-[0.3em] uppercase text-gray-400">
            <a href="#vessels" className="hover:text-white transition-colors">Vessels</a>
            <a href="#destinations" className="hover:text-white transition-colors">Destinations</a>
            <a href="#experience" className="hover:text-white transition-colors">Experience</a>
          </div>

          <button className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all">
            Reserve Seat
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="min-h-screen flex items-center justify-center relative px-6">
        <div className="max-w-5xl mx-auto text-center z-10">
          <div className="reveal-trigger reveal-active inline-block mb-6 px-4 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-[0.3em] text-indigo-300">
            The Next Frontier is Here
          </div>
          
          <h1 className="reveal-trigger reveal-active font-serif text-5xl md:text-8xl lg:text-9xl mb-8 leading-tight text-gradient font-bold" style={{ transitionDelay: '200ms' }}>
            BEYOND<br />HORIZONS
          </h1>
          
          <p className="reveal-trigger reveal-active text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed mb-12" style={{ transitionDelay: '400ms' }}>
            Experience the silence of the void and the curve of the Earth. 
            Luxury commercial space travel is no longer a dream. It is a destination.
          </p>

          <div className="reveal-trigger reveal-active flex flex-col md:flex-row justify-center gap-6" style={{ transitionDelay: '600ms' }}>
            <button className="bg-white text-[#030510] px-10 py-5 font-bold uppercase tracking-[0.2em] text-xs hover:bg-indigo-50 transition-all">
              View Flight Path
            </button>
            <button className="bg-white/5 backdrop-blur-md border border-white/20 px-10 py-5 font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-3 justify-center group hover:bg-white/10 transition-all">
              <Play size={14} className="group-hover:text-indigo-400 transition-colors" /> Watch Film
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30">
          <span className="text-[9px] uppercase tracking-[0.5em]">Scroll</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="w-full border-y border-white/5 bg-black/20 backdrop-blur-sm z-10 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
          {[
            { val: "400km", label: "Altitude" },
            { val: "90min", label: "Orbit Time" },
            { val: "Zero-G", label: "Environment" },
            { val: "5 Star", label: "Service" }
          ].map((stat, i) => (
            <div key={i} className="py-10 text-center">
              <div className="text-3xl font-serif mb-2 tracking-tighter">{stat.val}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Section */}
      <section id="experience" className="py-32 relative overflow-hidden">
        {/* CSS Art Planet */}
        <div className="absolute -right-20 top-40 animate-float opacity-50 hidden lg:block">
          <div className="w-72 h-72 rounded-full bg-gradient-to-br from-indigo-600 via-indigo-950 to-black planet-glow relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_70%)] blur-sm" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center relative z-10">
          <div className="reveal-trigger">
            <h2 className="font-serif text-4xl md:text-5xl mb-8 leading-tight tracking-tight">ENGINEERED FOR<br />ELEGANCE</h2>
            <div className="h-px w-20 bg-indigo-500 mb-8"></div>
            <p className="text-gray-400 leading-relaxed text-lg mb-10">
              The <strong>ORBIT Mark IV</strong> capsule is designed not just for safety, but for observation. 
              With the largest windows ever constructed for a pressurized spacecraft, 
              you won't just see space—you'll inhabit it.
            </p>
            <ul className="space-y-6">
              {['Personalized Climate Control', 'Michelin Star Zero-G Dining', 'High-Fidelity Audio Suppression'].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-xs tracking-widest uppercase text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Check size={12} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="reveal-trigger glass-panel p-10 rounded-2xl animate-float-delayed relative">
            <div className="absolute -top-4 -left-4 bg-indigo-600 px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
              Now Booking 2026
            </div>
            <div className="flex justify-between items-end mb-12">
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Vessel</div>
                <div className="text-3xl font-serif tracking-tighter">Mark IV</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</div>
                <div className="text-green-400 text-sm flex items-center gap-2 font-semibold">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Flight Ready
                </div>
              </div>
            </div>
            <div className="bg-white/5 h-40 rounded-xl flex items-center justify-center border border-white/5 mb-8">
              <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase animate-pulse">
                [ Cabin Preview Interactive ]
              </span>
            </div>
            <div className="flex gap-4">
              <div className="h-1 flex-1 bg-indigo-500 rounded-full" />
              <div className="h-1 flex-1 bg-white/10 rounded-full" />
              <div className="h-1 flex-1 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Destination Grid */}
      <section id="destinations" className="py-32 bg-gradient-to-b from-transparent to-indigo-950/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24 reveal-trigger">
            <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">The Itinerary</span>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight">CHOOSE YOUR HORIZON</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Luna Card */}
            <DestinationCard 
              title="LUNA ORBIT" 
              price="$1.2M" 
              duration="7 Days"
              desc="A complete circumlunar navigation. Witness the dark side of the moon and the legendary Earthrise."
              planetColor="bg-gray-300"
            />
            
            {/* Earth Card */}
            <DestinationCard 
              title="LOW EARTH" 
              price="$250K" 
              duration="4 Hours"
              desc="Two full orbits around the planet. Experience the Overview Effect and true physical weightlessness."
              planetColor="bg-blue-600"
              featured
            />

            {/* Mars Card */}
            <DestinationCard 
              title="RED MARS" 
              price="Inquire" 
              duration="6 Months"
              desc="The ultimate voyage. Join the first civilian colonization transport. One way or return paths available."
              planetColor="bg-red-700"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black z-10 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left">
            <div className="font-serif text-2xl font-bold tracking-widest mb-2">ORBIT</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Aerospace Division</div>
          </div>
          
          <div className="flex gap-10 text-[10px] text-gray-400 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" class="hover:text-white transition-colors">Terms</a>
            <a href="#" class="hover:text-white transition-colors">Safety</a>
          </div>

          <div className="text-gray-700 text-[10px] tracking-widest uppercase">
            © 2050 ORBIT Corp. All skies reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const DestinationCard = ({ title, price, duration, desc, planetColor, featured }) => (
  <div className={`reveal-trigger glass-panel group overflow-hidden transition-all duration-500 hover:bg-white/5 ${featured ? 'md:-translate-y-8' : ''}`}>
    <div className="h-64 bg-black/40 relative overflow-hidden flex items-center justify-center">
      <div className={`w-32 h-32 rounded-full ${planetColor} shadow-[inset_-15px_-15px_30px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-700`} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030510] to-transparent opacity-80" />
      {featured && <div className="absolute top-4 right-4 bg-indigo-600 text-[9px] font-bold px-3 py-1 uppercase tracking-tighter">Best Seller</div>}
      <div className="absolute bottom-6 left-8">
        <h3 className="font-serif text-2xl tracking-tighter">{title}</h3>
      </div>
    </div>
    <div className="p-8">
      <div className="flex justify-between text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-6">
        <span>{duration}</span>
        <span>{price}</span>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed mb-8 h-12 overflow-hidden">
        {desc}
      </p>
      <button className={`w-full py-4 text-[10px] uppercase tracking-[0.3em] font-bold transition-all ${
        featured ? 'bg-white text-black hover:bg-gray-200' : 'border border-white/20 hover:bg-white hover:text-black'
      }`}>
        Details
      </button>
    </div>
  </div>
);