"use server";

import { randomBytes } from "node:crypto";
import { createAdminClient } from "@mirai-gikai/supabase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { env } from "@/lib/env";

interface GeneratePreviewUrlResult {
  success: boolean;
  url?: string;
  token?: string;
  expiresAt?: string;
  error?: string;
}

interface ExistingToken {
  token: string;
  expires_at: string;
}

export async function generatePreviewUrl(
  billId: string
): Promise<GeneratePreviewUrlResult> {
  await requireAdmin();

  try {
    const existingToken = await _getExistingValidToken(billId);

    if (existingToken) {
      return {
        success: true,
        url: _buildPreviewUrl(billId, existingToken.token),
        token: existingToken.token,
        expiresAt: existingToken.expires_at,
      };
    }

    const token = _generateToken();
    const expiresAt = _calculateExpiry();

    await _saveToken(billId, token, expiresAt);

    return {
      success: true,
      url: _buildPreviewUrl(billId, token),
      token,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    console.error("Error generating preview URL:", error);
    return {
      success: false,
      error: "予期しないエラーが発生しました",
    };
  }
}

// 既存の有効なトークンを取得
async function _getExistingValidToken(
  billId: string
): Promise<ExistingToken | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("preview_tokens")
    .select("token, expires_at")
    .eq("bill_id", billId)
    .single();

  if (error || !data) {
    return null;
  }

  const expiresAt = new Date(data.expires_at);
  const now = new Date();

  if (expiresAt > now) {
    return data;
  }

  // 期限切れの場合は削除
  await supabase.from("preview_tokens").delete().eq("bill_id", billId);
  return null;
}

// 新しいトークンを生成
function _generateToken(): string {
  return randomBytes(32).toString("hex");
}

// 有効期限を計算（30日後）
function _calculateExpiry(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  return expiresAt;
}

// トークンをデータベースに保存
async function _saveToken(billId: string, token: string, expiresAt: Date) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("preview_tokens").insert({
    bill_id: billId,
    token,
    expires_at: expiresAt.toISOString(),
    created_by: "admin", // TODO: 実際の管理者IDを使用
  });

  if (error) {
    throw new Error(`Failed to insert preview token: ${error}`);
  }
}

// プレビューURLを構築
function _buildPreviewUrl(billId: string, token: string): string {
  return `${env.webUrl}/preview/bills/${billId}?token=${token}`;
}

// トークンの検証
export async function _validatePreviewToken(
  billId: string,
  token: string
): Promise<boolean> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("preview_tokens")
      .select("expires_at")
      .eq("bill_id", billId)
      .eq("token", token)
      .single();

    if (error || !data) {
      return false;
    }

    // 有効期限をチェック
    const expiresAt = new Date(data.expires_at);
    const now = new Date();

    return expiresAt > now;
  } catch (error) {
    console.error("Error validating preview token:", error);
    return false;
  }
}
