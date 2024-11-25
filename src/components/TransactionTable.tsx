import { format } from "date-fns";
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
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable = ({ transactions }: TransactionTableProps) => {
  return (
    <div className="w-full rounded-lg overflow-hidden backdrop-blur-lg bg-white/5 border border-solana-purple/20 animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Amount (SOL)</TableHead>
            <TableHead>Signature</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.signature}>
              <TableCell>{format(tx.timestamp, "PPpp")}</TableCell>
              <TableCell className="font-mono">{tx.from.slice(0, 8)}...</TableCell>
              <TableCell className="font-mono">{tx.to.slice(0, 8)}...</TableCell>
              <TableCell>{tx.amount}</TableCell>
              <TableCell className="font-mono">{tx.signature.slice(0, 8)}...</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};