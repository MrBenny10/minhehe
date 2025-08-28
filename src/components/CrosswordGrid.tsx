import React, { useCallback, useEffect } from 'react';
import { Cell } from './CrosswordGame';
import { cn } from '@/lib/utils';

interface CrosswordGridProps {
  cells: Cell[];
  selectedCell: string | null;
  onCellSelect: (id: string) => void;
  onCellUpdate: (id: string, value: string) => void;
  showingErrors: boolean;
  gameStarted: boolean;
  currentClue?: any; // Add current clue to know direction
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  cells,
  selectedCell,
  onCellSelect,
  onCellUpdate,
  showingErrors,
  gameStarted,
  currentClue
}) => {
  const handleCellClick = useCallback((cell: Cell) => {
    if (!cell.isBlocked) {
      onCellSelect(cell.id);
    }
  }, [onCellSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, cell: Cell) => {
    if (cell.isBlocked || !gameStarted) return;

    if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
      e.preventDefault();
      onCellUpdate(cell.id, e.key);
      
      // Smart auto-advance based on current clue direction
      if (currentClue) {
        let nextCell = null;
        
        if (currentClue.direction === 'across') {
          // Move right for across clues
          const nextCol = cell.col + 1;
          if (nextCol < 5) {
            nextCell = cells.find(c => c.row === cell.row && c.col === nextCol && !c.isBlocked);
          }
        } else if (currentClue.direction === 'down') {
          // Move down for down clues
          const nextRow = cell.row + 1;
          if (nextRow < 5) {
            nextCell = cells.find(c => c.row === nextRow && c.col === cell.col && !c.isBlocked);
          }
        }
        
        if (nextCell) {
          onCellSelect(nextCell.id);
        } else {
          // We've reached the end of current word, find another word to continue with
          // Find all available clues and pick the next one
          const allClues = [
            { number: 1, direction: 'across', startRow: 1, startCol: 0 },
            { number: 3, direction: 'across', startRow: 3, startCol: 1 },
            { number: 2, direction: 'down', startRow: 0, startCol: 1 }
          ];
          
          // Find the next clue that's different from current
          const currentIndex = allClues.findIndex(clue => 
            clue.number === currentClue.number && clue.direction === currentClue.direction
          );
          
          if (currentIndex !== -1) {
            const nextClueIndex = (currentIndex + 1) % allClues.length;
            const nextClue = allClues[nextClueIndex];
            const nextStartCell = cells.find(c => 
              c.row === nextClue.startRow && c.col === nextClue.startCol && !c.isBlocked
            );
            
            if (nextStartCell) {
              onCellSelect(nextStartCell.id);
            }
          }
        }
      } else {
        // Default to moving right if no current clue context
        const nextCol = cell.col + 1;
        if (nextCol < 5) {
          const nextCell = cells.find(c => c.row === cell.row && c.col === nextCol && !c.isBlocked);
          if (nextCell) {
            onCellSelect(nextCell.id);
          }
        }
      }
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      onCellUpdate(cell.id, '');
      
      // Smart backspace based on current clue direction
      if (currentClue) {
        if (currentClue.direction === 'across') {
          // Move left for across clues
          const prevCol = cell.col - 1;
          if (prevCol >= 0) {
            const prevCell = cells.find(c => c.row === cell.row && c.col === prevCol && !c.isBlocked);
            if (prevCell) {
              onCellSelect(prevCell.id);
            }
          }
        } else if (currentClue.direction === 'down') {
          // Move up for down clues
          const prevRow = cell.row - 1;
          if (prevRow >= 0) {
            const prevCell = cells.find(c => c.row === prevRow && c.col === cell.col && !c.isBlocked);
            if (prevCell) {
              onCellSelect(prevCell.id);
            }
          }
        }
      } else {
        // Default to moving left if no current clue context
        const prevCol = cell.col - 1;
        if (prevCol >= 0) {
          const prevCell = cells.find(c => c.row === cell.row && c.col === prevCol && !c.isBlocked);
          if (prevCell) {
            onCellSelect(prevCell.id);
          }
        }
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextCol = cell.col + 1;
      if (nextCol < 5) {
        const nextCell = cells.find(c => c.row === cell.row && c.col === nextCol && !c.isBlocked);
        if (nextCell) onCellSelect(nextCell.id);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevCol = cell.col - 1;
      if (prevCol >= 0) {
        const prevCell = cells.find(c => c.row === cell.row && c.col === prevCol && !c.isBlocked);
        if (prevCell) onCellSelect(prevCell.id);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextRow = cell.row + 1;
      if (nextRow < 5) {
        const nextCell = cells.find(c => c.row === nextRow && c.col === cell.col && !c.isBlocked);
        if (nextCell) onCellSelect(nextCell.id);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevRow = cell.row - 1;
      if (prevRow >= 0) {
        const prevCell = cells.find(c => c.row === prevRow && c.col === cell.col && !c.isBlocked);
        if (prevCell) onCellSelect(prevCell.id);
      }
    }
  }, [cells, onCellUpdate, onCellSelect, gameStarted, currentClue]);

  const getCellStatus = (cell: Cell) => {
    if (cell.isBlocked) return 'blocked';
    if (!gameStarted) return 'inactive';
    if (showingErrors && cell.value && cell.value.toUpperCase() !== cell.answer.toUpperCase()) return 'incorrect';
    if (cell.value && cell.value.toUpperCase() === cell.answer.toUpperCase()) return 'correct';
    return 'active';
  };

  // Auto-focus selected cell
  useEffect(() => {
    if (selectedCell) {
      const cellElement = document.getElementById(`cell-${selectedCell}`);
      if (cellElement) {
        cellElement.focus();
      }
    }
  }, [selectedCell]);

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-5 gap-1 p-4 bg-background border-2 border-grid-border rounded-lg">
        {cells.map((cell) => {
          const status = getCellStatus(cell);
          const isSelected = selectedCell === cell.id;
          
          if (cell.isBlocked) {
            return (
              <div
                key={cell.id}
                className="w-12 h-12 bg-foreground opacity-10 rounded-sm"
              />
            );
          }

          return (
            <div
              key={cell.id}
              className="relative"
            >
              {cell.number && (
                <span className="absolute top-0 left-0 text-xs font-bold text-foreground z-10 ml-1 mt-0.5">
                  {cell.number}
                </span>
              )}
              <input
                id={`cell-${cell.id}`}
                type="text"
                value={cell.value}
                onChange={(e) => {
                  const value = e.target.value.slice(-1); // Only take the last character
                  if (value.match(/[a-zA-Z]/) || value === '') {
                    onCellUpdate(cell.id, value);
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, cell)}
                onClick={() => handleCellClick(cell)}
                className={cn(
                  "w-12 h-12 text-center text-lg font-mono font-bold border-2 rounded-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200",
                  "cursor-pointer select-none uppercase",
                  {
                    "bg-grid-cell border-grid-border text-foreground": status === 'active',
                    "bg-grid-active border-primary": isSelected && status === 'active',
                    "bg-grid-correct border-grid-correct text-white": status === 'correct',
                    "bg-grid-incorrect border-destructive text-destructive-foreground animate-pulse-error": status === 'incorrect',
                    "bg-muted border-muted text-muted-foreground cursor-not-allowed": status === 'inactive',
                  }
                )}
                maxLength={1}
                disabled={!gameStarted}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};