import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ReceiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
}

export function ReceiveModal({ open, onOpenChange, walletAddress }: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy address",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Receive Money
          </DialogTitle>
          <DialogDescription>
            Share your wallet address or QR code to receive funds
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center p-6 bg-white rounded-xl">
            <QRCodeSVG
              value={walletAddress}
              size={180}
              level="H"
              includeMargin
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Your Wallet Address</Label>
            <div className="flex gap-2">
              <Input
                value={walletAddress}
                readOnly
                className="font-mono text-sm"
                data-testid="input-wallet-address"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                data-testid="button-copy-address"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Send only SOL, USDC, or fiat currencies to this address
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
