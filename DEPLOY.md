# デプロイ手順書

クレカコンシェルジュをWebに公開するための手順です。

## デプロイ前のチェックリスト

### 1. ドメイン・URL設定の変更

以下のファイルで `https://your-domain.com` を実際のドメインに変更してください：

- [ ] `app/layout.tsx` (L25, L30)
- [ ] `app/sitemap.ts` (L4)
- [ ] `app/robots.ts` (L4)

### 2. カード情報の最終確認

- [ ] `data/cards.json` のカード情報が最新か確認
- [ ] 還元率、年会費、特典内容が公式サイトと一致しているか確認
- [ ] 免責事項が適切に表示されているか確認

### 3. ローカルテスト

\`\`\`bash
# 開発サーバーで動作確認
npm run dev

# プロダクションビルドをテスト
npm run build
npm start
\`\`\`

確認項目：
- [ ] トップページが正しく表示される
- [ ] 支出額を入力して計算が正しく動作する
- [ ] 結果が正しくランキング順に表示される
- [ ] 詳細展開が動作する
- [ ] レスポンシブデザインが正しく機能する（モバイル・タブレット・PC）
- [ ] エラーハンドリングが正しく動作する

## Vercelへのデプロイ（推奨）

### Step 1: Vercelアカウントの作成

1. [Vercel](https://vercel.com)にアクセス
2. GitHubアカウントでサインアップ（または直接サインアップ）

### Step 2: プロジェクトのインポート

#### 方法A: Gitリポジトリ経由（推奨）

1. プロジェクトをGitHubにプッシュ
   \`\`\`bash
   cd /Users/tobita/Documents/Colleagues_cursor/credit-card-concierge
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   \`\`\`

2. Vercelダッシュボードで「New Project」をクリック
3. GitHubリポジトリをインポート
4. フレームワークプリセット: Next.js（自動検出）
5. 「Deploy」をクリック

#### 方法B: Vercel CLIで直接デプロイ

\`\`\`bash
# Vercel CLIをインストール
npm i -g vercel

# プロジェクトディレクトリでログイン
cd /Users/tobita/Documents/Colleagues_cursor/credit-card-concierge
vercel login

# デプロイ
vercel

# プロダクションデプロイ
vercel --prod
\`\`\`

### Step 3: 環境変数の設定（必要な場合）

現在は環境変数は不要ですが、将来的にAPIキーなどを使用する場合：

1. Vercelダッシュボードでプロジェクトを選択
2. Settings → Environment Variables
3. 必要な変数を追加

### Step 4: カスタムドメインの設定（オプション）

1. Vercelダッシュボードでプロジェクトを選択
2. Settings → Domains
3. カスタムドメインを追加
4. DNSレコードを設定（Vercelが指示を表示）

## その他のホスティングサービス

### Netlify

1. [Netlify](https://www.netlify.com/)にサインアップ
2. 「New site from Git」でGitリポジトリをインポート
3. ビルドコマンド: `npm run build`
4. 公開ディレクトリ: `.next`
5. 「Deploy site」をクリック

### Cloudflare Pages

1. [Cloudflare Pages](https://pages.cloudflare.com/)にサインアップ
2. プロジェクトを作成
3. フレームワークプリセット: Next.js
4. デプロイ

## デプロイ後の設定

### 1. Google Search Consoleの設定

1. [Google Search Console](https://search.google.com/search-console)にアクセス
2. プロパティを追加（URLプレフィックス方式）
3. 所有権の確認
   - HTMLタグ方式の場合：`app/layout.tsx` の `verification.google` に追加
   - または他の方法で確認
4. サイトマップを送信
   - URL: `https://your-domain.com/sitemap.xml`

### 2. Google Analyticsの設定（オプション）

\`\`\`bash
# Google Analyticsパッケージをインストール
npm install @next/third-parties
\`\`\`

`app/layout.tsx` に以下を追加：

\`\`\`typescript
import { GoogleAnalytics } from '@next/third-parties/google'

// <body>タグ内に追加
<GoogleAnalytics gaId="G-XXXXXXXXXX" />
\`\`\`

### 3. パフォーマンスチェック

デプロイ後、以下のツールでサイトを分析：

- [ ] [PageSpeed Insights](https://pagespeed.web.dev/)
- [ ] [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [ ] モバイルフレンドリーテスト

目標スコア：
- パフォーマンス: 90+
- アクセシビリティ: 90+
- ベストプラクティス: 90+
- SEO: 90+

### 4. ソーシャルメディアでの表示確認

- [ ] [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

## 継続的な運用

### カード情報の更新

1. `data/cards.json` を編集
2. Gitにコミット（Git管理している場合）
3. Vercelが自動的に再デプロイ（Gitリポジトリ連携時）

### 新しいカードの追加

1. カード情報を調査
2. `data/cards.json` に追加
3. `app/page.tsx` の対応カード一覧を更新
4. デプロイ

### パフォーマンスモニタリング

- Vercel Analytics（有料）またはGoogle Analyticsで訪問者数を追跡
- Google Search Consoleで検索パフォーマンスを確認
- 定期的にPageSpeed Insightsでパフォーマンスをチェック

## トラブルシューティング

### ビルドエラーが発生する

\`\`\`bash
# ローカルでビルドエラーを確認
npm run build

# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install
\`\`\`

### ページが表示されない

1. Vercelのデプロイログを確認
2. ブラウザの開発者ツールでエラーを確認
3. 404エラーの場合：next.config.tsの設定を確認

### SEOが効かない

1. robots.txt、sitemap.xmlが正しく生成されているか確認
2. Google Search Consoleでインデックス状況を確認
3. メタデータが正しく設定されているか確認（ブラウザの「ページのソースを表示」で確認）

## サポート

デプロイに関する質問や問題がある場合：

- Vercel: [Vercel Documentation](https://vercel.com/docs)
- Next.js: [Next.js Documentation](https://nextjs.org/docs)
- このプロジェクト: プロジェクトオーナーに連絡
