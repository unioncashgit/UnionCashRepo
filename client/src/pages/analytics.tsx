import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import type { Transaction } from "@shared/schema";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

const COLORS = ["#ec4899", "#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const getSpendingByCategory = () => {
    if (!transactions) return [];
    const categoryMap: Record<string, number> = {};
    transactions
      .filter((tx) => tx.type === "send" || tx.type === "payment")
      .forEach((tx) => {
        const category = tx.category || "Other";
        categoryMap[category] = (categoryMap[category] || 0) + Math.abs(parseFloat(tx.amount));
      });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  };

  const getSpendingTrend = () => {
    if (!transactions) return [];
    const today = new Date();
    const days = eachDayOfInterval({
      start: subDays(today, 30),
      end: today,
    });
    
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayTransactions = transactions.filter((tx) => {
        if (!tx.createdAt) return false;
        return format(new Date(tx.createdAt), "yyyy-MM-dd") === dayStr;
      });
      
      const spent = dayTransactions
        .filter((tx) => tx.type === "send" || tx.type === "payment")
        .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0);
      
      const received = dayTransactions
        .filter((tx) => tx.type === "receive" || tx.type === "topup")
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
      
      return {
        date: format(day, "MMM d"),
        spent,
        received,
      };
    });
  };

  const getMonthlyComparison = () => {
    if (!transactions) return [];
    const months: Record<string, { sent: number; received: number }> = {};
    
    transactions.forEach((tx) => {
      if (!tx.createdAt) return;
      const month = format(new Date(tx.createdAt), "MMM yyyy");
      if (!months[month]) months[month] = { sent: 0, received: 0 };
      
      if (tx.type === "send" || tx.type === "payment") {
        months[month].sent += Math.abs(parseFloat(tx.amount));
      } else {
        months[month].received += parseFloat(tx.amount);
      }
    });
    
    return Object.entries(months)
      .slice(-6)
      .map(([month, data]) => ({ month, ...data }));
  };

  const calculateTotals = () => {
    if (!transactions) return { sent: 0, received: 0, net: 0 };
    
    const sent = transactions
      .filter((tx) => tx.type === "send" || tx.type === "payment")
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0);
    
    const received = transactions
      .filter((tx) => tx.type === "receive" || tx.type === "topup")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    
    return { sent, received, net: received - sent };
  };

  const totals = calculateTotals();
  const spendingByCategory = getSpendingByCategory();
  const spendingTrend = getSpendingTrend();
  const monthlyComparison = getMonthlyComparison();

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your financial insights</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your financial insights</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 bg-card border-card-border">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <ArrowDownLeft className="h-5 w-5 text-green-500" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground">Total Received</p>
          <p className="text-2xl font-bold text-green-500" data-testid="text-total-received">
            +${totals.received.toFixed(2)}
          </p>
        </Card>

        <Card className="p-6 bg-card border-card-border">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-red-500" />
            </div>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-sm text-muted-foreground">Total Spent</p>
          <p className="text-2xl font-bold text-red-500" data-testid="text-total-spent">
            -${totals.sent.toFixed(2)}
          </p>
        </Card>

        <Card className="p-6 bg-card border-card-border">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            {totals.net >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">Net Balance</p>
          <p
            className={`text-2xl font-bold ${totals.net >= 0 ? "text-green-500" : "text-red-500"}`}
            data-testid="text-net-balance"
          >
            {totals.net >= 0 ? "+" : "-"}${Math.abs(totals.net).toFixed(2)}
          </p>
        </Card>
      </div>

      <Tabs defaultValue="trend" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trend" data-testid="tab-trend">
            Spending Trend
          </TabsTrigger>
          <TabsTrigger value="category" data-testid="tab-category">
            By Category
          </TabsTrigger>
          <TabsTrigger value="monthly" data-testid="tab-monthly">
            Monthly
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <Card className="p-6 bg-card border-card-border">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              30-Day Spending Trend
            </h3>
            <div className="h-80">
              {spendingTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spendingTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="spent"
                      name="Spent"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="received"
                      name="Received"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="category">
          <Card className="p-6 bg-card border-card-border">
            <h3 className="text-lg font-semibold mb-6">Spending by Category</h3>
            <div className="h-80">
              {spendingByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {spendingByCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No spending data available
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card className="p-6 bg-card border-card-border">
            <h3 className="text-lg font-semibold mb-6">Monthly Comparison</h3>
            <div className="h-80">
              {monthlyComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
                    />
                    <Legend />
                    <Bar dataKey="received" name="Received" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sent" name="Sent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No monthly data available
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
