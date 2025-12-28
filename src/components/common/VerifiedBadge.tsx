import React from 'react';
import { CheckCircle } from 'lucide-react';

interface VerifiedBadgeProps {
  status: string;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ status }) => {
  if (status !== 'verified') return null;
  return (
    <div className="flex items-center text-green-600 ml-1" title="Verified Expert">
      <CheckCircle size={16} fill="currentColor" className="text-white bg-green-600 rounded-full" />
    </div>
  );
};

export default VerifiedBadge;