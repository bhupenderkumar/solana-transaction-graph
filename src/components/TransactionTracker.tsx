import { useEffect, useState } from "react";
import { subscribeToTransactions } from "@/lib/solana";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface Transaction {
  signature: string;
  timestamp: number;
  type: string;
}

interface TransactionTrackerProps {
  publicKey: string;
}

export const TransactionTracker = ({ publicKey }: TransactionTrackerProps) => {
  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToTransactions(publicKey, (transaction) => {
      setLatestTransactions((prev) => [transaction, ...prev].slice(0, 5));
    });

    return () => {
      unsubscribe();
    };
  }, [publicKey]);

  return (
    <Card className="w-full backdrop-blur-lg bg-white/5 border-solana-purple/20 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Latest Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {latestTransactions.map((tx) => (
            <div
              key={tx.signature}
              className="flex justify-between items-center p-2 rounded bg-white/5"
            >
              <span className="font-mono text-sm">
                {tx.signature.slice(0, 8)}...
              </span>
              <span className="text-sm text-gray-400">
                {format(tx.timestamp, "HH:mm:ss")}
              </span>
            </div>
          ))}
          {latestTransactions.length === 0 && (
            <div className="text-center text-gray-400 py-4">
              Waiting for new transactions...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};