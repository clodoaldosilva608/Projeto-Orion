"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteGoalAction } from "@/lib/actions";

export function DeleteGoalButton({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;
    startTransition(async () => {
      const res = await deleteGoalAction(goalId);
      if (res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      title="Excluir meta"
      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#8b8fa3] hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
