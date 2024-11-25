import { useState, useEffect, useCallback } from "react";
import { SearchBar } from "@/components/SearchBar";
import { TransactionGraph } from "@/components/TransactionGraph";
import { TransactionTable } from "@/components/TransactionTable";
import { TransactionTracker } from "@/components/TransactionTracker";
import { getTransactionHistory, processTransactionsForGraph, getAccountInfo, getRecentNetworkTransactions } from "@/lib/solana";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Transaction {
  signature: string;
  timestamp: number;
  from: string;
  to: string;
  amount?: number;
  type: string;
}

interface AccountInfo {
  balance: number;
  executable: boolean;
  owner: string;
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [currentKey, setCurrentKey] = useState<string>("");
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (publicKey: string) => {
    try {
      setLoading(true);
      setError(null);
      toast.info("Fetching transactions...");
      
      const [txHistory, info] = await Promise.all([
        getTransactionHistory(publicKey),
        getAccountInfo(publicKey)
      ]);

      if (!txHistory || txHistory.length === 0) {
        toast.warning("No transactions found for this address");
        return;
      }

      setTransactions(txHistory);
      setGraphData(processTransactionsForGraph(txHistory));
      setAccountInfo(info);
      setCurrentKey(publicKey);
      toast.success(`Found ${txHistory.length} transactions`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch transactions";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentTransactions = useCallback(async () => {
    try {
      setNetworkLoading(true);
      const recent = await getRecentNetworkTransactions(5);
      setRecentTransactions(recent);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      toast.error("Failed to fetch recent network transactions");
    } finally {
      setNetworkLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentTransactions();
    const interval = setInterval(fetchRecentTransactions, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchRecentTransactions]);

  const handleSearch = useCallback((key: string) => {
    if (!key) {
      toast.error("Please enter a valid Solana address");
      return;
    }
    fetchTransactions(key);
  }, [fetchTransactions]);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (nodeId === currentKey) {
      toast.info("This is the current address");
      return;
    }
    handleSearch(nodeId);
  }, [currentKey, handleSearch]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Solana Transaction Explorer</CardTitle>
            </CardHeader>
            <CardContent>
              <SearchBar onSearch={handleSearch} disabled={loading} />
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {accountInfo && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>Balance: {accountInfo.balance} SOL</p>
                  <p>Owner: {accountInfo.owner}</p>
                  <p>Executable: {accountInfo.executable ? "Yes" : "No"}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Recent Network Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {networkLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tx) => (
                  <div key={tx.signature} className="p-2 bg-secondary rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono">
                        {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(tx.timestamp, "HH:mm:ss")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {transactions.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Transaction Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionGraph data={graphData} onNodeClick={handleNodeClick} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={transactions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTracker publicKey={currentKey} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Index;