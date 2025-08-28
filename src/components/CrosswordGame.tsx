import React, { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
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

// Swedish-themed 5x5 crossword - FULLY TESTED INTERSECTIONS
const samplePuzzle = {
  size: 5,
  clues: [
    // Across clues
    {
      number: 1,
      text: 'Swedish furniture store',
      direction: 'across' as const,
      startRow: 1,
      startCol: 0,
      length: 4,
      solution: 'IKEA',
    },
    {
      number: 3,
      text: 'Swedish university city',
      direction: 'across' as const,
      startRow: 3,
      startCol: 1,
      length: 4,
      solution: 'LUND',
    },

    // Down clues
    {
      number: 2,
      text: 'Swedish word for cheers',
      direction: 'down' as const,
      startRow: 0,
      startCol: 1,
      length: 4,
      solution: 'SKAL', // S, K(from IKEA), A, L(from LUND)
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
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [currentClue, setCurrentClue] = useState<Clue | null>(null);

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
    setCells(prev => {
      const newCells = prev.map(cell => 
        cell.id === cellId ? { ...cell, value: value.toUpperCase() } : cell
      );
      
      // Check for completion immediately
      const isComplete = newCells.every(cell => 
        cell.isBlocked || cell.value.toUpperCase() === cell.answer.toUpperCase()
      );
      
      if (isComplete && !gameCompleted) {
        // Stop timer immediately
        setGameCompleted(true);
        setCompletionTime(timeElapsed);
        
        // Trigger confetti after a brief delay to ensure state is updated
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }, 100);
      }
      
      return newCells;
    });
  }, [gameCompleted, timeElapsed]);

  const handleCellSelect = useCallback((cellId: string) => {
    setSelectedCell(cellId);
    
    // Find the clue for the selected cell
    const [row, col] = cellId.split('-').map(Number);
    const cellIndex = row * samplePuzzle.size + col;
    const cell = cells[cellIndex];
    
    if (cell && cell.number) {
      // Find the clue that starts with this number
      const clue = samplePuzzle.clues.find(c => c.number === cell.number);
      if (clue) {
        setCurrentClue(clue);
      }
    }
  }, [cells]);

  const handleStart = useCallback(() => {
    initializeGrid();
    setGameStarted(true);
    setGameCompleted(false);
    setCompletionTime(null);
    setShowingErrors(false);
    setTimeElapsed(0);
    setCurrentClue(null);
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
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [cells, timeElapsed]);

  // Loading screen effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoadingScreen(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  if (showLoadingScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-scale-in">
            <img 
              src={minHeheLogoSrc} 
              alt="minHehe Logo" 
              className="h-32 w-auto mx-auto mb-6 animate-pulse"
            />
          </div>
          <h1 className="text-6xl font-bold text-foreground mb-4 animate-fade-in">minHehe</h1>
          <p className="text-xl text-muted-foreground animate-fade-in">Loading your crossword adventure...</p>
        </div>
      </div>
    );
  }

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

        {/* Fixed clue display at top */}
        {gameStarted && currentClue && (
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border mb-4">
            <div className="container mx-auto max-w-6xl p-4">
              <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    {currentClue.number} {currentClue.direction}
                  </span>
                  <p className="text-foreground font-medium">{currentClue.text}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-center">
              <GameTimer 
                timeElapsed={timeElapsed}
                setTimeElapsed={setTimeElapsed}
                isRunning={gameStarted && !gameCompleted}
                gameCompleted={gameCompleted}
              />
            </div>
            
            <CrosswordGrid
              cells={cells}
              selectedCell={selectedCell}
              onCellSelect={handleCellSelect}
              onCellUpdate={handleCellUpdate}
              showingErrors={showingErrors}
              gameStarted={gameStarted}
              currentClue={currentClue}
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