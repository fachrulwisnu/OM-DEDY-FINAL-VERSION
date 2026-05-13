import React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CustomDatePickerProps {
  selectedDate: string | null;
  onChange: (date: string | null) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ 
  selectedDate, 
  onChange, 
  className,
  placeholder,
  minDate,
  maxDate,
  disabled = false
}) => {
  // Extract YYYY-MM-DD from ISO string if needed
  const dateValue = selectedDate ? selectedDate.substring(0, 10) : '';

  return (
    <div className={cn("relative w-full group min-h-[42px] bg-[var(--bg-page)] rounded-xl border border-[var(--border)] focus-within:border-[var(--accent)] transition-all overflow-hidden shadow-sm", disabled && "opacity-50 cursor-not-allowed")}>
      <input
        type="date"
        value={dateValue}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
        placeholder={placeholder}
        min={minDate ? minDate.toISOString().split('T')[0] : undefined}
        max={maxDate ? maxDate.toISOString().split('T')[0] : undefined}
        className={cn(`
          absolute inset-0 w-full h-full px-3 py-2.5 bg-transparent text-[var(--text-main)] text-sm font-medium outline-none cursor-pointer z-10
          /* STRETCH THE NATIVE BUTTON TO COVER THE WHOLE INPUT */
          [&::-webkit-calendar-picker-indicator]:absolute 
          [&::-webkit-calendar-picker-indicator]:top-0 
          [&::-webkit-calendar-picker-indicator]:left-0 
          [&::-webkit-calendar-picker-indicator]:w-full 
          [&::-webkit-calendar-picker-indicator]:h-full 
          [&::-webkit-calendar-picker-indicator]:opacity-0 
          [&::-webkit-calendar-picker-indicator]:cursor-pointer
          [&::-webkit-calendar-picker-indicator]:z-20
        `, className)}
      />
      {/* CUSTOM ICON MUST HAVE pointer-events-none AND LOWER Z-INDEX */}
      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--accent)] w-4 h-4 pointer-events-none z-0 group-hover:opacity-100 opacity-60 transition-colors" />
    </div>
  );
};
