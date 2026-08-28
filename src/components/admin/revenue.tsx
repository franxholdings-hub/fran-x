import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, TrendingUp, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Empty, Loading, PanelSection, StatCard, toneForStatus } from "@/components/admin/kit";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  REVENUE_CATEGORIES,
  formatMoney,
} from "@/lib/ai-integration";
import { makeReference } from "@/lib/site";

type RevenueRow = {
  id: string;
  transaction_id: string;
  transacted_at: string;
  customer_name: string | null;
  customer_email: string | null;
  category: string;
  service_product: string | null;
  amount: number;
  currency: string;
  payment_method: string | null;
  paystack_reference: string | null;
  payment_status: string;
  related_type: string | null;
  related_id: string | null;
  notes: string | null;
};

type ExpenseRow = {
  id: string;
  incurred_at: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  vendor: string | null;
  notes: string | null;
};

export function Revenue() {
  return (
    <Tabs defaultValue="history">
      <TabsList className="mb-6 flex h-auto flex-wrap gap-1">
        <TabsTrigger value="history"><TrendingUp className="h-4 w-4" /> Revenue History</TabsTrigger>
        <TabsTrigger value="expenses"><Receipt className="h-4 w-4" /> Expenses</TabsTrigger>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
      </TabsList>
      <TabsContent value="history"><RevenueHistory /></TabsContent>
      <TabsContent value="expenses"><Expenses /></TabsContent>
      <TabsContent value="dashboard"><RevenueDashboard /></TabsContent>
    </Tabs>
  );
}

/* ---------------- Revenue history ---------------- */

function RevenueHistory() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [category, setCategory] = useState("all");

  const rows = useQuery({
    queryKey: ["revenue-history", category],
    queryFn: async () => {
      let q = supabase.from("revenue_history").select("*").order("transacted_at", { ascending: false }).limit(500);
      if (category !== "all") q = q.eq("category", category);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as RevenueRow[];
    },
  });

  const total = useMemo(
    () => (rows.data ?? []).filter((r) => r.payment_status === "completed").reduce((s, r) => s + Number(r.amount), 0),
    [rows.data],
  );

  return (
    <PanelSection
      title="Centralized Revenue History"
      description="The single permanent record of all FRAN-X revenue across every business unit. Records are never deleted."
      action={
        <Button onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Record Revenue
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {REVENUE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="outline" className={toneForStatus("completed")}>
          Completed total: {formatMoney(total)}
        </Badge>
      </div>

      {rows.isLoading ? (
        <Loading />
      ) : rows.data?.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Transaction ID</th>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Service</th>
                <th className="py-2 pr-3 text-right">Amount</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.data.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="py-2 pr-3 whitespace-nowrap">{new Date(r.transacted_at).toLocaleDateString()}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{r.transaction_id}</td>
                  <td className="py-2 pr-3">{r.customer_name ?? "—"}</td>
                  <td className="py-2 pr-3"><Badge variant="outline">{r.category}</Badge></td>
                  <td className="py-2 pr-3">{r.service_product ?? "—"}</td>
                  <td className="py-2 pr-3 text-right font-medium">{formatMoney(r.amount, r.currency)}</td>
                  <td className="py-2 pr-3"><Badge variant="outline" className={toneForStatus(r.payment_status)}>{r.payment_status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No revenue recorded yet.</Empty>
      )}

      {adding ? (
        <AddRevenueDialog
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            void qc.invalidateQueries({ queryKey: ["revenue-history"] });
            void qc.invalidateQueries({ queryKey: ["revenue-dashboard"] });
          }}
        />
      ) : null}
    </PanelSection>
  );
}

function AddRevenueDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth();
  const [transactedAt, setTransactedAt] = useState(new Date().toISOString().slice(0, 10));
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [cat, setCat] = useState("Other");
  const [serviceProduct, setServiceProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [paystackRef, setPaystackRef] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("completed");
  const [notes, setNotes] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      const amt = Number(amount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount.");
      const transaction_id = makeReference("FXR");
      const { error } = await supabase.from("revenue_history").insert({
        transaction_id,
        transacted_at: transactedAt,
        customer_name: customerName.trim() || null,
        customer_email: customerEmail.trim() || null,
        category: cat,
        service_product: serviceProduct.trim() || null,
        amount: amt,
        currency,
        payment_method: paymentMethod,
        paystack_reference: paystackRef.trim() || null,
        payment_status: paymentStatus,
        notes: notes.trim() || null,
      } as never);
      if (error) throw error;
      await supabase.from("audit_log").insert({
        actor_id: user?.id ?? null,
        actor_email: user?.email ?? null,
        action: "revenue.insert",
        entity: "revenue_history",
        entity_id: transaction_id,
      } as never);
    },
    onSuccess: () => {
      toast.success("Revenue recorded");
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record revenue</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Date</Label>
            <Input className="mt-1" type="date" value={transactedAt} onChange={(e) => setTransactedAt(e.target.value)} />
          </div>
          <div>
            <Label>Amount</Label>
            <Input className="mt-1" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label>Currency</Label>
            <Input className="mt-1" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {REVENUE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Customer name</Label>
            <Input className="mt-1" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div>
            <Label>Customer email</Label>
            <Input className="mt-1" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Service / product</Label>
            <Input className="mt-1" value={serviceProduct} onChange={(e) => setServiceProduct(e.target.value)} />
          </div>
          <div>
            <Label>Payment method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Payment status</Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Paystack reference (optional)</Label>
            <Input className="mt-1" value={paystackRef} onChange={(e) => setPaystackRef(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Notes</Label>
            <Textarea className="mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending}>Record</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Expenses ---------------- */

function Expenses() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);

  const rows = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("incurred_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as unknown as ExpenseRow[];
    },
  });

  const total = useMemo(() => (rows.data ?? []).reduce((s, r) => s + Number(r.amount), 0), [rows.data]);

  return (
    <PanelSection
      title="Expenses"
      description="Track operating costs — AI/API, hosting, software, marketing and more — to calculate true profit."
      action={
        <Button onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      }
    >
      <Badge variant="outline" className="mb-4">Total expenses: {formatMoney(total)}</Badge>
      {rows.isLoading ? (
        <Loading />
      ) : rows.data?.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Description</th>
                <th className="py-2 pr-3">Vendor</th>
                <th className="py-2 pr-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.data.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="py-2 pr-3 whitespace-nowrap">{new Date(r.incurred_at).toLocaleDateString()}</td>
                  <td className="py-2 pr-3"><Badge variant="outline">{r.category}</Badge></td>
                  <td className="py-2 pr-3">{r.description}</td>
                  <td className="py-2 pr-3">{r.vendor ?? "—"}</td>
                  <td className="py-2 pr-3 text-right font-medium">{formatMoney(r.amount, r.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No expenses recorded yet.</Empty>
      )}
      {adding ? (
        <AddExpenseDialog
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            void qc.invalidateQueries({ queryKey: ["expenses"] });
            void qc.invalidateQueries({ queryKey: ["revenue-dashboard"] });
          }}
        />
      ) : null}
    </PanelSection>
  );
}

function AddExpenseDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth();
  const [incurredAt, setIncurredAt] = useState(new Date().toISOString().slice(0, 10));
  const [cat, setCat] = useState("Operations");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [vendor, setVendor] = useState("");
  const [notes, setNotes] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      const amt = Number(amount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount.");
      if (!description.trim()) throw new Error("Description is required.");
      const { error } = await supabase.from("expenses").insert({
        incurred_at: incurredAt,
        category: cat,
        description: description.trim(),
        amount: amt,
        currency,
        vendor: vendor.trim() || null,
        notes: notes.trim() || null,
      } as never);
      if (error) throw error;
      await supabase.from("audit_log").insert({
        actor_id: user?.id ?? null,
        actor_email: user?.email ?? null,
        action: "expense.insert",
        entity: "expenses",
      } as never);
    },
    onSuccess: () => {
      toast.success("Expense recorded");
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Date</Label>
            <Input className="mt-1" type="date" value={incurredAt} onChange={(e) => setIncurredAt(e.target.value)} />
          </div>
          <div>
            <Label>Amount</Label>
            <Input className="mt-1" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label>Currency</Label>
            <Input className="mt-1" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Input className="mt-1" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Vendor</Label>
            <Input className="mt-1" value={vendor} onChange={(e) => setVendor(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Notes</Label>
            <Textarea className="mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Dashboard ---------------- */

function RevenueDashboard() {
  const data = useQuery({
    queryKey: ["revenue-dashboard"],
    queryFn: async () => {
      const { data: rev, error: e1 } = await supabase
        .from("revenue_history")
        .select("amount, currency, category, payment_status, transacted_at")
        .order("transacted_at", { ascending: false });
      if (e1) throw e1;
      const { data: exp, error: e2 } = await supabase
        .from("expenses")
        .select("amount, currency, category, incurred_at");
      if (e2) throw e2;
      const { count: activeSubs } = await supabase
        .from("ai_client_subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");
      return {
        revenue: (rev ?? []) as { amount: number; currency: string; category: string; payment_status: string; transacted_at: string }[],
        expenses: (exp ?? []) as { amount: number; currency: string; category: string; incurred_at: string }[],
        activeSubs: activeSubs ?? 0,
      };
    },
  });

  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const completed = data.data?.revenue.filter((r) => r.payment_status === "completed") ?? [];
    const sum = (rows: { amount: number; transacted_at: string }[], from: Date) =>
      rows.filter((r) => new Date(r.transacted_at) >= from).reduce((s, r) => s + Number(r.amount), 0);

    const allTime = completed.reduce((s, r) => s + Number(r.amount), 0);
    const byCategory = new Map<string, number>();
    for (const r of completed) byCategory.set(r.category, (byCategory.get(r.category) ?? 0) + Number(r.amount));

    const totalExpenses = (data.data?.expenses ?? []).reduce((s, r) => s + Number(r.amount), 0);
    const aiCost = (data.data?.expenses ?? []).filter((r) => r.category === "AI/API").reduce((s, r) => s + Number(r.amount), 0);

    // MRR: sum of active monthly subscriptions — approximated by recurring revenue this month.
    const monthRev = sum(completed, startOfMonth);
    return {
      today: sum(completed, startOfDay),
      week: sum(completed, startOfWeek),
      month: monthRev,
      year: sum(completed, startOfYear),
      allTime,
      byCategory: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
      totalExpenses,
      aiCost,
      net: monthRev - totalExpenses,
      activeSubs: data.data?.activeSubs ?? 0,
    };
  }, [data.data]);

  if (data.isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Today" value={formatMoney(stats.today)} />
        <StatCard label="This week" value={formatMoney(stats.week)} />
        <StatCard label="This month" value={formatMoney(stats.month)} />
        <StatCard label="This year" value={formatMoney(stats.year)} />
        <StatCard label="All-time revenue" value={formatMoney(stats.allTime)} />
        <StatCard label="Active subscriptions" value={stats.activeSubs} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PanelSection title="Revenue by category" description="Completed revenue split across FRAN-X business units.">
          {stats.byCategory.length ? (
            <ul className="space-y-2">
              {stats.byCategory.map(([cat, amt]) => (
                <li key={cat} className="flex items-center justify-between text-sm">
                  <span>{cat}</span>
                  <span className="font-medium">{formatMoney(amt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No completed revenue yet.</Empty>
          )}
        </PanelSection>

        <PanelSection title="Profit foundation" description="Revenue vs. costs. Profit is revenue minus all expenses.">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span>Gross revenue (this month)</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatMoney(stats.month)}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Total expenses</span>
              <span className="font-medium text-destructive">-{formatMoney(stats.totalExpenses)}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Estimated AI cost</span>
              <span className="font-medium text-muted-foreground">{formatMoney(stats.aiCost)}</span>
            </li>
            <li className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="font-semibold">Net operating result</span>
              <span className={`font-display text-lg font-semibold ${stats.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                {formatMoney(stats.net)}
              </span>
            </li>
          </ul>
        </PanelSection>
      </div>
    </div>
  );
}
