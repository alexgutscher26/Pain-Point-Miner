"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Copy, Check, Share2, Code2, ExternalLink } from "lucide-react";
import { siteUrl } from "@/lib/seo";

interface ReportShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportTitle: string;
  ideaTitle?: string;
  validationScore?: string | number;
  reportId: string;
}

export function ReportShareModal({
  open,
  onOpenChange,
  reportTitle,
  ideaTitle,
  validationScore,
  reportId,
}: ReportShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [embedFormat, setEmbedFormat] = useState<"html" | "markdown" | "react">(
    "html",
  );

  const displayTitle = ideaTitle || reportTitle;
  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `${siteUrl}/dashboard/reports/${reportId}`;

  const tweetText = `Just discovered a validated SaaS opportunity on @ThreddIQ:\n\n💡 "${displayTitle}"\n🔥 Demand Score: ${validationScore || "8.5"}/10\n\nMined from real Reddit pain points:`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  const embedCodes = {
    html: `<a href="${siteUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${siteUrl}/badge.svg" alt="Validated with ThreddIQ" width="220" height="42" />\n</a>`,
    markdown: `[![Validated with ThreddIQ](${siteUrl}/badge.svg)](${siteUrl})`,
    react: `<a href="${siteUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${siteUrl}/badge.svg" alt="Validated with ThreddIQ" width={220} height={42} />\n</a>`,
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success("Shareable link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCodes[embedFormat]);
    setCopiedEmbed(true);
    toast.success("Embed badge code copied!");
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border border-zinc-200 bg-white p-6 text-zinc-950">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-[#ff4500]">
              <Share2 className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-extrabold text-zinc-900">
              Share Opportunity & Embed Badge
            </DialogTitle>
          </div>
          <DialogDescription className="pt-1 text-xs text-zinc-500">
            Share this validated Reddit intelligence report with co-founders,
            investors, or your audience.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          {/* Social Share Buttons */}
          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              Direct Social Share
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-black px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-zinc-800"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </a>

              <a
                href={linkedInShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-[#0a66c2] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#084e96]"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>

          {/* Copy Direct Link */}
          <div>
            <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              Report URL
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-700 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-700"
              >
                {copiedLink ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Embeddable "Made with ThreddIQ" Badge */}
          <div className="border-zinc-150 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-[#ff4500]" />
                <span className="text-xs font-bold text-zinc-900">
                  "Validated with ThreddIQ" Embed Badge
                </span>
              </div>
              <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 text-[10px] font-bold">
                {(["html", "markdown", "react"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setEmbedFormat(fmt)}
                    className={`rounded px-2 py-0.5 uppercase transition-colors ${
                      embedFormat === fmt
                        ? "bg-white text-zinc-900 shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Badge Preview */}
            <div className="mt-3 flex items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <img
                src="/badge.svg"
                alt="Validated with ThreddIQ"
                className="h-[42px] w-[220px] rounded-lg shadow-sm"
              />
            </div>

            {/* Code Snippet Box */}
            <div className="relative mt-3 rounded-xl border border-zinc-200 bg-zinc-900 p-3 text-white">
              <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-zinc-300">
                <code>{embedCodes[embedFormat]}</code>
              </pre>
              <button
                type="button"
                onClick={handleCopyEmbed}
                className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold text-white transition-colors hover:bg-white/20"
              >
                {copiedEmbed ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copiedEmbed ? "Copied" : "Copy Code"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
