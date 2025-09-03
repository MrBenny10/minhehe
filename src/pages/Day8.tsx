import React, { useState, useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CrosswordGrid } from '@/components/CrosswordGrid';
import { CluesPanel } from '@/components/CluesPanel';
import { GameTimer } from '@/components/GameTimer';
import { GameControls } from '@/components/GameControls';
import { CompletionModal } from '@/components/CompletionModal';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import minHeheLogoSrc from '@/assets/minhehe-logo.png';
import type { Clue, Cell, Puzzle } from '@/components/CrosswordGame';

const exercisePuzzle: Puzzle = {
  size: 13, // 13 cols × 8 rows  
  clues: [
    // Across
    {
      number: 1,
      text: 'One who might push your limits, or just lace up (7)',
      direction: 'across',
      startRow: 4, // TRAINER intersects with CORE(I), ENDURE(N), MUSCLE(E)
      startCol: 1,
      length: 7,
      solution: 'TRAINER',
    },
    {
      number: 2,
      text: 'Exercise with depth; slang for "nothing at all" (5)',
      direction: 'across',
      startRow: 4, // SQUAT intersects with STRETCH(T)
      startCol: 8,
      length: 5,
      solution: 'SQUAT',
    },
    {
      number: 3,
      text: 'Work that leaves you breathless (6)',
      direction: 'across',
      startRow: 7, // CARDIO intersects with MUSCLE(C)
      startCol: 7,
      length: 6,
      solution: 'CARDIO',
    },

    // Down
    {
      number: 4,
      text: 'Abs and stabilizers, or the center of an apple (4)',
      direction: 'down',
      startRow: 3, // CORE intersects with TRAINER(I) at (4,3)
      startCol: 3,
      length: 4,
      solution: 'CORE',
    },
    {
      number: 5,
      text: 'What marathoners must do mile after mile (6)',
      direction: 'down',
      startRow: 1, // ENDURE intersects with TRAINER(N) at (4,6)
      startCol: 6,
      length: 6,
      solution: 'ENDURE',
    },
    {
      number: 6,
      text: 'Tissue for power, or a way to "force" something (6)',
      direction: 'down',
      startRow: 2, // MUSCLE intersects with TRAINER(E) at (4,7) and CARDIO(C) at (7,7)
      startCol: 7,
      length: 6,
      solution: 'MUSCLE',
    },
    {
      number: 7,
      text: 'Elongation before exertion, or a long period (7)',
      direction: 'down',
      startRow: 0, // STRETCH intersects with SQUAT(T) at (4,12)
      startCol: 12,
      length: 7,
      solution: 'STRETCH',
    }
  ]
};

