import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditCard, QrCode, ScanLine } from "lucide-react";

interface QuickCardAccessProps {
  onManageCards: () => void;
  onQrPayment: () => void;
  onGenerateQr: () => void;
}

export function QuickCardAccess({ onManageCards, onQrPayment, onGenerateQr }: QuickCardAccessProps) {
  return (
    <Card className="p-4 bg-card border-card-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Quick Card Access</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="flex-1 min-w-[100px] gap-2"
          onClick={onManageCards}
          data-testid="button-manage-cards"
        >
          <CreditCard className="h-4 w-4" />
          Manage
        </Button>
        <Button
          variant="outline"
          className="flex-1 min-w-[100px] gap-2"
          onClick={onQrPayment}
          data-testid="button-qr-payment"
        >
          <ScanLine className="h-4 w-4" />
          QR Payment
        </Button>
        <Button
          variant="outline"
          className="flex-1 min-w-[100px] gap-2"
          onClick={onGenerateQr}
          data-testid="button-generate-qr"
        >
          <QrCode className="h-4 w-4" />
          Generate QR
        </Button>
      </div>
    </Card>
  );
}
