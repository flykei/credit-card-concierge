// カード情報の型定義

export interface Card {
  id: string;
  name: string;
  issuer: string;
  annualFee: number;
  annualFeeConditions?: string; // 年会費の条件（例：年100万円利用で無料）
  baseRate: number; // 基本還元率（%）
  bonusRates: BonusRate[]; // カテゴリ別ボーナス還元率
  specialBonuses: SpecialBonus[]; // 特別ボーナス
  pointValue?: number; // 1ポイントの価値（円）デフォルト1円
  maxAnnualPoints?: number; // 年間獲得上限ポイント
  description?: string;
  affiliateUrl?: string; // アフィリエイトリンク
  exclusiveGroup?: string; // 排他的グループ（同じグループのカードは併用不可）
}

export interface BonusRate {
  merchant: string; // 加盟店・カテゴリID
  merchantName: string; // 表示用の名前
  rate: number; // ボーナス還元率（%）
  description?: string; // 条件の説明
}

export interface SpecialBonus {
  type: 'annual_usage' | 'annual_fee_waiver' | 'fixed'; // ボーナスタイプ
  threshold?: number; // 年間利用額の閾値
  bonus: number; // ボーナスポイント/金額
  description?: string;
}

// 支出データの型定義
export interface Expenses {
  total: number; // 年間支出合計額
  breakdown: Record<string, number>; // カテゴリ別支出内訳
  additionalInfo?: {
    sbiDepositBalance?: number; // 住信SBI銀行の円普通預金残高
    enableMultiCardRecommendation?: boolean; // 複数カード組み合わせ提案を有効化
    customPointValues?: Record<string, number>; // カスタムポイント価値（カードID → ポイント価値）
  };
}

// 計算結果の型定義
export interface CalculationResult {
  card: Card;
  totalPoints: number; // 獲得予想ポイント
  pointsValue: number; // ポイントの価値（円）
  effectiveReturn: number; // 実質還元額（ポイント価値 - 年会費）
  effectiveRate: number; // 実質還元率（%）
  breakdown: ResultBreakdown;
  totalExpense: number; // 年間支出額（円）
}

// 複数カード組み合わせの計算結果
export interface MultiCardRecommendation {
  cards: {
    card: Card;
    allocatedAmount: number; // このカードに割り当てる年間利用額
    categoryAllocations: Record<string, number>; // カテゴリ別の割り当て
    totalPoints: number;
    pointsValue: number;
    effectiveReturn: number;
  }[];
  totalEffectiveReturn: number; // 合計実質還元額
  totalEffectiveRate: number; // 合計実質還元率
  improvement: number; // 単一カードと比較した改善額
}

export interface ResultBreakdown {
  basePoints: number; // 基本還元ポイント
  bonusPoints: number; // ボーナス還元ポイント
  specialBonusPoints: number; // 特別ボーナスポイント
  annualFee: number; // 年会費
  details: BreakdownDetail[]; // 詳細内訳
}

export interface BreakdownDetail {
  merchant: string;
  merchantName: string;
  amount: number; // 支出額
  rate: number; // 還元率
  points: number; // 獲得ポイント
}

// 加盟店カテゴリの定義
export const MERCHANT_CATEGORIES = {
  amazon: 'Amazon',
  rakuten: '楽天市場',
  yahoo_shopping: 'Yahoo!ショッピング・LOHACO',
  seven_eleven: 'セブン-イレブン',
  family_mart: 'ファミリーマート',
  lawson: 'ローソン',
  restaurant: '対象飲食店（マクドナルド、サイゼリヤ、ガスト等）',
  travel: 'ANA/JALグループ・マリオット系ホテル',
  jal_group: 'JAL航空券・機内販売',
  other: 'その他（上記以外のすべて）',
} as const;

export type MerchantCategory = keyof typeof MERCHANT_CATEGORIES;
