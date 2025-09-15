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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { updateBillContents } from "../actions/update-bill-contents";
import type { Bill } from "../types";
import type {
  BillContent,
  BillContentsUpdateInput,
  DifficultyLevel,
} from "../types/bill-contents";
import {
  DIFFICULTY_LEVELS,
  billContentsUpdateSchema,
} from "../types/bill-contents";

interface BillContentsEditFormProps {
  bill: Bill;
  billContents: BillContent[];
}

export function BillContentsEditForm({
  bill,
  billContents,
}: BillContentsEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // BillContent配列を難易度別のオブジェクトに変換
  const contentsByDifficulty = billContents.reduce(
    (acc, content) => {
      acc[content.difficulty_level as DifficultyLevel] = content;
      return acc;
    },
    {} as Record<DifficultyLevel, BillContent>
  );

  const form = useForm<BillContentsUpdateInput>({
    resolver: zodResolver(billContentsUpdateSchema),
    defaultValues: {
      easy: {
        title: contentsByDifficulty.easy?.title || "",
        summary: contentsByDifficulty.easy?.summary || "",
        content: contentsByDifficulty.easy?.content || "",
      },
      normal: {
        title: contentsByDifficulty.normal?.title || "",
        summary: contentsByDifficulty.normal?.summary || "",
        content: contentsByDifficulty.normal?.content || "",
      },
      hard: {
        title: contentsByDifficulty.hard?.title || "",
        summary: contentsByDifficulty.hard?.summary || "",
        content: contentsByDifficulty.hard?.content || "",
      },
    },
  });

  async function onSubmit(data: BillContentsUpdateInput) {
    setIsSubmitting(true);
    setError(null);

    try {
      await updateBillContents(bill.id, data);
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
        <CardTitle>議案コンテンツ編集</CardTitle>
        <p className="text-sm text-gray-600">{bill.name}</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="easy" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {DIFFICULTY_LEVELS.map((level) => (
                  <TabsTrigger key={level.value} value={level.value}>
                    {level.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {DIFFICULTY_LEVELS.map((level) => (
                <TabsContent
                  key={level.value}
                  value={level.value}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name={`${level.value}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>タイトル *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          {level.label}
                          レベル向けのタイトルを入力してください（最大200文字）
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`${level.value}.summary`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>要約 *</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="min-h-[100px]" />
                        </FormControl>
                        <FormDescription>
                          {level.label}
                          レベル向けの要約を入力してください（最大500文字）
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`${level.value}.content`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>内容 *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="min-h-[400px] font-mono text-sm"
                          />
                        </FormControl>
                        <FormDescription>
                          {level.label}
                          レベル向けの内容をMarkdown形式で入力してください（最大50000文字）
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              ))}
            </Tabs>

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
