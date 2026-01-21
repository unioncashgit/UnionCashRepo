import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { Delete, Shield } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function SetupPasscodePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [passcode, setPasscode] = useState<string[]>(["", "", "", "", "", ""]);
  const [confirmPasscode, setConfirmPasscode] = useState<string[]>(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [isLoading, setIsLoading] = useState(false);

  const currentPasscode = step === "create" ? passcode : confirmPasscode;
  const setCurrentPasscode = step === "create" ? setPasscode : setConfirmPasscode;

  const handleDigitClick = (digit: string) => {
    const emptyIndex = currentPasscode.findIndex((d) => d === "");
    if (emptyIndex !== -1) {
      const newPasscode = [...currentPasscode];
      newPasscode[emptyIndex] = digit;
      setCurrentPasscode(newPasscode);

      if (emptyIndex === 5) {
        if (step === "create") {
          setStep("confirm");
        } else {
          submitPasscode(passcode.join(""), newPasscode.join(""));
        }
      }
    }
  };

  const handleDelete = () => {
    const filledIndex = currentPasscode.map((d) => d !== "").lastIndexOf(true);
    if (filledIndex !== -1) {
      const newPasscode = [...currentPasscode];
      newPasscode[filledIndex] = "";
      setCurrentPasscode(newPasscode);
    }
  };

  const submitPasscode = async (first: string, second: string) => {
    if (first !== second) {
      toast({
        variant: "destructive",
        title: "Passcodes Don't Match",
        description: "Please try again",
      });
      setPasscode(["", "", "", "", "", ""]);
      setConfirmPasscode(["", "", "", "", "", ""]);
      setStep("create");
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/set-passcode", { passcode: first });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Passcode Set",
        description: "Your wallet is now secured",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to set passcode",
      });
      setPasscode(["", "", "", "", "", ""]);
      setConfirmPasscode(["", "", "", "", "", ""]);
      setStep("create");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "confirm") {
      setConfirmPasscode(["", "", "", "", "", ""]);
      setStep("create");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 bg-card border-card-border">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-purple-600/30 blur-2xl rounded-full" />
              <div className="relative">
                <Logo size="lg" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Secure Your Wallet</span>
              </div>
              <h1 className="text-2xl font-bold">
                {step === "create" ? "Create Your Passcode" : "Confirm Your Passcode"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {step === "create"
                  ? "Enter a 6-digit passcode to secure your wallet"
                  : "Re-enter your passcode to confirm"}
              </p>
            </div>

            <div className="flex gap-3">
              {currentPasscode.map((digit, index) => (
                <div
                  key={index}
                  className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                    digit
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background"
                  }`}
                  data-testid={`passcode-digit-${index}`}
                >
                  {digit ? "●" : ""}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  size="lg"
                  className="h-16 text-xl font-semibold"
                  onClick={() => handleDigitClick(String(num))}
                  disabled={isLoading}
                  data-testid={`button-digit-${num}`}
                >
                  {num}
                </Button>
              ))}
              {step === "confirm" ? (
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-16 text-sm"
                  onClick={handleBack}
                  disabled={isLoading}
                  data-testid="button-back"
                >
                  Back
                </Button>
              ) : (
                <div />
              )}
              <Button
                variant="outline"
                size="lg"
                className="h-16 text-xl font-semibold"
                onClick={() => handleDigitClick("0")}
                disabled={isLoading}
                data-testid="button-digit-0"
              >
                0
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="h-16"
                onClick={handleDelete}
                disabled={isLoading}
                data-testid="button-delete"
              >
                <Delete className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <footer className="py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Union Cash. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
