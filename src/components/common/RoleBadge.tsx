import React from 'react';

interface RoleBadgeProps {
  role: string;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const colors: Record<string, string> = {
    student: 'bg-blue-100 text-blue-800 border-blue-200',
    expert: 'bg-purple-100 text-purple-800 border-purple-200',
    moderator: 'bg-green-100 text-green-800 border-green-200',
    admin: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[role] || 'bg-gray-100 text-gray-800'}`}>
      {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown'}
    </span>
  );
};

export default RoleBadge;