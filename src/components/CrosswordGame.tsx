import React, { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CrosswordGrid } from './CrosswordGrid';
import { CluesPanel } from './CluesPanel';
import { GameTimer } from './GameTimer';
import { GameControls } from './GameControls';
import { CompletionModal } from './CompletionModal';
import { cn } from '@/lib/utils';
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

// Swedish-themed 5x5 crossword with proper intersections
// Grid layout:
//   0 1 2 3 4
// 0 ■ A B B A
// 1 ■ ■ ■ ■ ■
// 2 S K A L ■
// 3 ■ ■ ■ ■ ■
// 4 ■ I K E A
const samplePuzzle = {
  size: 5,
  clues: [
    // Across clues
    {
      number: 1,
      text: 'Famous Swedish pop group (4)',
      direction: 'across' as const,
      startRow: 0,
      startCol: 1,
      length: 4,
      solution: 'ABBA',
    },
    {
      number: 3,
      text: 'What Swedes say for "cheers!" (4)',
      direction: 'across' as const,
      startRow: 2,
      startCol: 0,
      length: 4,
      solution: 'SKAL',
    },
    {
      number: 5,
      text: 'Swedish furniture giant (4)',
      direction: 'across' as const,
      startRow: 4,
      startCol: 1,
      length: 4,
      solution: 'IKEA',
    },

  ],
};

export const CrosswordGame: React.FC = () => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
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
        // Stop timer and complete game immediately in the same render cycle
        setGameCompleted(true);
        setShowCompletionModal(true);
        setCompletionTime(timeElapsed);
        
        // Trigger confetti after a brief delay
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
    
    // Find all clues that contain this cell
    const matchingClues = samplePuzzle.clues.filter(clue => {
      if (clue.direction === 'across') {
        return row === clue.startRow && 
               col >= clue.startCol && 
               col < clue.startCol + clue.length;
      } else {
        return col === clue.startCol && 
               row >= clue.startRow && 
               row < clue.startRow + clue.length;
      }
    });
    
    // If we have matching clues, prefer to keep the same direction as current clue
    if (matchingClues.length > 0) {
      let selectedClue = matchingClues[0];
      
      // If current clue exists and there's a matching clue in the same direction, prefer it
      if (currentClue && matchingClues.some(clue => clue.direction === currentClue.direction)) {
        selectedClue = matchingClues.find(clue => clue.direction === currentClue.direction) || matchingClues[0];
      }
      
      setCurrentClue(selectedClue);
    }
  }, [currentClue]);

  const handleStart = useCallback(() => {
    initializeGrid();
    setGameStarted(true);
    setGameCompleted(false);
    setShowCompletionModal(false);
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
      setShowCompletionModal(true);
      setCompletionTime(timeElapsed);
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [cells, timeElapsed]);

  // Loading screen effect and auto-start game
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoadingScreen(false);
      // Auto-start the game when loading finishes
      handleStart();
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [handleStart]);

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
          <p className="text-xl text-muted-foreground animate-fade-in">Fun crosswords, no wall to pay!</p>
          <p className="text-sm text-muted-foreground mt-2 animate-fade-in">Loading your puzzle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Compact clue display - stays visible with keyboard */}
        {gameStarted && currentClue && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-sm border-b border-border">
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {currentClue.number}{currentClue.direction === 'across' ? 'A' : 'D'}
                </span>
                <p className="text-foreground font-medium truncate">{currentClue.text}</p>
              </div>
            </div>
          </div>
        )}

        <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-8", gameStarted && currentClue ? "pt-12" : "")}>
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
              gridSize={samplePuzzle.size}
            />
            
            <div className="flex justify-center">
              <GameControls
                gameStarted={gameStarted}
                gameCompleted={gameCompleted}
                onStartGame={handleStart}
                onCheckAnswers={handleCheck}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <CluesPanel clues={samplePuzzle.clues} />
          </div>
        </div>

        <CompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          completionTime={completionTime || 0}
          onNewGame={handleStart}
        />
      </div>
    </div>
  );
};