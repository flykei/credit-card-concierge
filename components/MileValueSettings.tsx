'use client';

import { useState } from 'react';

interface MileValueSettingsProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MileValueSettings({ value, onChange }: MileValueSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (rawValue: string) => {
    const sanitized = rawValue.replace(/[^\d.]/g, '');
    onChange(sanitized);
  };

  return (
    <div className="card" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="collapsible__toggle" style={{ width: '100%', justifyContent: 'space-between' }}>
        <div>
          <h3 className="section-title" style={{ fontSize: '0.875rem', color: '#374151' }}>
            マイル価値の設定（任意）
          </h3>
          <p className="form-help" style={{ marginTop: '0.25rem' }}>
            ANAマイル・JALマイルの価値を変更できます（デフォルト: 1マイル=2円）
          </p>
        </div>
        <svg className={`collapsible__icon ${isOpen ? 'collapsible__icon--open' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4" style={{ paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <label htmlFor="mileValue" className="form-label">
            1マイル = 何円？
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="mileValue"
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              className="input"
              placeholder="2"
            />
            <span className="input__unit">円</span>
          </div>
          <p className="form-help">
            一般的には1.5円〜3円の範囲で設定されます。特典航空券の使い方によって価値が変わります。
          </p>
        </div>
      )}
    </div>
  );
}
