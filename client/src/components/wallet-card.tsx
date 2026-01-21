import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, TrendingUp } from "lucide-react";
import type { Wallet as WalletType } from "@shared/schema";

interface WalletCardProps {
  wallet: WalletType | null | undefined;
  isLoading: boolean;
}

export function WalletCard({ wallet, isLoading }: WalletCardProps) {
  const formatCurrency = (value: string | null | undefined, decimals: number = 2) => {
    const num = parseFloat(value || "0");
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const calculateTotal = () => {
    if (!wallet) return "0.00";
    const fiat = parseFloat(wallet.fiatBalance || "0");
    const sol = parseFloat(wallet.solBalance || "0") * 175;
    const usdc = parseFloat(wallet.usdcBalance || "0");
    return formatCurrency(String(fiat + sol + usdc));
  };

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-purple-600/10 border-0">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5" />
        <div className="relative space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-purple-600/10 border-0">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full -translate-y-32 translate-x-32" />
      <div className="relative space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Your Wallet</span>
            <div className="flex items-center gap-1 text-xs text-green-500">
              <TrendingUp className="h-3 w-3" />
              +2.5%
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
          <p className="text-4xl font-bold" data-testid="text-total-balance">
            ${calculateTotal()}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-background/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-green-600">$</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">Fiat (USD)</span>
            </div>
            <p className="text-lg font-bold" data-testid="text-fiat-balance">
              ${formatCurrency(wallet?.fiatBalance)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-background/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-purple-600">◎</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">SOL</span>
            </div>
            <p className="text-lg font-bold" data-testid="text-sol-balance">
              {formatCurrency(wallet?.solBalance, 4)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-background/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">U</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">USDC</span>
            </div>
            <p className="text-lg font-bold" data-testid="text-usdc-balance">
              {formatCurrency(wallet?.usdcBalance)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
