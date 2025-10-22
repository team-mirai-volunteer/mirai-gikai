"use client";

import { useState } from "react";
import { BillShareModal } from "@/features/bills/components/share/bill-share-modal";
import {
  mockBillData,
  mockBillDataWithoutThumbnail,
} from "@/features/bills/mock/bill-data";

/**
 * bill-share-modalのテスト表示用ページ
 * ローカル環境でDBに接続できない場合にモーダルの動作を確認できます
 *
 * アクセス方法: http://localhost:3000/bills/test-share-modal
 */
export default function TestShareModalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [useDataWithoutThumbnail, setUseDataWithoutThumbnail] = useState(false);

  const currentBill = useDataWithoutThumbnail
    ? mockBillDataWithoutThumbnail
    : mockBillData;

  const shareMessage = `【みらい議会】${currentBill.name}\n${currentBill.bill_content?.summary || ""}`;
  const shareUrl = `https://mirai-gikai.jp/bills/${currentBill.id}`;

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        議案シェアモーダル テストページ
      </h1>

      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-bold mb-4">使用中のデータ</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>議案名:</strong> {currentBill.name}
          </p>
          <p>
            <strong>サムネイル:</strong>{" "}
            {currentBill.thumbnail_url ? "あり" : "なし"}
          </p>
          <p>
            <strong>要約:</strong> {currentBill.bill_content?.summary}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <input
            type="checkbox"
            id="thumbnailToggle"
            checked={useDataWithoutThumbnail}
            onChange={(e) => setUseDataWithoutThumbnail(e.target.checked)}
            className="w-5 h-5"
          />
          <label htmlFor="thumbnailToggle" className="cursor-pointer">
            サムネイル画像なしのデータを使用
          </label>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-mirai-gradient text-gray-800 font-bold py-4 px-6 rounded-lg border-2 border-gray-800 hover:opacity-90 transition-opacity"
        >
          シェアモーダルを開く
        </button>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">📝 テストポイント</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>モーダルが正しく表示されるか</li>
            <li>サムネイル画像の表示（ある場合/ない場合）</li>
            <li>各SNSアイコンがクリックできるか</li>
            <li>
              スマホレイアウト時のみLINE/Threads/共有ボタンが表示されるか
            </li>
            <li>背景クリックで閉じられるか</li>
            <li>Escキーで閉じられるか</li>
            <li>「このまま閉じる」ボタンで閉じられるか</li>
          </ul>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2">🔍 開発者向け情報</h3>
          <div className="text-sm space-y-1">
            <p>
              <strong>モックデータの場所:</strong>{" "}
              <code className="bg-white px-2 py-1 rounded">
                web/src/features/bills/mock/bill-data.ts
              </code>
            </p>
            <p>
              <strong>モーダルコンポーネント:</strong>{" "}
              <code className="bg-white px-2 py-1 rounded">
                web/src/features/bills/components/share/bill-share-modal.tsx
              </code>
            </p>
          </div>
        </div>
      </div>

      <BillShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shareMessage={shareMessage}
        shareUrl={shareUrl}
        thumbnailUrl={currentBill.thumbnail_url}
      />
    </div>
  );
}
