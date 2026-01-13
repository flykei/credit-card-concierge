'use client';

import { useState } from 'react';
import { Expenses, CalculationResult, MultiCardRecommendation } from '@/lib/types';
import { getAllCards } from '@/lib/cards';
import { calculateAllCards, validateExpenses, calculateMultiCardRecommendation } from '@/lib/calculator';
import ExpenseInput from './ExpenseInput';
import ResultDisplay from './ResultDisplay';

export default function Calculator() {
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [multiCardRecommendations, setMultiCardRecommendations] = useState<MultiCardRecommendation[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleCalculate = (expenses: Expenses) => {
    // バリデーション
    const validation = validateExpenses(expenses);
    if (!validation.valid) {
      setErrors(validation.errors);
      setResults([]);
      setMultiCardRecommendations([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // エラーをクリア
    setErrors([]);

    // 全カードの還元額を計算
    const allCards = getAllCards();
    const calculationResults = calculateAllCards(allCards, expenses);

    setResults(calculationResults);

    // 複数カード組み合わせ提案を計算（有効化されている場合）
    if (expenses.additionalInfo?.enableMultiCardRecommendation) {
      const multiCardResults = calculateMultiCardRecommendation(allCards, expenses);
      setMultiCardRecommendations(multiCardResults);
    } else {
      setMultiCardRecommendations([]);
    }

    // 結果セクションまでスクロール
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* エラー表示 */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-900 mb-2">⚠️ 入力エラー</h3>
          <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 入力フォーム */}
      <ExpenseInput onCalculate={handleCalculate} />

      {/* 計算結果 */}
      <div id="results">
        <ResultDisplay results={results} multiCardRecommendations={multiCardRecommendations} />
      </div>
    </div>
  );
}
