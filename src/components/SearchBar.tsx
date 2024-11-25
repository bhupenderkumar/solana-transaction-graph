import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { PublicKey } from "@solana/web3.js";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { setNetwork } from "@/lib/solana";

interface SearchBarProps {
  onSearch: (publicKey: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [input, setInput] = useState("");
  const [network, setNetworkValue] = useState("testnet");

  const handleSearch = () => {
    try {
      new PublicKey(input);
      setNetwork(network as "mainnet" | "testnet");
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
    <div className="flex flex-col w-full max-w-2xl gap-4">
      <div className="flex gap-2">
        <Select
          value={network}
          onValueChange={(value) => {
            setNetworkValue(value);
            setNetwork(value as "mainnet" | "testnet");
          }}
        >
          <SelectTrigger className="w-[180px] bg-background border-border focus:ring-2 focus:ring-solana-purple/50">
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mainnet">Mainnet</SelectItem>
            <SelectItem value="testnet">Testnet</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-1 gap-2 glass p-3">
          <Input
            placeholder="Enter Solana public key"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-background border-border focus:ring-2 focus:ring-solana-purple/50"
          />
          <Button 
            onClick={handleSearch}
            className="bg-gradient-to-r from-solana-purple to-solana-teal hover:opacity-90 transition-all duration-300"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
      <div className="text-center text-sm text-muted-foreground">
        Try searching for: Cwg1f6m4m3DGwMEbmsbAfDtUToUf5jRdKrJSGD7GfZCB (Testnet)
      </div>
    </div>
  );
};