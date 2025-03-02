import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-2 shadow-md border rounded">
      <p className="font-bold">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm">
          {`${entry.name}: ${entry.value}`}
        </p>
      ))}
    </div>
  );
};

export default CustomTooltip;
