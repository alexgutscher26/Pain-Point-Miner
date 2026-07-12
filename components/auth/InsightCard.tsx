/* eslint-disable @next/next/no-img-element */
import { TrendingUp } from "lucide-react";

interface InsightCardProps {
  badge: string;
  subreddit: string;
  time: string;
  quote: string;
  avatar: string | React.ReactNode;
  username: string;
  upvotes: number;
  comments: number;
  intent: string;
}

export function InsightCard({
  badge,
  subreddit,
  time,
  quote,
  avatar,
  username,
  upvotes,
  comments,
  intent,
}: InsightCardProps) {
  return (
    <div className="rounded-[20px] border border-black/[0.04] bg-white/80 p-6 shadow-xs backdrop-blur-md">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full border border-[#ff4500]/20 bg-[#ff4500]/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#ff4500] uppercase">
          {badge}
        </span>
        <span className="text-xs font-medium text-zinc-400">
          {subreddit} • {time}
        </span>
      </div>

      <blockquote className="mb-6 text-[17px] leading-relaxed font-medium text-zinc-700">
        &quot;{quote}&quot;
      </blockquote>

      <div className="flex items-center justify-between border-t border-black/[0.04] pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-black/[0.04] bg-zinc-100">
            {typeof avatar === "string" ? (
              <img
                className="h-full w-full object-cover"
                alt={`${username} avatar`}
                src={avatar}
                width={32}
                height={32}
                loading="lazy"
              />
            ) : (
              avatar
            )}
          </div>
          <div className="text-sm">
            <p className="font-bold text-zinc-800">{username}</p>
            <p className="text-xs text-zinc-400">
              {upvotes} Upvotes • {comments} Comments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-[#ff4500]" />
          <span className="text-xs font-bold text-[#ff4500] italic">
            {intent}
          </span>
        </div>
      </div>
    </div>
  );
}
