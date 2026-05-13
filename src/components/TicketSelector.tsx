import React, { useState, useEffect, useRef } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { Search, Plus, Check, AlertCircle } from 'lucide-react';
import { MasterProject } from '../types';
import { taskService } from '../services/taskService';
import { cn } from '../lib/utils';

interface TicketSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onSelectMaster: (master: MasterProject) => void;
  className?: string;
}

export function TicketSelector({ value, onChange, onSelectMaster, className }: TicketSelectorProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<MasterProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExactMatch, setIsExactMatch] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const fetchSuggestions = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      setIsExactMatch(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await taskService.searchMasterProjects(searchTerm);
      setSuggestions(results);
      
      // Check if there's an exact match
      const exact = results.find(
        p => p.ticket_id.toLowerCase() === searchTerm.toLowerCase()
      );
      setIsExactMatch(!!exact);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value;
    setQuery(newVal);
    onChange(newVal);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newVal);
    }, 300);
  };

  const handleSelect = (master: MasterProject | string) => {
    if (typeof master === 'string') {
      onChange(master);
      setQuery(master);
    } else {
      onSelectMaster(master);
      setQuery(master.ticket_id);
      setIsExactMatch(true);
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Combobox value={query} onChange={handleSelect}>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <Search className="w-4 h-4 text-[var(--text-sub)]" />
          </div>
          
          <Combobox.Input
            className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl pl-10 pr-24 py-3 text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-colors font-mono uppercase text-sm"
            onChange={handleInputChange}
            displayValue={(val: string) => val}
            placeholder="Search or Enter Ticket ID..."
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isLoading && (
              <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            )}
            {query.length >= 2 && !isLoading && !isExactMatch && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">Tiket Baru</span>
              </div>
            )}
            {isExactMatch && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Terdaftar</span>
              </div>
            )}
          </div>
        </div>

        <Transition
          as={React.Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => {}}
        >
          <Combobox.Options className="absolute z-[200] mt-2 max-h-60 w-full overflow-auto rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-1 shadow-2xl focus:outline-none">
            {suggestions.length === 0 && query !== '' && !isLoading ? (
              <div className="relative cursor-default select-none py-4 px-4 text-[var(--text-sub)] text-center">
                <p className="text-xs font-bold uppercase tracking-widest mb-1">Tidak ada hasil</p>
                <p className="text-[10px] text-[var(--text-sub)]/60">Gunakan tiket baru: <span className="text-[var(--accent)] font-mono italic">"{query}"</span></p>
              </div>
            ) : (
              suggestions.map((master) => (
                <Combobox.Option
                  key={master.id}
                  className={({ active }) =>
                    cn(
                      "relative cursor-pointer select-none rounded-lg p-3 transition-colors",
                      active ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30" : "border border-transparent"
                    )
                  }
                  value={master}
                >
                  {({ selected, active }) => (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-[10px] font-black font-mono tracking-widest uppercase", active ? "text-[var(--accent)]" : "text-[var(--text-sub)]")}>
                          {master.ticket_id}
                        </span>
                        {selected && (
                          <Check className="w-3 h-3 text-emerald-500" />
                        )}
                      </div>
                      <span className={cn("text-xs font-bold truncate", active ? "text-[var(--text-main)]" : "text-[var(--text-main)]/80")}>
                        {master.project_name}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] text-[var(--text-sub)] uppercase font-black">{master.owner_name}</span>
                        <span className="text-[8px] text-[var(--text-sub)]/30">•</span>
                        <span className="text-[8px] text-[var(--text-sub)] uppercase font-black italic">{master.pic_name}</span>
                      </div>
                    </div>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </Combobox>
    </div>
  );
}
