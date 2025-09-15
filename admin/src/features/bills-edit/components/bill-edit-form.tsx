"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { updateBill } from "../actions/update-bill";
import { type Bill, type BillUpdateInput, billUpdateSchema } from "../types";
import {
  BILL_STATUS_CONFIG,
  ORIGINATING_HOUSE_CONFIG,
} from "@/features/bills/constants/bill-config";
import type { BillStatus, OriginatingHouse } from "@/features/bills/types";

const BILL_STATUS_OPTIONS = Object.entries(BILL_STATUS_CONFIG).map(
  ([value, config]) => ({
    value: value as BillStatus,
    label: config.label,
  })
);

const ORIGINATING_HOUSE_OPTIONS = Object.entries(ORIGINATING_HOUSE_CONFIG).map(
  ([value, label]) => ({
    value: value as OriginatingHouse,
    label,
  })
);
interface BillEditFormProps {
  bill: Bill;
}

export function BillEditForm({ bill }: BillEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BillUpdateInput>({
    resolver: zodResolver(billUpdateSchema),
    defaultValues: {
      name: bill.name,
      status: bill.status,
      originating_house: bill.originating_house,
      status_note: bill.status_note,
      // 日時をdatetime-local形式に変換
      published_at: new Date(bill.published_at).toISOString().slice(0, 16),
    },
  });

  async function onSubmit(data: BillUpdateInput) {
    setIsSubmitting(true);
    setError(null);

    try {
      await updateBill(bill.id, data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "更新中にエラーが発生しました"
      );
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>議案基本情報編集</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>議案名 *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    議案の正式名称を入力してください（最大200文字）
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ステータス *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="ステータスを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BILL_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      現在の審議状況を選択してください
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="originating_house"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>提出院 *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="提出院を選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ORIGINATING_HOUSE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      議案を提出した議院を選択してください
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status_note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ステータス備考</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormDescription>
                    審議状況の詳細や補足情報を入力してください（最大500文字）
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="published_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>公開日時 *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription>
                    議案が公開される日時を設定してください
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/bills")}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
