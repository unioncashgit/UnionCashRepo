import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Send, Download, Loader2, Users } from "lucide-react";
import type { Transaction } from "@shared/schema";

const paymentSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine((val) => parseFloat(val) > 0, "Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  recipientAddress: z.string().min(1, "Recipient is required"),
  description: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function PaymentPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("send");

  const { data: transactions, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: "",
      currency: "USD",
      recipientAddress: "",
      description: "",
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      return apiRequest("POST", "/api/transactions", {
        type: "send",
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: "Success", description: "Payment sent successfully" });
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send payment", variant: "destructive" });
    },
  });

  const recentRecipients = transactions
    ?.filter((tx) => tx.type === "send" && tx.recipientAddress)
    .slice(0, 5)
    .map((tx) => tx.recipientAddress)
    .filter((addr, i, arr) => arr.indexOf(addr) === i);

  const onSubmit = async (data: PaymentFormData) => {
    await sendMutation.mutateAsync(data);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payment</h1>
        <p className="text-muted-foreground">Send and receive payments</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="send" className="gap-2" data-testid="tab-send">
            <Send className="h-4 w-4" />
            Send
          </TabsTrigger>
          <TabsTrigger value="request" className="gap-2" data-testid="tab-request">
            <Download className="h-4 w-4" />
            Request
          </TabsTrigger>
        </TabsList>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <TabsContent value="send" className="mt-0">
              <Card className="p-6 bg-card border-card-border">
                <h2 className="text-lg font-semibold mb-6">Send Money</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="recipientAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter email, username, or wallet address"
                              {...field}
                              data-testid="input-payment-recipient"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="text-2xl h-14"
                                {...field}
                                data-testid="input-payment-amount"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-14" data-testid="select-payment-currency">
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="SOL">SOL</SelectItem>
                                <SelectItem value="USDC">USDC</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="What's this payment for?"
                              {...field}
                              data-testid="input-payment-note"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12"
                      disabled={sendMutation.isPending}
                      data-testid="button-send-payment"
                    >
                      {sendMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Payment
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </Card>
            </TabsContent>

            <TabsContent value="request" className="mt-0">
              <Card className="p-6 bg-card border-card-border">
                <h2 className="text-lg font-semibold mb-6">Request Payment</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="recipientAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Request From</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter email, username, or wallet address"
                              {...field}
                              data-testid="input-request-from-payment"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="text-2xl h-14"
                                {...field}
                                data-testid="input-request-amount-payment"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-14" data-testid="select-request-currency-payment">
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="SOL">SOL</SelectItem>
                                <SelectItem value="USDC">USDC</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="What's this request for?"
                              {...field}
                              data-testid="input-request-note-payment"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12"
                      disabled={sendMutation.isPending}
                      data-testid="button-request-payment"
                    >
                      {sendMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Request Payment
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </Card>
            </TabsContent>
          </div>

          <div>
            <Card className="p-6 bg-card border-card-border">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Recent Recipients
              </h3>
              {txLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              ) : recentRecipients && recentRecipients.length > 0 ? (
                <div className="space-y-3">
                  {recentRecipients.map((recipient, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => form.setValue("recipientAddress", recipient || "")}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover-elevate transition-colors text-left"
                      data-testid={`button-recent-recipient-${i}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {recipient?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate">{recipient}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No recent recipients yet
                </p>
              )}
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
