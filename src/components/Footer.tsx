// ============================================================
// Footer — UNI stay DBUU branded footer
// ============================================================

import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Share2, MessageSquare, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-11 h-11 rounded-xl overflow-hidden shadow-md bg-white p-0.5 border border-gray-800 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <img
                  src="/logo.png"
                  alt="UNI stay DBUU"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-white text-base block leading-none tracking-tight">
                  UNI stay <span className="text-[#d4a340]">DBUU</span>
                </span>
                <span className="text-2xs text-gray-400 leading-none uppercase tracking-wider block mt-1">Find Your Home • Focus on Future</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              India's dedicated student accommodation platform for Dev Bhoomi Uttarakhand University.
              Find affordable PGs, rooms, flats and hostels near campus.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <Share2 size={16} />, label: 'Instagram', href: '#' },
                { icon: <MessageSquare size={16} />, label: 'Twitter', href: '#' },
                { icon: <ExternalLink size={16} />, label: 'LinkedIn', href: '#' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-indigo-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/search', label: 'Find Accommodation' },
                { to: '/search?type=PG', label: 'PGs Near DBUU' },
                { to: '/search?type=Hostel', label: 'Hostels' },
                { to: '/search?type=Flat', label: 'Flats & Apartments' },
                { to: '/post-property', label: 'List Your Property' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-gray-400 hover:text-indigo-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Student */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">For Students</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/register', label: 'Create Free Account' },
                { to: '/login', label: 'Login' },
                { to: '/saved', label: 'Saved Stays' },
                { to: '/dashboard', label: 'My Dashboard' },
                { to: '/search?budget=5000', label: 'Budget Under ₹5,000' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-gray-400 hover:text-indigo-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">University & Support</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-gray-400">
                <MapPin size={15} className="mt-0.5 text-indigo-400 shrink-0" />
                <span>Dev Bhoomi Uttarakhand University,<br />Manduwala, Dehradun,<br />Uttarakhand — 248007</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400">
                <Mail size={15} className="text-indigo-400 shrink-0" />
                <a href="mailto:dbuu.rituraj@gmail.com" className="hover:text-indigo-400 transition-colors">
                  dbuu.rituraj@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400">
                <Phone size={15} className="text-indigo-400 shrink-0" />
                <a href="tel:+918271745566" className="hover:text-indigo-400 transition-colors">
                  +91 8271745566
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400">
                <Phone size={15} className="text-indigo-400 shrink-0" />
                <a href="tel:+919123723276" className="hover:text-indigo-400 transition-colors">
                  +91 9123723276
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} UNI stay DBUU. Built for DBUU students.
          </p>
          <div className="flex gap-5 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
