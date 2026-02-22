/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayingCard } from './components/PlayingCard';
import { SuitPicker } from './components/SuitPicker';
import { Card, Suit, GameState, GameStatus } from './types';
import { createDeck, isValidMove, getSuitSymbol, getSuitColor, reshuffleDiscardPile } from './utils/deck';
import { Trophy, RotateCcw, Info, User, Cpu, Layers, AlertCircle } from 'lucide-react';

const suitNames: Record<Suit, string> = {
  hearts: '红心',
  diamonds: '方块',
  clubs: '梅花',
  spades: '黑桃',
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    playerHand: [],
    aiHand: [],
    drawPile: [],
    discardPile: [],
    currentSuit: null,
    turn: 'player',
    status: 'dealing',
    winner: null,
    lastAction: '欢迎来到 Tina 疯狂 8 点！',
  });

  const [pendingEight, setPendingEight] = useState<Card | null>(null);
  const [isReshuffling, setIsReshuffling] = useState(false);

  // Initialize game
  const initGame = useCallback(() => {
    const deck = createDeck();
    const playerHand = deck.splice(0, 8);
    const aiHand = deck.splice(0, 8);
    const discardPile = [deck.pop()!];
    
    // If the first discard is an 8, reshuffle or just pick another
    while (discardPile[0].rank === '8') {
      deck.unshift(discardPile.pop()!);
      discardPile.push(deck.pop()!);
    }

    setGameState({
      playerHand,
      aiHand,
      drawPile: deck,
      discardPile,
      currentSuit: discardPile[0].suit,
      turn: 'player',
      status: 'playing',
      winner: null,
      lastAction: '游戏开始！轮到你了。',
    });
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Helper to handle reshuffling
  const ensureDrawPile = useCallback((state: GameState): GameState => {
    if (state.drawPile.length === 0 && state.discardPile.length > 1) {
      const { drawPile, discardPile } = reshuffleDiscardPile(state.discardPile);
      return { ...state, drawPile, discardPile };
    }
    return state;
  }, []);

  // AI Logic
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.turn === 'ai' && !gameState.winner) {
      const timer = setTimeout(() => {
        setGameState(current => {
          const state = ensureDrawPile(current);
          const topCard = state.discardPile[state.discardPile.length - 1];
          const playableCards = state.aiHand.filter(card => 
            isValidMove(card, topCard, state.currentSuit)
          );

          if (playableCards.length > 0) {
            const cardToPlay = playableCards.find(c => c.rank !== '8') || playableCards[0];
            const newAiHand = state.aiHand.filter(c => c.id !== cardToPlay.id);
            const newDiscardPile = [...state.discardPile, cardToPlay];
            
            if (cardToPlay.rank === '8') {
              const suitCounts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
              newAiHand.forEach(c => suitCounts[c.suit]++);
              const chosenSuit = (Object.keys(suitCounts) as Suit[]).reduce((a, b) => 
                suitCounts[a] > suitCounts[b] ? a : b
              );

              return {
                ...state,
                aiHand: newAiHand,
                discardPile: newDiscardPile,
                currentSuit: chosenSuit,
                turn: 'player',
                lastAction: `AI 打出了 8，并选择了 ${suitNames[chosenSuit]}！`,
                winner: newAiHand.length === 0 ? 'ai' : null,
                status: newAiHand.length === 0 ? 'game_over' : 'playing',
              };
            } else {
              return {
                ...state,
                aiHand: newAiHand,
                discardPile: newDiscardPile,
                currentSuit: cardToPlay.suit,
                turn: 'player',
                lastAction: `AI 打出了 ${suitNames[cardToPlay.suit]} ${cardToPlay.rank}。`,
                winner: newAiHand.length === 0 ? 'ai' : null,
                status: newAiHand.length === 0 ? 'game_over' : 'playing',
              };
            }
          } else if (state.drawPile.length > 0) {
            const [drawnCard, ...remainingDrawPile] = state.drawPile;
            return {
              ...state,
              aiHand: [...state.aiHand, drawnCard],
              drawPile: remainingDrawPile,
              turn: 'player',
              lastAction: 'AI 无牌可出，摸了一张牌。',
            };
          } else {
            return {
              ...state,
              turn: 'player',
              lastAction: 'AI 无牌可出且摸牌堆已空，AI 跳过本回合。',
            };
          }
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.turn, gameState.status, gameState.aiHand, gameState.discardPile, gameState.currentSuit, gameState.drawPile, gameState.winner, ensureDrawPile]);

  const handlePlayerPlay = (card: Card) => {
    if (gameState.turn !== 'player' || gameState.status !== 'playing') return;

    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    if (!isValidMove(card, topCard, gameState.currentSuit)) return;

    if (card.rank === '8') {
      setPendingEight(card);
      setGameState(prev => ({ ...prev, status: 'choosing_suit' }));
    } else {
      const newPlayerHand = gameState.playerHand.filter(c => c.id !== card.id);
      const newDiscardPile = [...gameState.discardPile, card];
      
      setGameState(prev => ({
        ...prev,
        playerHand: newPlayerHand,
        discardPile: newDiscardPile,
        currentSuit: card.suit,
        turn: 'ai',
        lastAction: `你打出了 ${suitNames[card.suit]} ${card.rank}。`,
        winner: newPlayerHand.length === 0 ? 'player' : null,
        status: newPlayerHand.length === 0 ? 'game_over' : 'playing',
      }));
    }
  };

  const handleSuitSelect = (suit: Suit) => {
    if (!pendingEight) return;

    const newPlayerHand = gameState.playerHand.filter(c => c.id !== pendingEight.id);
    const newDiscardPile = [...gameState.discardPile, pendingEight];

    setGameState(prev => ({
      ...prev,
      playerHand: newPlayerHand,
      discardPile: newDiscardPile,
      currentSuit: suit,
      turn: 'ai',
      status: newPlayerHand.length === 0 ? 'game_over' : 'playing',
      winner: newPlayerHand.length === 0 ? 'player' : null,
      lastAction: `你打出了 8，并选择了 ${suitNames[suit]}！`,
    }));
    setPendingEight(null);
  };

  const handleDraw = () => {
    if (gameState.turn !== 'player' || gameState.status !== 'playing') return;

    setGameState(current => {
      let state = current;
      if (state.drawPile.length === 0) {
        if (state.discardPile.length > 1) {
          state = ensureDrawPile(state);
        } else {
          return {
            ...state,
            turn: 'ai',
            lastAction: '摸牌堆已空且无可重洗牌，你跳过本回合。',
          };
        }
      }

      if (state.drawPile.length > 0) {
        const [drawnCard, ...remainingDrawPile] = state.drawPile;
        return {
          ...state,
          playerHand: [...state.playerHand, drawnCard],
          drawPile: remainingDrawPile,
          lastAction: `你摸到了 ${suitNames[drawnCard.suit]} ${drawnCard.rank}。`,
          turn: 'ai',
        };
      }
      
      return state;
    });
  };

  const topDiscard = gameState.discardPile.length > 0 
    ? gameState.discardPile[gameState.discardPile.length - 1] 
    : null;

  return (
    <div className="min-h-screen felt-texture flex flex-col font-sans">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="font-serif italic font-bold text-xl">T</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight font-serif italic">Tina Crazy 8s</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm">
            <Info size={16} className="text-indigo-300" />
            <span>匹配花色或点数。8 是万能牌！</span>
          </div>
          <button 
            onClick={initGame}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="重新开始"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden">
        
        {/* AI Hand */}
        <div className="w-full flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-white/60 text-sm font-medium uppercase tracking-widest mb-2">
            <Cpu size={16} />
            <span>AI 对手 ({gameState.aiHand.length})</span>
          </div>
          <div className="flex -space-x-12 sm:-space-x-16 hover:-space-x-8 transition-all duration-300">
            {gameState.aiHand.map((card, i) => (
              <PlayingCard 
                key={card.id} 
                card={card} 
                isFaceUp={false} 
                className="scale-75 sm:scale-90"
                disabled
              />
            ))}
          </div>
        </div>

        {/* Center: Draw & Discard Piles */}
        <div className="flex items-center gap-8 sm:gap-16 my-8">
          {/* Draw Pile */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {gameState.drawPile.length > 0 ? (
                <div onClick={handleDraw} className="cursor-pointer group">
                  {/* Stack effect */}
                  <div className="absolute top-1 left-1 w-24 h-36 sm:w-32 sm:h-48 bg-indigo-950 rounded-xl border-2 border-white/20" />
                  <div className="absolute top-0.5 left-0.5 w-24 h-36 sm:w-32 sm:h-48 bg-indigo-900 rounded-xl border-2 border-white/40" />
                  <PlayingCard 
                    card={gameState.drawPile[0]} 
                    isFaceUp={false} 
                    className="group-hover:-translate-y-2 transition-transform"
                  />
                </div>
              ) : (
                <div className="w-24 h-36 sm:w-32 sm:h-48 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-white/20">
                  Empty
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-tighter">
              <Layers size={14} />
              <span>摸牌 ({gameState.drawPile.length})</span>
            </div>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <AnimatePresence mode="popLayout">
                {topDiscard && (
                  <PlayingCard 
                    key={topDiscard.id}
                    card={topDiscard} 
                    disabled
                  />
                )}
              </AnimatePresence>
              
              {/* Current Suit Indicator (for 8s) */}
              {topDiscard?.rank === '8' && gameState.currentSuit && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-indigo-500 z-20"
                >
                  <span className={`text-2xl ${getSuitColor(gameState.currentSuit)}`}>
                    {getSuitSymbol(gameState.currentSuit)}
                  </span>
                </motion.div>
              )}
            </div>
            <div className="text-xs font-bold text-white/40 uppercase tracking-tighter">
              弃牌堆
            </div>
          </div>
        </div>

        {/* Player Hand */}
        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-white/60 text-sm font-medium uppercase tracking-widest">
            <User size={16} />
            <span>你的手牌 ({gameState.playerHand.length})</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 max-w-5xl">
            {gameState.playerHand.map((card) => {
              const playable = gameState.turn === 'player' && 
                               gameState.status === 'playing' && 
                               isValidMove(card, topDiscard, gameState.currentSuit);
              return (
                <PlayingCard 
                  key={card.id} 
                  card={card} 
                  isPlayable={playable}
                  onClick={() => handlePlayerPlay(card)}
                  disabled={gameState.turn !== 'player' || gameState.status !== 'playing'}
                />
              );
            })}
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <footer className="p-4 bg-black/40 backdrop-blur-md border-t border-white/10 flex justify-center">
        <motion.div 
          key={gameState.lastAction}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-indigo-200 font-medium text-center"
        >
          {gameState.lastAction}
        </motion.div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {gameState.status === 'choosing_suit' && (
          <SuitPicker onSelect={handleSuitSelect} />
        )}

        {gameState.status === 'game_over' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-12 shadow-2xl max-w-md w-full text-center text-slate-900"
            >
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
                <Trophy size={48} />
              </div>
              
              <h2 className="text-4xl font-bold mb-2 font-serif italic">
                {gameState.winner === 'player' ? '你赢了！' : 'AI 赢了！'}
              </h2>
              <p className="text-slate-500 mb-8">
                {gameState.winner === 'player' 
                  ? '精彩的策略！你最先清空了手牌。' 
                  : '下次好运！AI 的速度太快了。'}
              </p>

              <button 
                onClick={initGame}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                再玩一次
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
