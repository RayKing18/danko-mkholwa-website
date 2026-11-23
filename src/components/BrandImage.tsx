"use client";

import { useState } from "react";
import { ASSETS } from "@/lib/utils";

/**
 * Product / gallery image with a branded fallback.
 * We use a plain <img> (not next/image) because photos can come from the
 * database (/api/media/:id) as well as from /public.
 */
export function BrandImage({
  src,
  alt,
  className = "",
  imgClassName = "object-cover",
  label,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
  label?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`bg-tiles flex items-center justify-center bg-coal ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="px-4 text-center">
          <p className="font-display text-2xl leading-none text-gold">
            {label ?? alt}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-widest text-white/40">
            Photo coming soon
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`h-full w-full ${imgClassName}`}
      />
    </div>
  );
}

/**
 * The official Danko Mkholwa logo.
 * Priority: logo uploaded in the dashboard → /assets/logo/danko-mkholwa-logo.png.
 * If neither exists yet we show a plain wordmark so the layout never breaks —
 * drop the real file in place and this disappears automatically.
 */
export function Logo({
  src,
  className = "h-14",
  priority = false,
}: {
  src?: string | null;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const url = src || ASSETS.logo;

  if (failed) {
    return (
      <span
        className={`flex items-center gap-2 ${className}`}
        aria-label="Danko Mkholwa"
      >
        <span className="font-script text-3xl leading-none text-white">Danko</span>
        <span className="font-display text-lg leading-none tracking-widest text-gold">
          MKHOLWA
        </span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Danko Mkholwa — Flavour that feels like home"
      className={`w-auto object-contain ${className}`}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailed(true)}
    />
  );
}
