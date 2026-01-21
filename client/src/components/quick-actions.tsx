import { Button } from "@/components/ui/button";
import { Send, Download, Plus, HandCoins } from "lucide-react";

interface QuickActionsProps {
  onSend: () => void;
  onReceive: () => void;
  onTopUp: () => void;
  onRequest: () => void;
}

export function QuickActions({ onSend, onReceive, onTopUp, onRequest }: QuickActionsProps) {
  const actions = [
    { label: "Send", icon: Send, onClick: onSend, variant: "default" as const },
    { label: "Receive", icon: Download, onClick: onReceive, variant: "secondary" as const },
    { label: "Top Up", icon: Plus, onClick: onTopUp, variant: "secondary" as const },
    { label: "Request", icon: HandCoins, onClick: onRequest, variant: "secondary" as const },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          className="h-auto flex-col gap-2 py-6 rounded-xl"
          onClick={action.onClick}
          data-testid={`button-${action.label.toLowerCase().replace(" ", "-")}`}
        >
          <div className="h-10 w-10 rounded-full bg-background/20 flex items-center justify-center">
            <action.icon className="h-5 w-5" />
          </div>
          <span className="font-medium">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
