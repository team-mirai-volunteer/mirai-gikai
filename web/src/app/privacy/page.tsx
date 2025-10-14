import { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "プライバシーポリシー | みらい議会",
  description: "みらい議会のプライバシーポリシー",
};

// TODO: Replace this placeholder content with your actual privacy policy
const PRIVACY_CONTENT = `
1. 個人情報の定義

個人情報とは、以下のような情報により特定の個人を識別することができるものを指します。

・氏名、年齢、性別、住所、電話番号、職業、メールアドレス
・個人ごとに割り当てられたIDやパスワード、その他識別可能な記号など
・単体では個人の特定ができないものの、他の情報と容易に照合することができ、個人を特定できる情報

2. 個人情報の収集目的と使用範囲

個人情報をご提供いただく際には、ユーザーの同意に基づいて行うことを原則とし、無断で収集・利用することはありません。

3. 第三者への情報提供について

以下のいずれかに該当する場合を除き、利用者から提供された個人情報を第三者に開示・提供することはありません。

・利用者本人の同意がある場合
・利用者個人が識別されない形（他の情報と照合しても個人を特定できない場合）で提供する場合
・法令に基づく開示請求があった場合
・不正アクセスや規約違反など、利用者本人による違反が確認された場合
・第三者に対して不利益を与えると判断された場合
・公共の利益や利用者本人の利益のために必要と判断された場合

4. 安全管理措置について

個人情報の適切な管理を行うために、責任者を定めた上で、厳正な管理・監督体制を構築しています。

5. Cookie（クッキー）について

Cookieとは、サーバーが利用者の識別を目的として、利用者のブラウザに送信し、端末に保存される情報です。

当ウェブサイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を使用しており、Googleアナリティクスはデータ収集のためにCookieを使用しています。 データは匿名で収集されており、個人を特定するものではありません。この機能はお使いのブラウザの設定でCookieを無効にすることで拒否することができます。 Googleアナリティクスでデータが収集および処理される仕組みの詳細は「Google のサービスを使用するサイトやアプリから収集した情報の Google による使用」のページをご覧ください。

6. 個人情報の保管期間
取得した個人情報は、政治資金規正法等の法令に基づき、必要な期間（原則として7年間）保管した後、適切な方法により廃棄・削除いたします。

7. プライバシーポリシーの改訂と通知について

このプライバシーポリシーは、必要に応じて内容の見直しを行い、改訂されることがあります。その際、個別の通知は行いませんので、最新の情報については当ウェブサイトをご確認ください。

8. 個人情報に関するお問い合わせ

個人情報の確認・修正・削除・利用停止等をご希望される場合は、下記のお問い合わせ窓口までご連絡ください。なお、ご請求内容がご本人によるものであることが確認できた場合に限り、必要な調査を行い、その結果に基づき適切な対応を行います。

お問い合わせ窓口

チームみらい 個人情報保護管理責任者
support@team-mir.ai

`;

export default function PrivacyPage() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-4xl">
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(PRIVACY_CONTENT) }} />
        </div>
      </div>
    </Container>
  );
}

// Simple markdown to HTML converter
function convertMarkdownToHtml(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, (match) => {
      if (!match.startsWith('<')) {
        return `<p>${match}</p>`;
      }
      return match;
    });
}
