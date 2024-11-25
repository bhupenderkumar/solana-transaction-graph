import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { TransactionGraph } from "@/components/TransactionGraph";
import { TransactionTable } from "@/components/TransactionTable";
import { TransactionTracker } from "@/components/TransactionTracker";
import { AccountMetadata } from "@/components/AccountMetadata"; // Import the new AccountMetadata component
import { getTransactionHistory, processTransactionsForGraph, getAccountInfo } from "@/lib/solana";
import { toast } from "sonner";

const Index = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [currentKey, setCurrentKey] = useState<string>("");
  const [accountInfo, setAccountInfo] = useState<any | null>(null); // State for account info

  const fetchTransactions = async (publicKey: string) => {
    try {
      setLoading(true);
      toast.info("Fetching transactions...");
      const txHistory = await getTransactionHistory(publicKey);
      const info = await getAccountInfo(publicKey); // Fetch account info

      if (txHistory.length === 0) {
        toast.warning("No transactions found for this address");
        return;
      }

      setTransactions(txHistory);
      setGraphData(processTransactionsForGraph(txHistory));
      setAccountInfo(info); // Set account info
      setCurrentKey(publicKey);
      toast.success(`Found ${txHistory.length} transactions`);
    } catch (error) {
      toast.error("Failed to fetch transactions. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    if (recentSearches.length > 0) {
      fetchTransactions(recentSearches[0]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#2C1A2C] to-[#1A1F2C]">
      <div className="container mx-auto py-12 px-4 space-y-8">
        <div className="text-center space-y-8 mb-16">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-solana-purple/30 to-solana-teal/30 -z-10"></div>
            <h1 className="text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-solana-purple to-solana-teal animate-glow inline-block">
              Solana Explorer
            </h1>
          </div>
          <p className="text-xl text-gray-300/90 max-w-2xl mx-auto leading-relaxed">
            Explore and visualize transaction history on the Solana blockchain with real-time updates 
            and detailed analytics
          </p>
          <div className="flex gap-4 justify-center items-center text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-solana-purple animate-pulse"></div>
              Real-time Updates
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-solana-teal animate-pulse"></div>
              Transaction Visualization
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-16">
          <SearchBar onSearch={fetchTransactions} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-solana-purple animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-4 h-4 rounded-full bg-solana-purple animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-4 h-4 rounded-full bg-solana-purple animate-bounce"></div>
          </div>
        ) : (
          <>
            {currentKey && (
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-8">
                  <TransactionTracker publicKey={currentKey} />
                  <AccountMetadata 
                    accountInfo={accountInfo} 
                    loading={loading} 
                  />
                </div>
                <div className="lg:col-span-2">
                  <div className="glass p-6 h-full">
                    {graphData.nodes.length > 0 ? (
                      <TransactionGraph
                        data={graphData}
                        onNodeClick={(nodeId) => fetchTransactions(nodeId)}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No transaction data to visualize
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {transactions.length > 0 && (
              <div className="mt-8">
                <TransactionTable transactions={transactions} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
