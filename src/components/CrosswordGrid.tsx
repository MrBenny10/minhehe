import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  gridSize?: number; // For square grids (backward compatibility)
  gridCols?: number; // For rectangular grids
  gridRows?: number; // For rectangular grids
  fontSize?: 'sm' | 'md' | 'lg' | 'xl'; // Font size variant
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  cells,
  selectedCell,
  onCellSelect,
  onCellUpdate,
  showingErrors,
  gameStarted,
  currentClue,
  gridSize = 5,
  gridCols,
  gridRows,
  fontSize = 'sm'
}) => {
  // Use specific cols/rows if provided, otherwise fall back to gridSize for square grids
  const cols = gridCols || gridSize;
  const rows = gridRows || gridSize;
  
  // Font size variants
  const fontSizeClasses = {
    sm: 'text-[0.7rem] md:text-xs lg:text-sm',
    md: 'text-xs md:text-sm lg:text-base',
    lg: 'text-sm md:text-base lg:text-lg',
    xl: 'text-base md:text-lg lg:text-xl'
  };
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Helper function for auto-advance logic
  const autoAdvanceToNext = useCallback((cell: Cell) => {
    console.log(`AutoAdvance called for cell: ${cell.id} (${cell.row}, ${cell.col})`);
    console.log(`Current clue: ${currentClue?.number}${currentClue?.direction} - ${currentClue?.solution}`);
    
    if (currentClue) {
      let nextCell = null;
      
      if (currentClue.direction === 'across') {
        // Move right for across clues, skipping already correct cells
        let checkCol = cell.col + 1;
        console.log(`Looking for next cell after col ${cell.col}, checking col ${checkCol}`);
        while (checkCol < cols) {
          const candidateCell = cells.find(c => c.row === cell.row && c.col === checkCol && !c.isBlocked);
          console.log(`Checking candidate cell at (${cell.row}, ${checkCol}):`, candidateCell);
          if (candidateCell) {
            // Skip if cell is already correct (green), continue looking
            if (!candidateCell.value || candidateCell.value.toUpperCase() !== candidateCell.answer.toUpperCase()) {
              nextCell = candidateCell;
              break;
            }
          }
          checkCol++;
        }
      } else if (currentClue.direction === 'down') {
        // Move down for down clues, skipping already correct cells
        let checkRow = cell.row + 1;
        while (checkRow < rows) {
          const candidateCell = cells.find(c => c.row === checkRow && c.col === cell.col && !c.isBlocked);
          if (candidateCell) {
            // Skip if cell is already correct (green), continue looking
            if (!candidateCell.value || candidateCell.value.toUpperCase() !== candidateCell.answer.toUpperCase()) {
              nextCell = candidateCell;
              break;
            }
          }
          checkRow++;
        }
      }
      
      if (nextCell) {
        onCellSelect(nextCell.id);
      } else {
        // Current word is complete, check if the current clue is fully complete
        let isCurrentClueComplete = true;
        for (let i = 0; i < currentClue.length; i++) {
          const checkRow = currentClue.direction === 'across' ? currentClue.startRow : currentClue.startRow + i;
          const checkCol = currentClue.direction === 'across' ? currentClue.startCol + i : currentClue.startCol;
          const checkCell = cells.find(c => c.row === checkRow && c.col === checkCol);
          
          if (checkCell && (!checkCell.value || checkCell.value.toUpperCase() !== checkCell.answer.toUpperCase())) {
            isCurrentClueComplete = false;
            break;
          }
        }
        
        // Only jump to next word if current word is truly complete
        if (isCurrentClueComplete) {
          // Find the first cell that has an incomplete answer, starting from top-left
          let foundNextCell = null;
          
          // Search row by row, column by column for the first incomplete cell
          for (let row = 0; row < rows && !foundNextCell; row++) {
            for (let col = 0; col < cols && !foundNextCell; col++) {
              const candidateCell = cells.find(c => c.row === row && c.col === col && !c.isBlocked);
              if (candidateCell && (!candidateCell.value || candidateCell.value.toUpperCase() !== candidateCell.answer.toUpperCase())) {
                foundNextCell = candidateCell;
              }
            }
          }
          
          if (foundNextCell) {
            onCellSelect(foundNextCell.id);
          }
        }
      }
    }
  }, [cells, currentClue, onCellSelect, cols, rows]);

  const handleCellClick = useCallback((cell: Cell) => {
    if (!cell.isBlocked && gameStarted) {
      // If cell is correct, auto-advance to next available cell instead of selecting it
      if (cell.value && cell.value.toUpperCase() === cell.answer.toUpperCase()) {
        autoAdvanceToNext(cell);
      } else {
        onCellSelect(cell.id);
        
        // Focus hidden input on mobile to capture keystrokes
        if (isMobile && hiddenInputRef.current) {
          hiddenInputRef.current.focus();
        }
      }
    }
  }, [onCellSelect, autoAdvanceToNext, isMobile, gameStarted]);

  const handleMobileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCell || !gameStarted) return;
    
    const value = e.target.value.slice(-1);
    const selectedCellData = cells.find(c => c.id === selectedCell);
    
    if (selectedCellData && !selectedCellData.isBlocked) {
      if (value.match(/[a-zA-Z]/) || value === '') {
        onCellUpdate(selectedCell, value);
        if (value) {
          autoAdvanceToNext(selectedCellData);
        }
      }
    }
    
    // Clear the hidden input
    e.target.value = '';
  }, [selectedCell, cells, onCellUpdate, autoAdvanceToNext, gameStarted]);

  const handleMobileKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!selectedCell || !gameStarted) return;
    
    const selectedCellData = cells.find(c => c.id === selectedCell);
    if (!selectedCellData || selectedCellData.isBlocked) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      onCellUpdate(selectedCell, '');
      
      // Move to previous cell based on current clue direction
      if (currentClue) {
        if (currentClue.direction === 'across') {
          const prevCol = selectedCellData.col - 1;
          if (prevCol >= 0) {
            const prevCell = cells.find(c => c.row === selectedCellData.row && c.col === prevCol && !c.isBlocked);
            if (prevCell) onCellSelect(prevCell.id);
          }
        } else if (currentClue.direction === 'down') {
          const prevRow = selectedCellData.row - 1;
          if (prevRow >= 0) {
            const prevCell = cells.find(c => c.row === prevRow && c.col === selectedCellData.col && !c.isBlocked);
            if (prevCell) onCellSelect(prevCell.id);
          }
        }
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextCol = selectedCellData.col + 1;
      if (nextCol < cols) {
        const nextCell = cells.find(c => c.row === selectedCellData.row && c.col === nextCol && !c.isBlocked);
        if (nextCell) onCellSelect(nextCell.id);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevCol = selectedCellData.col - 1;
      if (prevCol >= 0) {
        const prevCell = cells.find(c => c.row === selectedCellData.row && c.col === prevCol && !c.isBlocked);
        if (prevCell) onCellSelect(prevCell.id);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextRow = selectedCellData.row + 1;
      if (nextRow < rows) {
        const nextCell = cells.find(c => c.row === nextRow && c.col === selectedCellData.col && !c.isBlocked);
        if (nextCell) onCellSelect(nextCell.id);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevRow = selectedCellData.row - 1;
      if (prevRow >= 0) {
        const prevCell = cells.find(c => c.row === prevRow && c.col === selectedCellData.col && !c.isBlocked);
        if (prevCell) onCellSelect(prevCell.id);
      }
    }
  }, [selectedCell, cells, onCellUpdate, onCellSelect, gameStarted, currentClue]);

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
      console.log(`Typing letter: ${e.key} in cell: ${cell.id} (${cell.row}, ${cell.col})`);
      console.log(`Current clue: ${currentClue?.number}${currentClue?.direction} - ${currentClue?.solution}`);
      onCellUpdate(cell.id, e.key);
      
      // Use the helper function for auto-advance
      console.log(`About to auto-advance from cell: ${cell.id}`);
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
      if (nextCol < cols) {
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
      if (nextRow < rows) {
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

  // Auto-focus hidden input when cell is selected on mobile
  useEffect(() => {
    if (selectedCell && isMobile && hiddenInputRef.current && gameStarted) {
      hiddenInputRef.current.focus();
    }
  }, [selectedCell, isMobile, gameStarted]);

  // Auto-focus selected cell on desktop
  useEffect(() => {
    if (selectedCell && !isMobile) {
      setTimeout(() => {
        const cellElement = document.getElementById(`cell-${selectedCell}`);
        if (cellElement) {
          cellElement.focus({ preventScroll: true });
        }
      }, 0);
    }
  }, [selectedCell, isMobile]);

  return (
    <div className="flex justify-center w-full h-full">
      {/* Hidden input for mobile keystroke capture */}
      {isMobile && (
        <input
          ref={hiddenInputRef}
          type="text"
          className="fixed -top-[1000px] -left-[1000px] opacity-0 pointer-events-none"
          onChange={handleMobileInput}
          onKeyDown={handleMobileKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      )}
      
      <div 
        className="grid gap-0.5 p-1 md:gap-1 md:p-2 bg-background border-2 border-grid-border rounded-lg"
        style={{ 
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          // Mobile: use full viewport calculations
          width: cols === rows 
            ? `min(98vw, (100vh - 120px))` 
            : `min(98vw, (100vh - 120px) * ${cols}/${rows})`,
          height: cols === rows 
            ? `min(98vw, 100vh - 120px)` 
            : `min(98vw * ${rows}/${cols}, 100vh - 120px)`,
          aspectRatio: `${cols}/${rows}`,
        }}
      >
        {cells.map((cell) => {
          const status = getCellStatus(cell);
          const isSelected = selectedCell === cell.id;
          
          if (cell.isBlocked) {
            return (
              <div
                key={cell.id}
                className="w-full h-full bg-block-bg border border-block-border rounded-sm shadow-inner"
              />
            );
          }

          return (
            <div
              key={cell.id}
              className="relative w-full h-full"
            >
              {cell.number && (
                <span className="absolute top-0 left-0 text-[0.5rem] md:text-[0.6rem] font-bold text-grid-text z-10 ml-0.5 mt-0.5 leading-none">
                  {cell.number}
                </span>
              )}
              {isMobile ? (
                // Mobile: Use div that looks like input but doesn't trigger keyboard
                <div
                  className={cn(
                    "w-full h-full text-center font-mono font-bold border-2 rounded-sm",
                    fontSizeClasses[fontSize],
                    "cursor-pointer select-none uppercase touch-manipulation flex items-center justify-center",
                    {
                      "bg-grid-cell border-grid-border text-grid-text": status === 'active',
                      "bg-grid-active border-primary": isSelected && status === 'active',
                      "bg-grid-correct border-grid-correct text-white": status === 'correct',
                      "bg-grid-incorrect border-destructive text-destructive-foreground animate-pulse-error": status === 'incorrect',
                      "bg-muted border-muted text-muted-foreground cursor-not-allowed": status === 'inactive',
                      "cursor-default": cell.value && cell.value.toUpperCase() === cell.answer.toUpperCase(),
                    }
                  )}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCellClick(cell);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCellClick(cell);
                  }}
                >
                  {cell.value}
                </div>
              ) : (
                // Desktop: Use actual input
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
                  onClick={(e) => {
                    e.preventDefault();
                    handleCellClick(cell);
                  }}
                  onFocus={(e) => {
                    e.target.setSelectionRange(0, 0);
                  }}
                  readOnly={cell.value && cell.value.toUpperCase() === cell.answer.toUpperCase()}
                  className={cn(
                    "w-full h-full text-center font-mono font-bold border-2 rounded-sm",
                    fontSizeClasses[fontSize],
                    "focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200",
                    "cursor-pointer select-none uppercase",
                    {
                      "bg-grid-cell border-grid-border text-grid-text": status === 'active',
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};