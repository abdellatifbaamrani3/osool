import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "gold";
type Size = "sm" | "md" | "lg" | "xl";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-ivory hover:bg-brand-600 shadow-[var(--shadow-cta)]",
  secondary:
    "bg-white text-brand-800 border border-sand-200 hover:border-brand-100 hover:shadow-[var(--shadow-sm)]",
  ghost:
    "bg-transparent text-brand-700 hover:bg-brand-50 border border-transparent",
  gold: "bg-gold-500 text-brand-900 hover:bg-gold-300 shadow-[var(--shadow-md)]",
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 text-body-sm",
  md: "min-h-12 px-5 text-body",
  lg: "min-h-12 px-6 text-body",
  xl: "min-h-14 px-6 text-body-lg font-medium",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] transition-[transform,background-color,box-shadow,border-color] duration-[var(--dur-fast)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

type Common = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
  "data-cta"?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className = "",
  children,
  ...props
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  fullWidth,
  className = "",
  children,
  ...props
}: Common & { href: string } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
>) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
