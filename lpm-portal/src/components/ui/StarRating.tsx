import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StarRatingProps {
  value: number; // 1-10 scale
  onChange?: (newValue: number) => void;
  readonly?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({ value, onChange, readonly = false }) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    if (readonly || !onChange) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    const newValue = percent < 0.5 ? (index * 2) + 1 : (index * 2) + 2;
    setHoverValue(newValue);
  };

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHoverValue(null)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const starValueFull = (i + 1) * 2;
        const starValueHalf = starValueFull - 1;
        
        let state: 'full' | 'half' | 'empty' = 'empty';
        if (displayValue >= starValueFull) state = 'full';
        else if (displayValue >= starValueHalf) state = 'half';

        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onMouseMove={(e) => handleMouseMove(e, i)}
            onClick={() => !readonly && onChange && hoverValue && onChange(hoverValue)}
            className={cn(
              "transition-all duration-200 focus:outline-none p-0.5",
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110",
              state !== 'empty' && "drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
            )}
          >
            <div className="relative w-4 h-4">
              <Star className="w-4 h-4 text-slate-200 dark:text-slate-700 fill-transparent absolute inset-0" />
              {state === 'half' && (
                <StarHalf className="w-4 h-4 text-yellow-400 fill-yellow-400 absolute inset-0 z-10" />
              )}
              {state === 'full' && (
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 absolute inset-0 z-10" />
              )}
            </div>
          </button>
        );
      })}
      
      {!readonly && (
        <span className={cn(
          "text-[10px] font-mono font-bold ml-2 w-6 tabular-nums transition-colors",
          displayValue > 0 ? "text-text-primary dark:text-white" : "text-slate-300 dark:text-slate-600"
        )}>
          {displayValue > 0 ? (displayValue / 2).toFixed(1) : "0.0"}
        </span>
      )}
    </div>
  );
};