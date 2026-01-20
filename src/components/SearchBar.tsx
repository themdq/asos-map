import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  darkMode?: boolean;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  darkMode = false,
  placeholder = "Search"
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          py-3 pl-9 pr-2.5 rounded-[5px] text-sm outline-none shadow-md
          transition-colors w-full cursor-text
          ${darkMode
            ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
            : 'bg-primary border-gray-300 text-gray-800 placeholder:text-gray-500'
          }
          border focus:ring-2 focus:ring-blue-500
        `}
      />
    </div>
  );
}
