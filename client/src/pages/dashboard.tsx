import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { WalletCard } from "@/components/wallet-card";
import { QuickActions } from "@/components/quick-actions";
import { QuickCardAccess } from "@/components/quick-card-access";
import { RecentTransactions } from "@/components/recent-transactions";
import { SendModal } from "@/components/modals/send-modal";
import { ReceiveModal } from "@/components/modals/receive-modal";
import { TopupModal } from "@/components/modals/topup-modal";
import { RequestModal } from "@/components/modals/request-modal";
import { QrModal } from "@/components/modals/qr-modal";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Wallet, Transaction } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const { data: wallet, isLoading: walletLoading } = useQuery<Wallet>({
    queryKey: ["/api/wallet"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const sendMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/transactions", {
        type: "send",
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: "Success", description: "Transaction sent successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send transaction", variant: "destructive" });
    },
  });

  const topupMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/transactions", {
        type: "topup",
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: "Success", description: "Top up completed successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to process top up", variant: "destructive" });
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/transactions", {
        type: "request",
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: "Success", description: "Payment request sent" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send request", variant: "destructive" });
    },
  });

  const walletAddress = user?.id ? `union-cash:${user.id.slice(0, 8)}` : "union-cash:wallet";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || "User"}</h1>
          <p className="text-muted-foreground">Here's your financial overview</p>
        </div>
      </div>

      <WalletCard wallet={wallet} isLoading={walletLoading} />

      <QuickActions
        onSend={() => setSendOpen(true)}
        onReceive={() => setReceiveOpen(true)}
        onTopUp={() => setTopupOpen(true)}
        onRequest={() => setRequestOpen(true)}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={transactions} isLoading={transactionsLoading} />
        </div>
        <div>
          <QuickCardAccess
            onManageCards={() => setLocation("/card")}
            onQrPayment={() => setReceiveOpen(true)}
            onGenerateQr={() => setQrOpen(true)}
          />
        </div>
      </div>

      <SendModal
        open={sendOpen}
        onOpenChange={setSendOpen}
        onSubmit={async (data) => {
          await sendMutation.mutateAsync(data);
        }}
        isLoading={sendMutation.isPending}
      />

      <ReceiveModal
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
        walletAddress={walletAddress}
      />

      <TopupModal
        open={topupOpen}
        onOpenChange={setTopupOpen}
        onSubmit={async (data) => {
          await topupMutation.mutateAsync(data);
        }}
        isLoading={topupMutation.isPending}
      />

      <RequestModal
        open={requestOpen}
        onOpenChange={setRequestOpen}
        onSubmit={async (data) => {
          await requestMutation.mutateAsync(data);
        }}
        isLoading={requestMutation.isPending}
      />

      <QrModal
        open={qrOpen}
        onOpenChange={setQrOpen}
        data={walletAddress}
        title="Your Payment QR"
        description="Share this QR code to receive payments"
      />
    </div>
  );
}
