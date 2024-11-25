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
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#2C1A2C] to-[#1A1F2C]">
      <div className="container mx-auto py-12 px-4 space-y-8">
        <div className="text-center space-y-6 mb-16 animate-float">
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-solana-purple to-solana-teal animate-glow">
            Solana Explorer
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore and visualize transaction history on the Solana blockchain with real-time updates and detailed analytics
          </p>
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