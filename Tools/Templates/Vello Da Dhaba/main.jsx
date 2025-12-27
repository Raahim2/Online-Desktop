"use client";

import React, { useState } from 'react';
import { 
  Utensils, 
  Phone, 
  Hand, 
  Music, 
  Truck, 
  Instagram, 
  Facebook, 
  Twitter, 
  Quote, 
  Heart,
  Bike,
  Sun,
  Coffee,
  Menu as MenuIcon,
  X
} from 'lucide-react';

const VelloDhaba = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Custom Colors & Styles Mapping
  const styles = {
    orange: '#FF8C00',
    yellow: '#FFD700',
    pink: '#FF007F',
    green: '#32CD32',
    clay: '#8B4513',
    shadowPink: '8px 8px 0px rgba(255, 0, 127, 1)',
    shadowGreen: '8px 8px 0px rgba(50, 205, 50, 1)',
    shadowYellow: '8px 8px 0px rgba(255, 215, 0, 1)',
    shadowBlack: '6px 6px 0px 0px rgba(0,0,0,1)',
    shadowWhite: '6px 6px 0px 0px rgba(255,255,255,1)',
  };

  const menuItems = [
    {
      emoji: "🍗",
      name: "Butter Chicken Vello Style",
      price: "₹350",
      desc: "Boneless chicken swimming in a pool of butter and love. Not for diet people.",
      color: "bg-orange-500"
    },
    {
      emoji: "🥘",
      name: "Dal Makhani Overload",
      price: "₹220",
      desc: "Cooked for 24 hours on slow coal fire. Creamier than your moisturizer.",
      color: "bg-yellow-500"
    },
    {
      emoji: "🥛",
      name: "Patiala Lassi (1 Litre)",
      price: "₹150",
      desc: "Served in a steel glass. Comes with a spoon because it's that thick.",
      color: "bg-white"
    },
    {
      emoji: "🫓",
      name: "Bullet Naan",
      price: "₹60",
      desc: "Spicy chili garlic naan. Warning: Keep water ready.",
      color: "bg-green-600"
    }
  ];

  return (
    <div className="h-screen overflow-y-auto bg-[#FFF7ED] text-gray-800 font-sans selection:bg-[#FF007F] selection:text-white overflow-x-hidden">
      {/* Google Fonts Injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rozha+One&family=Poppins:wght@300;400;700&display=swap');
        
        .font-display { font-family: 'Rozha One', serif; }
        .font-body { font-family: 'Poppins', sans-serif; }

        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .scrolling-text {
          animation: scroll 20s linear infinite;
        }
        .truck-pattern {
          background-image: radial-gradient(#FF8C00 15%, transparent 16%), radial-gradient(#FF8C00 15%, transparent 16%);
          background-size: 20px 20px;
          background-position: 0 0, 10px 10px;
        }
      `}</style>

      {/* Marquee Alert */}
      <div className="bg-[#FF007F] text-white py-2 overflow-hidden border-b-4 border-[#FFD700] sticky top-0 z-[60]">
        <div className="whitespace-nowrap scrolling-text font-bold uppercase tracking-widest text-sm flex items-center gap-4">
          <span>🚨 GARMA GARAM NAAN AVAILABLE • EXTRA MAKHAN FREE FOR STUDENTS • HORN OK PLEASE • OPEN 24/7 FOR VELLOS • CHAI IS EMOTION 🚨</span>
          <span>🚨 GARMA GARAM NAAN AVAILABLE • EXTRA MAKHAN FREE FOR STUDENTS • HORN OK PLEASE • OPEN 24/7 FOR VELLOS • CHAI IS EMOTION 🚨</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b-4 border-[#FF8C00] sticky top-[40px] z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-display text-4xl text-[#FF007F] tracking-wide drop-shadow-sm cursor-pointer">
            VELLO<span className="text-[#FF8C00]">.</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-8 font-bold text-gray-700 uppercase tracking-wider text-sm">
            <a href="#menu" className="hover:text-[#FF8C00] transition">The Menu</a>
            <a href="#vibe" className="hover:text-[#FF8C00] transition">The Vibe</a>
            <a href="#location" className="hover:text-[#FF8C00] transition">Find Us</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:block bg-[#FF8C00] text-white px-6 py-2 font-bold rounded-full hover:bg-red-600 transition border-2 border-[#FFD700] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
              ORDER ONLINE
            </button>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b-4 border-[#FF8C00] p-4 flex flex-col gap-4 font-bold uppercase">
            <a href="#menu" onClick={() => setIsMenuOpen(false)}>The Menu</a>
            <a href="#vibe" onClick={() => setIsMenuOpen(false)}>The Vibe</a>
            <a href="#location" onClick={() => setIsMenuOpen(false)}>Find Us</a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-[85vh] flex items-center justify-center bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-60">
            <img 
                src="https://images.unsplash.com/photo-1596566779354-9544923f1c63?q=80&w=2000" 
                alt="Dhaba Background" 
                className="w-full h-full object-cover"
            />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/95 via-orange-900/40 to-transparent"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <div className="inline-block bg-[#FFD700] text-black px-4 py-1 font-bold text-xs uppercase tracking-widest mb-6 -rotate-2 border-2 border-black shadow-[4px_4px_0px_black]">
            Since Today Morning
          </div>
          <h1 className="font-display text-6xl md:text-9xl text-white mb-2 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] leading-tight">
            VELLO THE DHABA
          </h1>
          <p className="font-display text-2xl md:text-4xl text-[#FF007F] mb-10 drop-shadow-md">
            "Eat. Sleep. Vello. Repeat."
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a href="#menu" className="w-full sm:w-auto bg-[#32CD32] text-black px-10 py-5 font-bold text-xl rounded hover:scale-105 transition border-2 border-white shadow-[6px_6px_0px_0px_white] flex items-center justify-center">
              <Utensils className="mr-3" /> KHANA DEKHO
            </a>
            <a href="tel:1234567890" className="w-full sm:w-auto bg-white text-black px-10 py-5 font-bold text-xl rounded hover:scale-105 transition border-2 border-black shadow-[6px_6px_0px_0px_black] flex items-center justify-center">
              <Phone className="mr-3" /> BOOK CHARPAI
            </a>
          </div>
        </div>

        {/* Decorative Spinning Sun */}
        <div className="absolute bottom-0 left-0 text-[#FFD700] opacity-20 text-9xl animate-[spin_10s_linear_infinite] -ml-20 -mb-20">
          <Sun size={200} />
        </div>
      </header>

      {/* The Vibe Section */}
      <section id="vibe" className="py-24 truck-pattern relative border-b-8 border-[#8B4513]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-6xl text-[#8B4513] mb-4">THE VELLO RULES</h2>
            <div className="h-2 w-32 bg-[#FF007F] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Rules Cards */}
            <div className="bg-white p-10 border-4 border-black text-center shadow-[8px_8px_0px_rgba(255,0,127,1)] hover:-translate-y-3 transition duration-300">
              <div className="text-[#FF8C00] flex justify-center mb-6 animate-bounce">
                <Hand size={64} />
              </div>
              <h3 className="font-display text-3xl mb-4">No Forks Allowed</h3>
              <p className="text-gray-600 font-medium">God gave you hands for a reason. Use them to tear that Naan. Experience the taste physically.</p>
            </div>

            <div className="bg-white p-10 border-4 border-black text-center shadow-[8px_8px_0px_rgba(50,205,50,1)] hover:-translate-y-3 transition duration-300">
              <div className="text-[#FF007F] flex justify-center mb-6">
                <Coffee size={64} />
              </div>
              <h3 className="font-display text-3xl mb-4">Charpai Seating</h3>
              <p className="text-gray-600 font-medium">Cross your legs. Relax your back. If you eat too much, just lay down. We don't judge the nap.</p>
            </div>

            <div className="bg-white p-10 border-4 border-black text-center shadow-[8px_8px_0px_rgba(255,215,0,1)] hover:-translate-y-3 transition duration-300">
              <div className="text-[#8B4513] flex justify-center mb-6">
                <Music size={64} />
              </div>
              <h3 className="font-display text-3xl mb-4">Desi Beats Only</h3>
              <p className="text-gray-600 font-medium">No Jazz. No EDM. Only Punjabi MC and 90s Bollywood remixes. Balle Balle is a lifestyle.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Special Menu Section */}
      <section id="menu" className="py-24 bg-gray-900 text-white border-t-8 border-dashed border-[#FFD700]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center mb-16">
            <span className="bg-[#FF007F] text-white px-4 py-1 text-sm font-bold uppercase tracking-[0.2em] mb-4">Pet Pooja</span>
            <h2 className="font-display text-6xl md:text-7xl text-center text-[#FFD700] drop-shadow-lg">
              TODAY'S SPECIAL
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {menuItems.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-center gap-6 bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-[#32CD32] transition group cursor-pointer">
                <div className={`w-28 h-28 ${item.color} rounded-full flex-shrink-0 flex items-center justify-center text-5xl shadow-xl border-4 border-white group-hover:scale-110 transition duration-300`}>
                  {item.emoji}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-2">
                    <h3 className="text-2xl font-display text-white group-hover:text-[#32CD32] transition">{item.name}</h3>
                    <span className="text-2xl font-bold text-[#FFD700]">{item.price}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <button className="text-2xl font-display text-[#FF007F] hover:text-white underline decoration-wavy underline-offset-8 transition">
              View Full Menu PDF
            </button>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 bg-[#FF007F] text-white text-center px-6">
        <div className="max-w-4xl mx-auto border-8 border-white p-12 border-double rotate-1">
          <Quote className="mx-auto text-white/40 w-16 h-16 mb-6" />
          <h3 className="text-3xl md:text-5xl font-display leading-tight italic">
            "I came here to eat one roti, I ended up eating four. Now I cannot walk. Someone please call a rickshaw. Best dhaba ever."
          </h3>
          <div className="mt-8 font-bold uppercase tracking-[0.3em] text-[#FFD700] text-xl">
            — Happy Singh, Local Guide
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="location" className="bg-gray-950 text-white pt-24 pb-12 border-t-8 border-[#FF8C00]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-16">
          
          {/* Address */}
          <div className="space-y-6">
            <h4 className="font-display text-4xl text-[#FFD700] mb-4">VELLO THE DHABA</h4>
            <p className="text-gray-400 text-lg leading-relaxed">
              Plot No. 420, Behind the Old Banyan Tree,<br />
              Highway 69, Next to Sharmaji Ka Petrol Pump.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#FF007F] transition transform hover:scale-125"><Instagram size={28} /></a>
              <a href="#" className="hover:text-[#FF007F] transition transform hover:scale-125"><Facebook size={28} /></a>
              <a href="#" className="hover:text-[#FF007F] transition transform hover:scale-125"><Twitter size={28} /></a>
            </div>
          </div>

          {/* Slogan Card */}
          <div className="bg-gradient-to-br from-[#FF8C00] via-[#FF007F] to-[#32CD32] p-1.5 rounded-3xl -rotate-2">
            <div className="bg-black h-full p-8 flex flex-col items-center justify-center text-center border-4 border-dashed border-white rounded-2xl">
              <Truck size={48} className="text-[#FFD700] mb-4" />
              <h5 className="font-display text-2xl text-white uppercase tracking-wider leading-tight">
                "Buri Nazar Wale<br />Tera Muh Kala"
              </h5>
              <p className="text-xs text-gray-500 mt-4 italic">(Don't be jealous, just grab a seat.)</p>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-6">
            <h4 className="font-display text-3xl text-[#32CD32] mb-4 uppercase">Timings</h4>
            <ul className="text-gray-400 space-y-3 font-bold">
              <li className="flex justify-between border-b border-gray-800 pb-2">
                <span>Mon - Fri:</span> 
                <span className="text-white">11 AM - 3 AM</span>
              </li>
              <li className="flex justify-between border-b border-gray-800 pb-2">
                <span>Sat - Sun:</span> 
                <span className="text-white">11 AM - 5 AM</span>
              </li>
            </ul>
            <div className="bg-[#FF007F]/10 p-4 rounded-xl border border-[#FF007F]/20 text-[#FF007F] font-bold flex items-center">
              <Bike className="mr-3" /> 20 Min Delivery for Vellos
            </div>
          </div>
        </div>

        <div className="text-center mt-24 text-gray-600 text-sm font-mono border-t border-gray-900 pt-8">
          © 2025 Vello The Dhaba. Made with <Heart className="inline text-red-600" size={16} /> and Pure Desi Ghee.
        </div>
      </footer>
    </div>
  );
};

export default VelloDhaba;