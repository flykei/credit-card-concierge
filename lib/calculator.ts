import { Card, Expenses, CalculationResult, ResultBreakdown, BreakdownDetail, MultiCardRecommendation } from './types';

/**
 * カードの実質還元額を計算する
 * @param card カード情報
 * @param expenses 支出情報
 * @returns 計算結果
 */
export function calculateReturn(card: Card, expenses: Expenses): CalculationResult {
  const additionalInfo = expenses.additionalInfo || {};
  // カスタムポイント価値があればそれを使用、なければカードのデフォルト値
  const pointValue = additionalInfo.customPointValues?.[card.id] ?? card.pointValue ?? 1;

  // 年会費の計算（初年度は必ず発生）
  // 翌年以降の年会費無料は別途「2年目以降」として表示
  let actualAnnualFee = card.annualFee;

  const breakdown: ResultBreakdown = {
    basePoints: 0,
    bonusPoints: 0,
    specialBonusPoints: 0,
    annualFee: actualAnnualFee,
    details: [],
  };

  // 基本還元率の計算（住信SBIデビットカードは預金残高で変動）
  let effectiveBaseRate = card.baseRate;
  
  if ((card.id === 'sbi-platinum-debit' || card.id === 'sbi-debit-point-plus') && additionalInfo.sbiDepositBalance) {
    const balance = additionalInfo.sbiDepositBalance;
    if (card.id === 'sbi-platinum-debit') {
      if (balance >= 10000000) {
        effectiveBaseRate = 2.5;
      } else if (balance >= 5000000) {
        effectiveBaseRate = 2.0;
      } else if (balance >= 2000000) {
        effectiveBaseRate = 1.75;
      } else if (balance >= 1000000) {
        effectiveBaseRate = 1.5;
      }
    } else if (card.id === 'sbi-debit-point-plus') {
      if (balance >= 10000000) {
        effectiveBaseRate = 2.0;
      } else if (balance >= 5000000) {
        effectiveBaseRate = 1.75;
      } else if (balance >= 2000000) {
        effectiveBaseRate = 1.5;
      }
    }
    // 預金残高と実質還元率を保存
    breakdown.effectiveBaseRate = effectiveBaseRate;
    breakdown.depositBalance = balance;
  }

  // 基本還元ポイントの計算
  const basePoints = (expenses.total * effectiveBaseRate) / 100;
  breakdown.basePoints = basePoints;

  // カテゴリ別ボーナス還元の計算
  let bonusPoints = 0;
  const details: BreakdownDetail[] = [];

  for (const bonusRate of card.bonusRates) {
    const merchantExpense = expenses.breakdown[bonusRate.merchant] || 0;
    if (merchantExpense > 0) {
      // ボーナス還元率での獲得ポイント
      const merchantPoints = (merchantExpense * bonusRate.rate) / 100;
      // 基本還元との差分がボーナスポイント
      const merchantBasePoints = (merchantExpense * effectiveBaseRate) / 100;
      const merchantBonusPoints = merchantPoints - merchantBasePoints;
      
      bonusPoints += merchantBonusPoints;
      
      details.push({
        merchant: bonusRate.merchant,
        merchantName: bonusRate.merchantName,
        amount: merchantExpense,
        rate: bonusRate.rate,
        points: merchantPoints,
      });
    }
  }

  breakdown.bonusPoints = bonusPoints;
  breakdown.details = details;

  // 年間利用額ボーナスの計算
  let specialBonusPoints = 0;
  
  for (const bonus of card.specialBonuses) {
    if (bonus.type === 'annual_usage' && bonus.threshold) {
      // 累積型ボーナス：閾値を超えたらボーナス付与
      if (expenses.total >= bonus.threshold) {
        specialBonusPoints += bonus.bonus;
      }
    } else if (bonus.type === 'fixed') {
      // fixed タイプ：継続ボーナスなど、条件なしで付与されるボーナス
      // ただし、預金残高に関するものは除外（descriptionで判定）
      if (bonus.description && !bonus.description.includes('預金残高') && !bonus.description.includes('ANAスカイコイン')) {
        specialBonusPoints += bonus.bonus;
      }
    }
  }

  breakdown.specialBonusPoints = specialBonusPoints;

  // 合計獲得ポイント
  const totalPoints = basePoints + bonusPoints + specialBonusPoints;

  // ポイントの価値（円換算）
  const pointsValue = totalPoints * pointValue;

  // 実質還元額 = ポイント価値 - 年会費
  const effectiveReturn = pointsValue - card.annualFee;

  // 実質還元率 = (実質還元額 / 年間支出額) * 100
  const effectiveRate = expenses.total > 0 ? (effectiveReturn / expenses.total) * 100 : 0;

  return {
    card,
    totalPoints,
    pointsValue,
    effectiveReturn,
    effectiveRate,
    breakdown,
    totalExpense: expenses.total,
  };
}

