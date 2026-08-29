import { useNavigate } from "@tanstack/react-router";
import { Lock, Bell, Shield, Eye, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PanelSection } from "@/components/admin/kit";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function SettingsSection() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    toast.success("Signed out");
    void navigate({ to: "/", replace: true });
  };

  return (
    <div className="space-y-6">
      <PanelSection title="Account settings" description="Manage your account details.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Email</Label>
            <Input className="mt-1" value={user?.email ?? ""} readOnly />
          </div>
          <div>
            <Label>Language</Label>
            <Input className="mt-1" defaultValue="English" readOnly />
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Notification preferences" description="Choose what FRAN-X notifies you about.">
        <div className="space-y-3">
          <Pref icon={Bell} label="Inquiry updates" desc="When your requests change status." defaultChecked />
          <Pref icon={Eye} label="Opportunity alerts" desc="New and price-changed opportunities." defaultChecked />
          <Pref icon={Shield} label="System announcements" desc="Product and policy updates." />
        </div>
      </PanelSection>

      <PanelSection title="Security" description="Protect your account.">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-4 py-3">
            <span className="flex items-center gap-3 text-sm"><Lock className="h-4 w-4 text-primary" /> Change password</span>
            <Button size="sm" variant="outline" onClick={() => toast.message("Password reset link will be emailed.")}>
              Send reset link
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-4 py-3">
            <span className="flex items-center gap-3 text-sm"><Shield className="h-4 w-4 text-primary" /> Two-factor authentication</span>
            <Switch disabled />
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Privacy" description="Control your data and visibility.">
        <div className="space-y-3">
          <Pref icon={Eye} label="Public profile" desc="Show your name on community surfaces." />
          <Pref icon={Lock} label="Activity tracking" desc="Allow FRAN-X to personalize your dashboard." defaultChecked />
        </div>
      </PanelSection>

      <PanelSection title="Session" description="End your FRAN-X session on this device.">
        <Button variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </PanelSection>
    </div>
  );
}

function Pref({ icon: Icon, label, desc, defaultChecked }: { icon: typeof Bell; label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-4 py-3">
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-primary" />
        <span>
          <span className="block text-sm font-medium">{label}</span>
          <span className="block text-xs text-muted-foreground">{desc}</span>
        </span>
      </span>
      <Switch defaultChecked={defaultChecked} />
    </label>
  );
}
