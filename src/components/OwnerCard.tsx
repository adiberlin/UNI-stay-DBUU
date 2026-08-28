// ============================================================
// OwnerCard — Property owner/manager card
// ============================================================

import { useState } from 'react';
import { Phone, MessageCircle, Star, ShieldCheck } from 'lucide-react';
import type { PropertyOwner } from '../types/property';
import { Modal } from './Modal';

interface OwnerCardProps {
  owner: PropertyOwner;
  propertyTitle: string;
  onEnquiry?: (message: string) => void;
}

export function OwnerCard({ owner, propertyTitle, onEnquiry }: OwnerCardProps) {
  const [contactOpen, setContactOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [message, setMessage] = useState(
    `Hi, I am interested in "${propertyTitle}". Could you please provide more details?`
  );

  const handleSendEnquiry = () => {
    onEnquiry?.(message);
    setEnquiryOpen(false);
    setMessage(`Hi, I am interested in "${propertyTitle}". Could you please provide more details?`);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Listed by</h3>

        <div className="flex items-center gap-4 mb-5">
          <img
            src={owner.avatar}
            alt={owner.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(owner.name)}&background=4f46e5&color=fff`; }}
          />
          <div>
            <p className="font-bold text-gray-900">{owner.name}</p>
            <p className="text-sm text-gray-500 mb-1">Property Manager</p>
            <div className="flex items-center gap-3 text-xs">
              {owner.rating && (
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Star size={12} fill="currentColor" />
                  {owner.rating} rating
                </span>
              )}
              {owner.memberSince && (
                <span className="text-gray-400">Member since {owner.memberSince}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5 p-2.5 bg-green-50 rounded-xl border border-green-100">
          <ShieldCheck size={16} className="text-green-600" />
          <span className="text-xs text-green-700 font-medium">ID Verified Owner</span>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => setContactOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-95 text-sm"
          >
            <Phone size={16} />
            Contact Owner
          </button>
          <button
            onClick={() => setEnquiryOpen(true)}
            className="w-full flex items-center justify-center gap-2 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold py-2.5 rounded-xl transition-all active:scale-95 text-sm"
          >
            <MessageCircle size={16} />
            Send Enquiry
          </button>
        </div>
      </div>

      {/* Contact Modal */}
      <Modal isOpen={contactOpen} onClose={() => setContactOpen(false)} title="Contact Owner & Support">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <Phone size={28} className="text-indigo-600" />
          </div>
          <p className="text-gray-600 text-sm mb-2">
            You can reach <strong>{owner.name}</strong> directly at:
          </p>
          <a
            href={`tel:+91${owner.phone || '8271745566'}`}
            className="block text-2xl font-bold text-indigo-700 hover:text-indigo-900 transition-colors mb-4"
          >
            📞 +91 {owner.phone || '8271745566'}
          </a>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left my-4 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">DBUU Student Helplines</p>
            <div className="flex flex-col gap-1.5 text-sm">
              <a href="tel:+918271745566" className="font-semibold text-gray-800 hover:text-indigo-600 flex items-center gap-2">
                <span>📱</span> +91 8271745566
              </a>
              <a href="tel:+919123723276" className="font-semibold text-gray-800 hover:text-indigo-600 flex items-center gap-2">
                <span>📱</span> +91 9123723276
              </a>
              <a href="mailto:dbuu.rituraj@gmail.com" className="text-xs font-medium text-indigo-600 hover:underline flex items-center gap-2 pt-1 border-t border-gray-200">
                <span>✉️</span> dbuu.rituraj@gmail.com
              </a>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-2">Calling hours: 9 AM – 8 PM</p>
          <button
            onClick={() => setContactOpen(false)}
            className="mt-5 btn-primary w-full"
          >
            Done
          </button>
        </div>
      </Modal>

      {/* Enquiry Modal */}
      <Modal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} title="Send Enquiry">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Your enquiry will be sent to <strong>{owner.name}</strong> for <strong>{propertyTitle}</strong>.
          </p>
          <div>
            <label htmlFor="enquiry-msg" className="block text-sm font-medium text-gray-700 mb-1.5">
              Your Message
            </label>
            <textarea
              id="enquiry-msg"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              rows={4}
            />
          </div>
          <button
            onClick={handleSendEnquiry}
            disabled={!message.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Enquiry
          </button>
        </div>
      </Modal>
    </>
  );
}
