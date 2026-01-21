import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { Delete, LogOut } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function PasscodePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [passcode, setPasscode] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitClick = (digit: string) => {
    const emptyIndex = passcode.findIndex((d) => d === "");
    if (emptyIndex !== -1) {
      const newPasscode = [...passcode];
      newPasscode[emptyIndex] = digit;
      setPasscode(newPasscode);

      if (emptyIndex === 5) {
        verifyPasscode(newPasscode.join(""));
      }
    }
  };

  const handleDelete = () => {
    const filledIndex = passcode.map((d) => d !== "").lastIndexOf(true);
    if (filledIndex !== -1) {
      const newPasscode = [...passcode];
      newPasscode[filledIndex] = "";
      setPasscode(newPasscode);
    }
  };

  const verifyPasscode = async (code: string) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/verify-passcode", { passcode: code });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Invalid Passcode",
        description: "Please try again",
      });
      setPasscode(["", "", "", "", "", ""]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setLocation("/login");
    } catch (error) {
      setLocation("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
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
              <h1 className="text-2xl font-bold">Enter Your Passcode</h1>
              <p className="text-muted-foreground text-sm">
                Enter your 6-digit passcode to unlock
              </p>
            </div>

            <div className="flex gap-3">
              {passcode.map((digit, index) => (
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
              <div />
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
