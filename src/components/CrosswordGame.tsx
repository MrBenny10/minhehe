import React, { useState, useCallback } from 'react';
import { CrosswordGrid } from './CrosswordGrid';
import { CluesPanel } from './CluesPanel';
import { GameTimer } from './GameTimer';
import { GameControls } from './GameControls';
import { CompletionModal } from './CompletionModal';

export interface Clue {
  number: number;
  text: string;
  direction: 'across' | 'down';
  startRow: number;
  startCol: number;
  length: number;
  solution: string;
}

export interface Cell {
  id: string;
  row: number;
  col: number;
  value: string;
  answer: string;
  isBlocked: boolean;
  number?: number;
}

// Crossword with proper letter intersections
const samplePuzzle = {
  size: 5,
  clues: [
    // Across clues
    {
      number: 1,
      text: 'Place to pour a pint',
      direction: 'across' as const,
      startRow: 0,
      startCol: 0,
      length: 3,
      solution: 'PUB',
    },
    {
      number: 4,
      text: 'Host of the 2028 Olympics, for short',
      direction: 'across' as const,
      startRow: 1,
      startCol: 0,
      length: 3,
      solution: 'USA',
    },
    {
      number: 6,
      text: 'Political commentator Jen',
      direction: 'across' as const,
      startRow: 2,
      startCol: 1,
      length: 5,
      solution: 'PSAKI',
    },
    {
      number: 8,
      text: 'Black suit',
      direction: 'across' as const,
      startRow: 3,
      startCol: 0,
      length: 5,
      solution: 'CLUBS',
    },
    {
      number: 9,
      text: "Kick one's feet up",
      direction: 'across' as const,
      startRow: 4,
      startCol: 0,
      length: 5,
      solution: 'RELAX',
    },

    // Down clues
    {
      number: 2,
      text: 'Sign of life',
      direction: 'down' as const,
      startRow: 0,
      startCol: 0,
      length: 5,
      solution: 'PULSE', // P(PUB), U(USA), L(CLUBS), E(RELAX), intersecting at column 0
    },
    {
      number: 3,
      text: 'Regular patron\'s order, with "the"',
      direction: 'down' as const,
      startRow: 0,
      startCol: 1,
      length: 5,
      solution: 'USUAL', // U(PUB), S(USA), U(CLUBS), A(intersects), L(RELAX)
    },
    {
      number: 5,
      text: 'Loaf with a chocolate swirl',
      direction: 'down' as const,
      startRow: 0,
      startCol: 2,
      length: 5,
      solution: 'BABKA', // B(PUB), A(USA), B(intersects), K(intersects), A(RELAX)
    },
    {
      number: 7,
      text: 'Skill practiced on dummies, for short',
      direction: 'down' as const,
      startRow: 2,
      startCol: 3,
      length: 3,
      solution: 'CPR', // A(PSAKI), B(CLUBS), L(RELAX)
    },
    {
      number: 10,
      text: 'Age at which Tiger Woods made his first hole-in-one',
      direction: 'down' as const,
      startRow: 2,
      startCol: 4,
      length: 3,
      solution: 'SIX', // K(PSAKI), S(CLUBS), X(RELAX)
    },
  ],
};

export const CrosswordGame: React.FC = () => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showingErrors, setShowingErrors] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [completionTime, setCompletionTime] = useState<number | null>(null);

  // Initialize grid
  const initializeGrid = useCallback(() => {
    const newCells: Cell[] = [];
    
    // Create all cells as blocked initially
    for (let row = 0; row < samplePuzzle.size; row++) {
      for (let col = 0; col < samplePuzzle.size; col++) {
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

    // Mark cells used by clues as unblocked and set answers
    samplePuzzle.clues.forEach((clue) => {
      for (let i = 0; i < clue.length; i++) {
        const cellRow = clue.direction === 'across' ? clue.startRow : clue.startRow + i;
        const cellCol = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
        
        const cellIndex = cellRow * samplePuzzle.size + cellCol;
        if (newCells[cellIndex]) {
          newCells[cellIndex].isBlocked = false;
          newCells[cellIndex].answer = clue.solution[i];
          
          // Add number to starting cell
          if (i === 0) {
            newCells[cellIndex].number = clue.number;
          }
        }
      }
    });

    setCells(newCells);
  }, []);

  const handleCellUpdate = useCallback((cellId: string, value: string) => {
    setCells(prev => prev.map(cell => 
      cell.id === cellId ? { ...cell, value: value.toUpperCase() } : cell
    ));
  }, []);

  const handleStart = useCallback(() => {
    initializeGrid();
    setGameStarted(true);
    setGameCompleted(false);
    setCompletionTime(null);
    setShowingErrors(false);
    setTimeElapsed(0);
  }, [initializeGrid]);

  const handleCheck = useCallback(() => {
    setShowingErrors(true);
    
    // Check if puzzle is complete
    const isComplete = cells.every(cell => 
      cell.isBlocked || cell.value.toUpperCase() === cell.answer.toUpperCase()
    );
    
    if (isComplete) {
      setGameCompleted(true);
      setCompletionTime(timeElapsed);
    }
  }, [cells, timeElapsed]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mini Crossword</h1>
          <p className="text-muted-foreground">Challenge yourself with our daily puzzle</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-center">
              <GameTimer 
                timeElapsed={timeElapsed}
                setTimeElapsed={setTimeElapsed}
                isRunning={gameStarted && !gameCompleted}
              />
            </div>
            
            <CrosswordGrid
              cells={cells}
              selectedCell={selectedCell}
              onCellSelect={setSelectedCell}
              onCellUpdate={handleCellUpdate}
              showingErrors={showingErrors}
              gameStarted={gameStarted}
            />
            
            <GameControls
              gameStarted={gameStarted}
              gameCompleted={gameCompleted}
              onStartGame={handleStart}
              onCheckAnswers={handleCheck}
            />
          </div>

          <div className="lg:col-span-1">
            <CluesPanel clues={samplePuzzle.clues} />
          </div>
        </div>

        <CompletionModal
          isOpen={gameCompleted}
          onClose={() => setGameCompleted(false)}
          completionTime={completionTime || 0}
          onNewGame={handleStart}
        />
      </div>
    </div>
  );
};