import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import type { Transaction } from "@shared/schema";
import { format } from "date-fns";

interface RecentTransactionsProps {
  transactions: Transaction[] | undefined;
  isLoading: boolean;
}

export function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  const formatAmount = (amount: string, type: string, currency: string) => {
    const num = parseFloat(amount);
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: currency === "SOL" ? 4 : 2,
    }).format(Math.abs(num));
    
    const prefix = type === "send" || type === "payment" ? "-" : "+";
    const currencySymbol = currency === "USD" || currency === "USDC" ? "$" : "";
    const suffix = currency === "SOL" ? " SOL" : "";
    
    return `${prefix}${currencySymbol}${formatted}${suffix}`;
  };

  const getTransactionIcon = (type: string) => {
    if (type === "send" || type === "payment") {
      return <ArrowUpRight className="h-4 w-4 text-red-500" />;
    }
    return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: "bg-green-500/10 text-green-600",
      pending: "bg-yellow-500/10 text-yellow-600",
      failed: "bg-red-500/10 text-red-600",
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-card-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="p-6 bg-card border-card-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Clock className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">No transactions yet</p>
          <p className="text-xs mt-1">Your transaction history will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-card-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <a href="/history" className="text-sm text-primary hover:underline" data-testid="link-view-all">
          View All
        </a>
      </div>
      <div className="space-y-4">
        {transactions.slice(0, 5).map((tx) => (
          <div key={tx.id} className="flex items-center gap-4 p-3 rounded-lg hover-elevate transition-colors" data-testid={`transaction-${tx.id}`}>
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              {getTransactionIcon(tx.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate capitalize">
                {tx.description || tx.type}
              </p>
              <p className="text-xs text-muted-foreground">
                {tx.createdAt ? format(new Date(tx.createdAt), "MMM d, yyyy • h:mm a") : ""}
              </p>
            </div>
            <div className="text-right">
              <p className={`font-semibold text-sm ${tx.type === "send" || tx.type === "payment" ? "text-red-500" : "text-green-500"}`}>
                {formatAmount(tx.amount, tx.type, tx.currency)}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(tx.status)}`}>
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
