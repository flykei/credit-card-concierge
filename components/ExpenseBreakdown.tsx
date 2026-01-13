'use client';

import { useState } from 'react';
import { MERCHANT_CATEGORIES, MerchantCategory } from '@/lib/types';

interface ExpenseBreakdownProps {
  breakdown: Record<string, string>;
  onBreakdownChange: (merchant: string, value: string) => void;
}

export default function ExpenseBreakdown({ breakdown, onBreakdownChange }: ExpenseBreakdownProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const formatDisplayNumber = (value: string) => {
    if (!value) return '';
    return parseInt(value).toLocaleString('ja-JP');
  };

  const handleChange = (merchant: string, rawValue: string) => {
    const sanitized = rawValue.replace(/[^\d]/g, '');
    onBreakdownChange(merchant, sanitized);
  };

  const primaryCategories: MerchantCategory[] = [
    'amazon',
    'rakuten',
    'yahoo_shopping',
    'seven_eleven',
    'family_mart',
    'lawson',
    'restaurant',
    'travel',
    'jal_group',
  ];

  return (
    <div className="card">
      <div className="collapsible__header">
        <h3 className="section-title">支出内訳（任意）</h3>
        <button type="button" onClick={() => setShowBreakdown(!showBreakdown)} className="collapsible__toggle">
          {showBreakdown ? '閉じる' : '詳細入力'}
          <svg className={`collapsible__icon ${showBreakdown ? 'collapsible__icon--open' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {showBreakdown && (
        <div>
          <div className="alert alert--info mb-3">
            <p>
              <strong>ポイント高還元の店舗・サイトの支出額</strong>を入力すると、より正確な還元額をシミュレーションできます。
            </p>
          </div>

          <div>
            {primaryCategories.map((key) => (
              <div key={key} className="form-row">
                <label htmlFor={key} className="form-row__label">
                  {MERCHANT_CATEGORIES[key]}
                </label>
                <div className="input-wrapper form-row__input">
                  <input
                    type="text"
                    id={key}
                    value={breakdown[key] ? formatDisplayNumber(breakdown[key]) : ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="input"
                    placeholder="0"
                  />
                  <span className="input__unit">万円</span>
                </div>
              </div>
            ))}
          </div>

          <p className="form-help mt-4">
            ※ 内訳の合計が年間支出額と一致する必要はありません。高還元の店舗・サイトの金額のみ入力してください。
          </p>
        </div>
      )}
    </div>
  );
}
