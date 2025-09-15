"use client";

import { BillForm } from "./bill-form";
import { type Bill } from "../types";

interface BillEditFormProps {
	bill: Bill;
}

export function BillEditForm({ bill }: BillEditFormProps) {
	return <BillForm bill={bill} mode="edit" />;
}
