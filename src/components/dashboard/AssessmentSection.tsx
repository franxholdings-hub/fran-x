import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { PanelSection, StatCard, Empty } from "@/components/admin/kit";
import { useSubscription } from "@/hooks/useSubscription";

// Mock assessment history — backend assessment engine is not yet available.
const HISTORY = [
  { date: "12 Aug 2026", score: 68, label: "Growth-ready" },
  { date: "04 Jun 2026", score: 54, label: "Early stage" },
];

export function AssessmentSection() {
  const sub = useSubscription();
  const [answers, setAnswers] = useState({ industry: "", revenue: "", challenge: "" });
  const [result, setResult] = useState<{ score: number; label: string } | null>(null);

  const runAssessment = () => {
    if (!answers.industry.trim() || !answers.challenge.trim()) {
      toast.error("Please answer the industry and key challenge fields.");
      return;
    }
    // Placeholder scoring — no real backend yet.
    const score = 58 + (answers.revenue.trim() ? 12 : 0);
    setResult({ score, label: score >= 70 ? "Scale-ready" : score >= 60 ? "Growth-ready" : "Early stage" });
    toast.success("Assessment completed (demo scoring).");
  };

  const canAssess = sub.data?.canUsePremium ?? true;

  return (
    <div className="space-y-6">
      <PanelSection
        title="Business Assessment"
        description="Get a snapshot of your business position and readiness. One assessment is included with Explorer."
      >
        {!canAssess ? (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
            <p className="font-medium text-primary">Upgrade to unlock full assessments</p>
            <p className="mt-1 text-muted-foreground">
              Your current plan includes one basic assessment. Upgrade for unlimited, in-depth assessments.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Industry / sector</Label>
              <Input className="mt-1" value={answers.industry} onChange={(e) => setAnswers({ ...answers, industry: e.target.value })} placeholder="e.g. Retail, Logistics" />
            </div>
            <div>
              <Label>Monthly revenue range</Label>
              <Input className="mt-1" value={answers.revenue} onChange={(e) => setAnswers({ ...answers, revenue: e.target.value })} placeholder="e.g. ₦500k–₦2M" />
            </div>
            <div className="sm:col-span-2">
              <Label>Key business challenge</Label>
              <Textarea className="mt-1" rows={3} value={answers.challenge} onChange={(e) => setAnswers({ ...answers, challenge: e.target.value })} placeholder="Describe your biggest current challenge" />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={runAssessment}>Start assessment</Button>
            </div>
          </div>
        )}
      </PanelSection>

      {result && (
        <PanelSection title="Your result" description="A demo business score based on your answers.">
          <div className="flex items-center gap-4">
            <div className="font-display text-4xl font-semibold text-primary">{result.score}</div>
            <div className="flex-1">
              <Badge variant="outline" className="border-primary/40 text-primary">{result.label}</Badge>
              <Progress className="mt-3" value={result.score} />
            </div>
          </div>
        </PanelSection>
      )}

      <PanelSection title="Assessment history" description="Your previous assessment results.">
        {HISTORY.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {HISTORY.map((h) => (
              <StatCard key={h.date} label={h.date} value={h.score} hint={h.label} />
            ))}
          </div>
        ) : (
          <Empty>No previous assessments yet.</Empty>
        )}
      </PanelSection>
    </div>
  );
}
