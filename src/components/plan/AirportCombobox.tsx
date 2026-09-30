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
    <div style={{ position: 'relative' }}>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Where are you flying from?"
        style={{ width: '100%', padding: 8 }}
      />
      {open && results.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            background: 'white',
            border: '1px solid #ccc',
            width: '100%',
            listStyle: 'none',
            margin: 0,
            padding: 4,
            zIndex: 10,
          }}
        >
          {results.map((a) => (
            <li
              key={a.code}
              style={{ padding: 6, cursor: 'pointer' }}
              onClick={() => {
                onChange({ code: a.code, city: a.city });
                setQuery(`${a.city} (${a.code})`);
                setOpen(false);
              }}
            >
              {a.city} ({a.code}) — {a.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
