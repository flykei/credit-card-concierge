import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllCards, getCardById } from '@/lib/cards';
import { Metadata } from 'next';
import EffectiveRateChart from '@/components/EffectiveRateChart';

type Props = {
  params: { id: string };
};

export async function generateStaticParams() {
  const cards = getAllCards();
  return cards.map((card) => ({
    id: card.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const card = getCardById(id);
  
  if (!card) {
    return {
      title: 'カードが見つかりません',
    };
  }

  return {
    title: `${card.name} | 実質還元率・年会費 | クレカコンシェルジュ`,
    description: `${card.name}の実質還元率、年会費、ポイント還元の詳細情報。${card.description}`,
  };
}

export default async function CardDetailPage({ params }: Props) {
  const { id } = await params;
  const card = getCardById(id);

  if (!card) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            ← トップページに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {card.name}
          </h1>
          <p className="mt-2 text-gray-600">{card.issuer}</p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* カード概要 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">カード概要</h2>
          <p className="text-gray-700">{card.description}</p>
        </div>

        {/* 基本情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">基本情報</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-gray-700 font-medium">年会費</span>
              <span className="text-xl font-bold text-gray-900">
                {card.annualFee.toLocaleString()}円
              </span>
            </div>
            {card.annualFeeConditions && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">条件:</span> {card.annualFeeConditions}
                </p>
              </div>
            )}
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-gray-700 font-medium">基本還元率</span>
              <span className="text-xl font-bold text-blue-600">
                {card.baseRate}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">ポイント価値</span>
              <span className="text-gray-900">
                1ポイント = {card.pointValue || 1}円
              </span>
            </div>
          </div>
        </div>

        {/* ボーナス還元 */}
        {card.bonusRates.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ボーナス還元</h2>
            <div className="space-y-3">
              {card.bonusRates.map((bonus, index) => (
                <div key={index} className="bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">
                      {bonus.merchantName}
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {bonus.rate}%
                    </span>
                  </div>
                  {bonus.description && (
                    <p className="text-sm text-gray-600">{bonus.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 年間利用ボーナス */}
        {card.specialBonuses.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">年間利用特典</h2>
            <div className="space-y-3">
              {card.specialBonuses.map((bonus, index) => (
                <div key={index} className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-900">
                        {bonus.description || 
                          `年間${bonus.threshold?.toLocaleString()}円以上利用で${bonus.bonus.toLocaleString()}ポイント`}
                      </p>
                    </div>
                    {bonus.bonus > 0 && (
                      <span className="ml-4 text-lg font-bold text-yellow-700">
                        +{bonus.bonus.toLocaleString()}pt
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* グラフ */}
        <EffectiveRateChart card={card} />

        {/* 実質還元率の計算例 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white mb-8 mt-8">
          <h2 className="text-xl font-bold mb-4">実質還元率の計算方法</h2>
          <div className="space-y-3">
            <p className="text-blue-100">
              このカードの実質還元額は、以下の計算式で算出されます：
            </p>
            <div className="bg-white/10 rounded p-4 font-mono text-sm">
              <p>実質還元額 = 獲得ポイント - 年会費</p>
              <p className="mt-2">実質還元率 = 実質還元額 ÷ 年間支出額 × 100</p>
            </div>
            <p className="text-blue-100 text-sm">
              ※ 獲得ポイントには、基本還元、ボーナス還元、年間利用特典が含まれます
            </p>
          </div>
        </div>

        {/* シミュレーションへのリンク */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            あなたの支出額で実質還元額をシミュレーション
          </h3>
          <p className="text-gray-600 mb-4">
            年間支出額を入力して、このカードの実質還元額を計算できます。
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
          >
            シミュレーターで計算する
          </Link>
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ ご注意</h4>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>記載の還元率や特典内容は変更される可能性があります。</li>
            <li>最新の情報は必ず公式サイトでご確認ください。</li>
            <li>実際の還元額は利用条件により異なる場合があります。</li>
          </ul>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2026 クレカコンシェルジュ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
