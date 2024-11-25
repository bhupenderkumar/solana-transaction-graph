import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

interface AccountMetadataProps {
  accountInfo: {
    balance: number;
    executable: boolean;
    owner: string;
    space: number;
    rentExemption: number;
    isRentExempt: boolean;
  } | null;
  loading: boolean;
}

export const AccountMetadata = ({ accountInfo, loading }: AccountMetadataProps) => {
  if (loading) {
    return (
      <Card className="backdrop-blur-lg bg-background/5 border-border">
        <CardHeader>
          <CardTitle>Account Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full bg-muted" />
          <Skeleton className="h-4 w-3/4 bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!accountInfo) return null;

  return (
    <Card className="backdrop-blur-lg bg-background/5 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Account Metadata
          <Badge variant="outline" className="ml-2">
            {accountInfo.executable ? "Executable" : "Non-Executable"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-lg font-medium">{accountInfo.balance.toFixed(6)} SOL</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Data Size</p>
              <p className="text-lg font-medium">{accountInfo.space} bytes</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Owner</p>
            <p className="font-mono text-sm bg-background/5 p-2 rounded">{accountInfo.owner}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Rent Exemption</p>
              <p className="text-lg font-medium">{accountInfo.rentExemption.toFixed(6)} SOL</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Rent Status</p>
              <Badge 
                variant={accountInfo.isRentExempt ? "default" : "destructive"}
                className={accountInfo.isRentExempt ? "bg-green-500/80 text-white" : ""}
              >
                {accountInfo.isRentExempt ? "Rent Exempt" : "Not Rent Exempt"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};