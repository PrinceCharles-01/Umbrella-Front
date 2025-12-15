import { Search, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onLocationRequest: () => void;
}

const SearchBar = ({ onSearch, onLocationRequest }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleClear = () => {
    setQuery("");
    onSearch(""); // Also clear the search results in the parent component
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-card rounded-2xl p-6 apple-hover">
          <div className="flex items-center gap-4">
            <Search className="h-6 w-6 text-muted-foreground" />
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Rechercher un médicament..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 pr-10"
              />
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full apple-press"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onLocationRequest}
              className="apple-press text-secondary hover:bg-secondary/10"
            >
              <MapPin className="h-5 w-5" />
            </Button>
          </div>
          
          {query && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <Button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground apple-press"
              >
                Rechercher dans les pharmacies
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchBar;