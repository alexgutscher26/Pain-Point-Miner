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
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-in fade-in zoom-in duration-300">
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
          Thanks for the feedback!
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 items-center">
      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mr-2">
        Accurate?
      </p>
      <button
        onClick={() => handleVote(1)}
        disabled={isSubmitting}
        className={`p-2 rounded-lg border transition-all ${
          vote === 1
            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-500"
            : "bg-zinc-900 border-white/10 text-zinc-400 hover:bg-white/5"
        } disabled:opacity-50`}
        title="Thumbs Up"
      >
        {isSubmitting && vote === 1 ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ThumbsUp className="w-4 h-4" />
        )}
      </button>
      <button
        onClick={() => handleVote(-1)}
        disabled={isSubmitting}
        className={`p-2 rounded-lg border transition-all ${
          vote === -1
            ? "bg-rose-500/20 border-rose-500/40 text-rose-500"
            : "bg-zinc-900 border-white/10 text-zinc-400 hover:bg-white/5"
        } disabled:opacity-50`}
        title="Thumbs Down"
      >
        {isSubmitting && vote === -1 ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ThumbsDown className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