const Day8: React.FC = () => {
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize grid
  const initializeGrid = useCallback(() => {
    const newCells: Cell[] = [];
    const cols = 13; // 13 columns
    const rows = 8;  // 8 rows
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
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

    exercisePuzzle.clues.forEach((clue) => {
      for (let i = 0; i < clue.length; i++) {
        const r = clue.direction === 'across' ? clue.startRow : clue.startRow + i;
        const c = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
        const idx = r * cols + c;
        if (newCells[idx] && r < rows && c < cols) {
          newCells[idx].isBlocked = false;
          newCells[idx].answer = clue.solution[i];
          if (i === 0) newCells[idx].number = clue.number;
        }
      }
    });

    setCells(newCells);
  }, []);

  const isValidAnswer = useCallback((cell: Cell, value: string) => {
    const cluesForCell = exercisePuzzle.clues.filter(clue => {
      if (clue.direction === 'across') {
        return cell.row === clue.startRow && cell.col >= clue.startCol && cell.col < clue.startCol + clue.length;
      }
      return cell.col === clue.startCol && cell.row >= clue.startRow && cell.row < clue.startRow + clue.length;
    });

    return cluesForCell.some(clue => {
      const position = clue.direction === 'across' 
        ? cell.col - clue.startCol 
        : cell.row - clue.startRow;
      
      const solutions = [clue.solution, ...(clue.alternateSolutions || [])];
      return solutions.some(solution => solution[position] === value.toUpperCase());
    });
  }, []);

  const handleCellUpdate = useCallback((cellId: string, value: string) => {
    setCells(prev => {
      const next = prev.map(cell =>
        cell.id === cellId ? { ...cell, value: value.toUpperCase() } : cell
      );
      
      const complete = next.every(cell => {
        if (cell.isBlocked) return true;
        return isValidAnswer(cell, cell.value);
      });
      
      if (complete && !gameCompleted) {
        setGameCompleted(true);
        setShowCompletionModal(true);
        setCompletionTime(timeElapsed);
        setTimeout(() => {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }, 100);
      }
      return next;
    });
  }, [gameCompleted, timeElapsed, isValidAnswer]);

  const handleCellSelect = useCallback((cellId: string) => {
    setSelectedCell(cellId);
    const [row, col] = cellId.split('-').map(Number);
    const matches = exercisePuzzle.clues.filter(clue => {
      if (clue.direction === 'across') {
        return row === clue.startRow && col >= clue.startCol && col < clue.startCol + clue.length;
      }
      return col === clue.startCol && row >= clue.startRow && row < clue.startRow + clue.length;
    });
    if (matches.length > 0) {
      let chosen = matches[0];
      if (currentClue && matches.some(c => c.direction === currentClue.direction)) {
        chosen = matches.find(c => c.direction === currentClue.direction) || matches[0];
      }
      setCurrentClue(chosen);
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
    setCurrentClue(exercisePuzzle.clues[0]); // Auto-select first clue
    // Auto-select first cell of first clue
    const firstClue = exercisePuzzle.clues[0];
    setSelectedCell(`${firstClue.startRow}-${firstClue.startCol}`);
  }, [initializeGrid]);

  const handleCheck = useCallback(() => {
    setShowingErrors(true);
    const isComplete = cells.every(cell => {
      if (cell.isBlocked) return true;
      return isValidAnswer(cell, cell.value);
    });
    if (isComplete) {
      setGameCompleted(true);
      setShowCompletionModal(true);
      setCompletionTime(timeElapsed);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [cells, timeElapsed, isValidAnswer]);

  React.useEffect(() => {
    // Check for test parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const testParam = urlParams.get('test');
    
    if (testParam === 'complete') {
      // Skip loading screen and trigger completion modal
      setShowLoadingScreen(false);
      setGameStarted(true);
      setGameCompleted(true);
      setShowCompletionModal(true);
      setCompletionTime(123); // Test time of 2:03
      return;
    }
    
    const t = setTimeout(() => {
      setShowLoadingScreen(false);
      handleStart();
    }, 2500);
    return () => clearTimeout(t);
  }, [handleStart]);

  useEffect(() => {
    // Small delay to ensure ScrollArea content is fully rendered
    const timer = setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
        const activeButton = scrollAreaRef.current.querySelector('button[disabled]') as HTMLElement;
        if (scrollElement && activeButton) {
          // Mobile-friendly scroll calculation
          const containerWidth = scrollElement.clientWidth;
          const buttonLeft = activeButton.offsetLeft;
          const buttonWidth = activeButton.offsetWidth;
          const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
          scrollElement.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);


  if (showLoadingScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col justify-center items-center px-4">
        <div className="text-center animate-fade-in">
          <div className="animate-scale-in">
            <img src={minHeheLogoSrc} alt="minHehe Logo" className="h-32 w-auto mx-auto mb-6 animate-pulse" />
          </div>
          <h1 className="text-6xl font-bold text-foreground mb-4 animate-fade-in">minHehe</h1>
          <p className="text-xl text-muted-foreground animate-fade-in">Exercise & Fitness Edition - Day 8</p>
          <p className="text-sm text-muted-foreground mt-2 animate-fade-in">Loading your workout puzzle...</p>
        </div>
        
        {/* Professional footer - positioned below content */}
        <div className="mt-16 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Made by Benny in Sweden</span>
            <div className="flex">
              {/* Swedish flag heart - blue and yellow */}
              <div className="w-4 h-4 relative">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  {/* Blue heart shape */}
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill="#006AA7"
                    className="animate-pulse"
                  />
                  {/* Yellow cross pattern */}
                  <rect x="9" y="2" width="6" height="20" fill="#FECC00" />
                  <rect x="2" y="9" width="20" height="6" fill="#FECC00" />
                </svg>
              </div>
            </div>
            <span>with AI</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-muted overflow-hidden">
      {gameStarted && currentClue && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border h-[4rem] overflow-hidden">
          <div className="px-2 py-2 md:px-4 md:py-3 pr-16 md:pr-20 h-full flex items-center">
            <div className="flex items-start gap-2 text-xs md:text-sm w-full">
              <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                {currentClue.number}{currentClue.direction === 'across' ? 'A' : 'D'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-medium leading-snug break-words hyphens-auto" 
                   style={{ 
                     wordWrap: 'break-word',
                     overflowWrap: 'break-word',
                     lineHeight: '1.3',
                     display: '-webkit-box',
                     WebkitLineClamp: 2,
                     WebkitBoxOrient: 'vertical',
                     overflow: 'hidden'
                   }}>
                  {currentClue.text}
                </p>
              </div>
            </div>
          </div>
          {/* Timer positioned absolutely in top-right */}
          <div className="absolute top-2 right-2 md:top-3 md:right-4">
            <GameTimer
              timeElapsed={timeElapsed}
              setTimeElapsed={setTimeElapsed}
              isRunning={gameStarted && !gameCompleted}
              gameCompleted={gameCompleted}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col h-full">
        {/* Main game area with more space - moved higher on mobile for Day 8 */}
        <div className={cn(
          "flex-1 flex flex-col items-center px-1 py-1 md:px-2 md:py-2 min-h-0",
          gameStarted && currentClue ? "pt-[4.5rem] justify-start md:pt-[5rem] md:justify-center" : "pt-1 justify-start md:pt-4 md:justify-center"
        )}>
          <div className="w-full max-w-full flex-1 flex items-center justify-center">
            <CrosswordGrid
              cells={cells}
              selectedCell={selectedCell}
              onCellSelect={handleCellSelect}
              onCellUpdate={handleCellUpdate}
              showingErrors={showingErrors}
              gameStarted={gameStarted}
              currentClue={currentClue}
              gridCols={13}
              gridRows={8}
            />
          </div>
        </div>

        {/* Controls at bottom */}
        <div className="flex justify-center py-1 px-2 md:py-2 md:px-4">
          <GameControls
            gameStarted={gameStarted}
            gameCompleted={gameCompleted}
            onStartGame={handleStart}
            onCheckAnswers={handleCheck}
          />
        </div>

        {/* Clues panel - hidden on mobile, accessible via modal/drawer if needed */}
        <div className="hidden lg:block fixed right-4 top-1/2 transform -translate-y-1/2 w-80">
          <CluesPanel clues={exercisePuzzle.clues} />
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4">
        <ScrollArea ref={scrollAreaRef} className="w-full whitespace-nowrap rounded-md bg-background/80 backdrop-blur-sm border p-1">
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline" size="sm" className="shrink-0">Day 1</Button>
            </Link>
            <Link to="/day2">
              <Button variant="outline" size="sm" className="shrink-0">Day 2</Button>
            </Link>
            <Link to="/day3">
              <Button variant="outline" size="sm" className="shrink-0">Day 3</Button>
            </Link>
            <Link to="/day4">
              <Button variant="outline" size="sm" className="shrink-0">Day 4</Button>
            </Link>
            <Link to="/day5">
              <Button variant="outline" size="sm" className="shrink-0">Day 5</Button>
            </Link>
            <Link to="/day6">
              <Button variant="outline" size="sm" className="shrink-0">Day 6</Button>
            </Link>
            <Link to="/day7">
              <Button variant="outline" size="sm" className="shrink-0">Day 7</Button>
            </Link>
            <Button variant="secondary" size="sm" disabled className="shrink-0">Day 8</Button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Professional footer */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-40 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Made by Benny in Sweden</span>
          <div className="flex">
            {/* Swedish flag heart - blue and yellow */}
            <div className="w-4 h-4 relative">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                {/* Blue heart shape */}
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="#006AA7"
                  className="animate-pulse"
                />
                {/* Yellow cross pattern */}
                <rect x="9" y="2" width="6" height="20" fill="#FECC00" />
                <rect x="2" y="9" width="20" height="6" fill="#FECC00" />
              </svg>
            </div>
          </div>
          <span>with AI</span>
        </div>
      </div>

      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        completionTime={completionTime || 0}
        onNewGame={handleStart}
      />
    </div>
  );
};

export default Day8;