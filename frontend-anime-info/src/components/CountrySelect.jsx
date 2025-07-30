import { useState, useMemo } from 'react';
import countryList from 'react-select-country-list';

const CountrySelect = ({ value, onChange, error, placeholder = "Select your country", ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = useMemo(() => countryList().getData(), []);

  const selectedCountry = options.find(option => option.value === value);

  const handleSelect = (country) => {
    onChange(country.value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 cursor-pointer flex items-center justify-between ${
          error
            ? "border-red-400/60 focus:ring-red-400/50"
            : "border-slate-500/30 focus:ring-slate-400/50"
        }`}
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.25)",
          border: error
            ? "2px solid rgba(248, 113, 113, 0.6)"
            : "2px solid rgba(100, 116, 139, 0.3)",
        }}
        {...props}
      >
        <span className={selectedCountry ? "text-white" : "text-slate-400"}>
          {selectedCountry ? selectedCountry.label : placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 rounded-lg border shadow-lg max-h-60 overflow-y-auto"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.95)",
            border: "1px solid rgba(100, 116, 139, 0.3)",
            backdropFilter: "blur(10px)",
          }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option)}
              className="px-4 py-2 cursor-pointer hover:bg-slate-600/50 text-white transition-colors duration-150"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CountrySelect;