import type { BillWithContent } from "../types";

/**
 * bill-share-modalのテスト表示用ダミーデータ
 * ローカル環境でDBに接続できない場合に使用
 */
export const mockBillData: BillWithContent = {
  id: "test-bill-001",
  name: "デジタル社会形成基本法案",
  number: "001",
  session: "第213回国会",
  diet_session_id: "213",
  originating_house: "HR",
  status: "in_originating_house",
  status_note: null,
  submitted_by: "内閣",
  submitted_by_detail: null,
  submitted_at: "2025-01-15",
  link_url: "https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/honbun/houan/g21301001.htm",
  pdf_url: null,
  published_at: "2025-01-20T00:00:00.000Z",
  thumbnail_url: "/images/sample-bill-thumbnail.jpg",
  created_at: "2025-01-15T10:00:00.000Z",
  updated_at: "2025-01-20T15:30:00.000Z",
  publish_status: "published",
  bill_content: {
    id: "test-content-001",
    bill_id: "test-bill-001",
    summary: "デジタル社会の形成に関する基本理念や国・地方公共団体等の責務、施策の基本となる事項を定めることにより、デジタル社会の形成に関する施策を総合的かつ効果的に推進することを目的とする法案です。",
    summary_easy: "デジタル化を進めるための基本的なルールを決める法律です。国や地方自治体がどのようにデジタル化を進めていくかの方針を定めています。",
    summary_simple: "デジタル化を進めるための基本的なルールを決める法律です。",
    purpose: "デジタル社会の形成に関する施策を総合的かつ効果的に推進すること",
    background: "Society 5.0の実現に向けて、デジタル技術を活用した社会変革が求められています。",
    key_points: [
      "デジタル社会形成の基本理念を明確化",
      "国・地方公共団体の責務を規定",
      "デジタル社会形成推進会議の設置",
    ],
    key_points_easy: [
      "デジタル社会の基本的な考え方を決める",
      "国と地方自治体がやるべきことを決める",
      "デジタル化を進めるための会議を作る",
    ],
    key_points_simple: [
      "デジタル社会の基本を決める",
      "責任の範囲を決める",
      "推進会議を作る",
    ],
    impact: "デジタル化の推進により、行政サービスの利便性向上や業務効率化が期待されます。",
    controversy: null,
    difficulty_level: "normal",
    created_at: "2025-01-15T10:30:00.000Z",
    updated_at: "2025-01-20T15:30:00.000Z",
  },
  mirai_stance: {
    id: "test-stance-001",
    bill_id: "test-bill-001",
    stance: "for",
    reasoning: "デジタル社会の形成は国民生活の利便性向上と行政の効率化に不可欠であり、基本的な方向性として支持します。",
    concerns: "個人情報保護やデジタルデバイド対策については、引き続き注視が必要です。",
    created_at: "2025-01-18T10:00:00.000Z",
    updated_at: "2025-01-18T10:00:00.000Z",
  },
  tags: [
    { id: "tag-001", label: "デジタル政策" },
    { id: "tag-002", label: "行政改革" },
  ],
};

/**
 * サムネイル画像がない場合のダミーデータ
 */
export const mockBillDataWithoutThumbnail: BillWithContent = {
  ...mockBillData,
  id: "test-bill-002",
  name: "気候変動対策推進法案",
  thumbnail_url: null,
  bill_content: {
    ...mockBillData.bill_content!,
    id: "test-content-002",
    bill_id: "test-bill-002",
    summary: "気候変動対策を推進するための基本的な枠組みを定める法案です。",
    summary_easy: "地球温暖化を防ぐための法律です。",
    summary_simple: "温暖化対策の法律です。",
  },
  tags: [
    { id: "tag-003", label: "環境政策" },
    { id: "tag-004", label: "気候変動" },
  ],
};
