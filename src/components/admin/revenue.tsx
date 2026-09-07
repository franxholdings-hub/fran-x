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

type Txn = {
  id: string;
  amount: number;
  currency: string;
  category: string;
  payment_status: string;
  transacted_at: string;
  service_product: string | null;
  customer_name: string | null;
  transaction_id: string;
};

function RevenueDashboard() {
  const [range, setRange] = useState<"6M" | "1Y" | "All">("6M");

  const data = useQuery({
    queryKey: ["revenue-dashboard"],
    queryFn: async () => {
      const { data: rev, error } = await supabase
        .from("revenue_history")
        .select("id, transaction_id, amount, currency, category, payment_status, transacted_at, service_product, customer_name")
        .order("transacted_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      const { count: activeSubs } = await supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");
      return { revenue: (rev ?? []) as unknown as Txn[], activeSubs: activeSubs ?? 0 };
    },
  });

  const completed = useMemo(
    () => (data.data?.revenue ?? []).filter((r) => r.payment_status === "completed"),
    [data.data],
  );

  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const total = completed.reduce((s, r) => s + Number(r.amount), 0);
    const thisMonth = completed
      .filter((r) => new Date(r.transacted_at) >= startOfMonth)
      .reduce((s, r) => s + Number(r.amount), 0);
    const lastMonth = completed
      .filter((r) => {
        const d = new Date(r.transacted_at);
        return d >= prevStart && d < startOfMonth;
      })
      .reduce((s, r) => s + Number(r.amount), 0);
    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null;
    const avg = completed.length ? total / completed.length : 0;
    return {
      total,
      thisMonth,
      growth,
      avg,
      count: completed.length,
      activeSubs: data.data?.activeSubs ?? 0,
    };
  }, [completed, data.data]);

  const series = useMemo(() => {
    const months = range === "6M" ? 6 : range === "1Y" ? 12 : 24;
    const now = new Date();
    const buckets: { label: string; key: string; value: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        label: d.toLocaleDateString("en-NG", { month: "short" }),
        key: `${d.getFullYear()}-${d.getMonth()}`,
        value: 0,
      });
    }
    for (const r of completed) {
      const d = new Date(r.transacted_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const b = buckets.find((x) => x.key === key);
      if (b) b.value += Number(r.amount);
    }
    return buckets;
  }, [completed, range]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of completed) map.set(r.category, (map.get(r.category) ?? 0) + Number(r.amount));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [completed]);

  const maxCat = byCategory[0]?.[1] ?? 0;

  if (data.isLoading) return <Loading />;

  return (
    <div className="dark space-y-4 rounded-2xl border border-border bg-background p-4 text-foreground sm:p-6">
      <div>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Revenue Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Live figures from verified transactions only.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Revenue" value={formatMoney(stats.total)} delta={stats.growth} />
        <MetricCard label="Transactions" value={String(stats.count)} />
        <MetricCard label="Active subscriptions" value={String(stats.activeSubs)} />
        <MetricCard label="Avg transaction" value={formatMoney(Math.round(stats.avg))} />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold">Revenue</h3>
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            {(["6M", "1Y", "All"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                  range === r ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v: number) => (v >= 1000 ? `₦${Math.round(v / 1000)}k` : `₦${v}`)}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  color: "var(--foreground)",
                  fontSize: 12,
                }}
                formatter={(v: number) => [formatMoney(v), "Revenue"]}
              />
              <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#goldFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h3 className="mb-4 font-display text-base font-semibold">Revenue by category</h3>
        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            {byCategory.length ? (
              byCategory.map(([cat, amt]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-xs text-muted-foreground">{cat}</span>
                  <div className="h-4 flex-1 overflow-hidden rounded-sm bg-surface">
                    <div
                      className="h-full rounded-sm bg-primary"
                      style={{ width: `${maxCat ? Math.max(4, (amt / maxCat) * 100) : 0}%` }}
                    />
                  </div>
                  <span className="w-24 shrink-0 text-right text-xs font-medium">{formatMoney(amt)}</span>
                </div>
              ))
            ) : (
              <Empty>No completed revenue yet.</Empty>
            )}
          </div>
          <div className="lg:w-48 lg:border-l lg:border-border lg:pl-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total revenue</p>
            <p className="mt-1 font-display text-2xl font-semibold">{formatMoney(stats.total)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatMoney(stats.thisMonth)} this month
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h3 className="mb-4 font-display text-base font-semibold">Latest transactions</h3>
        {completed.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Item</th>
                  <th className="py-2 pr-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {completed.slice(0, 10).map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="py-2 pr-3 whitespace-nowrap text-xs">{new Date(r.transacted_at).toLocaleDateString()}</td>
                    <td className="py-2 pr-3">{r.customer_name ?? "—"}</td>
                    <td className="py-2 pr-3"><Badge variant="outline" className="border-primary/40 text-primary">{r.category}</Badge></td>
                    <td className="py-2 pr-3">{r.service_product ?? "—"}</td>
                    <td className="py-2 pr-3 text-right font-medium">{formatMoney(r.amount, r.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No transactions yet.</Empty>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, delta }: { label: string; value: string; delta?: number | null }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <span className="grid h-9 w-9 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
        <CircleDollarSign className="h-[1.05rem] w-[1.05rem]" />
      </span>
      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
      {delta != null && Number.isFinite(delta) ? (
        <p className={`mt-1 flex items-center gap-1 text-xs ${delta >= 0 ? "text-emerald-400" : "text-destructive"}`}>
          {delta >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {Math.abs(delta).toFixed(1)}% vs last month
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">&nbsp;</p>
      )}
    </div>
  );
}
