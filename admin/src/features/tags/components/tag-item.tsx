"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteTag } from "../actions/delete-tag";
import { updateTag } from "../actions/update-tag";
import type { TagWithBillCount } from "../types";

type TagItemProps = {
  tag: TagWithBillCount;
};

export function TagItem({ tag }: TagItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(tag.label);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => {
    if (!editLabel.trim()) {
      toast.error("タグ名を入力してください");
      return;
    }

    if (editLabel === tag.label) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateTag(tag.id, { label: editLabel });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("タグを更新しました");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Update tag error:", error);
      toast.error("タグの更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);

    try {
      const result = await deleteTag(tag.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("タグを削除しました");
      }
    } catch (error) {
      console.error("Delete tag error:", error);
      toast.error("タグの削除に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUpdate();
    } else if (e.key === "Escape") {
      setEditLabel(tag.label);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="flex-1">
        {isEditing ? (
          <Input
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleUpdate}
            disabled={isSubmitting}
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-left hover:text-gray-600"
          >
            {tag.label}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">({tag.bill_count}件)</span>

        {!isEditing && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isSubmitting}
            >
              編集
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isSubmitting}>
                  削除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>タグの削除</AlertDialogTitle>
                  <AlertDialogDescription>
                    このタグを削除しますか？紐付けられている議案からもタグが削除されます。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    削除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
}
