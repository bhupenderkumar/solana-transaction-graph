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
      new PublicKey(input); // Validate public key format
      onSearch(input);
      // Save to local storage
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
    <div className="flex w-full max-w-2xl gap-2 px-4 animate-fade-in">
      <Input
        placeholder="Enter Solana public key"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="bg-white/5 backdrop-blur-lg border-solana-purple/20"
      />
      <Button 
        onClick={handleSearch}
        className="bg-solana-purple hover:bg-solana-purple/90 text-white"
      >
        Search
      </Button>
    </div>
  );
};