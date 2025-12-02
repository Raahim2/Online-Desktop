import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-12 py-8 border-t border-white/5 text-center text-gray-500 text-sm">
        <div className="flex justify-center gap-6 mb-4">
            <a href="#" className="hover:text-white">About Us</a>
            <a href="#" className="hover:text-white">Developers</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Privacy</a>
        </div>
        <p>&copy; 2024 CrazyTools All rights reserved.</p>
    </footer>
  );
};

export default Footer;