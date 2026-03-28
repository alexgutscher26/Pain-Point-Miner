"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PainPointFeedbackProps {
  painPointId: string;
}

export function PainPointFeedback({ painPointId }: PainPointFeedbackProps) {
  const [vote, setVote] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);

  const handleVote = async (newVote: number) => {
    if (isSubmitting || voted) return;

    setIsSubmitting(true);
    setVote(newVote);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ painPointId, vote: newVote }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setVoted(true);
      toast.success("Thanks for the feedback!");
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Unable to save feedback.");
      setVote(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (voted) {
    return (
      <div className="animate-in fade-in zoom-in flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 duration-300">
        <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
          Thanks for the feedback!
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className="mr-2 text-[10px] font-black tracking-widest text-zinc-600 uppercase">
        Accurate?
      </p>
      <button
        onClick={() => handleVote(1)}
        disabled={isSubmitting}
        className={`rounded-lg border p-2 transition-all ${
          vote === 1
            ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-500"
            : "border-white/10 bg-zinc-900 text-zinc-400 hover:bg-white/5"
        } disabled:opacity-50`}
        title="Thumbs Up"
      >
        {isSubmitting && vote === 1 ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ThumbsUp className="h-4 w-4" />
        )}
      </button>
      <button
        onClick={() => handleVote(-1)}
        disabled={isSubmitting}
        className={`rounded-lg border p-2 transition-all ${
          vote === -1
            ? "border-rose-500/40 bg-rose-500/20 text-rose-500"
            : "border-white/10 bg-zinc-900 text-zinc-400 hover:bg-white/5"
        } disabled:opacity-50`}
        title="Thumbs Down"
      >
        {isSubmitting && vote === -1 ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ThumbsDown className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
