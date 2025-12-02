"use client"; // Required for Next.js App Router

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Head from 'next/head';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

export default function Project() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const comp = useRef(null); // Ref for GSAP Context

  // Colors (Hardcoded for portability)
  const NEON_COLOR = "#ccff00"; 
  const DARK_BG = "#050505";

  // Handle Scroll for Navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP Animations
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Create a GSAP context for easy cleanup in React
    let ctx = gsap.context(() => {
      
      // Hero Text Fade Up
      gsap.from(".hero-content > *", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });

      // Hero Image Enter
      gsap.from(".hero-image", {
        x: 100,
        opacity: 0,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)",
        delay: 0.5
      });

      // Parallax Text Reveal
      gsap.from(".parallax-content", {
        scrollTrigger: {
          trigger: "#about",
          start: "top 80%",
          toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 1
      });

      // Product Cards Stagger
      gsap.from(".product-card", {
        scrollTrigger: {
          trigger: "#products",
          start: "top 70%"
        },
        y: 100,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out"
      });

    }, comp); // Scope to this component

    return () => ctx.revert(); // Cleanup
  }, []);

  return (
    <div ref={comp} className="h-screen overflow-y-auto bg-[#050505] text-white font-sans overflow-x-hidden">
      {/* Inject Fonts and Global Styles specifically for this page */}
      <Head>
        <title>NEON SIP | Future of Hydration</title>
        <meta name="description" content="Frontend Internship Assessment" />
      </Head>
      
      {/* Global CSS for this component */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&display=swap');
        
        body {
          font-family: 'Outfit', sans-serif;
          background-color: #050505;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #ccff00; }

        /* Glass Utility */
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* Parallax Background */
        .parallax-bg {
          background-image: url('https://images.unsplash.com/photo-1555196301-9acc011dfde4?q=80&w=2070&auto=format&fit=crop');
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
        }

        /* Float Animation */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .float-anim { animation: float 6s ease-in-out infinite; }
        
        .neon-text-glow { text-shadow: 0 0 10px rgba(204, 255, 0, 0.3); }
      `}</style>

      {/* Sticky Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md' : 'glass'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0 cursor-pointer">
              <span className="text-2xl font-black tracking-tighter text-white">NEON<span className="text-[#ccff00]">SIP</span>.</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {['Home', 'Flavors', 'Story', 'Reviews'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase() === 'home' ? 'hero' : item.toLowerCase() === 'flavors' ? 'products' : item.toLowerCase() === 'story' ? 'about' : 'reviews'}`} 
                     className="hover:text-[#ccff00] transition-colors duration-300 font-medium">
                    {item}
                  </a>
                ))}
              </div>
            </div>
            <div className="hidden md:block">
              <button className="bg-[#ccff00] text-black px-6 py-2 rounded-full font-bold hover:bg-white transition-all transform hover:scale-105 duration-300">
                Shop Now
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="-mr-2 flex md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-[#ccff00] inline-flex items-center justify-center p-2 rounded-md focus:outline-none"
              >
                <svg className="h-8 w-8" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 absolute w-full border-b border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center">
              {['Home', 'Flavors', 'Reviews'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase() === 'home' ? 'hero' : item.toLowerCase() === 'flavors' ? 'products' : 'reviews'}`}
                  className="block px-3 py-2 text-white hover:text-[#ccff00]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ccff00]/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="hero-content space-y-6 text-center md:text-left z-10">
            <div className="inline-block px-4 py-1 border border-[#ccff00]/50 rounded-full text-[#ccff00] text-sm font-bold tracking-widest uppercase mb-2">
              Zero Sugar. Maximum Vibe.
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
              TASTE THE <br /> <span className="text-[#ccff00] neon-text-glow">FUTURE</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto md:mx-0">
              Experience the next generation of hydration. Infused with natural electrolytes and a kick of kinetic energy.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start pt-4">
              <button className="group relative px-8 py-4 bg-[#ccff00] text-black font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105">
                <span className="relative z-10">Get Starter Pack</span>
                <div className="absolute inset-0 h-full w-full scale-0 rounded-full transition-all duration-300 group-hover:scale-100 group-hover:bg-white/30"></div>
              </button>
              <button className="px-8 py-4 border border-white/20 text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all">
                View Flavors
              </button>
            </div>
          </div>

          <div className="hero-image relative flex justify-center z-10">
            <div className="absolute inset-0 border border-white/10 rounded-full scale-75 animate-pulse"></div>
            <div className="absolute inset-0 border border-white/5 rounded-full scale-90"></div>
            <img 
              src="https://static.vecteezy.com/system/resources/thumbnails/047/420/976/small_2x/trendy-water-caps-and-bottles-elevate-your-hydration-game-free-png.png" 
              alt="Neon Sip Bottle" 
              className="relative w-64 md:w-80 h-auto object-cover rounded-3xl shadow-2xl float-anim border border-white/10 rotate-3 hover:rotate-0 transition-all duration-500"
            />
          </div>
        </div>
      </section>

      {/* Parallax Scroll Section */}
      <section id="about" className="parallax-bg h-[60vh] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto parallax-content">
          <h2 className="text-4xl md:text-6xl font-black mb-6">UNSTOPPABLE <span className="text-[#ccff00]">ENERGY</span></h2>
          <p className="text-xl md:text-2xl text-gray-200 font-light">
            Crafted for creators, gamers, and night owls. <br />
            Sustain your flow state without the crash.
          </p>
        </div>
      </section>

      {/* Product Showcase */}
      <section id="products" className="py-24 bg-[#0a0a0a] relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Choose Your <span className="text-[#ccff00]">Fuel</span></h2>
            <div className="h-1 w-24 bg-[#ccff00] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ProductCard 
              title="Electric Lime" 
              desc="Citrus punch with a sour kick." 
              price="$24.00" 
              color="text-[#ccff00]"
              btnColor="hover:bg-[#ccff00]"
              borderColor="hover:border-[#ccff00]/50"
              img="https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=2070&auto=format&fit=crop"
            />
            <ProductCard 
              title="Cyber Berry" 
              desc="Mixed berries with a cooling finish." 
              price="$24.00" 
              color="text-blue-400"
              btnColor="hover:bg-blue-400"
              borderColor="hover:border-blue-400/50"
              img="https://images.unsplash.com/photo-1543364195-077a16c30ff3?q=80&w=2070&auto=format&fit=crop"
            />
            <ProductCard 
              title="Glitch Grape" 
              desc="Deep grape flavor with sparkling fizz." 
              price="$24.00" 
              color="text-pink-500"
              btnColor="hover:bg-pink-500"
              borderColor="hover:border-pink-500/50"
              img="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=2070&auto=format&fit=crop"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-24 bg-black relative overflow-hidden">
        <div className="absolute -right-20 top-20 w-72 h-72 bg-[#ccff00]/10 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Community <span className="text-[#ccff00]">Hype</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard 
              quote="The cleanest energy drink I've ever had. No jitters, just pure focus for my coding sessions."
              name="Alex Dev"
              role="Frontend Engineer"
              img="https://i.pravatar.cc/150?img=11"
            />
            <TestimonialCard 
              quote="Obsessed with the design and the taste. Electric Lime is my absolute favorite before the gym."
              name="Sarah Fit"
              role="Personal Trainer"
              img="https://i.pravatar.cc/150?img=5"
            />
             <TestimonialCard 
              quote="Finally a drink that matches my setup aesthetic. It tastes amazing too. 10/10 recommended."
              name="Jay Gamer"
              role="Streamer"
              img="https://i.pravatar.cc/150?img=3"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111111] border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-2xl font-black tracking-tighter text-white">NEON<span className="text-[#ccff00]">SIP</span>.</span>
            <p className="text-gray-500 text-sm mt-2">© 2023 Neon Sip Inc. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-gray-400">
            <a href="#" className="hover:text-[#ccff00] transition-colors">Instagram</a>
            <a href="#" className="hover:text-[#ccff00] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[#ccff00] transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-components for cleaner JSX
function ProductCard({ title, desc, price, color, btnColor, borderColor, img }) {
  return (
    <div className={`product-card group relative p-6 bg-[#111111] rounded-2xl border border-white/5 ${borderColor} transition-all duration-300 hover:-translate-y-2`}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 rounded-2xl z-0"></div>
      <div className="relative z-10 flex flex-col items-center">
        <img src={img} alt={title} className="w-full h-64 object-cover rounded-xl mb-6 group-hover:scale-105 transition-transform duration-500" />
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{desc}</p>
        <div className="flex items-center justify-between w-full px-4">
          <span className={`text-xl font-bold ${color}`}>{price}</span>
          <button className={`p-2 bg-white text-black rounded-full ${btnColor} transition-colors`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, name, role, img }) {
  return (
    <div className="p-8 bg-[#111111] rounded-2xl border border-white/10 relative">
      <div className="text-[#ccff00] text-4xl font-serif absolute top-4 left-4">"</div>
      <p className="text-gray-300 mt-4 mb-6 relative z-10">{quote}</p>
      <div className="flex items-center gap-4">
        <img src={img} alt={name} className="w-12 h-12 rounded-full border-2 border-[#ccff00]" />
        <div>
          <h4 className="font-bold text-white">{name}</h4>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
    </div>
  );
}