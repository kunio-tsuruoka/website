import type { ReactNode } from 'react';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="block text-xs font-semibold text-gray-600 mb-1">{label}</span>
      {children}
    </div>
  );
}
