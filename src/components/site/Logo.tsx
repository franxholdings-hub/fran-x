import { cn } from "@/lib/utils";
import mark from "@/assets/franx-mark.png.asset.json";
import full from "@/assets/franx-logo.png.asset.json";

export const LOGO_MARK_URL = mark.url;
export const LOGO_FULL_URL = full.url;

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={mark.url}
      alt="FRAN-X Technologies emblem"
      width={512}
      height={512}
      className={cn("h-9 w-9 object-contain", className)}
    />
  );
}

export function LogoLockup({ className, subtitle = "AI · Software · Automation" }: { className?: string; subtitle?: string | null }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <LogoMark />
      <span className="min-w-0">
        <span className="block truncate font-display text-sm font-semibold tracking-tight">
          FRAN-X <span className="text-metal">TECHNOLOGIES</span>
        </span>
        {subtitle ? (
          <span className="hidden text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:block">
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}

/** Large logo watermark rendered as a spliced/scanline motif behind hero sections. */
export function LogoSplice({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className="absolute -right-16 top-1/2 h-[36rem] w-[36rem] -translate-y-1/2 opacity-[0.07] dark:opacity-[0.12]"
        style={{
          backgroundImage: `url(${mark.url})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          maskImage:
            "repeating-linear-gradient(115deg, black 0px, black 9px, transparent 9px, transparent 15px)",
          WebkitMaskImage:
            "repeating-linear-gradient(115deg, black 0px, black 9px, transparent 9px, transparent 15px)",
        }}
      />
      <div
        className="absolute -left-24 -top-24 h-[26rem] w-[26rem] opacity-[0.05] dark:opacity-[0.09]"
        style={{
          backgroundImage: `url(${mark.url})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          maskImage: "repeating-linear-gradient(65deg, black 0px, black 6px, transparent 6px, transparent 14px)",
          WebkitMaskImage: "repeating-linear-gradient(65deg, black 0px, black 6px, transparent 6px, transparent 14px)",
        }}
      />
    </div>
  );
}
