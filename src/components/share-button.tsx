"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

/** Copies the canonical URL of whatever page it sits on. The clipboard API
 *  needs a secure context, so it falls back to selecting a temporary input
 *  when the page is served over plain http. */
export function ShareButton({ label = "Share" }: { label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const field = document.createElement("input");
      field.value = url;
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-white"
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Link2 className="h-4 w-4" />
      )}
      {copied ? "Link copied" : label}
    </button>
  );
}
