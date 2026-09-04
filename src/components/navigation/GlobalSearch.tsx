import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Home,
  Compass,
  Bot,
  LayoutDashboard,
  Info,
  Briefcase,
  CreditCard,
  Wrench,
  Mail,
  Bell,
  Heart,
  MessageSquare,
  UserRound,
  Settings,
  HelpCircle,
  FileText,
  LogOut,
  LogIn,
  ShieldCheck,
  Moon,
  type LucideIcon,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useAuth } from "@/hooks/useAuth";

type SearchResult = {
  id: string;
  label: string;
  icon?: LucideIcon;
  group: string;
  to?: string;
  hash?: string;
  action?: "frix" | "signout" | "theme";
  keywords?: string;
};

const RECENT_KEY = "franx.search.recent";
const MAX_RECENT = 5;

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  // Keyboard shortcut: Ctrl+K / ⌘+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Listen for custom open event (from sidebar / mobile header)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("franx:search:open", handler);
    return () => window.removeEventListener("franx:search:open", handler);
  }, []);

  const go = useCallback(
    (result: SearchResult) => {
      setOpen(false);

      // Store recent
      try {
        const stored = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
        const next = [result.id, ...stored.filter((id) => id !== result.id)].slice(0, MAX_RECENT);
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }

      if (result.action === "frix") {
        window.dispatchEvent(new CustomEvent("frix:open"));
      } else if (result.action === "signout") {
        void signOut();
        void navigate({ to: "/", replace: true });
      } else if (result.action === "theme") {
        document.documentElement.classList.toggle("dark");
      } else if (result.to) {
        void navigate({ to: result.to, hash: result.hash });
      }
    },
    [navigate, signOut],
  );

  // Build searchable items
  const allItems = useMemo<SearchResult[]>(() => {
    const pages: SearchResult[] = [
      { id: "page-home", label: "Home", icon: Home, group: "Pages", to: "/", keywords: "home main landing" },
      { id: "page-frix", label: "FRIX AI", icon: Bot, group: "Pages", to: "/frix-ai", keywords: "frix ai assistant chat" },
      { id: "page-services", label: "Services", icon: Briefcase, group: "Pages", to: "/services", keywords: "services web development mobile app ai automation data software" },
      { id: "page-solutions", label: "Solutions", icon: Compass, group: "Pages", to: "/solutions", keywords: "solutions business problems" },
      { id: "page-store", label: "Digital Products", icon: FileText, group: "Pages", to: "/store", keywords: "digital products store ebooks templates guides finance resources downloads" },
      { id: "page-pricing", label: "Pricing", icon: CreditCard, group: "Pages", to: "/pricing", keywords: "pricing plans subscription" },
      { id: "page-about", label: "About", icon: Info, group: "Pages", to: "/about", keywords: "about company founder vision mission" },
      { id: "page-contact", label: "Contact", icon: Mail, group: "Pages", to: "/contact", keywords: "contact inquiry email phone" },
      { id: "page-request", label: "Start a Project", icon: Wrench, group: "Pages", to: "/request", keywords: "start project request build website app" },
      { id: "page-terms", label: "Terms & Policies", icon: FileText, group: "Pages", to: "/legal/terms", keywords: "terms legal policies privacy cookies" },
    ];

    const actions: SearchResult[] = [
      { id: "action-frix", label: "Ask FRIX AI", icon: Bot, group: "Quick Actions", action: "frix", keywords: "frix ai chat assistant help" },
      { id: "action-theme", label: "Toggle theme", icon: Moon, group: "Quick Actions", action: "theme", keywords: "theme dark light mode appearance" },
    ];

    const authItems: SearchResult[] = user
      ? [
          { id: "auth-dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Account", to: "/portal", keywords: "dashboard portal workspace" },
          { id: "auth-notifications", label: "Notifications", icon: Bell, group: "Account", to: "/portal", hash: "notifications", keywords: "notifications alerts" },
          { id: "auth-saved", label: "Saved", icon: Heart, group: "Account", to: "/portal", hash: "saved", keywords: "saved favorites bookmarks" },
          { id: "auth-messages", label: "Messages", icon: MessageSquare, group: "Account", to: "/portal", hash: "inquiries", keywords: "messages inquiries" },
          { id: "auth-profile", label: "Profile", icon: UserRound, group: "Account", to: "/portal", hash: "profile", keywords: "profile account" },
          { id: "auth-settings", label: "Settings", icon: Settings, group: "Account", to: "/portal", hash: "settings", keywords: "settings preferences" },
          { id: "auth-signout", label: "Sign out", icon: LogOut, group: "Account", action: "signout", keywords: "sign out logout" },
        ]
      : [
          { id: "auth-signin", label: "Sign in", icon: LogIn, group: "Account", to: "/auth", keywords: "sign in login register auth" },
        ];

    const adminItems: SearchResult[] = isAdmin
      ? [{ id: "admin-panel", label: "Admin Panel", icon: ShieldCheck, group: "Account", to: "/admin", keywords: "admin panel dashboard" }]
      : [];

    return [...pages, ...actions, ...authItems, ...adminItems];
  }, [user, isAdmin]);

  // Recent searches
  const [recentIds, setRecentIds] = useState<string[]>([]);
  useEffect(() => {
    if (open) {
      try {
        setRecentIds(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"));
      } catch {
        setRecentIds([]);
      }
    }
  }, [open]);

  const recentItems = useMemo(
    () => recentIds.map((id) => allItems.find((item) => item.id === id)).filter(Boolean) as SearchResult[],
    [recentIds, allItems],
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search FRAN-X — pages, actions…" />
      <CommandList>
        <CommandEmpty>No results found. Try a different search term.</CommandEmpty>

        {recentItems.length > 0 && (
          <CommandGroup heading="Recent">
            {recentItems.map((item) => (
              <CommandItem key={item.id} onSelect={() => go(item)}>
                {item.icon ? <item.icon /> : <Search />}
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Pages">
          {allItems
            .filter((i) => i.group === "Pages")
            .map((item) => (
              <CommandItem key={item.id} onSelect={() => go(item)}>
                {item.icon && <item.icon />}
                {item.label}
              </CommandItem>
            ))}
        </CommandGroup>

        <CommandGroup heading="Quick Actions">
          {allItems
            .filter((i) => i.group === "Quick Actions")
            .map((item) => (
              <CommandItem key={item.id} onSelect={() => go(item)}>
                {item.icon && <item.icon />}
                {item.label}
              </CommandItem>
            ))}
        </CommandGroup>

        {allItems.some((i) => i.group === "Account") && (
          <CommandGroup heading="Account">
            {allItems
              .filter((i) => i.group === "Account")
              .map((item) => (
                <CommandItem key={item.id} onSelect={() => go(item)}>
                  {item.icon && <item.icon />}
                  {item.label}
                </CommandItem>
              ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
