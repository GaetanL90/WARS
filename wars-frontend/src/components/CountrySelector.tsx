import { useState, useRef, useEffect } from "react";

interface CountryData {
  code: string;
  cca2: string;
  name: string;
}

interface CountrySelectorProps {
  countries: CountryData[];
  selectedCode: string;
  onSelect: (code: string) => void;
  loading?: boolean;
}

export function CountrySelector({ countries, selectedCode, onSelect, loading }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = countries.find(c => c.code === selectedCode) || countries.find(c => c.cca2 === "RW");

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.includes(searchTerm) ||
    c.cca2.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selection with immediate closure
  const handleSelect = (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(code);
    setIsOpen(false);
    setSearchTerm("");
  };

  if (loading && countries.length === 0) {
    return (
      <div className="country-selector">
        <div className="country-selector-trigger loading-skeleton" style={{ width: '100px' }}></div>
      </div>
    );
  }

  return (
    <div className="country-selector" ref={dropdownRef}>
      <button 
        type="button" 
        className="country-selector-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedCountry && (
          <img 
            src={`https://flagcdn.com/w40/${selectedCountry.cca2.toLowerCase()}.png`} 
            alt={selectedCountry.cca2} 
            className="country-flag-img"
          />
        )}
        <span className="selected-code-text">{selectedCode}</span>
        <svg className={`chevron-icon ${isOpen ? 'open' : ''}`} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="country-dropdown">
          <div className="country-search-wrapper" onClick={(e) => e.stopPropagation()}>
            <input 
              type="text" 
              className="country-search-input" 
              placeholder="Search country..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <ul className="country-list" role="listbox">
            {filteredCountries.map((c) => (
              <li 
                key={`${c.cca2}-${c.code}`} 
                role="option"
                aria-selected={selectedCode === c.code}
                className={`country-item ${selectedCode === c.code ? 'active' : ''}`}
                onMouseDown={(e) => handleSelect(c.code, e)}
              >
                <img 
                  src={`https://flagcdn.com/w40/${c.cca2.toLowerCase()}.png`} 
                  alt={c.cca2} 
                  className="country-flag-img"
                />
                <span className="country-name">{c.name}</span>
                <span className="country-code-val">{c.code}</span>
              </li>
            ))}
            {filteredCountries.length === 0 && (
              <li className="country-item no-results">No countries found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
