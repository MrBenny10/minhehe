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
  currentClue?: any;
  gridSize?: number; // Add gridSize prop
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  cells,
  selectedCell,
  onCellSelect,
  onCellUpdate,
  showingErrors,
  gameStarted,
  currentClue,
  gridSize = 7
}) => {
  // Helper function for auto-advance logic
  const autoAdvanceToNext = useCallback((cell: Cell) => {
    if (currentClue) {
      let nextCell = null;
      
      if (currentClue.direction === 'across') {
        // Move right for across clues, skipping correct cells
        let checkCol = cell.col + 1;
        while (checkCol < gridSize) {
          const candidateCell = cells.find(c => c.row === cell.row && c.col === checkCol && !c.isBlocked);
          if (candidateCell && candidateCell.value.toUpperCase() !== candidateCell.answer.toUpperCase()) {
            nextCell = candidateCell;
            break;
          }
          checkCol++;
        }
      } else if (currentClue.direction === 'down') {
        // Move down for down clues, skipping correct cells
        let checkRow = cell.row + 1;
        while (checkRow < gridSize) {
          const candidateCell = cells.find(c => c.row === checkRow && c.col === cell.col && !c.isBlocked);
          if (candidateCell && candidateCell.value.toUpperCase() !== candidateCell.answer.toUpperCase()) {
            nextCell = candidateCell;
            break;
          }
          checkRow++;
        }
      }
      
      if (nextCell) {
        onCellSelect(nextCell.id);
      } else {
        // Current word is complete, find the next incomplete word
        const allClues = [
          { number: 1, direction: 'across', startRow: 1, startCol: 0, length: 4 },
          { number: 3, direction: 'across', startRow: 3, startCol: 1, length: 4 },
          { number: 2, direction: 'down', startRow: 0, startCol: 1, length: 4 }
        ];
        
        // Find a clue that has incomplete cells
        for (const clue of allClues) {
          if (clue.number === currentClue.number && clue.direction === currentClue.direction) continue;
          
          // Check if this clue has any incomplete cells
          for (let i = 0; i < clue.length; i++) {
            const checkRow = clue.direction === 'across' ? clue.startRow : clue.startRow + i;
            const checkCol = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
            const checkCell = cells.find(c => c.row === checkRow && c.col === checkCol);
            
            if (checkCell && checkCell.value.toUpperCase() !== checkCell.answer.toUpperCase()) {
              onCellSelect(checkCell.id);
              return;
            }
          }
        }
      }
    }
  }, [cells, currentClue, onCellSelect]);

  const handleCellClick = useCallback((cell: Cell) => {
    if (!cell.isBlocked) {
      // If cell is correct, auto-advance to next available cell instead of selecting it
      if (cell.value && cell.value.toUpperCase() === cell.answer.toUpperCase()) {
        autoAdvanceToNext(cell);
      } else {
        onCellSelect(cell.id);
      }
    }
  }, [onCellSelect, autoAdvanceToNext]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, cell: Cell) => {
    if (cell.isBlocked || !gameStarted) return;

    // If cell is already correct, skip to next cell instead of allowing input
    if (cell.value && cell.value.toUpperCase() === cell.answer.toUpperCase()) {
      if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
        e.preventDefault();
        // Auto-advance to next available cell
        autoAdvanceToNext(cell);
        return;
      }
    }

    if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
      e.preventDefault();
      onCellUpdate(cell.id, e.key);
      
      // Use the helper function for auto-advance
      autoAdvanceToNext(cell);
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
      if (nextCol < gridSize) {
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
      if (nextRow < gridSize) {
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
  }, [cells, onCellUpdate, onCellSelect, gameStarted, currentClue, autoAdvanceToNext]);

  const getCellStatus = (cell: Cell) => {
    if (cell.isBlocked) return 'blocked';
    if (!gameStarted) return 'inactive';
    if (showingErrors && cell.value && cell.value.toUpperCase() !== cell.answer.toUpperCase()) return 'incorrect';
    if (cell.value && cell.value.toUpperCase() === cell.answer.toUpperCase()) return 'correct';
    return 'active';
  };

  // Auto-focus selected cell without scrolling
  useEffect(() => {
    if (selectedCell) {
      const cellElement = document.getElementById(`cell-${selectedCell}`);
      if (cellElement) {
        // Use scrollIntoView with block: 'nearest' to prevent viewport jumping
        cellElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'nearest' 
        });
        cellElement.focus({ preventScroll: true });
      }
    }
  }, [selectedCell]);

  return (
    <div className="flex justify-center">
      <div className={`grid gap-1 p-4 bg-background border-2 border-grid-border rounded-lg`} style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
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
                  // Prevent editing if cell is already correct
                  if (cell.value && cell.value.toUpperCase() === cell.answer.toUpperCase()) {
                    return;
                  }
                  const value = e.target.value.slice(-1); // Only take the last character
                  if (value.match(/[a-zA-Z]/) || value === '') {
                    onCellUpdate(cell.id, value);
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, cell)}
                onClick={() => handleCellClick(cell)}
                readOnly={cell.value && cell.value.toUpperCase() === cell.answer.toUpperCase()}
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
                    "cursor-default": cell.value && cell.value.toUpperCase() === cell.answer.toUpperCase(),
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