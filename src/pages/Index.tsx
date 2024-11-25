import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { TransactionGraph } from "@/components/TransactionGraph";
import { TransactionTable } from "@/components/TransactionTable";
import { TransactionTracker } from "@/components/TransactionTracker";
import { getTransactionHistory, processTransactionsForGraph } from "@/lib/solana";
import { toast } from "sonner";

const Index = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [currentKey, setCurrentKey] = useState<string>("");

  const fetchTransactions = async (publicKey: string) => {
    try {
      setLoading(true);
      toast.info("Fetching transactions...");
      const txHistory = await getTransactionHistory(publicKey);
      
      if (txHistory.length === 0) {
        toast.warning("No transactions found for this address");
        return;
      }
      
      setTransactions(txHistory);
      setGraphData(processTransactionsForGraph(txHistory));
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
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#6E59A5]">
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-white animate-fade-in">
            Solana Transaction Explorer
          </h1>
          <p className="text-gray-300 animate-fade-in">
            Visualize transaction history and relationships between Solana addresses
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <SearchBar onSearch={fetchTransactions} />
        </div>

        {loading ? (
          <div className="text-center text-white animate-pulse">Loading transactions...</div>
        ) : (
          <>
            {currentKey && (
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <TransactionTracker publicKey={currentKey} />
                </div>
                <div className="lg:col-span-2">
                  {graphData.nodes.length > 0 && (
                    <TransactionGraph
                      data={graphData}
                      onNodeClick={(nodeId) => fetchTransactions(nodeId)}
                    />
                  )}
                </div>
              </div>
            )}
            
            {transactions.length > 0 && (
              <div className="mt-8 animate-fade-in">
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