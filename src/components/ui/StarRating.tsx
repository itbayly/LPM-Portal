import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StarRatingProps {
  value: number; // 1-10 scale (backend) -> converted to 0.5-5.0 (frontend)
  onChange?: (newValue: number) => void;
  readonly?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({ value, onChange, readonly = false }) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  // The value to display (either the current hover state or the actual saved value)
  const displayValue = hoverValue ?? value;

  // Calculate rating based on which side of the star is hovered
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    if (readonly || !onChange) return;
    
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    
    // Logic: 
    // Star 0 (Index 0): Left=1 (0.5), Right=2 (1.0)
    // Star 1 (Index 1): Left=3 (1.5), Right=4 (2.0)
    const newValue = percent < 0.5 ? (index * 2) + 1 : (index * 2) + 2;
    setHoverValue(newValue);
  };

  const handleClick = () => {
    if (!readonly && onChange && hoverValue !== null) {
      onChange(hoverValue);
    }
  };

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHoverValue(null)}>
      {Array.from({ length: 5 }).map((_, i) => {
        // Calculate the value thresholds for this specific star
        const starValueFull = (i + 1) * 2;   // e.g., Star 1 is value 2
        const starValueHalf = starValueFull - 1; // e.g., Star 1 is value 1

        let state: 'full' | 'half' | 'empty' = 'empty';
        if (displayValue >= starValueFull) state = 'full';
        else if (displayValue >= starValueHalf) state = 'half';

        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onMouseMove={(e) => handleMouseMove(e, i)}
            onClick={handleClick}
            className={cn(
              "transition-transform duration-75 focus:outline-none p-1 rounded-sm",
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"
            )}
          >
            <div className="relative w-6 h-6">
              {/* Base Layer: Empty Grey Star */}
              <Star className="w-6 h-6 text-slate-200 fill-transparent absolute inset-0" />
              
              {/* Half Layer */}
              {state === 'half' && (
                <StarHalf className="w-6 h-6 text-yellow-400 fill-yellow-400 absolute inset-0 z-10" />
              )}
              
              {/* Full Layer */}
              {state === 'full' && (
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 absolute inset-0 z-10" />
              )}
            </div>
          </button>
        );
      })}
      
      {/* Optional Text Label */}
      {!readonly && (
        <span className={cn(
          "text-xs font-bold ml-2 w-8 tabular-nums transition-colors",
          displayValue > 0 ? "text-text-primary" : "text-slate-300"
        )}>
          {displayValue > 0 ? (displayValue / 2).toFixed(1) : "0.0"}
        </span>
      )}
    </div>
  );
};