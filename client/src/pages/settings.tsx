import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/components/theme-provider";
import {
  Settings,
  User,
  Palette,
  Globe,
  LogOut,
  Moon,
  Sun,
  HelpCircle,
  FileText,
} from "lucide-react";
import type { UserPreferences } from "@shared/schema";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const { data: preferences, isLoading } = useQuery<UserPreferences>({
    queryKey: ["/api/preferences"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<UserPreferences>) => {
      return apiRequest("PATCH", "/api/preferences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
      toast({ title: "Success", description: "Settings updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" });
    },
  });

  const getInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getDisplayName = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </h3>
        <Card className="p-6 bg-card border-card-border">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="text-xl font-semibold" data-testid="text-profile-name">
                {getDisplayName(user)}
              </h4>
              <p className="text-muted-foreground" data-testid="text-profile-email">
                {user?.email || "No email"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Appearance
        </h3>
        <Card className="p-6 bg-card border-card-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 text-primary" />
                ) : (
                  <Sun className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <h4 className="font-semibold">Dark Mode</h4>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              data-testid="switch-dark-mode"
            />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Preferences
        </h3>
        <Card className="p-6 bg-card border-card-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-semibold">Default Currency</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred display currency
              </p>
            </div>
            <Select
              value={preferences?.currency || "USD"}
              onValueChange={(value) => updateMutation.mutate({ currency: value })}
            >
              <SelectTrigger className="w-32" data-testid="select-currency-preference">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="IDR">IDR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-semibold">Language</Label>
              <p className="text-sm text-muted-foreground">
                Select your preferred language
              </p>
            </div>
            <Select
              value={preferences?.language || "en"}
              onValueChange={(value) => updateMutation.mutate({ language: value })}
            >
              <SelectTrigger className="w-32" data-testid="select-language-preference">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="id">Indonesia</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Other
        </h3>
        <Card className="p-6 bg-card border-card-border space-y-4">
          <Button variant="ghost" className="w-full justify-start gap-3" data-testid="button-help">
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3" data-testid="button-terms">
            <FileText className="h-5 w-5" />
            Terms & Privacy Policy
          </Button>
          <hr className="border-border" />
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-500 hover:text-red-500 hover:bg-red-500/10"
            onClick={() => logout()}
            data-testid="button-logout-settings"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </Card>
      </div>
    </div>
  );
}
