import Calculator from '@/components/Calculator';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-lg bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            クレカコンシェルジュ
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            年会費を考慮した実質還元額で最適なカードを診断
          </p>
        </div>
      </header>

      {/* ヒーローセクション */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white py-20">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              年間支出から算出する<br />
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">本当にお得な</span>クレジットカード
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-indigo-100 font-light">
              還元率だけでは見えない、年会費込みの実質還元額で比較
            </p>
            <div className="flex flex-wrap gap-6 justify-center items-center text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">完全無料</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">3分で完了</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-medium">個人情報不要</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 使い方セクション */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            3ステップで最適なカードを診断
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 mt-2">年間支出額を入力</h3>
              <p className="text-gray-600 leading-relaxed">クレジットカードで払う金額を入力するだけ。Amazon、楽天などの内訳も入力可能</p>
            </div>
            <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 mt-2">最適カードを診断</h3>
              <p className="text-gray-600 leading-relaxed">24枚のカードから、あなたの支出パターンに最適なカードをランキング形式で表示</p>
            </div>
            <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 mt-2">今すぐ申し込み</h3>
              <p className="text-gray-600 leading-relaxed">診断結果からそのまま公式サイトへアクセスして申し込みが完了</p>
            </div>
          </div>
        </div>

        {/* 特徴セクション */}
        <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-3xl p-10 mb-16 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            このツールの特徴
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">実質還元額で比較</h3>
                <p className="text-gray-600 text-sm leading-relaxed">獲得ポイント - 年会費 = あなたの本当の得を正確に計算</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">支出内訳を反映</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Amazon、楽天、コンビニなど、あなたの使い方に最適化</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">年間ボーナス込み</h3>
                <p className="text-gray-600 text-sm leading-relaxed">年100万円で10,000pt還元などの特典も全て計算</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">複数カード使い分けも</h3>
                <p className="text-gray-600 text-sm leading-relaxed">最大3枚の組み合わせで、さらに還元額UP</p>
              </div>
            </div>
          </div>
        </div>

        {/* 計算機 */}
        <Calculator />

        {/* 対応カード */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">対応カード一覧（全24枚）</h2>
          <p className="text-sm text-gray-600 mb-4">
            カード名をクリックすると、詳細情報（還元率、年会費、特典など）を確認できます。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <a href="/cards/jcb-card-w" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              JCBカードW
            </a>
            <a href="/cards/rakuten-card" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              楽天カード
            </a>
            <a href="/cards/orico-card-the-point" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              Orico Card THE POINT
            </a>
            <a href="/cards/recruit-card" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              リクルートカード
            </a>
            <a href="/cards/p-one-wiz" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              P-oneカード Wiz
            </a>
            <a href="/cards/smbc-gold-nl" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              三井住友カード ゴールド(NL)
            </a>
            <a href="/cards/mercari-gold" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              メルカード ゴールド
            </a>
            <a href="/cards/paypay-card-gold" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              PayPayカード ゴールド
            </a>
            <a href="/cards/rakuten-premium-card" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              楽天プレミアムカード
            </a>
            <a href="/cards/sbi-debit-point-plus" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              住信SBIネット銀行 デビットカード Point+
            </a>
            <a href="/cards/sbi-platinum-debit" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              住信SBIネット銀行 プラチナデビットカード
            </a>
            <a href="/cards/jaccs-platinum" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              ジャックスカードプラチナ
            </a>
            <a href="/cards/epos-platinum" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              エポスプラチナカード
            </a>
            <a href="/cards/smbc-platinum-preferred" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              三井住友カード プラチナプリファード
            </a>
            <a href="/cards/saison-platinum-amex" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              セゾンプラチナ・アメックス
            </a>
            <a href="/cards/marriott-bonvoy-amex-premium" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              Marriott Bonvoy アメックス・プレミアム
            </a>
            <a href="/cards/luxury-card-black" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              ラグジュアリーカード Mastercard Black
            </a>
            <a href="/cards/amex-platinum" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              アメリカン・エキスプレス・プラチナ・カード
            </a>
            <a href="/cards/ana-amex-premium" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              ANA アメックス・プレミアム
            </a>
            <a href="/cards/ana-visa-platinum-premium" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              ANA VISAプラチナ プレミアム
            </a>
            <a href="/cards/ana-jcb-premium" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              ANA JCBカード プレミアム
            </a>
            <a href="/cards/jal-platinum-jcb" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              JALカード プラチナ（JCB）
            </a>
            <a href="/cards/jal-club-a-gold" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              JAL CLUB-Aゴールド
            </a>
            <a href="/cards/jal-amex-platinum" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
              <span className="mr-2">•</span>
              JALアメックス プラチナ
            </a>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2026 クレカコンシェルジュ. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              本サイトの情報は参考情報であり、カード会社の公式情報を優先してください。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
