"use client";

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
	BILL_STATUS_CONFIG,
	ORIGINATING_HOUSE_CONFIG,
} from "@/features/bills/constants/bill-config";
import type { BillStatus, OriginatingHouse } from "@/features/bills/types";
import type { Control } from "react-hook-form";
import type { BillCreateInput } from "../types";

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

interface BillFormFieldsProps {
	control: Control<BillCreateInput>;
}

export function BillFormFields({ control }: BillFormFieldsProps) {
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
		</>
	);
}