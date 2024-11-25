import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { PublicKey } from "@solana/web3.js";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (publicKey: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [input, setInput] = useState("");

  const handleSearch = () => {
    try {
      new PublicKey(input);
      onSearch(input);
      const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
      if (!recentSearches.includes(input)) {
        localStorage.setItem(
          "recentSearches",
          JSON.stringify([input, ...recentSearches].slice(0, 5))
        );
      }
    } catch (error) {
      toast.error("Invalid Solana public key");
    }
  };

  return (
    <div className="flex w-full max-w-2xl gap-2 glass p-3">
      <Input
        placeholder="Enter Solana public key"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="bg-white/5 border-none focus:ring-2 focus:ring-solana-purple/50"
      />
      <Button 
        onClick={handleSearch}
        className="bg-gradient-to-r from-solana-purple to-solana-teal hover:opacity-90 transition-all duration-300"
      >
        <Search className="w-4 h-4 mr-2" />
        Search
      </Button>
    </div>
  );
};