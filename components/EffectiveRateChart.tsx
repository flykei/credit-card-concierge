'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/lib/types';

interface EffectiveRateChartProps {
  card: Card;
}

/**
 * SBI銀行の預金残高に応じた基本還元率を取得
 */
function getSBIBaseRate(cardId: string, depositBalance: number): number {
  if (cardId === 'sbi-platinum-debit') {
    if (depositBalance >= 10000000) return 2.5;
    if (depositBalance >= 5000000) return 2.0;
    if (depositBalance >= 2000000) return 1.75;
    if (depositBalance >= 1000000) return 1.5;
    return 1.25;
  }
  
  if (cardId === 'sbi-debit-point-plus') {
    if (depositBalance >= 10000000) return 2.0;
    if (depositBalance >= 5000000) return 1.75;
    if (depositBalance >= 2000000) return 1.5;
    return 1.25;
  }
  
  return 0;
}

/**
 * 年間利用額に応じた実質還元率を計算
 * @param annualAmount 年間利用額
 * @param card カード情報
 * @param depositBalance SBI銀行の預金残高（該当カードのみ）
 * @returns 実質還元率（%）
 */
function calculateEffectiveRate(annualAmount: number, card: Card, depositBalance?: number): number {
  if (annualAmount === 0) return 0;

  const pointValue = card.pointValue || 1;
  
  // 基本還元率（SBI系カードの場合は預金残高を考慮）
  let baseRate = card.baseRate;
  if ((card.id === 'sbi-platinum-debit' || card.id === 'sbi-debit-point-plus') && depositBalance !== undefined) {
    baseRate = getSBIBaseRate(card.id, depositBalance);
  }
  
  // 基本還元ポイント
  const basePoints = (annualAmount * baseRate) / 100;
  
  // 年間利用特典ボーナス
  let specialBonusPoints = 0;
  for (const bonus of card.specialBonuses) {
    if (bonus.type === 'annual_usage' && bonus.threshold && annualAmount >= bonus.threshold) {
      specialBonusPoints += bonus.bonus;
    }
  }
  
  // 合計ポイント
  const totalPoints = basePoints + specialBonusPoints;
  
  // ポイント価値（円）
  const pointsValue = totalPoints * pointValue;
  
  // 実質還元額
  const effectiveReturn = pointsValue - card.annualFee;
  
  // 実質還元率
  const effectiveRate = (effectiveReturn / annualAmount) * 100;
  
  // 0%未満の場合は0%として表示
  return Math.max(0, effectiveRate);
}

/**
 * グラフデータを生成（通常のカード用）
 */
function generateChartData(card: Card) {
  const data = [];
  const maxAmount = 20000000; // 2000万円
  const step = 500000; // 50万円刻み
  
  for (let amount = 0; amount <= maxAmount; amount += step) {
    data.push({
      amount: amount / 10000, // 万円単位で表示
      rate: calculateEffectiveRate(amount, card),
    });
  }
  
  return data;
}

/**
 * SBI銀行系カード用のグラフデータを生成（複数の預金残高パターン）
 */
function generateSBIChartData(card: Card) {
  const data: any[] = [];
  const maxAmount = 20000000; // 2000万円
  const step = 500000; // 50万円刻み
  
  // 預金残高パターンを定義
  let depositBalances: number[];
  if (card.id === 'sbi-platinum-debit') {
    depositBalances = [0, 1000000, 2000000, 5000000, 10000000];
  } else if (card.id === 'sbi-debit-point-plus') {
    depositBalances = [0, 2000000, 5000000, 10000000];
  } else {
    return [];
  }
  
  for (let amount = 0; amount <= maxAmount; amount += step) {
    const dataPoint: any = {
      amount: amount / 10000, // 万円単位で表示
    };
    
    // 各預金残高パターンでの還元率を計算
    depositBalances.forEach((balance) => {
      const rate = calculateEffectiveRate(amount, card, balance);
      dataPoint[`rate_${balance}`] = rate;
    });
    
    data.push(dataPoint);
  }
  
  return data;
}

/**
 * 預金残高のラベルを取得
 */
function getDepositLabel(balance: number): string {
  if (balance === 0) return '預金残高: 0円';
  if (balance >= 10000000) return '預金残高: 1,000万円以上';
  if (balance >= 5000000) return '預金残高: 500万円以上';
  if (balance >= 2000000) return '預金残高: 200万円以上';
  if (balance >= 1000000) return '預金残高: 100万円以上';
  return `預金残高: ${(balance / 10000).toLocaleString()}万円`;
}

export default function EffectiveRateChart({ card }: EffectiveRateChartProps) {
  const isSBICard = card.id === 'sbi-platinum-debit' || card.id === 'sbi-debit-point-plus';
  const data = isSBICard ? generateSBIChartData(card) : generateChartData(card);
  
  // SBI系カードの預金残高パターン
  const sbiDepositBalances = card.id === 'sbi-platinum-debit' 
    ? [0, 1000000, 2000000, 5000000, 10000000]
    : card.id === 'sbi-debit-point-plus'
    ? [0, 2000000, 5000000, 10000000]
    : [];
  
  // グラフの色
  const colors = ['#94a3b8', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        年間利用額と実質還元率の関係
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        このグラフは、年会費・基本還元率・年間利用特典を考慮した実質還元率を示します。
        （カテゴリ別ボーナス還元は含まれていません）
        {isSBICard && <span className="block mt-1 font-semibold text-blue-700">※ 預金残高に応じた還元率の違いを複数の線で表示しています</span>}
      </p>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="amount" 
            label={{ value: '年間利用額（万円）', position: 'insideBottom', offset: -5 }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <YAxis 
            label={{ value: '実質還元率（%）', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => value.toFixed(2) + '%'}
            domain={[0, 'auto']}
          />
          <Tooltip 
            formatter={(value: number | undefined) => {
              if (value === undefined) return ['N/A', '実質還元率'];
              return [value.toFixed(3) + '%', '実質還元率'];
            }}
            labelFormatter={(label) => `年間利用額: ${Number(label).toLocaleString()}万円`}
          />
          <Legend />
          
          {isSBICard ? (
            // SBI系カード: 複数の預金残高パターンで複数の線を表示
            sbiDepositBalances.map((balance, index) => (
              <Line 
                key={balance}
                type="monotone" 
                dataKey={`rate_${balance}`}
                stroke={colors[index]}
                strokeWidth={2}
                name={getDepositLabel(balance)}
                dot={false}
              />
            ))
          ) : (
            // 通常のカード: 1本の線のみ
            <Line 
              type="monotone" 
              dataKey="rate" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="実質還元率"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">グラフの見方</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• 実質還元率がマイナスになる部分は0%として表示しています</li>
          <li>• 年間利用額が増えると、年会費の影響が薄まり実質還元率が向上します</li>
          <li>• 年間利用特典（100万円で○○ポイントなど）があるカードは、該当額で還元率が跳ね上がります</li>
          {isSBICard && <li>• <strong>SBI銀行の預金残高が多いほど、基本還元率が高くなり実質還元率も向上します</strong></li>}
          <li>• 実際の還元率は、Amazon・楽天・コンビニなどのボーナス還元により、さらに高くなります</li>
        </ul>
      </div>
    </div>
  );
}
