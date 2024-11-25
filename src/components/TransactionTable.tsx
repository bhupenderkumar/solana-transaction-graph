import { format } from "date-fns";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface Transaction {
  signature: string;
  timestamp: number;
  from: string;
  to: string;
  amount: number;
  status: string;
  fee: number;
  programId: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable = ({ transactions }: TransactionTableProps) => {
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="w-full rounded-lg overflow-hidden backdrop-blur-lg bg-white/5 border border-solana-purple/20 animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Time</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Amount (SOL)</TableHead>
            <TableHead>Fee (SOL)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Signature</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx, index) => (
            <TableRow 
              key={tx.signature}
              className={`${
                index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'
              } hover:bg-white/[0.05] transition-colors`}
            >
              <TableCell>{format(tx.timestamp, "PPpp")}</TableCell>
              <TableCell className="font-mono group">
                <div className="flex items-center gap-2">
                  <span>{tx.from.slice(0, 8)}...</span>
                  <Copy 
                    className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-solana-purple transition-all" 
                    onClick={() => handleCopy(tx.from, "Address")}
                  />
                </div>
              </TableCell>
              <TableCell className="font-mono group">
                <div className="flex items-center gap-2">
                  <span>{tx.to.slice(0, 8)}...</span>
                  <Copy 
                    className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-solana-purple transition-all" 
                    onClick={() => handleCopy(tx.to, "Address")}
                  />
                </div>
              </TableCell>
              <TableCell>{tx.amount.toFixed(4)}</TableCell>
              <TableCell>{tx.fee.toFixed(6)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded ${
                  tx.status === "Success" 
                    ? "bg-green-500/20 text-green-300" 
                    : "bg-red-500/20 text-red-300"
                }`}>
                  {tx.status}
                </span>
              </TableCell>
              <TableCell className="font-mono group">
                <div className="flex items-center gap-2">
                  <span>{tx.programId.slice(0, 8)}...</span>
                  <Copy 
                    className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-solana-purple transition-all" 
                    onClick={() => handleCopy(tx.programId, "Program ID")}
                  />
                </div>
              </TableCell>
              <TableCell className="font-mono group">
                <div className="flex items-center gap-2">
                  <span>{tx.signature.slice(0, 8)}...</span>
                  <Copy 
                    className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-solana-purple transition-all" 
                    onClick={() => handleCopy(tx.signature, "Signature")}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};