import { useState, useRef, useEffect } from "react";

interface Country {
  name: string;
  flag: string;
  code: string; // e.g. +250
  id: string;   // e.g. RW
}

interface CountrySelectorProps {
  countries: Country[];
  selectedCode: string;
  onSelect: (prefix: string, isoCode: string) => void;
  loading?: boolean;
}

export function CountrySelector({ countries, selectedCode, onSelect, loading }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.includes(search)
  );

  const selectedCountry = countries.find(c => c.code === selectedCode) || countries[0];

  const handleSelect = (c: Country) => {
    onSelect(c.code, c.id);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="country-selector" ref={dropdownRef}>
      <div className="country-selector-trigger" onClick={() => setIsOpen(!isOpen)}>
        {selectedCountry && (
          <>
            <img src={selectedCountry.flag} alt={selectedCountry.name} className="country-flag-small" />
            <span className="country-code-text">{selectedCountry.code}</span>
          </>
        )}
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', opacity: 0.5 }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {isOpen && (
        <div className="country-dropdown card shadow-lg">
          <div className="country-search-box">
            <input 
              type="text" 
              className="country-search-input" 
              placeholder="Search country..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="country-list scrollbar-hide">
            {loading ? (
              <div className="p-12 text-center text-muted">Loading...</div>
            ) : filteredCountries.length > 0 ? (
              filteredCountries.map((c) => (
                <div 
                  key={c.id} 
                  className={`country-item ${c.code === selectedCode ? 'selected' : ''}`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleSelect(c);
                  }}
                >
                  <img src={c.flag} alt={c.name} className="country-flag-small" />
                  <span className="country-name-list">{c.name}</span>
                  <span className="country-code-list">{c.code}</span>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
