// ============================================================
// AmenityItem — Icon + label chip for amenities
// ============================================================

import {
  Wifi, Utensils, Car, Zap, Shield, Droplets,
  Wind, BookOpen, Bath, Landmark, WashingMachine, Trees
} from 'lucide-react';

const amenityIcons: Record<string, React.ReactNode> = {
  'Wi-Fi': <Wifi size={16} />,
  'Food/Mess': <Utensils size={16} />,
  'Parking': <Car size={16} />,
  'Power Backup': <Zap size={16} />,
  'CCTV': <Shield size={16} />,
  'Hot Water': <Droplets size={16} />,
  'AC': <Wind size={16} />,
  'Study Table': <BookOpen size={16} />,
  'Attached Bathroom': <Bath size={16} />,
  'Balcony': <Trees size={16} />,
  'Laundry': <WashingMachine size={16} />,
  'Security': <Shield size={16} />,
  'Gym': <Landmark size={16} />,
};

interface AmenityItemProps {
  name: string;
  variant?: 'chip' | 'icon-grid';
}

export function AmenityItem({ name, variant = 'chip' }: AmenityItemProps) {
  const icon = amenityIcons[name] ?? <Landmark size={16} />;

  if (variant === 'icon-grid') {
    return (
      <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl text-center hover:bg-indigo-50 transition-colors group">
        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors shadow-sm">
          {icon}
        </div>
        <span className="text-xs font-medium text-gray-700 leading-tight">{name}</span>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
      <span className="text-indigo-500">{icon}</span>
      {name}
    </span>
  );
}

export { amenityIcons };
