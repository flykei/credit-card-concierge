'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalculationResult, MultiCardRecommendation, MERCHANT_CATEGORIES } from '@/lib/types';
import { formatNumber, formatRate } from '@/lib/calculator';

interface ResultDisplayProps {
  results: CalculationResult[];
  multiCardRecommendations?: MultiCardRecommendation[];
}

export default function ResultDisplay({ results, multiCardRecommendations = [] }: ResultDisplayProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleExpand = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  if (results.length === 0) {
    return null;
  }

  // 統合されたリストを作成（単一カードと複数カード組み合わせ）
  const allItems: Array<{ type: 'single' | 'multi'; data: any; effectiveReturn: number }> = [];
  
  // 単一カードを追加
  results.forEach((result) => {
    allItems.push({
      type: 'single',
      data: result,
      effectiveReturn: result.effectiveReturn,
    });
  });

  // 複数カード提案を追加
  multiCardRecommendations.forEach((recommendation) => {
    allItems.push({
      type: 'multi',
      data: recommendation,
      effectiveReturn: recommendation.totalEffectiveReturn,
    });
  });

  // 実質還元額でソート
  allItems.sort((a, b) => b.effectiveReturn - a.effectiveReturn);

  // 上位10位までに制限
  const topItems = allItems.slice(0, 10);

  return (
    <section className="section">
      <div className="result-header">
        <h2 className="result-header__title">診断結果</h2>
        <p className="result-header__subtitle">
          実質還元額（獲得ポイント - 年会費）でランキング
        </p>
        <div className="result-header__note">
          <p>あなたの年間支出で<strong>最もお得なカード</strong>を表示しています</p>
        </div>
      </div>

      <div className="section">
        {topItems.map((item, listIndex) => {
          if (item.type === 'multi' && item.data) {
            const multiCard = item.data as MultiCardRecommendation;
            const isTop = listIndex === 0;
            
            return (
              <div
                key={`multi-${listIndex}-${multiCard.cards.map(c => c.card.id).join('-')}`}
                className="card card--highlight"
              >
                {/* ヘッダー */}
                <div className="card__header">
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2 mb-2">
                      {listIndex === 0 && <span className="rank-badge rank-badge--first">第1位 最もお得</span>}
                      {listIndex === 1 && <span className="rank-badge rank-badge--second">第2位</span>}
                      {listIndex === 2 && <span className="rank-badge rank-badge--third">第3位</span>}
                      {listIndex > 2 && <span className="rank-badge rank-badge--other">第{listIndex + 1}位</span>}
                      <span className="badge--multi">複数カード使い分け</span>
                    </div>
                    <h3 className="card__title">
                      {multiCard.cards.map(c => c.card.name).join(' + ')}
                    </h3>
                    {multiCard.improvement > 0 ? (
                      <p className="text-sm text-gray-600">
                        2枚のカードを使い分けることで、単一カードより<span className="font-bold text-green-600">+{formatNumber(multiCard.improvement)}円</span>お得
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        2枚のカードを使い分けた場合の提案です
                      </p>
                    )}
                  </div>
                </div>

                {/* 実質還元額 */}
                  <div className={`rounded-lg p-6 mb-6 ${
                    isTop 
                      ? 'bg-gradient-to-r from-yellow-50 to-yellow-100' 
                      : 'bg-gradient-to-r from-gray-50 to-gray-100'
                  }`}>
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">実質還元額（合計）</p>
                        <p className={`text-4xl font-bold ${isTop ? 'text-yellow-900' : 'text-gray-900'}`}>
                          {formatNumber(multiCard.totalEffectiveReturn)}円
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">実質還元率</p>
                        <p className={`text-2xl font-bold ${isTop ? 'text-yellow-900' : 'text-gray-900'}`}>
                          {formatRate(multiCard.totalEffectiveRate)}
                        </p>
                      </div>
                    </div>
                    
                    {/* 2年目以降の合計（年会費無料条件達成カードがある場合） */}
                    {(() => {
                      let totalSecondYearReturn = 0;
                      let hasSecondYearBenefit = false;
                      let totalAllocatedAmount = 0;

                      multiCard.cards.forEach(cardAllocation => {
                        totalAllocatedAmount += cardAllocation.allocatedAmount;
                        
                        // 年会費無料条件を判定
                        let annualFeeWaived = false;
                        if (cardAllocation.card.id === 'smbc-gold-nl' && cardAllocation.allocatedAmount >= 1000000) {
                          annualFeeWaived = true;
                        }
                        if (cardAllocation.card.id === 'mercari-gold' && cardAllocation.allocatedAmount >= 500000) {
                          annualFeeWaived = true;
                        }
                        
                        if (annualFeeWaived && cardAllocation.card.annualFee > 0 && cardAllocation.card.annualFeeConditions?.includes('翌年')) {
                          hasSecondYearBenefit = true;
                          // 2年目以降は年会費0円なのでポイント価値がそのまま実質還元額
                          totalSecondYearReturn += cardAllocation.pointsValue;
                        } else {
                          // 年会費無料でない場合は通常通り
                          totalSecondYearReturn += cardAllocation.effectiveReturn;
                        }
                      });

                      if (hasSecondYearBenefit) {
                        const secondYearRate = (totalSecondYearReturn / totalAllocatedAmount) * 100;
                        return (
                          <div className="pt-4 border-t border-gray-300">
                            <div className="flex items-baseline justify-between">
                              <div>
                                <p className="text-sm text-blue-600 font-semibold mb-1">✨ 2年目以降（合計）</p>
                                <p className="text-2xl font-bold text-blue-600">
                                  {formatNumber(totalSecondYearReturn)}円
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600 mb-1">実質還元率</p>
                                <p className="text-xl font-bold text-blue-600">
                                  {formatRate(secondYearRate)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* 各カードの詳細 */}
                  <div className="space-y-4 mb-6">
                    {multiCard.cards.map((cardAllocation) => (
                      <div key={cardAllocation.card.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900">{cardAllocation.card.name}</h4>
                            <p className="text-sm text-gray-600">
                              年間利用額: {formatNumber(cardAllocation.allocatedAmount)}円 → 
                              実質還元額: <span className="font-bold text-blue-600">{formatNumber(cardAllocation.effectiveReturn)}円</span>
                            </p>
                            {/* 2年目以降の表示 */}
                            {(() => {
                              // 年会費無料条件を判定
                              let annualFeeWaived = false;
                              if (cardAllocation.card.id === 'smbc-gold-nl' && cardAllocation.allocatedAmount >= 1000000) {
                                annualFeeWaived = true;
                              }
                              if (cardAllocation.card.id === 'mercari-gold' && cardAllocation.allocatedAmount >= 500000) {
                                annualFeeWaived = true;
                              }
                              
                              if (annualFeeWaived && cardAllocation.card.annualFee > 0 && cardAllocation.card.annualFeeConditions?.includes('翌年')) {
                                const secondYearReturn = cardAllocation.pointsValue;
                                const secondYearRate = (secondYearReturn / cardAllocation.allocatedAmount) * 100;
                                return (
                                  <p className="text-xs text-blue-600 mt-1">
                                    ✨ 2年目以降: {formatNumber(secondYearReturn)}円（{formatRate(secondYearRate)}）
                                  </p>
                                );
                              }
                              return null;
                            })()}
                            {/* SBI系カードの注釈 */}
                            {(cardAllocation.card.id === 'sbi-platinum-debit' || cardAllocation.card.id === 'sbi-debit-point-plus') && (
                              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                <p className="text-blue-900 font-semibold">
                                  ⚠️ 銀行残高が全額SBIにあることが前提
                                </p>
                              </div>
                            )}
                          </div>
                          <a
                            href={cardAllocation.card.affiliateUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`ml-4 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] whitespace-nowrap ${
                              isTop 
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
                            }`}
                            onClick={(e) => {
                              if (!cardAllocation.card.affiliateUrl) {
                                e.preventDefault();
                                alert('申し込みリンクは準備中です');
                              }
                            }}
                          >
                            申し込む
                          </a>
                        </div>

                        {Object.keys(cardAllocation.categoryAllocations).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-300">
                            <p className="text-xs font-semibold text-gray-700 mb-2">このカードで使うカテゴリ：</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(cardAllocation.categoryAllocations).map(([category, amount]) => (
                                <span key={category} className="bg-white px-2 py-1 rounded text-xs text-gray-700 border">
                                  {MERCHANT_CATEGORIES[category as keyof typeof MERCHANT_CATEGORIES]}: {formatNumber(amount)}円
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                {/* ヒント */}
                <div className="alert alert--info">
                  <p>
                    💡 <strong>使い分けのポイント：</strong> カテゴリ別の高還元を活かしつつ、年間利用特典の閾値も考慮した最適な配分です。
                  </p>
                </div>
              </div>
            );
          } else {
            // 単一カード表示
            const result = item.data as CalculationResult;
            const isExpanded = expandedCards.has(result.card.id);
            const isTopCard = listIndex === 0;
            const isNegativeReturn = result.effectiveReturn < 0;

            return (
              <div
                key={result.card.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
                  isTopCard ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                {/* カードヘッダー */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {listIndex === 0 && (
                          <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 text-base font-bold px-5 py-2 rounded-lg shadow-lg border-2 border-amber-300">
                            第1位 最もお得
                          </span>
                        )}
                        {listIndex === 1 && (
                          <span className="bg-gradient-to-r from-slate-300 to-slate-400 text-slate-700 text-base font-semibold px-4 py-2 rounded-lg shadow-md border-2 border-slate-300">
                            第2位
                          </span>
                        )}
                        {listIndex === 2 && (
                          <span className="bg-gradient-to-r from-orange-300 to-orange-400 text-orange-800 text-base font-semibold px-4 py-2 rounded-lg shadow-md border-2 border-orange-300">
                            第3位
                          </span>
                        )}
                        {listIndex > 2 && (
                          <span className="bg-gray-100 text-gray-600 text-sm font-medium px-4 py-1.5 rounded-lg border border-gray-300">
                            第{listIndex + 1}位
                          </span>
                        )}
                      </div>
                      <Link 
                        href={`/cards/${result.card.id}`}
                        className="text-xl font-bold text-gray-900 hover:text-blue-600 mb-1 inline-block"
                      >
                        {result.card.name}
                      </Link>
                      <p className="text-sm text-gray-600">{result.card.issuer}</p>
                      {result.card.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {result.card.description}
                        </p>
                      )}
                      {/* SBI系カードの注釈 */}
                      {(result.card.id === 'sbi-platinum-debit' || result.card.id === 'sbi-debit-point-plus') && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-900 font-semibold mb-2">
                            ⚠️ このカードは銀行残高が全額住信SBIネット銀行にあることが前提です
                          </p>
                          <a
                            href="https://www.netbk.co.jp/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                          >
                            💳 住信SBIネット銀行の口座開設はこちら →
                          </a>
                        </div>
                      )}
                      <Link 
                        href={`/cards/${result.card.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                      >
                        詳細を見る →
                      </Link>
                    </div>
                    
                    {/* 申し込みボタン */}
                    <div className="flex flex-col gap-2 ml-4">
                      <a
                        href={result.card.affiliateUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-6 py-3 rounded-lg font-semibold text-center text-white shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] whitespace-nowrap ${
                          isTopCard 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700' 
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                        }`}
                        onClick={(e) => {
                          if (!result.card.affiliateUrl) {
                            e.preventDefault();
                            alert('申し込みリンクは準備中です');
                          }
                        }}
                      >
                        公式サイトで申し込む
                      </a>
                      {isTopCard && (
                        <span className="text-xs text-emerald-600 text-center font-semibold">このカードが最もお得です</span>
                      )}
                    </div>
                  </div>

                  {/* 主要指標 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">年会費</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatNumber(result.breakdown.annualFee)}円
                      </p>
                      {result.card.annualFeeConditions && (
                        <p className="text-xs text-gray-500 mt-1">
                          {result.card.annualFeeConditions}
                        </p>
                      )}
                      {(() => {
                        // 年会費無料条件達成の判定
                        let conditionMet = false;
                        if (result.card.id === 'smbc-gold-nl' && result.totalExpense >= 1000000) {
                          conditionMet = true;
                        }
                        if (result.card.id === 'mercari-gold' && result.totalExpense >= 500000) {
                          conditionMet = true;
                        }
                        return conditionMet && result.card.annualFee > 0 && (
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            ✓ 翌年以降無料の条件達成
                          </p>
                        );
                      })()}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">獲得ポイント</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatNumber(result.totalPoints)}pt
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">ポイント価値</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatNumber(result.pointsValue)}円
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">実質還元額</p>
                      <p
                        className={`text-xl font-bold ${
                          isNegativeReturn
                            ? 'text-red-600'
                            : isTopCard
                            ? 'text-yellow-700'
                            : 'text-green-600'
                        }`}
                      >
                        {result.effectiveReturn >= 0 ? '+' : ''}
                        {formatNumber(result.effectiveReturn)}円
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        実質還元率: {formatRate(result.effectiveRate)}
                      </p>
                      {/* 2年目以降の実質還元額（年会費無料条件達成時） */}
                      {(() => {
                        // 年会費無料条件を判定
                        let conditionMet = false;
                        if (result.card.id === 'smbc-gold-nl' && result.totalExpense >= 1000000) {
                          conditionMet = true;
                        }
                        if (result.card.id === 'mercari-gold' && result.totalExpense >= 500000) {
                          conditionMet = true;
                        }
                        return conditionMet && result.card.annualFee > 0 && result.card.annualFeeConditions?.includes('翌年');
                      })() && (
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <p className="text-xs text-blue-600 mb-1 font-semibold">✨ 2年目以降（年会費無料）</p>
                          <p className="text-lg font-bold text-blue-600">
                            +{formatNumber(result.pointsValue)}円
                          </p>
                          <p className="text-xs text-gray-600">
                            実質還元率: {formatRate((result.pointsValue / result.totalExpense) * 100)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 詳細表示ボタン */}
                  <button
                    onClick={() => toggleExpand(result.card.id)}
                    className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border-t border-gray-200"
                  >
                    {isExpanded ? '詳細を閉じる ▲' : '詳細を見る ▼'}
                  </button>
                </div>

                {/* 詳細情報 */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">獲得ポイントの内訳</h4>
                    
                    {/* 基本還元 */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-700">基本還元</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatNumber(result.breakdown.basePoints)}pt
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        基本還元率 {result.breakdown.effectiveBaseRate || result.card.baseRate}%
                        {result.breakdown.effectiveBaseRate && result.breakdown.effectiveBaseRate > result.card.baseRate && (
                          <span className="text-blue-600 font-semibold ml-1">
                            (預金残高により{result.card.baseRate}%→{result.breakdown.effectiveBaseRate}%)
                          </span>
                        )}
                      </p>
                    </div>

                    {/* ボーナス還元 */}
                    {result.breakdown.bonusPoints > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-700">カテゴリ別ボーナス還元</span>
                          <span className="text-sm font-semibold text-blue-600">
                            +{formatNumber(result.breakdown.bonusPoints)}pt
                          </span>
                        </div>
                        <div className="space-y-1">
                          {result.breakdown.details.map((detail, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-gray-600">
                              <span>
                                {detail.merchantName}: {formatNumber(detail.amount)}円 × {detail.rate}%
                              </span>
                              <span>{formatNumber(detail.points)}pt</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 年間利用特典 */}
                    {result.breakdown.specialBonusPoints > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-700">年間利用特典ボーナス</span>
                          <span className="text-sm font-semibold text-green-600">
                            +{formatNumber(result.breakdown.specialBonusPoints)}pt
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 合計 */}
                    <div className="pt-4 border-t border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">合計獲得ポイント</span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatNumber(result.totalPoints)}pt
                        </span>
                      </div>
                      {result.card.pointValue && result.card.pointValue !== 1 && (
                        <p className="text-xs text-gray-500 mt-1">
                          1pt = {result.card.pointValue}円相当
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          }
        })}
      </div>

      {/* 注意事項 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-yellow-900 mb-2">⚠️ ご注意</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>このシミュレーション結果は概算です。実際の還元額は利用条件により異なる場合があります。</li>
          <li>カードの還元率や特典内容は変更される可能性があります。</li>
          <li>カード申し込み前に必ず公式サイトで最新情報をご確認ください。</li>
          <li>住信SBIのデビットカードは預金残高による還元率アップが反映されていません。</li>
        </ul>
      </div>
    </section>
  );
}
