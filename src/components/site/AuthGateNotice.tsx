import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LockKeyhole } from "lucide-react";

export function AuthGateNotice({ action }: { action: string }) {
  return (
    <div className="glass-panel rounded-xl p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/40 text-primary">
          <LockKeyhole className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold">Create an account to {action}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Registering lets you track your inquiry, receive proposals and chat directly with the
            FRAN-X team from your client portal.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/auth">Register / Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">Other ways to reach us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}