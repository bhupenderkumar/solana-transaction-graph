import { useEffect, useState } from "react";
import { subscribeToTransactions, getAccountInfo } from "@/lib/solana";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

interface Transaction {
  signature: string;
  timestamp: number;
  type: string;
}

interface AccountInfo {
  balance: number;
  executable: boolean;
  owner: string;
  space: number;
}

interface TransactionTrackerProps {
  publicKey: string;
}

export const TransactionTracker = ({ publicKey }: TransactionTrackerProps) => {
  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>([]);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        const info = await getAccountInfo(publicKey);
        setAccountInfo(info);
      } catch (error) {
        console.error("Error fetching account info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountInfo();
    const unsubscribe = subscribeToTransactions(publicKey, (transaction) => {
      setLatestTransactions((prev) => [transaction, ...prev].slice(0, 5));
    });

    return () => {
      unsubscribe();
    };
  }, [publicKey]);

  if (loading) {
    return (
      <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full bg-purple-500/20" />
            <Skeleton className="h-4 w-3/4 bg-purple-500/20" />
            <Skeleton className="h-4 w-1/2 bg-purple-500/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 rounded bg-purple-500/10 border border-purple-500/20">
              <span className="text-gray-300">Balance</span>
              <span className="text-white font-mono">{accountInfo?.balance.toFixed(4)} SOL</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-purple-500/10 border border-purple-500/20">
              <span className="text-gray-300">Owner</span>
              <span className="text-white font-mono">{accountInfo?.owner.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-purple-500/10 border border-purple-500/20">
              <span className="text-gray-300">Executable</span>
              <span className="text-white">{accountInfo?.executable ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-purple-500/10 border border-purple-500/20">
              <span className="text-gray-300">Data Size</span>
              <span className="text-white">{accountInfo?.space} bytes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white">Latest Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {latestTransactions.map((tx) => (
              <div
                key={tx.signature}
                className="flex justify-between items-center p-2 rounded bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors duration-200"
              >
                <span className="font-mono text-sm text-gray-300">
                  {tx.signature.slice(0, 8)}...
                </span>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-400">
                    {format(tx.timestamp, "HH:mm:ss")}
                  </span>
                  <span className="text-xs text-gray-500">{tx.type}</span>
                </div>
              </div>
            ))}
            {latestTransactions.length === 0 && (
              <div className="text-center text-gray-400 py-4 animate-pulse">
                Waiting for new transactions...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};