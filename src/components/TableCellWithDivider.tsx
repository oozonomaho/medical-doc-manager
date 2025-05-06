// components/TableCellWithDivider.tsx

import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const TableCellWithDivider: React.FC<Props> = ({ children, className = '' }) => {
  return (
    <td className={`px-3 py-2 relative ${className}`}>
      <div className="flex items-center h-full min-h-[40px] relative">
        {children}
        <div className="absolute right-0 top-2 bottom-2 w-px bg-gray-300" />
      </div>
    </td>
  );
};

export default TableCellWithDivider;
