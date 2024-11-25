import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { TransactionGraph } from "@/components/TransactionGraph";
import { TransactionTable } from "@/components/TransactionTable";
import { TransactionTracker } from "@/components/TransactionTracker";
import { AccountMetadata } from "@/components/AccountMetadata";
import { getTransactionHistory, processTransactionsForGraph, getAccountInfo } from "@/lib/solana";
import { toast } from "sonner";

const Index = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [currentKey, setCurrentKey] = useState<string>("");
  const [accountInfo, setAccountInfo] = useState<any | null>(null);

  const fetchTransactions = async (publicKey: string) => {
    try {
      setLoading(true);
      toast.info("Fetching transactions...");
      const txHistory = await getTransactionHistory(publicKey);
      const info = await getAccountInfo(publicKey);

      if (txHistory.length === 0) {
        toast.warning("No transactions found for this address");
        return;
      }

      setTransactions(txHistory);
      setGraphData(processTransactionsForGraph(txHistory));
      setAccountInfo(info);
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
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto py-6 md:py-12 px-4 space-y-6 md:space-y-8">
        <div className="text-center space-y-4 md:space-y-8 mb-8 md:mb-16">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-solana-purple/30 to-solana-teal/30 -z-10"></div>
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-solana-purple to-solana-teal animate-glow inline-block">
              Solana Explorer
            </h1>
          </div>
          <p className="text-lg md:text-xl text-foreground/90 max-w-2xl mx-auto leading-relaxed px-4">
            Explore and visualize transaction history on the Solana blockchain with real-time updates 
            and detailed analytics
          </p>
          <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-muted-foreground">
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

        <div className="flex justify-center mb-8 md:mb-16 px-4">
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
              <div className="grid gap-6 md:gap-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-6">
                    <TransactionTracker publicKey={currentKey} />
                    <AccountMetadata 
                      accountInfo={accountInfo} 
                      loading={loading} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="glass p-4 md:p-6 h-full">
                      {graphData.nodes.length > 0 ? (
                        <TransactionGraph
                          data={graphData}
                          onNodeClick={(nodeId) => fetchTransactions(nodeId)}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No transaction data to visualize
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {transactions.length > 0 && (
              <div className="mt-6 md:mt-8 overflow-x-auto">
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