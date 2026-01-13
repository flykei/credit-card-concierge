import Link from 'next/link';
import { CalculationResult } from '@/lib/types';

interface SingleCardResultProps {
  result: CalculationResult;
  rank: number;
  isTopCard: boolean;
}

export default function SingleCardResult({ result, rank, isTopCard }: SingleCardResultProps) {
  // 年会費無料条件を判定
  let conditionMet = false;
  if (result.card.id === 'smbc-gold-nl') {
    conditionMet = result.totalExpense >= 1000000;
  } else if (result.card.id === 'mercari-gold') {
    conditionMet = result.totalExpense >= 500000;
  }
  
  const has2ndYearBenefit = conditionMet && result.card.annualFee > 0 && result.card.annualFeeConditions?.includes('翌年');
  const secondYearReturn = has2ndYearBenefit ? result.pointsValue : undefined;

  return (
    <div className="card card--highlight">
      <div className="card__header">
        <div style={{ flex: 1 }}>
          <div className="mb-2">
            {rank === 1 && <span className="rank-badge rank-badge--first">第1位 最もお得</span>}
            {rank === 2 && <span className="rank-badge rank-badge--second">第2位</span>}
            {rank === 3 && <span className="rank-badge rank-badge--third">第3位</span>}
            {rank > 3 && <span className="rank-badge rank-badge--other">第{rank}位</span>}
          </div>
          <h3 className="card__title">{result.card.name}</h3>
          <Link href={`/cards/${result.card.id}`} className="link">
            詳細を見る →
          </Link>
          
          <div className="card__actions">
            <a
              href={result.card.affiliateUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={isTopCard ? 'btn btn--primary' : 'btn btn--secondary'}
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
      </div>

      <div className="metrics grid--4">
        <div className="metric">
          <p className="metric__label">年会費</p>
          <p className="metric__value">
            {result.card.annualFee === 0 ? '無料' : `${result.card.annualFee.toLocaleString()}円`}
          </p>
        </div>
        <div className="metric">
          <p className="metric__label">獲得ポイント</p>
          <p className="metric__value" style={{ color: '#6366f1' }}>
            {Math.round(result.totalPoints).toLocaleString()}pt
          </p>
        </div>
        <div className="metric">
          <p className="metric__label">ポイント価値</p>
          <p className="metric__value" style={{ color: '#10b981' }}>
            {Math.round(result.pointsValue).toLocaleString()}円
          </p>
        </div>
        <div className="metric metric--highlight">
          <p className="metric__label">実質還元額</p>
          <p className="metric__value">
            {Math.round(result.effectiveReturn).toLocaleString()}円
          </p>
          {has2ndYearBenefit && secondYearReturn && (
            <p className="metric__sub">
              ✨ 2年目以降: {Math.round(secondYearReturn).toLocaleString()}円
            </p>
          )}
        </div>
      </div>

      {(result.card.id === 'sbi-platinum-debit' || result.card.id === 'sbi-debit-point-plus') && (
        <div className="alert alert--warning mt-3">
          <p className="alert__title">
            ⚠️ このカードは銀行残高が全額住信SBIネット銀行にあることが前提です
          </p>
          <a href="https://www.netbk.co.jp/" target="_blank" rel="noopener noreferrer" className="alert__link">
            💳 住信SBIネット銀行の口座開設はこちら →
          </a>
        </div>
      )}

      {/* 詳細内訳 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-700 font-medium hover:text-gray-900">
            詳細内訳を見る
          </summary>
          <div className="mt-3 space-y-2 text-gray-600">
            {result.breakdown.effectiveBaseRate && 
             result.breakdown.depositBalance && 
             result.breakdown.effectiveBaseRate > result.card.baseRate && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                <div className="flex justify-between text-xs text-blue-900 font-semibold">
                  <span>💰 預金残高による還元率アップ:</span>
                  <span>{result.card.baseRate}% → {result.breakdown.effectiveBaseRate}%</span>
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  銀行残高: {(result.breakdown.depositBalance / 10000).toLocaleString()}万円
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <span>基本還元ポイント:</span>
              <span>{Math.round(result.breakdown.basePoints).toLocaleString()}pt</span>
            </div>
            <div className="flex justify-between">
              <span>ボーナス還元ポイント:</span>
              <span>{Math.round(result.breakdown.bonusPoints).toLocaleString()}pt</span>
            </div>
            <div className="flex justify-between">
              <span>特別ボーナス:</span>
              <span>{Math.round(result.breakdown.specialBonusPoints).toLocaleString()}pt</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
              <span>合計ポイント価値:</span>
              <span>{Math.round(result.pointsValue).toLocaleString()}円</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>年会費:</span>
              <span>-{result.breakdown.annualFee.toLocaleString()}円</span>
            </div>
            <div className="flex justify-between font-bold text-indigo-600 pt-2 border-t text-base">
              <span>実質還元額:</span>
              <span>{Math.round(result.effectiveReturn).toLocaleString()}円</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
