import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  PiggyBank,
  Plus,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Utensils,
  Gamepad2,
  GraduationCap,
  Heart,
  Loader2,
  TrendingUp,
} from "lucide-react";
import type { Budget } from "@shared/schema";

const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  limit: z.string().min(1, "Budget limit is required").refine((val) => parseFloat(val) > 0, "Limit must be greater than 0"),
  period: z.string().min(1, "Period is required"),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

const categoryIcons: Record<string, any> = {
  Shopping: ShoppingBag,
  "Food & Dining": Utensils,
  Transportation: Car,
  Entertainment: Gamepad2,
  Housing: Home,
  "Coffee & Snacks": Coffee,
  Education: GraduationCap,
  Healthcare: Heart,
};

const categoryColors: Record<string, string> = {
  Shopping: "bg-pink-500",
  "Food & Dining": "bg-orange-500",
  Transportation: "bg-blue-500",
  Entertainment: "bg-purple-500",
  Housing: "bg-green-500",
  "Coffee & Snacks": "bg-amber-500",
  Education: "bg-indigo-500",
  Healthcare: "bg-red-500",
};

export default function BudgetPage() {
  const { toast } = useToast();
  const [addBudgetOpen, setAddBudgetOpen] = useState(false);

  const { data: budgets, isLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: "",
      limit: "",
      period: "monthly",
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      return apiRequest("POST", "/api/budgets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({ title: "Success", description: "Budget created successfully" });
      setAddBudgetOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create budget", variant: "destructive" });
    },
  });

  const onSubmit = async (data: BudgetFormData) => {
    await createBudgetMutation.mutateAsync(data);
  };

  const calculateProgress = (spent: string, limit: string) => {
    const spentNum = parseFloat(spent || "0");
    const limitNum = parseFloat(limit || "1");
    return Math.min((spentNum / limitNum) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "bg-red-500";
    if (progress >= 70) return "bg-yellow-500";
    return "bg-primary";
  };

  const totalBudget = budgets?.reduce((sum, b) => sum + parseFloat(b.limit || "0"), 0) || 0;
  const totalSpent = budgets?.reduce((sum, b) => sum + parseFloat(b.spent || "0"), 0) || 0;
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Budget</h1>
            <p className="text-muted-foreground">Track your spending limits</p>
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Budget</h1>
          <p className="text-muted-foreground">Track your spending limits</p>
        </div>
        <Button onClick={() => setAddBudgetOpen(true)} data-testid="button-add-budget">
          <Plus className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </div>

      <Card className="p-6 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-purple-600/10 border-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Budget</p>
              <p className="text-2xl font-bold">${totalSpent.toFixed(2)} / ${totalBudget.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-xl font-semibold text-green-500">${(totalBudget - totalSpent).toFixed(2)}</p>
          </div>
        </div>
        <Progress value={overallProgress} className="h-3" />
        <p className="text-xs text-muted-foreground mt-2">{overallProgress.toFixed(0)}% of total budget used</p>
      </Card>

      {!budgets || budgets.length === 0 ? (
        <Card className="p-12 bg-card border-card-border text-center">
          <PiggyBank className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
          <p className="text-muted-foreground mb-6">
            Create budgets to track your spending by category
          </p>
          <Button onClick={() => setAddBudgetOpen(true)} data-testid="button-create-first-budget">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Budget
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const Icon = categoryIcons[budget.category] || PiggyBank;
            const color = categoryColors[budget.category] || "bg-primary";
            const progress = calculateProgress(budget.spent, budget.limit);
            const progressColor = getProgressColor(progress);
            const remaining = parseFloat(budget.limit) - parseFloat(budget.spent || "0");

            return (
              <Card key={budget.id} className="p-6 bg-card border-card-border" data-testid={`budget-${budget.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${color} bg-opacity-20 flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${color.replace("bg-", "text-")}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{budget.category}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{budget.period}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">${parseFloat(budget.spent || "0").toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">of ${parseFloat(budget.limit).toFixed(2)}</p>
                    </div>
                    <p className={`text-sm font-medium ${remaining >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {remaining >= 0 ? `$${remaining.toFixed(2)} left` : `$${Math.abs(remaining).toFixed(2)} over`}
                    </p>
                  </div>
                  <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all ${progressColor}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">{progress.toFixed(0)}% used</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={addBudgetOpen} onOpenChange={setAddBudgetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Create Budget
            </DialogTitle>
            <DialogDescription>
              Set a spending limit for a category
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-budget-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.keys(categoryIcons).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Limit ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="500.00"
                        {...field}
                        data-testid="input-budget-limit"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-budget-period">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={createBudgetMutation.isPending}
                data-testid="button-confirm-create-budget"
              >
                {createBudgetMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Budget"
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
