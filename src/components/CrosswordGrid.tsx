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
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  cells,
  selectedCell,
  onCellSelect,
  onCellUpdate,
  showingErrors,
  gameStarted
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
      
      // Move to next cell
      const nextCol = cell.col + 1;
      const nextRow = cell.row;
      if (nextCol < 5) {
        const nextCell = cells.find(c => c.row === nextRow && c.col === nextCol && !c.isBlocked);
        if (nextCell) {
          onCellSelect(nextCell.id);
        }
      }
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      onCellUpdate(cell.id, '');
      
      // Move to previous cell
      const prevCol = cell.col - 1;
      const prevRow = cell.row;
      if (prevCol >= 0) {
        const prevCell = cells.find(c => c.row === prevRow && c.col === prevCol && !c.isBlocked);
        if (prevCell) {
          onCellSelect(prevCell.id);
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
  }, [cells, onCellUpdate, onCellSelect, gameStarted]);

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
                onChange={() => {}} // Handled by keyDown
                onKeyDown={(e) => handleKeyDown(e, cell)}
                onClick={() => handleCellClick(cell)}
                className={cn(
                  "w-12 h-12 text-center text-lg font-mono font-bold border-2 rounded-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200",
                  "cursor-pointer select-none",
                  {
                    "bg-grid-cell border-grid-border text-foreground": status === 'active',
                    "bg-grid-active border-primary": isSelected && status === 'active',
                    "bg-grid-correct border-success text-success-foreground": status === 'correct',
                    "bg-grid-incorrect border-destructive text-destructive-foreground animate-pulse-error": status === 'incorrect',
                    "bg-muted border-muted text-muted-foreground cursor-not-allowed": status === 'inactive',
                  }
                )}
                maxLength={1}
                disabled={!gameStarted}
                readOnly
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};