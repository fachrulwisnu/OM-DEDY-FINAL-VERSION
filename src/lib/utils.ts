import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calculateTimeliness = (endDate: string | Date | null | undefined, realizedDate: string | Date | null | undefined, status: string | null | undefined) => {
  if (!endDate) return { state: 'UNKNOWN', label: '-', color: 'bg-gray-500', text: '-', textColor: 'text-gray-400' };

  const end = new Date(endDate);
  if (isNaN(end.getTime())) return { state: 'UNKNOWN', label: 'Invalid Date', color: 'bg-gray-500', text: '-', textColor: 'text-gray-400' };

  // NEW BUSINESS RULE: If status is TODO, immediately return ON_TIME
  if (status && status.toString().toUpperCase() === 'TODO') {
    return { 
      state: 'ON_TIME', 
      label: 'Tepat Waktu', 
      color: 'bg-blue-500', 
      text: '0 Days (TODO)',
      textColor: 'text-blue-400'
    };
  }

  const actual = realizedDate ? new Date(realizedDate) : new Date();

  // Set both times to capture full day context if needed, but here we follow user's specific logic update
  end.setHours(23, 59, 59, 0);
  if (!realizedDate) actual.setHours(0, 0, 0, 0);

  const diffMs = actual.getTime() - end.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainHours = Math.abs(diffHours % 24);

  const diffText = `${Math.abs(diffDays)} Days, ${remainHours} Hours`;
  const isCompleted = status === 'DONE' || status === 'LIVE' || status === 'COMPLETED' || !!realizedDate;

  if (diffMs > 0) {
    return { state: 'LATE', label: 'Terlambat', color: 'bg-red-500', text: diffText, textColor: 'text-red-400' };
  } else if (diffMs < 0 && isCompleted) {
    return { state: 'FASTER', label: 'Lebih Cepat', color: 'bg-emerald-500', text: diffText, textColor: 'text-emerald-400' };
  } else {
    return { state: 'ON_TIME', label: 'Tepat Waktu', color: 'bg-blue-500', text: '0 Days', textColor: 'text-blue-400' };
  }
};
