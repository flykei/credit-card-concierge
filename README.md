# クレカコンシェルジュ

年間支出額から最適なクレジットカードを診断するシミュレーター。
年会費を差し引いた**実質還元額**で比較し、本当にお得なカードを見つけられます。

## 特徴

- ✅ **実質還元額で比較**: 獲得ポイント - 年会費 = 本当の得
- ✅ **支出内訳を反映**: Amazon、楽天、コンビニなどの支出を考慮
- ✅ **年間ボーナス込み**: 年100万円利用で10,000ptなどの特典も計算
- ✅ **10種類のカード対応**: 人気のクレジットカード・デビットカードを網羅
- ✅ **SEO最適化済み**: メタデータ、構造化データ、サイトマップ完備

## 対応カード

1. 三井住友カード プラチナプリファード
2. 三井住友カード ゴールド(NL)
3. ジャックスカードプラチナ
4. エポスプラチナカード
5. リクルートカード
6. P-oneカード Wiz
7. メルカード ゴールド
8. Marriott Bonvoy アメックス・プレミアム
9. 住信SBIネット銀行 プラチナデビットカード
10. 住信SBIネット銀行 デビットカード Point+

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **デプロイ**: Vercel推奨

## 開発環境のセットアップ

### 必要要件

- Node.js 18.17以上
- npm または yarn

### インストール

\`\`\`bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
\`\`\`

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

### ビルド

\`\`\`bash
# プロダクションビルド
npm run build

# プロダクションサーバーを起動
npm start
\`\`\`

## プロジェクト構造

\`\`\`
credit-card-concierge/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト（SEO設定含む）
│   ├── page.tsx           # トップページ
│   ├── robots.ts          # robots.txt生成
│   └── sitemap.ts         # サイトマップ生成
├── components/            # Reactコンポーネント
│   ├── Calculator.tsx     # メイン計算機
│   ├── ExpenseInput.tsx   # 支出入力フォーム
│   └── ResultDisplay.tsx  # 結果表示
├── lib/                   # ビジネスロジック
│   ├── types.ts          # TypeScript型定義
│   ├── cards.ts          # カードデータ操作
│   └── calculator.ts     # 還元額計算ロジック
├── data/                  # データファイル
│   └── cards.json        # カードマスターデータ
└── public/               # 静的ファイル
    └── card-logos/       # カードロゴ画像（将来用）
\`\`\`

## カスタマイズ

### カードの追加

1. `data/cards.json` に新しいカード情報を追加
2. 必要に応じて `lib/types.ts` の型定義を調整
3. `app/page.tsx` の対応カード一覧を更新

### 支出カテゴリの追加

1. `lib/types.ts` の `MERCHANT_CATEGORIES` にカテゴリを追加
2. `components/ExpenseInput.tsx` のUIを調整（必要に応じて）

## SEO設定

### デプロイ前の設定

以下のファイルでドメインを実際のURLに変更してください：

- `app/layout.tsx`: Open Graph、Twitter Card設定
- `app/sitemap.ts`: サイトマップのベースURL
- `app/robots.ts`: robots.txtのサイトマップURL

### Google Search Console

デプロイ後、以下を実施してください：

1. Google Search Consoleにサイトを登録
2. `app/layout.tsx` の `verification.google` に確認コードを追加
3. サイトマップを送信（https://your-domain.com/sitemap.xml）

## デプロイ

### Vercelへのデプロイ（推奨）

1. [Vercel](https://vercel.com)にアカウントを作成
2. プロジェクトをインポート
3. 自動的にビルド・デプロイされます

### その他のホスティング

静的エクスポートの場合：

\`\`\`bash
npm run build
\`\`\`

`.next` フォルダの内容をホスティングサービスにアップロードしてください。

## 注意事項

- このプロジェクトはDropboxで同期されています（Git管理は使用していません）
- カード情報は定期的に更新が必要です（還元率、年会費の変更など）
- 住信SBIのデビットカードは預金残高による還元率アップが未実装です

## ライセンス

このプロジェクトはプライベート用途です。

## お問い合わせ

質問や提案がある場合は、プロジェクトオーナーまでご連絡ください。
