'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/lib/types';
import { getAllCards } from '@/lib/cards';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CardRanking {
  card: Card;
  maxRate: number;
  maxRateAmount: number;
}

export default function RankingPage() {
  const [topCards, setTopCards] = useState<CardRanking[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const cards = getAllCards();
    
    // 各カードの最大実質還元率を計算
    const rankings: CardRanking[] = cards.map(card => {
      let maxRate = -Infinity;
      let maxRateAmount = 0;

      // 0円から2000万円まで計算
      for (let amount = 0; amount <= 20000000; amount += 100000) {
        const rate = calculateEffectiveRate(card, amount);
        if (rate > maxRate) {
          maxRate = rate;
          maxRateAmount = amount;
        }
      }

      return { card, maxRate, maxRateAmount };
    });

    // 実質還元率でソートして上位5つ
    const top5 = rankings
      .sort((a, b) => b.maxRate - a.maxRate)
      .slice(0, 5);
    
    setTopCards(top5);

    // グラフデータを生成
    const data: any[] = [];
    for (let amount = 0; amount <= 20000000; amount += 500000) {
      const point: any = {
        amount: amount / 10000, // 万円単位
      };
      
      top5.forEach(ranking => {
        const rate = calculateEffectiveRate(ranking.card, amount);
        point[ranking.card.name] = rate;
      });
      
      data.push(point);
    }
    
    setChartData(data);
  }, []);

  // カードの実質還元率を計算
  const calculateEffectiveRate = (card: Card, amount: number): number => {
    if (amount === 0) return 0;

    const baseRate = card.baseRate;
    let basePoints = (amount * baseRate) / 100;

    // 年間利用特典ボーナス
    let specialBonusPoints = 0;
    for (const bonus of card.specialBonuses) {
      if (bonus.type === 'annual_usage' && bonus.threshold && amount >= bonus.threshold) {
        specialBonusPoints += bonus.bonus;
      } else if (bonus.type === 'fixed') {
        if (bonus.description && !bonus.description.includes('預金残高') && !bonus.description.includes('ANAスカイコイン')) {
          specialBonusPoints += bonus.bonus;
        }
      }
    }

    const totalPoints = basePoints + specialBonusPoints;
    const pointValue = card.pointValue || 1;
    const pointsValue = totalPoints * pointValue;
    const effectiveReturn = pointsValue - card.annualFee;
    const effectiveRate = (effectiveReturn / amount) * 100;

    return Math.max(effectiveRate, 0); // 負の値は0にする
  };

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            ← トップに戻る
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-4">
            実質還元率の高いクレジットカード徹底比較
          </h1>
          <p className="mt-2 text-gray-600">
            年間利用額に応じた実質還元率を比較。年会費・ボーナス特典を考慮した真の還元率ランキング
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* グラフセクション */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            年間利用額 vs 実質還元率
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            横軸：年間利用額（万円）、縦軸：実質還元率（%）
          </p>
          
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="amount" 
                  label={{ value: '年間利用額（万円）', position: 'insideBottom', offset: -5 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  label={{ value: '実質還元率（%）', angle: -90, position: 'insideLeft' }}
                  stroke="#6b7280"
                  domain={[0, 'auto']}
                />
                <Tooltip 
                  formatter={(value: any) => value !== undefined ? `${value.toFixed(2)}%` : ''}
                  labelFormatter={(label: any) => `${label.toLocaleString()}万円`}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                {topCards.map((ranking, index) => (
                  <Line
                    key={ranking.card.id}
                    type="monotone"
                    dataKey={ranking.card.name}
                    stroke={colors[index]}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ランキングセクション */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            実質還元率ランキング TOP5
          </h2>
          
          {topCards.map((ranking, index) => (
            <div 
              key={ranking.card.id}
              className="bg-white rounded-xl shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow"
              style={{ borderColor: colors[index] }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <span 
                      className="text-3xl font-bold"
                      style={{ color: colors[index] }}
                    >
                      {index + 1}位
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {ranking.card.name}
                    </h3>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">最大実質還元率</p>
                      <p className="text-2xl font-bold" style={{ color: colors[index] }}>
                        {ranking.maxRate.toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">最大還元率到達金額</p>
                      <p className="text-xl font-bold text-gray-900">
                        {(ranking.maxRateAmount / 10000).toLocaleString()}万円
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">年会費</p>
                      <p className="text-xl font-bold text-gray-900">
                        {ranking.card.annualFee === 0 ? '無料' : `${ranking.card.annualFee.toLocaleString()}円`}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">
                    {ranking.card.description}
                  </p>

                  <div className="flex gap-3">
                    <Link
                      href={`/cards/${ranking.card.id}`}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-2 rounded-lg transition-colors"
                    >
                      詳細を見る
                    </Link>
                    <a
                      href={ranking.card.affiliateUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition-all"
                      onClick={(e) => {
                        if (!ranking.card.affiliateUrl) {
                          e.preventDefault();
                          alert('申し込みリンクは準備中です');
                        }
                      }}
                    >
                      公式サイトで申し込む
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 注意事項 */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-12 rounded-r-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📌 計算について</h3>
          <ul className="space-y-2 text-sm text-blue-900">
            <li>• 実質還元率 = (獲得ポイント価値 - 年会費) ÷ 年間利用額 × 100</li>
            <li>• 基本還元率と年間利用特典ボーナスを考慮しています</li>
            <li>• カテゴリ別ボーナス（Amazon、楽天など）は含まれていません</li>
            <li>• SBIカードの預金残高による還元率アップは含まれていません</li>
            <li>• 実際の還元額は利用方法によって異なる場合があります</li>
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
