"use client";

import type { Control } from "react-hook-form";
import {
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
import {
  type BillStatus,
  HOUSE_LABELS,
  type OriginatingHouse,
} from "@/features/bills/types";
import type { BillCreateInput } from "../types";
import { ThumbnailUpload } from "./thumbnail-upload";

const BILL_STATUS_OPTIONS: Array<{ value: BillStatus; label: string }> = [
  { value: "preparing", label: "準備中" },
  { value: "introduced", label: "提出済み" },
  { value: "in_originating_house", label: "審議中（提出院）" },
  { value: "in_receiving_house", label: "審議中（送付院）" },
  { value: "enacted", label: "成立" },
  { value: "rejected", label: "否決" },
];

const ORIGINATING_HOUSE_OPTIONS = Object.entries(HOUSE_LABELS).map(
  ([value, label]) => ({
    value: value as OriginatingHouse,
    label,
  })
);

interface BillFormFieldsProps {
  control: Control<BillCreateInput>;
  billId?: string;
}

export function BillFormFields({ control, billId }: BillFormFieldsProps) {
  return (
    <>
      <FormField
        control={control}
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
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ステータス *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          control={control}
          name="originating_house"
          render={({ field }) => (
            <FormItem>
              <FormLabel>提出院 *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        control={control}
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
        control={control}
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

      <FormField
        control={control}
        name="thumbnail_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>サムネイル画像</FormLabel>
            <FormControl>
              <ThumbnailUpload
                value={field.value}
                onChange={field.onChange}
                billId={billId}
              />
            </FormControl>
            <FormDescription>
              議案のサムネイル画像を設定してください（任意）
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
