import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { TransactionGraph } from "@/components/TransactionGraph";
import { TransactionTable } from "@/components/TransactionTable";
import { TransactionTracker } from "@/components/TransactionTracker";
import { getTransactionHistory, processTransactionsForGraph, getAccountInfo, getRecentNetworkTransactions } from "@/lib/solana";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

const Index = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [currentKey, setCurrentKey] = useState<string>("");
  const [accountInfo, setAccountInfo] = useState<any | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

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

  const fetchRecentTransactions = async () => {
    try {
      const recent = await getRecentNetworkTransactions(5);
      setRecentTransactions(recent);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
    }
  };

  useEffect(() => {
    const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    if (recentSearches.length > 0) {
      fetchTransactions(recentSearches[0]);
    }
    
    // Fetch recent transactions initially and every 30 seconds
    fetchRecentTransactions();
    const interval = setInterval(fetchRecentTransactions, 30000);
    return () => clearInterval(interval);
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
          
          {/* Recent Network Transactions */}
          <Card className="max-w-2xl mx-auto backdrop-blur-lg bg-background/50 border-solana-purple/20">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-foreground">Recent Network Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.signature}
                    className="flex justify-between items-center p-2 rounded bg-muted/50 hover:bg-muted transition-colors duration-200"
                  >
                    <span className="font-mono text-sm text-muted-foreground">
                      {tx.signature.slice(0, 8)}...
                    </span>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        tx.status === "Success" 
                          ? "bg-green-500/20 text-green-300" 
                          : "bg-red-500/20 text-red-300"
                      }`}>
                        {tx.status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(tx.timestamp, "HH:mm:ss")}
                      </span>
                    </div>
                  </div>
                ))}
                {recentTransactions.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    Loading recent transactions...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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