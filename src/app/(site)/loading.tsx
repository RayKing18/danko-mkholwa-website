import { Logo } from "@/components/BrandImage";
import { GeoBorder } from "@/components/ui";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="animate-pulse-gold">
        <Logo className="h-28" />
      </div>
      <GeoBorder className="max-w-[160px]" />
      <p className="font-script text-xl text-gold">Flavour that feels like home…</p>
    </div>
  );
}
