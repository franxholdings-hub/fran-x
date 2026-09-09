// Client helper: securely download a purchased digital product as PDF, Word
// or plain text and save it in the browser. The server re-verifies ownership
// before returning the document.

export async function downloadProductFile(
  slug: string,
  name: string,
  format: "pdf" | "doc" | "txt",
): Promise<void> {
  const { supabase } = await import("@/integrations/supabase/client");
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch("/api/store/download-file", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ""}`,
    },
    body: JSON.stringify({ slug, format }),
  });

  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error || "Download failed.");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/[^\w\- ]+/g, "").trim() || slug}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
