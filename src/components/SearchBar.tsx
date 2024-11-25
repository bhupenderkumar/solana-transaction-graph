import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { PublicKey } from "@solana/web3.js";

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
    <div className="flex w-full max-w-2xl gap-2 px-4 glass p-2">
      <Input
        placeholder="Enter Solana public key"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="bg-white/5 backdrop-blur-lg border-purple-500/20"
      />
      <Button 
        onClick={handleSearch}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300"
      >
        Search
      </Button>
    </div>
  );
};