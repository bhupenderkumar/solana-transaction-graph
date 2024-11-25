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
      const txHistory = await getTransactionHistory(publicKey);
      setTransactions(txHistory);
      setGraphData(processTransactionsForGraph(txHistory));
      setCurrentKey(publicKey);
    } catch (error) {
      toast.error("Failed to fetch transactions");
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
    <div className="min-h-screen bg-gradient-to-br from-black to-purple-900">
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
          <div className="text-center text-white">Loading transactions...</div>
        ) : (
          <>
            {currentKey && <TransactionTracker publicKey={currentKey} />}
            
            {graphData.nodes.length > 0 && (
              <TransactionGraph
                data={graphData}
                onNodeClick={(nodeId) => fetchTransactions(nodeId)}
              />
            )}

            {transactions.length > 0 && (
              <TransactionTable transactions={transactions} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;