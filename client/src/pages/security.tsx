import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Shield,
  Smartphone,
  Key,
  Bell,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import type { SecuritySettings } from "@shared/schema";

export default function SecurityPage() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<SecuritySettings>({
    queryKey: ["/api/security"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SecuritySettings>) => {
      return apiRequest("PATCH", "/api/security", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security"] });
      toast({ title: "Success", description: "Security settings updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" });
    },
  });

  const handleToggle = (key: keyof SecuritySettings, value: boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Security</h1>
          <p className="text-muted-foreground">Manage your account security settings</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const securityScore = [
    settings?.twoFactorEnabled,
    settings?.biometricEnabled,
    settings?.transactionNotifications,
    settings?.loginNotifications,
  ].filter(Boolean).length;

  const scoreColor =
    securityScore >= 3 ? "text-green-500" : securityScore >= 2 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-muted-foreground">Manage your account security settings</p>
      </div>

      <Card className="p-6 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-purple-600/10 border-0">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold">Security Score</h2>
              <Badge
                variant={securityScore >= 3 ? "default" : securityScore >= 2 ? "secondary" : "destructive"}
              >
                {securityScore >= 3 ? "Strong" : securityScore >= 2 ? "Good" : "Weak"}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <p className={`text-3xl font-bold ${scoreColor}`} data-testid="text-security-score">
                {securityScore}/4
              </p>
              <p className="text-sm text-muted-foreground">
                {securityScore >= 3
                  ? "Your account is well protected"
                  : "Enable more security features to protect your account"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Authentication</h3>

        <Card className="p-6 bg-card border-card-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">Two-Factor Authentication</h4>
                  {settings?.twoFactorEnabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Add an extra layer of security with 2FA authentication
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.twoFactorEnabled || false}
              onCheckedChange={(checked) => handleToggle("twoFactorEnabled", checked)}
              disabled={updateMutation.isPending}
              data-testid="switch-2fa"
            />
          </div>
        </Card>

        <Card className="p-6 bg-card border-card-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">Biometric Login</h4>
                  {settings?.biometricEnabled && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Use fingerprint or face recognition to sign in
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.biometricEnabled || false}
              onCheckedChange={(checked) => handleToggle("biometricEnabled", checked)}
              disabled={updateMutation.isPending}
              data-testid="switch-biometric"
            />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notifications</h3>

        <Card className="p-6 bg-card border-card-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Bell className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold">Transaction Notifications</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Get notified when you send or receive money
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.transactionNotifications || false}
              onCheckedChange={(checked) => handleToggle("transactionNotifications", checked)}
              disabled={updateMutation.isPending}
              data-testid="switch-transaction-notifications"
            />
          </div>
        </Card>

        <Card className="p-6 bg-card border-card-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold">Login Notifications</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive alerts when your account is accessed
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.loginNotifications || false}
              onCheckedChange={(checked) => handleToggle("loginNotifications", checked)}
              disabled={updateMutation.isPending}
              data-testid="switch-login-notifications"
            />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Card className="p-6 bg-card border-card-border">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-sm">Last login</p>
                <p className="text-xs text-muted-foreground">Today at {new Date().toLocaleTimeString()}</p>
              </div>
              <Badge variant="outline" className="text-xs">Current Session</Badge>
            </div>
            <Button variant="outline" className="w-full" data-testid="button-sign-out-all">
              Sign Out All Other Sessions
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
