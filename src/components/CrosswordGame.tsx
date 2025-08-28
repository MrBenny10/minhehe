import React, { useState, useCallback } from 'react';
import { CrosswordGrid } from './CrosswordGrid';
import { CluesPanel } from './CluesPanel';
import { GameTimer } from './GameTimer';
import { GameControls } from './GameControls';
import { CompletionModal } from './CompletionModal';
import minHeheLogoSrc from '@/assets/minhehe-logo.png';

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

// Swedish-themed 5x5 crossword with correct intersections
const samplePuzzle = {
  size: 5,
  clues: [
    // Across clues
    {
      number: 1,
      text: 'Famous Swedish pop group',
      direction: 'across' as const,
      startRow: 0,
      startCol: 0,
      length: 4,
      solution: 'ABBA',
    },
    {
      number: 5,
      text: 'Swedish furniture giant',
      direction: 'across' as const,
      startRow: 2,
      startCol: 0,
      length: 4,
      solution: 'IKEA',
    },
    {
      number: 7,
      text: 'Winter precipitation in Sweden',
      direction: 'across' as const,
      startRow: 4,
      startCol: 0,
      length: 4,
      solution: 'SNOW',
    },

    // Down clues
    {
      number: 2,
      text: 'Swedish word for "ice"',
      direction: 'down' as const,
      startRow: 0,
      startCol: 0,
      length: 3,
      solution: 'AIS', // A(ABBA), I(IKEA), S(SNOW)
    },
    {
      number: 3,
      text: 'Swedish word for "book"',
      direction: 'down' as const,
      startRow: 0,
      startCol: 1,
      length: 3,
      solution: 'BKN', // B(ABBA), K(IKEA), N(SNOW)
    },
    {
      number: 4,
      text: 'Swedish word for "beer"',
      direction: 'down' as const,
      startRow: 0,
      startCol: 2,
      length: 3,
      solution: 'BEO', // B(ABBA), E(IKEA), O(SNOW)
    },
    {
      number: 6,
      text: 'Letter sequence from Swedish words',
      direction: 'down' as const,
      startRow: 0,
      startCol: 3,
      length: 3,
      solution: 'AAW', // A(ABBA), A(IKEA), W(SNOW)
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
          <div className="flex flex-col items-center space-y-4">
            <img 
              src={minHeheLogoSrc} 
              alt="minHehe Logo" 
              className="h-20 w-auto"
            />
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">minHehe</h1>
              <p className="text-lg text-muted-foreground font-medium">Fun crosswords for all, no paywall!</p>
              <p className="text-sm text-muted-foreground">Challenge yourself with our daily puzzle</p>
            </div>
          </div>
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