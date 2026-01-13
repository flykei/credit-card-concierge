import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "クレカコンシェルジュ | クレジットカード還元額シミュレーター",
  description: "年間支出額から最適なクレジットカードを診断。年会費を差し引いた実質還元額で比較できます。三井住友プラチナプリファード、エポスプラチナなど人気カードの還元額を一括シミュレーション。",
  keywords: "クレジットカード,還元率,年会費,シミュレーター,比較,おすすめ,実質還元額,ポイント,診断ツール",
  authors: [{ name: "クレカコンシェルジュ" }],
  openGraph: {
    title: "クレカコンシェルジュ | クレジットカード還元額シミュレーター",
    description: "年会費を考慮した実質還元額であなたに最適なクレジットカードを診断",
    url: "https://your-domain.com",
    siteName: "クレカコンシェルジュ",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "クレカコンシェルジュ | クレジットカード還元額シミュレーター",
    description: "年会費を考慮した実質還元額であなたに最適なクレジットカードを診断",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console用（後で追加）
    // google: "your-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        {children}
        
        {/* 構造化データ（JSON-LD） */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "クレカコンシェルジュ",
              description: "クレジットカードの実質還元額を計算し、最適なカードを診断するシミュレーター",
              url: "https://your-domain.com",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "JPY",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.5",
                ratingCount: "100",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "クレジットカードの実質還元額とは何ですか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "実質還元額とは、クレジットカードで獲得できるポイントの価値から年会費を差し引いた金額です。還元率だけでなく年会費も考慮することで、本当にお得なカードを選ぶことができます。",
                  },
                },
                {
                  "@type": "Question",
                  name: "どのような支出カテゴリに対応していますか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Amazon、楽天市場、コンビニ、スーパー、飲食店、旅行・ホテル、ガソリンスタンド、公共料金、通信費など、主要な支出カテゴリに対応しています。",
                  },
                },
                {
                  "@type": "Question",
                  name: "年間利用額ボーナスも計算に含まれますか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "はい、年間100万円利用で10,000ポイント付与などの特典も計算に含まれます。これにより、より正確な実質還元額を算出できます。",
                  },
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
