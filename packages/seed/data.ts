import type { Database } from "../types/supabase.types";

type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
type MiraiStanceInsert =
  Database["public"]["Tables"]["mirai_stances"]["Insert"];

export const bills: BillInsert[] = [
  {
    name: "地方自治法改正案",
    headline: "国が地方自治体への指示権を強化する改正案",
    description:
      "地方自治体の事務処理において、国が必要と認める場合に指示権を行使できる範囲を拡大する法案。地方分権の観点から議論を呼んでいる。",
    originating_house: "HR",
    status: "in_originating_house",
    status_note: "衆議院総務委員会で審議中",
    published_at: "2025-01-15T09:00:00+09:00",
    body_markdown: `# 地方自治法改正案

## 概要
地方自治法第245条に基づく国の関与について、以下の改正を行う。

### 主な改正点
1. **指示権の拡大**
   - 緊急事態における国の指示権限を強化
   - 感染症対策、災害対応での統一的対応を可能に

2. **情報共有の義務化**
   - 地方自治体から国への報告義務を明確化
   - デジタル化による情報共有基盤の整備

## 論点
- 地方分権の後退懸念
- 緊急時対応の必要性
- 自治体の独自性確保`,
  },
  {
    name: "こども家庭庁予算増額法案",
    headline: "子育て支援の拡充に向けた予算措置",
    description:
      "少子化対策として、こども家庭庁の予算を前年度比30%増額し、保育無償化の対象拡大や児童手当の増額を図る法案。",
    originating_house: "HC",
    status: "in_receiving_house",
    status_note: "参議院で可決、衆議院へ送付",
    published_at: "2025-01-20T10:00:00+09:00",
    body_markdown: `# こども家庭庁予算増額法案

## 予算規模
- 総額: 5.2兆円（前年度比30%増）
- 新規施策: 1.5兆円

## 主要施策
### 1. 保育無償化の拡大
- 対象年齢を0歳児まで拡大
- 所得制限の撤廃

### 2. 児童手当の増額
- 月額15,000円→20,000円へ
- 第3子以降は30,000円

### 3. 学童保育の充実
- 開所時間の延長支援
- 質の向上に向けた指導員配置基準の改善`,
  },
  {
    name: "デジタル社会形成基本法改正案",
    headline: "マイナンバーカードの利用範囲拡大",
    description:
      "マイナンバーカードの民間利用を促進し、デジタル社会の基盤強化を図る改正案。プライバシー保護の観点から慎重な議論が続いている。",
    originating_house: "HR",
    status: "introduced",
    status_note: "衆議院に提出済み、委員会付託待ち",
    published_at: "2025-02-01T09:00:00+09:00",
    body_markdown: `# デジタル社会形成基本法改正案

## 改正の目的
デジタル社会の実現に向け、マイナンバーカードの利活用を促進

## 主な改正内容
1. **民間サービスとの連携**
   - 銀行口座との紐付け簡素化
   - 民間企業での本人確認利用

2. **行政手続きの完全デジタル化**
   - 全ての行政手続きをオンライン化
   - 書面提出の原則廃止

3. **セキュリティ強化**
   - 生体認証の導入
   - 不正利用防止システムの構築`,
  },
  {
    name: "再生可能エネルギー促進法案",
    headline: "2030年までに再エネ比率50%を目指す野心的法案",
    description:
      "太陽光・風力発電の設置を促進し、再生可能エネルギーの比率を大幅に引き上げる法案。電力料金への影響が懸念されている。",
    originating_house: "HC",
    status: "enacted",
    status_note: "両院で可決、施行待ち",
    published_at: "2024-12-15T10:00:00+09:00",
    body_markdown: `# 再生可能エネルギー促進法案

## 目標設定
- 2030年: 再エネ比率50%
- 2035年: 再エネ比率65%
- 2050年: カーボンニュートラル達成

## 促進策
### 補助金制度
- 住宅用太陽光: 設置費用の40%補助
- 事業用風力: 設置費用の30%補助

### 規制緩和
- 農地での太陽光発電設置要件緩和
- 洋上風力発電の環境アセスメント簡素化

### 送電網整備
- 地域間連系線の増強
- 蓄電池設置への支援`,
  },
  {
    name: "働き方改革推進法案",
    headline: "週休3日制の導入を促進する労働法改正",
    description:
      "選択的週休3日制の導入を企業に促し、ワークライフバランスの改善を図る法案。生産性への影響を巡って議論が続いている。",
    originating_house: "HR",
    status: "rejected",
    status_note: "衆議院本会議で否決",
    published_at: "2024-11-01T09:00:00+09:00",
    body_markdown: `# 働き方改革推進法案

## 法案の骨子
### 週休3日制の促進
- 大企業: 2026年4月から努力義務
- 中小企業: 2028年4月から努力義務

### 給与保障
- 週休3日選択時も給与水準維持を推奨
- 導入企業への税制優遇

## 期待される効果
- 従業員の健康増進
- 育児・介護との両立支援
- 地方移住の促進

## 懸念事項
- 人手不足業界への影響
- 中小企業の負担増
- 国際競争力への影響`,
  },
];

// bill_nameで参照するための一時的な型
interface MiraiStanceWithBillName {
  bill_name: string;
  type: Database["public"]["Enums"]["stance_type_enum"];
  comment?: string;
}

// bill_nameでの参照用データ
const miraiStancesWithBillName: MiraiStanceWithBillName[] = [
  {
    bill_name: "地方自治法改正案",
    type: "against",
    comment:
      "地方分権の理念に反し、地方自治体の独自性と創造性を損なう恐れがあります。緊急時対応は既存の枠組みで十分対応可能であり、国の権限強化は必要ありません。",
  },
  {
    bill_name: "こども家庭庁予算増額法案",
    type: "for",
    comment:
      "少子化対策は日本の最重要課題です。子育て世代の経済的負担を軽減し、すべての子どもが健やかに育つ環境を整備することは、未来への投資として不可欠です。",
  },
  {
    bill_name: "デジタル社会形成基本法改正案",
    type: "neutral",
    comment:
      "デジタル化の推進は重要ですが、個人情報保護とのバランスが必要です。十分なセキュリティ対策と国民の理解を得ながら、段階的に進めるべきです。",
  },
  {
    bill_name: "再生可能エネルギー促進法案",
    type: "for",
    comment:
      "気候変動対策は待ったなしの課題です。エネルギー安全保障の観点からも、再生可能エネルギーへの転換を加速させる必要があります。電力料金への配慮も含めた制度設計を支持します。",
  },
  {
    bill_name: "働き方改革推進法案",
    type: "for",
    comment:
      "多様な働き方の選択肢を提供することは、これからの社会に必要です。企業の実情に配慮しながら、段階的な導入を進めることで、真のワークライフバランスを実現できます。",
  },
];

// bill_nameをbill_idに変換する関数（seed実行時に使用）
export function createMiraiStances(
  insertedBills: { id: string; name: string }[]
): MiraiStanceInsert[] {
  return miraiStancesWithBillName.map((stance) => {
    const bill = insertedBills.find((b) => b.name === stance.bill_name);
    if (!bill) {
      throw new Error(`Bill not found: ${stance.bill_name}`);
    }

    return {
      bill_id: bill.id,
      type: stance.type,
      comment: stance.comment,
    };
  });
}
