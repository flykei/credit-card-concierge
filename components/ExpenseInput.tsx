'use client';

import { useState } from 'react';
import { Expenses } from '@/lib/types';
import CurrencyInput from './CurrencyInput';
import ExpenseBreakdown from './ExpenseBreakdown';
import MileValueSettings from './MileValueSettings';

interface ExpenseInputProps {
  onCalculate: (expenses: Expenses) => void;
}

export default function ExpenseInput({ onCalculate }: ExpenseInputProps) {
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [breakdown, setBreakdown] = useState<Record<string, string>>({});
  const [sbiDepositBalance, setSbiDepositBalance] = useState<string>('');
  const [mileValue, setMileValue] = useState<string>('2');

  const handleBreakdownChange = (merchant: string, value: string) => {
    setBreakdown(prev => ({
      ...prev,
      [merchant]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 万円単位を円に変換
    const total = (parseInt(totalAmount) || 0) * 10000;
    const expenseBreakdown: Record<string, number> = {};

    // 内訳を数値に変換（万円 → 円）
    for (const [merchant, value] of Object.entries(breakdown)) {
      const amount = (parseInt(value) || 0) * 10000;
      if (amount > 0) {
        expenseBreakdown[merchant] = amount;
      }
    }

    // カスタムポイント価値を設定（マイル系カード全体に適用）
    const customPointValues: Record<string, number> = {};
    const parsedMileValue = parseFloat(mileValue) || 2;
    const mileCardIds = [
      'ana-amex-premium',
      'ana-visa-platinum-premium',
      'ana-jcb-premium',
      'jal-platinum-jcb',
      'jal-club-a-gold',
      'jal-amex-platinum',
    ];
    mileCardIds.forEach(id => {
      customPointValues[id] = parsedMileValue;
    });

    const expenses: Expenses = {
      total,
      breakdown: expenseBreakdown,
      additionalInfo: {
        sbiDepositBalance: (parseInt(sbiDepositBalance) || 0) * 10000 || undefined,
        enableMultiCardRecommendation: true,
        customPointValues,
      },
    };

    onCalculate(expenses);
  };

  return (
    <form onSubmit={handleSubmit} className="section">
      {/* 年間支出合計額 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <CurrencyInput
          id="total"
          label="年間支出合計額"
          value={totalAmount}
          onChange={setTotalAmount}
          required
          placeholder="例：300"
          helpText="クレジットカードで支払う予定の年間支出額を万円単位で入力してください。"
        />
      </div>

      {/* 銀行残高 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <CurrencyInput
          id="sbiBalance"
          label="銀行残高"
          value={sbiDepositBalance}
          onChange={setSbiDepositBalance}
          required
          placeholder="例：500"
          helpText="銀行残高を入力すると、住信SBI系デビットカードの正確な還元率を計算できます。"
        />
      </div>

      {/* 支出内訳 */}
      <ExpenseBreakdown
        breakdown={breakdown}
        onBreakdownChange={handleBreakdownChange}
      />

      {/* マイル価値設定 */}
      <MileValueSettings
        value={mileValue}
        onChange={setMileValue}
      />

      <div className="form-group">
        <button type="submit" className="btn btn--secondary btn--large">
          最適なカードを診断する
        </button>
        <p className="text-note">
          完全無料・個人情報不要・所要時間3分
        </p>
      </div>
    </form>
  );
}