/**
 * 複数のカードの実質還元額を計算してランキング形式で返す
 * @param cards カードのリスト
 * @param expenses 支出情報
 * @returns ランキング順に並べられた計算結果
 */
export function calculateAllCards(
  cards: Card[],
  expenses: Expenses
): CalculationResult[] {
  const results = cards.map(card => calculateReturn(card, expenses));
  
  // 実質還元額の降順でソート
  return results.sort((a, b) => b.effectiveReturn - a.effectiveReturn);
}

/**
 * 上位N枚のカードを取得
 * @param cards カードのリスト
 * @param expenses 支出情報
 * @param topN 上位N枚（デフォルト3枚）
 * @returns 上位N枚の計算結果
 */
export function getTopCards(
  cards: Card[],
  expenses: Expenses,
  topN: number = 3
): CalculationResult[] {
  const allResults = calculateAllCards(cards, expenses);
  return allResults.slice(0, topN);
}

/**
 * 支出額の検証
 * @param expenses 支出情報
 * @returns 検証結果
 */
export function validateExpenses(expenses: Expenses): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 年間支出合計額が0以下の場合
  if (expenses.total <= 0) {
    errors.push('年間支出合計額は1円以上を入力してください。');
  }

  // 年間支出合計額が1億円を超える場合（現実的でない）
  if (expenses.total > 100000000) {
    errors.push('年間支出合計額は1億円以下を入力してください。');
  }

  // 内訳の合計が年間支出合計額を超える場合
  const breakdownTotal = Object.values(expenses.breakdown).reduce(
    (sum, amount) => sum + amount,
    0
  );
  
  if (breakdownTotal > expenses.total) {
    errors.push(
      `支出内訳の合計（${breakdownTotal.toLocaleString()}円）が年間支出合計額（${expenses.total.toLocaleString()}円）を超えています。`
    );
  }

  // 内訳に負の値がある場合
  for (const [merchant, amount] of Object.entries(expenses.breakdown)) {
    if (amount < 0) {
      errors.push(`${merchant}の支出額は0円以上を入力してください。`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 数値をカンマ区切りの文字列に変換
 * @param num 数値
 * @returns カンマ区切りの文字列
 */
export function formatNumber(num: number): string {
  return Math.round(num).toLocaleString('ja-JP');
}

/**
 * 還元率を文字列に変換
 * @param rate 還元率（%）
 * @param decimals 小数点以下の桁数（デフォルト2桁）
 * @returns 還元率の文字列
 */
export function formatRate(rate: number, decimals: number = 2): string {
  return rate.toFixed(decimals) + '%';
}

/**
 * 特定のカードで特定の金額を使った場合の実質還元額を計算
 * @param card カード情報
 * @param amount 利用額
 * @param categoryExpenses カテゴリ別支出
 * @param expenses 元の支出情報（追加情報用）
 * @returns 実質還元額
 */
function calculateReturnForAmount(
  card: Card,
  amount: number,
  categoryExpenses: Record<string, number>,
  expenses: Expenses
): { effectiveReturn: number; totalPoints: number; pointsValue: number; breakdown: ResultBreakdown } {
  const additionalInfo = expenses.additionalInfo || {};
  // カスタムポイント価値があればそれを使用、なければカードのデフォルト値
  const pointValue = additionalInfo.customPointValues?.[card.id] ?? card.pointValue ?? 1;

  // 年会費（初年度は必ず発生、翌年以降の無料条件は考慮しない）
  // 2年目以降の計算は別途表示で対応
  let actualAnnualFee = card.annualFee;

  // 基本還元率（SBI銀行の場合は預金残高を考慮）
  let effectiveBaseRate = card.baseRate;
  if ((card.id === 'sbi-platinum-debit' || card.id === 'sbi-debit-point-plus') && additionalInfo.sbiDepositBalance) {
    const balance = additionalInfo.sbiDepositBalance;
    if (card.id === 'sbi-platinum-debit') {
      if (balance >= 10000000) effectiveBaseRate = 2.5;
      else if (balance >= 5000000) effectiveBaseRate = 2.0;
      else if (balance >= 2000000) effectiveBaseRate = 1.75;
      else if (balance >= 1000000) effectiveBaseRate = 1.5;
    } else if (card.id === 'sbi-debit-point-plus') {
      if (balance >= 10000000) effectiveBaseRate = 2.0;
      else if (balance >= 5000000) effectiveBaseRate = 1.75;
      else if (balance >= 2000000) effectiveBaseRate = 1.5;
    }
  }

  // カテゴリ別支出の合計
  const categoryTotal = Object.values(categoryExpenses).reduce((sum, amt) => sum + amt, 0);
  // その他の支出
  const otherAmount = amount - categoryTotal;

  // 基本還元ポイント（全体）
  let basePoints = (amount * effectiveBaseRate) / 100;

  // カテゴリ別ボーナスポイント
  let bonusPoints = 0;
  const details: BreakdownDetail[] = [];
  for (const bonusRate of card.bonusRates) {
    const merchantExpense = categoryExpenses[bonusRate.merchant] || 0;
    if (merchantExpense > 0) {
      const merchantPoints = (merchantExpense * bonusRate.rate) / 100;
      const merchantBasePoints = (merchantExpense * effectiveBaseRate) / 100;
      bonusPoints += merchantPoints - merchantBasePoints;
      
      details.push({
        merchant: bonusRate.merchant,
        merchantName: bonusRate.merchantName,
        amount: merchantExpense,
        rate: bonusRate.rate,
        points: merchantPoints,
      });
    }
  }

  // 年間利用特典ボーナス
  let specialBonusPoints = 0;
  for (const bonus of card.specialBonuses) {
    if (bonus.type === 'annual_usage' && bonus.threshold && amount >= bonus.threshold) {
      specialBonusPoints += bonus.bonus;
    } else if (bonus.type === 'fixed') {
      // fixed タイプ：継続ボーナスなど、条件なしで付与されるボーナス
      // ただし、預金残高に関するものは除外（descriptionで判定）
      if (bonus.description && !bonus.description.includes('預金残高') && !bonus.description.includes('ANAスカイコイン')) {
        specialBonusPoints += bonus.bonus;
      }
    }
  }

  const totalPoints = basePoints + bonusPoints + specialBonusPoints;
  const pointsValue = totalPoints * pointValue;
  const effectiveReturn = pointsValue - actualAnnualFee;

  const breakdown: ResultBreakdown = {
    basePoints,
    bonusPoints,
    specialBonusPoints,
    annualFee: actualAnnualFee,
    details,
  };

  // SBIカードの場合は実質基本還元率と預金残高を保存
  if ((card.id === 'sbi-platinum-debit' || card.id === 'sbi-debit-point-plus') && 
      additionalInfo.sbiDepositBalance && 
      effectiveBaseRate > card.baseRate) {
    breakdown.effectiveBaseRate = effectiveBaseRate;
    breakdown.depositBalance = additionalInfo.sbiDepositBalance;
  }

  return { effectiveReturn, totalPoints, pointsValue, breakdown };
}

/**
 * カードの年間利用特典の閾値を取得
 */
function getCardThresholds(card: Card): number[] {
  const thresholds: number[] = [];
  for (const bonus of card.specialBonuses) {
    if (bonus.type === 'annual_usage' && bonus.threshold) {
      thresholds.push(bonus.threshold);
    }
  }
  // 年会費無料条件も閾値として追加
  if (card.id === 'smbc-gold-nl') {
    thresholds.push(1000000); // 100万円
  }
  if (card.id === 'mercari-gold') {
    thresholds.push(500000); // 50万円
  }
  return thresholds.sort((a, b) => a - b);
}

/**
 * 最大3枚のカードの組み合わせで最適な利用配分を計算
 * @param cards カードのリスト
 * @param expenses 支出情報
 * @returns すべての有効な組み合わせ提案（実質還元額の降順）
 */
export function calculateMultiCardRecommendation(
  cards: Card[],
  expenses: Expenses
): MultiCardRecommendation[] {
  // 単一カードでの最良の結果
  const singleCardResults = calculateAllCards(cards, expenses);
  const bestSingleCard = singleCardResults[0];

  // 最適化：上位15枚のカードのみで組み合わせを試す
  const topCards = singleCardResults.slice(0, 15).map(r => r.card);

  const allCombinations: MultiCardRecommendation[] = [];

  // 2枚の組み合わせを試す
  const twoCardCombinations = calculate2CardCombination(topCards, expenses, bestSingleCard);
  allCombinations.push(...twoCardCombinations);

  // 3枚の組み合わせを試す（さらに上位10枚に絞る）
  const top10Cards = singleCardResults.slice(0, 10).map(r => r.card);
  const threeCardCombinations = calculate3CardCombination(top10Cards, expenses, bestSingleCard);
  allCombinations.push(...threeCardCombinations);

  // 実質還元額の降順でソート
  allCombinations.sort((a, b) => b.totalEffectiveReturn - a.totalEffectiveReturn);

  // 重複する組み合わせを除外
  // 組み合わせAのすべてのカードを含む組み合わせBは除外（Aの方が少ないカードで同等以上の還元が得られるため）
  const filteredCombinations: MultiCardRecommendation[] = [];
  
  for (let i = 0; i < allCombinations.length; i++) {
    const currentCombo = allCombinations[i];
    const currentCardIds = new Set(currentCombo.cards.map(c => c.card.id));
    
    // この組み合わせが、既に追加された組み合わせのスーパーセット（すべてを含む）かチェック
    let isSuperSet = false;
    for (const addedCombo of filteredCombinations) {
      const addedCardIds = new Set(addedCombo.cards.map(c => c.card.id));
      
      // addedComboのすべてのカードがcurrentComboに含まれているか？
      const allIncluded = Array.from(addedCardIds).every(id => currentCardIds.has(id));
      
      if (allIncluded && addedCardIds.size < currentCardIds.size) {
        // currentComboはaddedComboのスーパーセット（より多くのカードを含む）
        isSuperSet = true;
        break;
      }
    }
    
    if (!isSuperSet) {
      filteredCombinations.push(currentCombo);
    }
  }

  return filteredCombinations;
}

/**
 * 2枚のカードの組み合わせで最適な利用配分を計算
 */
function calculate2CardCombination(
  cards: Card[],
  expenses: Expenses,
  bestSingleCard: CalculationResult
): MultiCardRecommendation[] {
  const combinations: MultiCardRecommendation[] = [];

  // カテゴリ別支出を抽出
  const categoryExpenses = { ...expenses.breakdown };
  const categoryTotal = Object.values(categoryExpenses).reduce((sum, amt) => sum + amt, 0);
  const otherAmount = expenses.total - categoryTotal;

  // すべてのカードペアを試す
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const card1 = cards[i];
      const card2 = cards[j];

      // 同じ排他的グループのカードは併用不可
      if (card1.exclusiveGroup && card2.exclusiveGroup && card1.exclusiveGroup === card2.exclusiveGroup) {
        continue;
      }

      // カテゴリ別支出の最適配分を計算
      const card1Categories: Record<string, number> = {};
      const card2Categories: Record<string, number> = {};

      for (const [category, amount] of Object.entries(categoryExpenses)) {
        if (amount === 0) continue;

        // 各カードでこのカテゴリの還元率を計算
        const card1BonusRate = card1.bonusRates.find(br => br.merchant === category);
        const card2BonusRate = card2.bonusRates.find(br => br.merchant === category);

        const card1Rate = card1BonusRate ? card1BonusRate.rate : card1.baseRate;
        const card2Rate = card2BonusRate ? card2BonusRate.rate : card2.baseRate;

        // 還元率が高い方に割り当て
        if (card1Rate >= card2Rate) {
          card1Categories[category] = amount;
        } else {
          card2Categories[category] = amount;
        }
      }

      const card1CategoryTotal = Object.values(card1Categories).reduce((sum, amt) => sum + amt, 0);
      const card2CategoryTotal = Object.values(card2Categories).reduce((sum, amt) => sum + amt, 0);

      // 各カードの閾値を取得
      const card1Thresholds = getCardThresholds(card1);
      const card2Thresholds = getCardThresholds(card2);

      // 試す配分パターンのリストを作成
      const splitPatterns: number[] = [];

      // 1. カード1の閾値に合わせるパターン
      for (const threshold of card1Thresholds) {
        const card1OtherAmount = threshold - card1CategoryTotal;
        if (card1OtherAmount >= 0 && card1OtherAmount <= otherAmount) {
          splitPatterns.push(card1OtherAmount);
        }
      }

      // 2. カード2の閾値に合わせるパターン
      for (const threshold of card2Thresholds) {
        const card2OtherAmount = threshold - card2CategoryTotal;
        const card1OtherAmount = otherAmount - card2OtherAmount;
        if (card1OtherAmount >= 0 && card1OtherAmount <= otherAmount) {
          splitPatterns.push(card1OtherAmount);
        }
      }

      // 3. 20%刻みのパターン（軽量化）
      for (let split = 0; split <= 5; split++) {
        splitPatterns.push((otherAmount * split) / 5);
      }

      // 重複を削除してソート
      const uniquePatterns = Array.from(new Set(splitPatterns)).sort((a, b) => a - b);

      // 各パターンを試す
      for (const card1OtherAmount of uniquePatterns) {
        const card2OtherAmount = otherAmount - card1OtherAmount;

        const card1TotalAmount = Object.values(card1Categories).reduce((sum, amt) => sum + amt, 0) + card1OtherAmount;
        const card2TotalAmount = Object.values(card2Categories).reduce((sum, amt) => sum + amt, 0) + card2OtherAmount;

        // 各カードの実質還元額を計算
        const card1Result = calculateReturnForAmount(card1, card1TotalAmount, card1Categories, expenses);
        const card2Result = calculateReturnForAmount(card2, card2TotalAmount, card2Categories, expenses);

        const totalEffectiveReturn = card1Result.effectiveReturn + card2Result.effectiveReturn;
        const totalEffectiveRate = expenses.total > 0 ? (totalEffectiveReturn / expenses.total) * 100 : 0;
        const improvement = totalEffectiveReturn - bestSingleCard.effectiveReturn;

        // 両方のカードが最低10万円以上利用される場合のみ記録（0円利用を除外）
        const minUsageAmount = 100000; // 10万円
        const bothCardsUsed = card1TotalAmount >= minUsageAmount && card2TotalAmount >= minUsageAmount;

        // 組み合わせ内のカードいずれかが単独で全額使った方が良い場合は除外
        const card1AloneResult = calculateReturnForAmount(card1, expenses.total, {}, expenses);
        const card2AloneResult = calculateReturnForAmount(card2, expenses.total, {}, expenses);
        const betterThanBothAlone = totalEffectiveReturn > card1AloneResult.effectiveReturn &&
                                    totalEffectiveReturn > card2AloneResult.effectiveReturn;

        // 有効な組み合わせを記録（両方のカードが有効に使われ、かつ単独より優れている場合）
        if (bothCardsUsed && betterThanBothAlone) {
          // 重複チェック：同じカードペアで既に記録済みかチェック
          const alreadyExists = combinations.some(c => 
            c.cards.length === 2 &&
            ((c.cards[0].card.id === card1.id && c.cards[1].card.id === card2.id) ||
             (c.cards[0].card.id === card2.id && c.cards[1].card.id === card1.id))
          );

          // 既に存在する場合は、実質還元額が高い方のみを保持
          if (alreadyExists) {
            const existingIndex = combinations.findIndex(c => 
              c.cards.length === 2 &&
              ((c.cards[0].card.id === card1.id && c.cards[1].card.id === card2.id) ||
               (c.cards[0].card.id === card2.id && c.cards[1].card.id === card1.id))
            );
            if (existingIndex !== -1 && totalEffectiveReturn > combinations[existingIndex].totalEffectiveReturn) {
              combinations[existingIndex] = {
                cards: [
                  {
                    card: card1,
                    allocatedAmount: card1TotalAmount,
                    categoryAllocations: card1Categories,
                    totalPoints: card1Result.totalPoints,
                    pointsValue: card1Result.pointsValue,
                    effectiveReturn: card1Result.effectiveReturn,
                    breakdown: card1Result.breakdown,
                  },
                  {
                    card: card2,
                    allocatedAmount: card2TotalAmount,
                    categoryAllocations: card2Categories,
                    totalPoints: card2Result.totalPoints,
                    pointsValue: card2Result.pointsValue,
                    effectiveReturn: card2Result.effectiveReturn,
                    breakdown: card2Result.breakdown,
                  },
                ],
                totalEffectiveReturn,
                totalEffectiveRate,
                improvement,
              };
            }
          } else {
            combinations.push({
              cards: [
                {
                  card: card1,
                  allocatedAmount: card1TotalAmount,
                  categoryAllocations: card1Categories,
                  totalPoints: card1Result.totalPoints,
                  pointsValue: card1Result.pointsValue,
                  effectiveReturn: card1Result.effectiveReturn,
                  breakdown: card1Result.breakdown,
                },
                {
                  card: card2,
                  allocatedAmount: card2TotalAmount,
                  categoryAllocations: card2Categories,
                  totalPoints: card2Result.totalPoints,
                  pointsValue: card2Result.pointsValue,
                  effectiveReturn: card2Result.effectiveReturn,
                  breakdown: card2Result.breakdown,
                },
              ],
              totalEffectiveReturn,
              totalEffectiveRate,
              improvement,
            });
          }
        }
      }
    }
  }

  return combinations;
}

/**
 * 3枚のカードの組み合わせで最適な利用配分を計算
 */
function calculate3CardCombination(
  cards: Card[],
  expenses: Expenses,
  bestSingleCard: CalculationResult
): MultiCardRecommendation[] {
  const combinations: MultiCardRecommendation[] = [];

  // カテゴリ別支出を抽出
  const categoryExpenses = { ...expenses.breakdown };
  const categoryTotal = Object.values(categoryExpenses).reduce((sum, amt) => sum + amt, 0);
  const otherAmount = expenses.total - categoryTotal;

  // すべての3枚の組み合わせを試す
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      for (let k = j + 1; k < cards.length; k++) {
        const card1 = cards[i];
        const card2 = cards[j];
        const card3 = cards[k];

        // 排他的グループのチェック
        const exclusiveGroups = [card1.exclusiveGroup, card2.exclusiveGroup, card3.exclusiveGroup].filter(g => g);
        if (exclusiveGroups.length !== new Set(exclusiveGroups).size) {
          continue; // 同じグループのカードが含まれている
        }

        // カテゴリ別支出の最適配分を計算
        const card1Categories: Record<string, number> = {};
        const card2Categories: Record<string, number> = {};
        const card3Categories: Record<string, number> = {};

        for (const [category, amount] of Object.entries(categoryExpenses)) {
          if (amount === 0) continue;

          // 各カードでこのカテゴリの還元率を計算
          const card1BonusRate = card1.bonusRates.find(br => br.merchant === category);
          const card2BonusRate = card2.bonusRates.find(br => br.merchant === category);
          const card3BonusRate = card3.bonusRates.find(br => br.merchant === category);

          const card1Rate = card1BonusRate ? card1BonusRate.rate : card1.baseRate;
          const card2Rate = card2BonusRate ? card2BonusRate.rate : card2.baseRate;
          const card3Rate = card3BonusRate ? card3BonusRate.rate : card3.baseRate;

          // 最も還元率が高いカードに割り当て
          if (card1Rate >= card2Rate && card1Rate >= card3Rate) {
            card1Categories[category] = amount;
          } else if (card2Rate >= card3Rate) {
            card2Categories[category] = amount;
          } else {
            card3Categories[category] = amount;
          }
        }

        const card1CategoryTotal = Object.values(card1Categories).reduce((sum, amt) => sum + amt, 0);
        const card2CategoryTotal = Object.values(card2Categories).reduce((sum, amt) => sum + amt, 0);
        const card3CategoryTotal = Object.values(card3Categories).reduce((sum, amt) => sum + amt, 0);

        // 各カードの閾値を取得
        const card1Thresholds = getCardThresholds(card1);
        const card2Thresholds = getCardThresholds(card2);
        const card3Thresholds = getCardThresholds(card3);

        // 試す配分パターンのリストを作成（3枚なので簡略化：主要な閾値パターンのみ）
        const splitPatterns: Array<[number, number]> = [];

        // 1. カード1の閾値に合わせるパターン
        for (const threshold1 of card1Thresholds) {
          const card1OtherAmount = threshold1 - card1CategoryTotal;
          if (card1OtherAmount >= 0 && card1OtherAmount <= otherAmount) {
            const remaining = otherAmount - card1OtherAmount;
            // 残りをカード2と3で分割
            for (let split = 0; split <= 10; split++) {
              const card2OtherAmount = (remaining * split) / 10;
              splitPatterns.push([card1OtherAmount, card2OtherAmount]);
            }
          }
        }

        // 2. カード2の閾値に合わせるパターン
        for (const threshold2 of card2Thresholds) {
          const card2OtherAmount = threshold2 - card2CategoryTotal;
          if (card2OtherAmount >= 0 && card2OtherAmount <= otherAmount) {
            const remaining = otherAmount - card2OtherAmount;
            // 残りをカード1と3で分割
            for (let split = 0; split <= 10; split++) {
              const card1OtherAmount = (remaining * split) / 10;
              splitPatterns.push([card1OtherAmount, card2OtherAmount]);
            }
          }
        }

        // 3. 基本的な分割パターン（25%刻み、軽量化）
        for (let split1 = 0; split1 <= 4; split1++) {
          for (let split2 = 0; split2 <= 4 - split1; split2++) {
            const card1OtherAmount = (otherAmount * split1) / 4;
            const card2OtherAmount = (otherAmount * split2) / 4;
            splitPatterns.push([card1OtherAmount, card2OtherAmount]);
          }
        }

        // 重複を削除
        const uniquePatterns = Array.from(
          new Set(splitPatterns.map(p => JSON.stringify(p)))
        ).map(s => JSON.parse(s) as [number, number]);

        // 各パターンを試す
        for (const [card1OtherAmount, card2OtherAmount] of uniquePatterns) {
          const card3OtherAmount = otherAmount - card1OtherAmount - card2OtherAmount;

          if (card3OtherAmount < 0) continue; // 不正なパターン

          const card1TotalAmount = card1CategoryTotal + card1OtherAmount;
          const card2TotalAmount = card2CategoryTotal + card2OtherAmount;
          const card3TotalAmount = card3CategoryTotal + card3OtherAmount;

          // 各カードの実質還元額を計算
          const card1Result = calculateReturnForAmount(card1, card1TotalAmount, card1Categories, expenses);
          const card2Result = calculateReturnForAmount(card2, card2TotalAmount, card2Categories, expenses);
          const card3Result = calculateReturnForAmount(card3, card3TotalAmount, card3Categories, expenses);

          const totalEffectiveReturn = card1Result.effectiveReturn + card2Result.effectiveReturn + card3Result.effectiveReturn;
          const totalEffectiveRate = expenses.total > 0 ? (totalEffectiveReturn / expenses.total) * 100 : 0;
          const improvement = totalEffectiveReturn - bestSingleCard.effectiveReturn;

          // すべてのカードが最低10万円以上利用される場合のみ記録
          const minUsageAmount = 100000; // 10万円
          const allCardsUsed = card1TotalAmount >= minUsageAmount && 
                               card2TotalAmount >= minUsageAmount && 
                               card3TotalAmount >= minUsageAmount;

          // 組み合わせ内のカードいずれかが単独で全額使った方が良い場合は除外
          const card1AloneResult = calculateReturnForAmount(card1, expenses.total, {}, expenses);
          const card2AloneResult = calculateReturnForAmount(card2, expenses.total, {}, expenses);
          const card3AloneResult = calculateReturnForAmount(card3, expenses.total, {}, expenses);
          const betterThanAllAlone = totalEffectiveReturn > card1AloneResult.effectiveReturn &&
                                     totalEffectiveReturn > card2AloneResult.effectiveReturn &&
                                     totalEffectiveReturn > card3AloneResult.effectiveReturn;

          // 有効な組み合わせを記録（すべてのカードが有効に使われ、かつすべて単独より優れている場合）
          if (allCardsUsed && betterThanAllAlone) {
            // 重複チェック：同じカード3枚の組み合わせで既に記録済みかチェック
            const cardIds = [card1.id, card2.id, card3.id].sort();
            const alreadyExists = combinations.some(c => {
              if (c.cards.length !== 3) return false;
              const existingIds = c.cards.map(x => x.card.id).sort();
              return JSON.stringify(cardIds) === JSON.stringify(existingIds);
            });

            // 既に存在する場合は、実質還元額が高い方のみを保持
            if (alreadyExists) {
              const existingIndex = combinations.findIndex(c => {
                if (c.cards.length !== 3) return false;
                const existingIds = c.cards.map(x => x.card.id).sort();
                return JSON.stringify(cardIds) === JSON.stringify(existingIds);
              });
              if (existingIndex !== -1 && totalEffectiveReturn > combinations[existingIndex].totalEffectiveReturn) {
                combinations[existingIndex] = {
                  cards: [
                    {
                      card: card1,
                      allocatedAmount: card1TotalAmount,
                      categoryAllocations: card1Categories,
                      totalPoints: card1Result.totalPoints,
                      pointsValue: card1Result.pointsValue,
                      effectiveReturn: card1Result.effectiveReturn,
                      breakdown: card1Result.breakdown,
                    },
                    {
                      card: card2,
                      allocatedAmount: card2TotalAmount,
                      categoryAllocations: card2Categories,
                      totalPoints: card2Result.totalPoints,
                      pointsValue: card2Result.pointsValue,
                      effectiveReturn: card2Result.effectiveReturn,
                      breakdown: card2Result.breakdown,
                    },
                    {
                      card: card3,
                      allocatedAmount: card3TotalAmount,
                      categoryAllocations: card3Categories,
                      totalPoints: card3Result.totalPoints,
                      pointsValue: card3Result.pointsValue,
                      effectiveReturn: card3Result.effectiveReturn,
                      breakdown: card3Result.breakdown,
                    },
                  ],
                  totalEffectiveReturn,
                  totalEffectiveRate,
                  improvement,
                };
              }
            } else {
              combinations.push({
                cards: [
                  {
                    card: card1,
                    allocatedAmount: card1TotalAmount,
                    categoryAllocations: card1Categories,
                    totalPoints: card1Result.totalPoints,
                    pointsValue: card1Result.pointsValue,
                    effectiveReturn: card1Result.effectiveReturn,
                    breakdown: card1Result.breakdown,
                  },
                  {
                    card: card2,
                    allocatedAmount: card2TotalAmount,
                    categoryAllocations: card2Categories,
                    totalPoints: card2Result.totalPoints,
                    pointsValue: card2Result.pointsValue,
                    effectiveReturn: card2Result.effectiveReturn,
                    breakdown: card2Result.breakdown,
                  },
                  {
                    card: card3,
                    allocatedAmount: card3TotalAmount,
                    categoryAllocations: card3Categories,
                    totalPoints: card3Result.totalPoints,
                    pointsValue: card3Result.pointsValue,
                    effectiveReturn: card3Result.effectiveReturn,
                    breakdown: card3Result.breakdown,
                  },
                ],
                totalEffectiveReturn,
                totalEffectiveRate,
                improvement,
              });
            }
          }
        }
      }
    }
  }

  return combinations;
}
