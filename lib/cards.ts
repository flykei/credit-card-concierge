import { Card } from './types';
import cardsData from '@/data/cards.json';

// カードデータを取得
export function getAllCards(): Card[] {
  return cardsData.cards as Card[];
}

// IDでカードを取得
export function getCardById(id: string): Card | undefined {
  return getAllCards().find(card => card.id === id);
}

// カード名でカードを取得
export function getCardByName(name: string): Card | undefined {
  return getAllCards().find(card => card.name === name);
}

// 発行会社でカードをフィルタ
export function getCardsByIssuer(issuer: string): Card[] {
  return getAllCards().filter(card => card.issuer === issuer);
}

// 年会費でカードをフィルタ
export function getCardsByAnnualFee(maxFee: number): Card[] {
  return getAllCards().filter(card => card.annualFee <= maxFee);
}

// 年会費無料のカードを取得
export function getFreeCards(): Card[] {
  return getCardsByAnnualFee(0);
}

// カードIDのリストを取得
export function getAllCardIds(): string[] {
  return getAllCards().map(card => card.id);
}
