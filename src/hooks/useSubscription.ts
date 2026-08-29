import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type SubStatus =
  | "trial"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired"
  | "suspended"
  | "none";

type Plan = {
  id: string;
  code: string;
  name: string;
  billing_interval: string;
  monthly_price: number;
  trial_days: number;
  usage_limit: number;
  product_type: string;
  features: string[] | string;
};

type Subscription = {
  id: string;
  status: string;
  started_at: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  plan: Plan | null;
};

export type SubscriptionState = {
  status: SubStatus;
  subscription: Subscription | null;
  plan: Plan | null;
  isPremium: boolean;
  isTrial: boolean;
  isExpired: boolean;
  trialDaysLeft: number;
  /** Premium features are accessible during an active sub or an unexpired trial. */
  canUsePremium: boolean;
};

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();

  return useQuery<SubscriptionState>({
    queryKey: ["subscription", user?.id],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, plan:ai_packages(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;

      const sub = data as unknown as Subscription | null;
      if (!sub) {
        return {
          status: "none",
          subscription: null,
          plan: null,
          isPremium: false,
          isTrial: false,
          isExpired: false,
          trialDaysLeft: 0,
          canUsePremium: false,
        };
      }

      const now = new Date();
      let effective: SubStatus = sub.status as SubStatus;
      if (sub.status === "trial" && sub.trial_ends_at && new Date(sub.trial_ends_at) < now) {
        effective = "expired";
      }
      if (sub.status === "active" && sub.current_period_end && new Date(sub.current_period_end) < now) {
        effective = "past_due";
      }

      const trialDaysLeft =
        effective === "trial" && sub.trial_ends_at
          ? Math.max(0, Math.ceil((new Date(sub.trial_ends_at).getTime() - now.getTime()) / 86400000))
          : 0;

      return {
        status: effective,
        subscription: sub,
        plan: sub.plan,
        isPremium: effective === "active",
        isTrial: effective === "trial",
        isExpired: effective === "expired" || effective === "none",
        trialDaysLeft,
        canUsePremium: effective === "active" || effective === "trial",
      };
    },
  });
}
