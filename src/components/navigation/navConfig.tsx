import {
  Home,
  Bot,
  Briefcase,
  Lightbulb,
  Package,
  CreditCard,
  Info,
  Mail,
  Bell,
  Heart,
  MessageSquare,
  LayoutDashboard,
  UserRound,
  Settings,
  HelpCircle,
  FileText,
  LogOut,
  LogIn,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type NavAction = "frix" | "signout";

export type NavItem = {
  to?: string;
  hash?: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  authOnly?: boolean;
  guestOnly?: boolean;
  adminOnly?: boolean;
  action?: NavAction;
};

/** Primary navigation — always visible in the sidebar */
export const PRIMARY_NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/frix-ai", label: "FRIX AI", icon: Bot },
  { to: "/services", label: "Services", icon: Briefcase },
  { to: "/store", label: "Digital Products", icon: Package },
  { to: "/solutions", label: "Solutions", icon: Lightbulb },
  { to: "/pricing", label: "Pricing", icon: CreditCard },
  { to: "/about", label: "About", icon: Info },
  { to: "/contact", label: "Contact", icon: Mail },
  { to: "/portal", label: "Dashboard", icon: LayoutDashboard, authOnly: true },
];

/** Authenticated user shortcuts — visible when logged in */
export const AUTH_NAV: NavItem[] = [
  { to: "/portal", hash: "notifications", label: "Notifications", icon: Bell, authOnly: true },
  { to: "/portal", hash: "library", label: "My Digital Products", icon: Package, authOnly: true },
  { to: "/portal", hash: "inquiries", label: "Messages", icon: MessageSquare, authOnly: true },
  { to: "/portal", hash: "profile", label: "Profile", icon: UserRound, authOnly: true },
];

/** Secondary navigation — marketing pages */
export const SECONDARY_NAV: NavItem[] = [
  { to: "/about", label: "About", icon: Info },
  { to: "/services", label: "Services", icon: Briefcase },
  { to: "/solutions", label: "Solutions", icon: Lightbulb },
  { to: "/pricing", label: "Pricing", icon: CreditCard },
  { to: "/store", label: "Digital Products", icon: Package },
  { to: "/contact", label: "Contact", icon: Mail },
];

/** Footer items — settings, help, policies, auth */
export const FOOTER_NAV: NavItem[] = [
  { to: "/portal", hash: "settings", label: "Settings", icon: Settings, authOnly: true },
  { to: "/admin", label: "Admin Panel", icon: ShieldCheck, adminOnly: true },
  { to: "/contact", label: "Help & Support", icon: HelpCircle },
  { to: "/legal/terms", label: "Terms / Policies", icon: FileText },
  { label: "Sign out", icon: LogOut, action: "signout", authOnly: true },
  { to: "/auth", label: "Sign in", icon: LogIn, guestOnly: true },
];

/** Mobile bottom navigation — 4 primary touch targets */
export const MOBILE_BOTTOM_NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/services", label: "Services", icon: Briefcase },
  { to: "/frix-ai", label: "FRIX AI", icon: Bot },
  { to: "/contact", label: "Contact", icon: Mail },
];

/** All items for the mobile "More" sheet */
export const MORE_NAV: NavItem[] = [
  { to: "/portal", label: "Dashboard", icon: LayoutDashboard, authOnly: true },
  { to: "/portal", hash: "profile", label: "Profile", icon: UserRound, authOnly: true },
  { to: "/portal", hash: "settings", label: "Settings", icon: Settings, authOnly: true },
  { to: "/admin", label: "Admin Panel", icon: ShieldCheck, adminOnly: true },
  { to: "/about", label: "About", icon: Info },
  { to: "/services", label: "Services", icon: Briefcase },
  { to: "/store", label: "Digital Products", icon: Package },
  { to: "/solutions", label: "Solutions", icon: Lightbulb },
  { to: "/pricing", label: "Pricing", icon: CreditCard },
  { to: "/contact", label: "Contact", icon: Mail },
  { to: "/legal/terms", label: "Terms / Policies", icon: FileText },
  { label: "Sign out", icon: LogOut, action: "signout", authOnly: true },
  { to: "/auth", label: "Sign in", icon: LogIn, guestOnly: true },
];

/** Quick CTA buttons shown in sidebar / more sheet */
export const CTA_ITEMS = [
  { to: "/request", label: "Start a Project" },
  { to: "/frix-ai", label: "Try FRIX AI" },
] as const;
