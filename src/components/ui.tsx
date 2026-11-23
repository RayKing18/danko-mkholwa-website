import Link from "next/link";
import type { ReactNode } from "react";
import { formatZAR } from "@/lib/utils";

// ---- Buttons --------------------------------------------------------
type Variant = "primary" | "secondary" | "ghost" | "whatsapp" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/40";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-sun to-gold text-ink shadow-gold hover:from-sun hover:to-sun",
  secondary:
    "border-2 border-gold text-gold hover:bg-gold hover:text-ink",
  ghost: "text-white/80 hover:bg-white/10 hover:text-white",
  whatsapp: "bg-[#25D366] text-ink hover:bg-[#3fe07d]",
  danger: "border border-brand-red/60 text-brand-red hover:bg-brand-red hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  external = false,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  external?: boolean;
}) {
  const cls = buttonClass(variant, size, className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

// ---- Geometric border (red / teal / gold triangles from the logo) ----
export function GeoBorder({ className = "" }: { className?: string }) {
  const colours = ["#e4432f", "#1ea48f", "#f3b400", "#ffffff"];
  const triangles = Array.from({ length: 24 }, (_, i) => i);
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 480 14"
      className={`h-3 w-full max-w-md ${className}`}
      preserveAspectRatio="none"
    >
      {triangles.map((i) => {
        const x = i * 20;
        const up = i % 2 === 0;
        const fill = colours[i % colours.length];
        return (
          <polygon
            key={i}
            fill={fill}
            points={up ? `${x},14 ${x + 10},0 ${x + 20},14` : `${x},0 ${x + 10},14 ${x + 20},0`}
          />
        );
      })}
    </svg>
  );
}

// ---- Section heading -------------------------------------------------
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  id?: string;
}) {
  const centre = align === "center";
  return (
    <div id={id} className={`mb-8 ${centre ? "mx-auto max-w-2xl text-center" : ""}`}>
      {eyebrow && (
        <p className="mb-2 font-script text-xl text-gold">{eyebrow}</p>
      )}
      <h2 className="font-display text-4xl leading-none text-white sm:text-5xl">
        {title}
      </h2>
      <GeoBorder className={`mt-3 ${centre ? "mx-auto" : ""}`} />
      {description && (
        <p className="mt-4 text-base text-white/70">{description}</p>
      )}
    </div>
  );
}

// ---- Small bits -----------------------------------------------------
export function Badge({
  children,
  tone = "gold",
  className = "",
}: {
  children: ReactNode;
  tone?: "gold" | "red" | "teal" | "muted";
  className?: string;
}) {
  const tones = {
    gold: "bg-gold text-ink",
    red: "bg-brand-red text-white",
    teal: "bg-brand-teal text-white",
    muted: "bg-white/10 text-white/70",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Price({
  cents,
  className = "",
}: {
  cents: number;
  className?: string;
}) {
  return (
    <span className={`font-display text-gold ${className}`}>{formatZAR(cents)}</span>
  );
}

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
