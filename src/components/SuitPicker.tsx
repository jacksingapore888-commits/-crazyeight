
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Suit } from '../types';
import { getSuitSymbol, getSuitColor } from '../utils/deck';

interface SuitPickerProps {
  onSelect: (suit: Suit) => void;
}

export const SuitPicker: React.FC<SuitPickerProps> = ({ onSelect }) => {
  const suits: { id: Suit; label: string }[] = [
    { id: 'hearts', label: '红心' },
    { id: 'diamonds', label: '方块' },
    { id: 'clubs', label: '梅花' },
    { id: 'spades', label: '黑桃' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 font-serif italic">请选择一个新花色</h2>
        <div className="grid grid-cols-2 gap-4">
          {suits.map((suit) => (
            <button
              key={suit.id}
              onClick={() => onSelect(suit.id)}
              className={`
                flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group
              `}
            >
              <span className={`text-5xl mb-2 ${getSuitColor(suit.id)} group-hover:scale-110 transition-transform`}>
                {getSuitSymbol(suit.id)}
              </span>
              <span className="text-slate-600 font-medium capitalize">{suit.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
