import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search"
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphit" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="py-3 pl-9 pr-2.5 rounded-[5px] text-sm outline-none shadow-md transition-colors w-full cursor-text bg-primary-foreground border border-border text-graphit placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}
