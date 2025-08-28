import React, { useState, useCallback, useEffect } from 'react';
import { CrosswordGrid } from './CrosswordGrid';
import { CluesPanel } from './CluesPanel';
import { GameControls } from './GameControls';
import { GameTimer } from './GameTimer';
import { CompletionModal } from './CompletionModal';
import { useToast } from '@/hooks/use-toast';

export interface Cell {
  id: string;
  row: number;
  col: number;
  value: string;
  answer: string;
  isBlocked: boolean;
  number?: number;
}

export interface Clue {
  number: number;
  text: string;
  direction: 'across' | 'down';
  startRow: number;
  startCol: number;
  length: number;
  solution: string;
}

interface Puzzle {
  size: number;
  clues: Clue[];
}

// 8-word Swedish crossword with proper intersections
const samplePuzzle: Puzzle = {
  size: 7,
  clues: [
    // Across
    {
      number: 1,
      text: 'Swedish pop group (4)',
      direction: 'across',
      startRow: 0,
      startCol: 0,
      length: 4,
      solution: 'ABBA',
    },
    {
      number: 3,
      text: 'Swedish car brand (4)',
      direction: 'across',
      startRow: 2,
      startCol: 2,
      length: 4,
      solution: 'SAAB',
    },
    {
      number: 5,
      text: 'Swedish furniture store (4)',
      direction: 'across',
      startRow: 4,
      startCol: 0,
      length: 4,
      solution: 'IKEA',
    },
    {
      number: 6,
      text: 'Swedish car manufacturer (5)',
      direction: 'across',
      startRow: 6,
      startCol: 1,
      length: 5,
      solution: 'VOLVO',
    },
    
    // Down
    {
      number: 2,
      text: 'Swedish concept of balance (5)',
      direction: 'down',
      startRow: 1,
      startCol: 3,
      length: 5,
      solution: 'LAGOM',
    },
    {
      number: 4,
      text: 'Indigenous people of northern Sweden (4)',
      direction: 'down',
      startRow: 2,
      startCol: 5,
      length: 4,
      solution: 'SAMI',
    },
    {
      number: 7,
      text: 'Swedish cheers (4)',
      direction: 'down',
      startRow: 3,
      startCol: 0,
      length: 4,
      solution: 'SKAL',
    },
    {
      number: 8,
      text: 'Swedish university city (7)',
      direction: 'down',
      startRow: 0,
      startCol: 1,
      length: 7,
      solution: 'UPPSALA',
    },
  ],
};

export const CrosswordGame: React.FC = () => {
  const [puzzle] = useState<Puzzle>(samplePuzzle);
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showingErrors, setShowingErrors] = useState(false);
  const [currentClue, setCurrentClue] = useState<Clue | null>(null);
  const { toast } = useToast();

  // Initialize the grid
  const initializeGrid = useCallback(() => {
    const newCells: Cell[] = [];
    const gridSize = puzzle.size;

    // Create all cells as blocked initially
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        newCells.push({
          id: `${row}-${col}`,
          row,
          col,
          value: '',
          answer: '',
          isBlocked: true,
        });
      }
    }

    // Mark cells that are part of words as unblocked and set their answers
    puzzle.clues.forEach((clue) => {
      for (let i = 0; i < clue.length; i++) {
        const cellRow = clue.direction === 'across' ? clue.startRow : clue.startRow + i;
        const cellCol = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
        
        if (cellRow < gridSize && cellCol < gridSize) {
          const cellIndex = cellRow * gridSize + cellCol;
          newCells[cellIndex].isBlocked = false;
          newCells[cellIndex].answer = clue.solution[i];
          
          // Add number to the first cell of each clue
          if (i === 0) {
            newCells[cellIndex].number = clue.number;
          }
        }
      }
    });

    setCells(newCells);
  }, [puzzle]);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  const handleCellSelect = useCallback((cellId: string) => {
    setSelectedCell(cellId);
    
    // Find which clue this cell belongs to
    const selectedCellData = cells.find(cell => cell.id === cellId);
    if (!selectedCellData) return;

    // Find clues that contain this cell
    const containingClues = puzzle.clues.filter(clue => {
      for (let i = 0; i < clue.length; i++) {
        const cellRow = clue.direction === 'across' ? clue.startRow : clue.startRow + i;
        const cellCol = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
        
        if (cellRow === selectedCellData.row && cellCol === selectedCellData.col) {
          return true;
        }
      }
      return false;
    });

    // Set the current clue (prefer across if multiple)
    if (containingClues.length > 0) {
      const acrossClue = containingClues.find(clue => clue.direction === 'across');
      setCurrentClue(acrossClue || containingClues[0]);
    }
  }, [cells, puzzle.clues]);

  const handleCellUpdate = useCallback((cellId: string, value: string) => {
    setCells(prevCells => 
      prevCells.map(cell => 
        cell.id === cellId ? { ...cell, value: value.toUpperCase() } : cell
      )
    );
    setShowingErrors(false);
  }, []);

  const handleStartGame = useCallback(() => {
    setGameStarted(true);
    setTimeElapsed(0);
    setIsCompleted(false);
    setCells(prevCells => prevCells.map(cell => ({ ...cell, value: '' })));
    
    // Select the first cell
    const firstCell = cells.find(cell => !cell.isBlocked);
    if (firstCell) {
      setSelectedCell(firstCell.id);
    }
    
    toast({
      title: "Game Started!",
      description: "Fill in the crossword. Good luck!",
    });
  }, [cells, toast]);

  const handleCheckAnswers = useCallback(() => {
    setShowingErrors(true);
    
    const allCorrect = cells
      .filter(cell => !cell.isBlocked)
      .every(cell => cell.value.toUpperCase() === cell.answer.toUpperCase());
    
    if (allCorrect) {
      setIsCompleted(true);
      toast({
        title: "Congratulations!",
        description: "You've completed the crossword!",
      });
    } else {
      toast({
        title: "Not quite right",
        description: "Some answers are incorrect. Keep trying!",
        variant: "destructive",
      });
    }
  }, [cells, toast]);

  const handleResetGame = useCallback(() => {
    setGameStarted(false);
    setTimeElapsed(0);
    setIsCompleted(false);
    setShowingErrors(false);
    setSelectedCell(null);
    setCurrentClue(null);
    setCells(prevCells => prevCells.map(cell => ({ ...cell, value: '' })));
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Swedish Crossword</h1>
          <p className="text-muted-foreground">
            Test your knowledge of Swedish culture and language
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <CrosswordGrid
              cells={cells}
              selectedCell={selectedCell}
              onCellSelect={handleCellSelect}
              onCellUpdate={handleCellUpdate}
              showingErrors={showingErrors}
              gameStarted={gameStarted}
              currentClue={currentClue}
              gridSize={puzzle.size}
            />
          </div>
          
          <div className="space-y-6">
            <CluesPanel clues={puzzle.clues} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <GameControls
            gameStarted={gameStarted}
            gameCompleted={isCompleted}
            onStartGame={handleStartGame}
            onCheckAnswers={handleCheckAnswers}
          />
          
          {gameStarted && (
            <GameTimer
              timeElapsed={timeElapsed}
              setTimeElapsed={setTimeElapsed}
              isRunning={gameStarted && !isCompleted}
              gameCompleted={isCompleted}
            />
          )}
        </div>

        <CompletionModal
          isOpen={isCompleted}
          onClose={() => setIsCompleted(false)}
          completionTime={timeElapsed}
          onNewGame={handleResetGame}
        />
      </div>
    </div>
  );
};