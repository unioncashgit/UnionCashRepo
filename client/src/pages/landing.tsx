import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, Shield, Wallet, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 bg-card border-card-border">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-purple-600/30 blur-2xl rounded-full" />
              <div className="relative">
                <Logo size="lg" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                  Union Cash
                </span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage your fiat and crypto assets in one secure digital wallet
              </p>
            </div>

            <div className="w-full space-y-3">
              <a href="/api/login" className="block w-full">
                <Button 
                  size="lg" 
                  className="w-full" 
                  data-testid="button-login"
                >
                  Sign In / Sign Up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t border-border">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Multi-Currency</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Instant Transfer</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Bank-Grade Security</span>
              </div>
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
