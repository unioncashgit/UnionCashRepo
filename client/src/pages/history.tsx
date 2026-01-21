import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Clock,
  Filter,
  Calendar,
} from "lucide-react";
import type { Transaction } from "@shared/schema";
import { format } from "date-fns";

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const filteredTransactions = transactions?.filter((tx) => {
    const matchesSearch =
      tx.description?.toLowerCase().includes(search.toLowerCase()) ||
      tx.recipientAddress?.toLowerCase().includes(search.toLowerCase()) ||
      tx.type.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    const matchesCurrency = currencyFilter === "all" || tx.currency === currencyFilter;
    return matchesSearch && matchesType && matchesCurrency;
  });

  const formatAmount = (amount: string, type: string, currency: string) => {
    const num = parseFloat(amount);
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: currency === "SOL" ? 6 : 2,
    }).format(Math.abs(num));

    const prefix = type === "send" || type === "payment" ? "-" : "+";
    const currencySymbol = currency === "USD" || currency === "USDC" ? "$" : "";
    const suffix = currency === "SOL" ? " SOL" : "";

    return `${prefix}${currencySymbol}${formatted}${suffix}`;
  };

  const getTransactionIcon = (type: string) => {
    if (type === "send" || type === "payment") {
      return <ArrowUpRight className="h-5 w-5 text-red-500" />;
    }
    return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-500/10 text-green-600 border-green-500/20",
      pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      failed: "bg-red-500/10 text-red-600 border-red-500/20",
    };
    return colors[status] || colors.pending;
  };

  const groupTransactionsByDate = (txs: Transaction[]) => {
    const groups: Record<string, Transaction[]> = {};
    txs.forEach((tx) => {
      const date = tx.createdAt ? format(new Date(tx.createdAt), "MMMM d, yyyy") : "Unknown";
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
    });
    return groups;
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">View all your transactions</p>
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const groupedTransactions = filteredTransactions
    ? groupTransactionsByDate(filteredTransactions)
    : {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground">View all your transactions</p>
      </div>

      <div className="sticky top-0 z-10 bg-background py-4 -mt-4 -mx-6 px-6 border-b border-border">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-transactions"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-type-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="send">Sent</SelectItem>
              <SelectItem value="receive">Received</SelectItem>
              <SelectItem value="topup">Top Up</SelectItem>
              <SelectItem value="request">Request</SelectItem>
            </SelectContent>
          </Select>
          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-currency-filter">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="SOL">SOL</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!filteredTransactions || filteredTransactions.length === 0 ? (
        <Card className="p-12 bg-card border-card-border text-center">
          <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
          <p className="text-muted-foreground">
            {search || typeFilter !== "all" || currencyFilter !== "all"
              ? "Try adjusting your filters"
              : "Your transaction history will appear here"}
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTransactions).map(([date, txs]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground">{date}</h3>
              </div>
              <Card className="bg-card border-card-border divide-y divide-border">
                {txs.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 p-4 hover-elevate transition-colors"
                    data-testid={`transaction-history-${tx.id}`}
                  >
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium capitalize">
                          {tx.description || tx.type}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusBadge(tx.status)}`}
                        >
                          {tx.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="truncate max-w-[200px]">
                          {tx.recipientAddress || tx.senderAddress || "—"}
                        </span>
                        <span className="text-xs">
                          {tx.createdAt && format(new Date(tx.createdAt), "h:mm a")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`font-bold ${
                          tx.type === "send" || tx.type === "payment"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {formatAmount(tx.amount, tx.type, tx.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">{tx.currency}</p>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
