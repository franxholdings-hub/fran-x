import { LogoSplice } from "@/components/site/Logo";

export function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-veil absolute inset-0" />
      <LogoSplice />
      <div
        className="grid-drift absolute inset-x-0 -top-1/2 h-[200%] opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(70% 55% at 50% 35%, black, transparent)",
          WebkitMaskImage: "radial-gradient(70% 55% at 50% 35%, black, transparent)",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="fx-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.55" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="text-primary" stroke="url(#fx-line)" strokeWidth="1" fill="none">
          <path d="M-50 460 C 250 380, 380 200, 620 210 S 1000 330, 1260 240" />
          <path d="M-50 520 C 300 470, 480 300, 700 300 S 1050 400, 1260 320" />
          <path d="M-50 380 C 220 330, 420 120, 660 140 S 980 250, 1260 170" />
        </g>
        <g className="text-primary" fill="currentColor">
          {[
            [200, 402],
            [620, 210],
            [880, 268],
            [420, 300],
            [1040, 196],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" opacity="0.85" />
          ))}
        </g>
      </svg>
      <div className="absolute -top-32 left-1/2 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
    </div>
  );
}