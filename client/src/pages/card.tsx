import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  CreditCard,
  Plus,
  Snowflake,
  Settings,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Loader2,
  Wallet,
} from "lucide-react";
import type { Card as CardType } from "@shared/schema";

export default function CardPage() {
  const { toast } = useToast();
  const [showNumbers, setShowNumbers] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false);

  const { data: cards, isLoading } = useQuery<CardType[]>({
    queryKey: ["/api/cards"],
  });

  const createCardMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cards", {
        cardType: "virtual",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      toast({ title: "Success", description: "Virtual card created successfully" });
      setAddCardOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create card", variant: "destructive" });
    },
  });

  const freezeCardMutation = useMutation({
    mutationFn: async ({ id, isFrozen }: { id: string; isFrozen: boolean }) => {
      return apiRequest("PATCH", `/api/cards/${id}`, { isFrozen });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      toast({ title: "Success", description: "Card status updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update card", variant: "destructive" });
    },
  });

  const copyCardNumber = async (cardNumber: string) => {
    try {
      await navigator.clipboard.writeText(cardNumber.replace(/\s/g, ""));
      setCopied(true);
      toast({ title: "Copied", description: "Card number copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  const copyWalletAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setWalletCopied(true);
      toast({ title: "Copied", description: "Wallet address copied to clipboard" });
      setTimeout(() => setWalletCopied(false), 2000);
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  const maskCardNumber = (number: string) => {
    return number.replace(/(\d{4})(?=\d)/g, "$1 ").replace(/\d(?=\d{4})/g, "*");
  };

  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cards</h1>
            <p className="text-muted-foreground">Manage your virtual and physical cards</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cards</h1>
          <p className="text-muted-foreground">Manage your virtual and physical cards</p>
        </div>
        <Button onClick={() => setAddCardOpen(true)} data-testid="button-add-card">
          <Plus className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </div>

      {!cards || cards.length === 0 ? (
        <Card className="p-12 bg-card border-card-border text-center">
          <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No cards yet</h3>
          <p className="text-muted-foreground mb-6">
            Create a virtual card to start making payments
          </p>
          <Button onClick={() => setAddCardOpen(true)} data-testid="button-create-first-card">
            <Plus className="mr-2 h-4 w-4" />
            Create Virtual Card
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="relative group cursor-pointer"
              onClick={() => setSelectedCard(card)}
              data-testid={`card-${card.id}`}
            >
              <div
                className={`relative h-56 rounded-2xl p-6 overflow-hidden transition-transform hover:scale-[1.02] ${
                  card.isFrozen
                    ? "bg-gradient-to-br from-gray-400 to-gray-600"
                    : "bg-gradient-to-br from-pink-500 via-purple-500 to-purple-600"
                }`}
              >
                {card.isFrozen && (
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center">
                    <Snowflake className="h-16 w-16 text-white/50" />
                  </div>
                )}
                <div className="relative h-full flex flex-col justify-between text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-0 text-xs"
                      >
                        {card.cardType === "virtual" ? "Virtual" : "Physical"}
                      </Badge>
                      {card.isFrozen && (
                        <Badge className="ml-2 bg-blue-500/50 text-white border-0 text-xs">
                          Frozen
                        </Badge>
                      )}
                    </div>
                    <CreditCard className="h-8 w-8 opacity-80" />
                  </div>
                  <div className="space-y-4">
                    <div className="font-mono text-lg tracking-widest">
                      {showNumbers ? formatCardNumber(card.cardNumber) : maskCardNumber(card.cardNumber)}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs opacity-70 mb-1">Card Holder</p>
                        <p className="font-medium text-sm">{card.cardHolder}</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-70 mb-1">Expires</p>
                        <p className="font-medium text-sm">{card.expiryDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Switch
          id="show-numbers"
          checked={showNumbers}
          onCheckedChange={setShowNumbers}
          data-testid="switch-show-numbers"
        />
        <Label htmlFor="show-numbers" className="text-sm">
          {showNumbers ? <Eye className="inline h-4 w-4 mr-1" /> : <EyeOff className="inline h-4 w-4 mr-1" />}
          {showNumbers ? "Hide card numbers" : "Show card numbers"}
        </Label>
      </div>

      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Card Settings
            </DialogTitle>
            <DialogDescription>
              Manage your {selectedCard?.cardType} card settings
            </DialogDescription>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Card Number</Label>
                    <p className="font-mono text-sm text-muted-foreground">
                      {formatCardNumber(selectedCard.cardNumber)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyCardNumber(selectedCard.cardNumber)}
                    data-testid="button-copy-card-number"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Cardholder</Label>
                    <p className="text-sm text-muted-foreground">{selectedCard.cardHolder}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Expires</Label>
                    <p className="text-sm text-muted-foreground">{selectedCard.expiryDate}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Daily Limit</Label>
                    <p className="text-sm text-muted-foreground">${selectedCard.dailyLimit}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Monthly Limit</Label>
                    <p className="text-sm text-muted-foreground">${selectedCard.monthlyLimit}</p>
                  </div>
                </div>
                {selectedCard.solanaAddress && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-purple-500" />
                      <Label className="text-sm font-medium">Solana Wallet</Label>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-xs text-muted-foreground truncate flex-1">
                        {selectedCard.solanaAddress}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => copyWalletAddress(selectedCard.solanaAddress!)}
                        data-testid="button-copy-wallet-address"
                      >
                        {walletCopied ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Use this address to receive SOL and USDC
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <Snowflake className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">Freeze Card</p>
                    <p className="text-xs text-muted-foreground">
                      Temporarily disable all transactions
                    </p>
                  </div>
                </div>
                <Switch
                  checked={selectedCard.isFrozen}
                  onCheckedChange={(checked) => {
                    freezeCardMutation.mutate({ id: selectedCard.id, isFrozen: checked });
                    setSelectedCard({ ...selectedCard, isFrozen: checked });
                  }}
                  disabled={freezeCardMutation.isPending}
                  data-testid="switch-freeze-card"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Create Virtual Card
            </DialogTitle>
            <DialogDescription>
              Generate a new virtual card for online payments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-purple-600">
              <div className="h-32 flex flex-col justify-between text-white">
                <CreditCard className="h-8 w-8 opacity-80" />
                <div>
                  <div className="font-mono text-lg tracking-widest mb-2">
                    **** **** **** ****
                  </div>
                  <p className="text-sm opacity-80">Your new virtual card</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Wallet className="h-5 w-5 text-purple-500 shrink-0" />
              <p className="text-sm text-muted-foreground">
                A Solana wallet will be automatically created for receiving SOL and USDC
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => createCardMutation.mutate()}
              disabled={createCardMutation.isPending}
              data-testid="button-confirm-create-card"
            >
              {createCardMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Card"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
