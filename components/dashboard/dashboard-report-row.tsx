import React from "react";
import Link from "next/link";

export function ReportRow({
  id,
  keyword,
  date,
  painPoint,
  score,
  status,
  explanation,
}: {
  id: string;
  keyword: string;
  date: string;
  painPoint: string;
  score: number;
  status: string;
  explanation?: string | null;
}) {
  return (
    <tr className="group cursor-pointer transition-all duration-300 hover:bg-zinc-50/50">
      <td className="px-8 py-6">
        <Link href={`/dashboard/reports/${id}`} className="block">
          <p className="text-zinc-850 mb-1 text-[15px] font-extrabold break-words transition-colors group-hover:text-[#ff4500]">
            {keyword}
          </p>
          <p className="font-mono text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
            {date}
          </p>
        </Link>
      </td>
      <td className="px-8 py-6">
        <Link href={`/dashboard/reports/${id}`} className="block">
          <p className="text-zinc-650 mb-1 max-w-[250px] truncate text-[14px] font-medium">
            {painPoint}
          </p>
          {explanation && (
            <p className="max-w-[250px] truncate text-[11px] font-medium text-zinc-400 italic">
              {explanation}
            </p>
          )}
        </Link>
      </td>
      <td className="px-8 py-6 text-center">
        <Link href={`/dashboard/reports/${id}`} className="block">
          <span className="shadow-3xs rounded-lg border border-zinc-200/60 bg-white/80 px-2.5 py-1 text-[14px] font-extrabold text-zinc-800">
            {score}
          </span>
        </Link>
      </td>
      <td className="px-8 py-6">
        <Link
          href={`/dashboard/reports/${id}`}
          className="flex items-center gap-2.5"
        >
          <div className="relative flex h-2 w-2">
            {status === "Live" && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                status === "Live"
                  ? "bg-amber-400"
                  : status === "Failed"
                    ? "bg-rose-500"
                    : "bg-emerald-500"
              }`}
            ></span>
          </div>
          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-black tracking-widest uppercase ${
              status === "Live"
                ? "border-amber-500/20 bg-amber-500/5 text-amber-700"
                : status === "Failed"
                  ? "border-rose-500/20 bg-rose-500/5 text-rose-700"
                  : "border-emerald-500/20 bg-emerald-500/5 text-emerald-700"
            }`}
          >
            {status}
          </span>
        </Link>
      </td>
    </tr>
  );
}
