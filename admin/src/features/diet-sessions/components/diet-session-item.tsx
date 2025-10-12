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
import { deleteDietSession } from "../actions/delete-diet-session";
import { updateDietSession } from "../actions/update-diet-session";
import type { DietSession } from "../types";

type DietSessionItemProps = {
  session: DietSession;
};

export function DietSessionItem({ session }: DietSessionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(session.name);
  const [editStartDate, setEditStartDate] = useState(session.start_date);
  const [editEndDate, setEditEndDate] = useState(session.end_date);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => {
    if (!editName.trim()) {
      toast.error("国会名を入力してください");
      return;
    }

    if (!editStartDate) {
      toast.error("開始日を入力してください");
      return;
    }

    if (!editEndDate) {
      toast.error("終了日を入力してください");
      return;
    }

    // 変更がない場合は編集モードを終了
    if (
      editName === session.name &&
      editStartDate === session.start_date &&
      editEndDate === session.end_date
    ) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateDietSession({
        id: session.id,
        name: editName,
        start_date: editStartDate,
        end_date: editEndDate,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("国会会期を更新しました");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Update diet session error:", error);
      toast.error("国会会期の更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);

    try {
      const result = await deleteDietSession({ id: session.id });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("国会会期を削除しました");
      }
    } catch (error) {
      console.error("Delete diet session error:", error);
      toast.error("国会会期の削除に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditName(session.name);
    setEditStartDate(session.start_date);
    setEditEndDate(session.end_date);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      {isEditing ? (
        <div className="flex-1 grid gap-4 md:grid-cols-3">
          <Input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="国会名"
            disabled={isSubmitting}
          />
          <Input
            type="date"
            value={editStartDate}
            onChange={(e) => setEditStartDate(e.target.value)}
            disabled={isSubmitting}
          />
          <Input
            type="date"
            value={editEndDate}
            onChange={(e) => setEditEndDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      ) : (
        <div className="flex-1">
          <div className="font-medium">{session.name}</div>
          <div className="text-sm text-gray-500">
            {formatDate(session.start_date)} 〜 {formatDate(session.end_date)}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button size="sm" onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </>
        ) : (
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
                  <AlertDialogTitle>国会会期の削除</AlertDialogTitle>
                  <AlertDialogDescription>
                    この国会会期を削除しますか？この操作は取り消せません。
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
