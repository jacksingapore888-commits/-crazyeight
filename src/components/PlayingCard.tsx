
import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../types';
import { getSuitSymbol, getSuitColor } from '../utils/deck';

interface PlayingCardProps {
  card: Card;
  isFaceUp?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  isPlayable?: boolean;
  className?: string;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isFaceUp = true,
  onClick,
  disabled = false,
  isPlayable = false,
  className = '',
}) => {
  const symbol = getSuitSymbol(card.suit);
  const color = getSuitColor(card.suit);

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={isPlayable && !disabled ? { y: -20, scale: 1.05 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`
        relative w-24 h-36 sm:w-32 sm:h-48 rounded-xl border-2 bg-white flex flex-col items-center justify-between p-2 sm:p-4 select-none
        ${isFaceUp ? 'cursor-pointer' : 'cursor-default'}
        ${isPlayable ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-[#1a472a]' : 'border-slate-200'}
        ${disabled ? 'opacity-80 grayscale-[0.2]' : 'shadow-xl'}
        ${className}
      `}
    >
      {isFaceUp ? (
        <>
          <div className={`self-start font-bold text-lg sm:text-2xl ${color}`}>
            <div className="leading-none">{card.rank}</div>
            <div className="text-sm sm:text-lg">{symbol}</div>
          </div>
          
          <div className={`text-4xl sm:text-6xl ${color} opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}>
            {symbol}
          </div>

          <div className={`self-end font-bold text-lg sm:text-2xl rotate-180 ${color}`}>
            <div className="leading-none">{card.rank}</div>
            <div className="text-sm sm:text-lg">{symbol}</div>
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-indigo-900 rounded-lg border-4 border-white flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '12px 12px'
          }} />
          <div className="text-white font-serif italic text-xl sm:text-2xl font-bold z-10">Tina</div>
        </div>
      )}
    </motion.div>
  );
};
