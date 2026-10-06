'use client';

import { useState, useEffect, useRef } from 'react';

interface Airport {
  code: string;
  city: string;
  country: string;
  name: string;
}

export default function AirportCombobox({
  value,
  onChange,
}: {
  value: { code: string; city: string } | null;
  onChange: (v: { code: string; city: string }) => void;
}) {
  const [query, setQuery] = useState(
    value ? `${value.city} (${value.code})` : '',
  );
  const [results, setResults] = useState<Airport[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(
        `/api/locations?keyword=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      setResults(data.results ?? []);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="relative">
      <label className="flex flex-col gap-1 text-sm text-ink/70">
        Where are you flying from?
        <input
          className="input-field"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="City or airport"
        />
      </label>
      {open && results.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-paper border border-ink/15 rounded-md overflow-hidden">
          {results.map((a) => (
            <li
              key={a.code}
              className="px-3 py-2 cursor-pointer hover:bg-ink/5 text-sm"
              onClick={() => {
                onChange({ code: a.code, city: a.city });
                setQuery(`${a.city} (${a.code})`);
                setOpen(false);
              }}
            >
              <span className="text-ink">
                {a.city} ({a.code})
              </span>
              <span className="text-ink/50"> — {a.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
