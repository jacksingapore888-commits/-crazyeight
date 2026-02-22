
import { Card, Suit, Rank } from '../types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}-${suit}-${Math.random().toString(36).substr(2, 9)}`,
        suit,
        rank,
      });
    }
  }
  return shuffle(deck);
};

export const shuffle = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const isValidMove = (card: Card, topCard: Card | null, currentSuit: Suit | null): boolean => {
  // If no top card, any move is valid (shouldn't happen in normal play)
  if (!topCard) return true;
  
  // If it's an 8, it's always valid
  if (card.rank === '8') return true;

  // If the top card was an 8, we must match the chosen suit
  if (topCard.rank === '8' && currentSuit) {
    return card.suit === currentSuit;
  }

  // Otherwise, match suit or rank
  return card.suit === topCard.suit || card.rank === topCard.rank;
};

export const getSuitSymbol = (suit: Suit): string => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
  }
};

export const getSuitColor = (suit: Suit): string => {
  return (suit === 'hearts' || suit === 'diamonds') ? 'text-red-600' : 'text-slate-900';
};

export const reshuffleDiscardPile = (discardPile: Card[]): { drawPile: Card[], discardPile: Card[] } => {
  if (discardPile.length <= 1) return { drawPile: [], discardPile };
  
  const topCard = discardPile[discardPile.length - 1];
  const cardsToReshuffle = discardPile.slice(0, -1);
  return {
    drawPile: shuffle(cardsToReshuffle),
    discardPile: [topCard]
  };
};
