import React from 'react';

interface ServiceBadgeProps {
  service: string;
}

export const ServiceBadge: React.FC<ServiceBadgeProps> = ({ service }) => {
  if (!service || service.trim() === '') {
    return <span className="h-5.5 w-12 block" />;
  }

  const s = service.trim().toUpperCase();

  // Color mappings based on the original OPAU board
  if (s === 'OPS') {
    return (
      <span className="inline-flex items-center justify-center px-3 py-0.5 text-xs font-bold text-white bg-[#741671] tracking-wider rounded-[2px] shadow-xs">
        OPS
      </span>
    );
  }

  if (s === 'EACM') {
    return (
      <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold text-[#321221] bg-[#dfa4c5] tracking-wider rounded-[2px]">
        EACM
      </span>
    );
  }

  if (s === 'T.B.T.' || s === 'TBT') {
    return (
      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 tracking-wider rounded-[2px]">
        T.B.T.
      </span>
    );
  }

  if (s === 'CARD') {
    return (
      <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold text-slate-900 bg-[#fff024] tracking-wider rounded-[2px]">
        CARD
      </span>
    );
  }

  if (s === 'GMG') {
    return (
      <span className="inline-flex items-center justify-center px-3 py-0.5 text-xs font-bold text-white bg-[#1044cc] tracking-wider rounded-[2px]">
        GMG
      </span>
    );
  }

  // Fallback for custom specialty services added in simulation
  return (
    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-purple-900 bg-purple-100 border border-purple-300 tracking-wider rounded-[2px]">
      {service}
    </span>
  );
};

interface DestinationBadgeProps {
  destination: string;
}

export const DestinationBadge: React.FC<DestinationBadgeProps> = ({ destination }) => {
  if (!destination || destination === '-' || destination.trim() === '') {
    return <span className="text-slate-400 font-mono text-sm">-</span>;
  }

  const d = destination.trim().toUpperCase();

  // Dark slate/charcoal block as seen in original board for DIS, RBOPS1, RBOPS4
  return (
    <span className="inline-block bg-[#3c4149] text-white px-2 py-0.5 text-[11px] font-bold tracking-tight rounded-[2px]">
      {d}
    </span>
  );
};
