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
    <tr className="group cursor-pointer transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-900/60">
      <td className="px-6 py-4.5 sm:px-8">
        <Link href={`/dashboard/reports/${id}`} className="block">
          <p className="text-[14px] font-extrabold text-zinc-950 transition-colors group-hover:text-[#ff4500] dark:text-zinc-100">
            {keyword}
          </p>
          <p className="mt-0.5 font-mono text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
            {date}
          </p>
        </Link>
      </td>
      <td className="px-6 py-4.5 sm:px-8">
        <Link href={`/dashboard/reports/${id}`} className="block">
          <p className="max-w-[280px] truncate text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
            {painPoint}
          </p>
          {explanation && (
            <p className="mt-0.5 max-w-[280px] truncate font-mono text-[10px] text-zinc-400 italic dark:text-zinc-500">
              {explanation}
            </p>
          )}
        </Link>
      </td>
      <td className="px-6 py-4.5 text-center sm:px-8">
        <Link href={`/dashboard/reports/${id}`} className="inline-block">
          <span className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-xs font-black text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
            {score}
          </span>
        </Link>
      </td>
      <td className="px-6 py-4.5 sm:px-8">
        <Link
          href={`/dashboard/reports/${id}`}
          className="flex items-center gap-2"
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
            className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-black tracking-widest uppercase ${
              status === "Live"
                ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                : status === "Failed"
                  ? "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {status}
          </span>
        </Link>
      </td>
    </tr>
  );
}
