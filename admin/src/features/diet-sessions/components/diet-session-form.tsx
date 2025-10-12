"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDietSession } from "../actions/create-diet-session";

export function DietSessionForm() {
  const nameId = useId();
  const startDateId = useId();
  const endDateId = useId();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("国会名を入力してください");
      return;
    }

    if (!startDate) {
      toast.error("開始日を入力してください");
      return;
    }

    if (!endDate) {
      toast.error("終了日を入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createDietSession({
        name,
        start_date: startDate,
        end_date: endDate,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("国会会期を作成しました");
        setName("");
        setStartDate("");
        setEndDate("");
      }
    } catch (error) {
      console.error("Create diet session error:", error);
      toast.error("国会会期の作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={nameId}>国会名</Label>
          <Input
            id={nameId}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 第218回 臨時国会"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={startDateId}>開始日</Label>
          <Input
            id={startDateId}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={endDateId}>終了日</Label>
          <Input
            id={endDateId}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "追加中..." : "追加"}
        </Button>
      </div>
    </form>
  );
}
