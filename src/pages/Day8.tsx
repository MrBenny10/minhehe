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

const gymPuzzle: Puzzle = {
  size: 7,
  clues: [
    // Across
    {
      number: 7,
      text: "Prefix in yoga practice meaning \"eight,\" as in ____nga.",
      direction: 'across',
      startRow: 2, // row 3 = 2
      startCol: 0, // col 1 = 0
      length: 5,
      solution: "ASHTA"
    },
    {
      number: 15,
      text: "Compound move that hammers quads, glutes, and core.",
      direction: 'across',
      startRow: 4, // row 5 = 4
      startCol: 0, // col 1 = 0
      length: 6,
      solution: "SQUATS"
    },
    {
      number: 21,
      text: "Diet plan high in fat and low in carbs, popular in weight loss circles.",
      direction: 'across',
      startRow: 6, // row 7 = 6
      startCol: 3, // col 4 = 3 (starts from TRACK's K)
      length: 4,
      solution: "KETO"
    },
    // Down
    {
      number: 1,
      text: "Thigh muscles that burn on leg day.",
      direction: 'down',
      startRow: 0, // row 1 = 0
      startCol: 0, // col 1 = 0
      length: 4,
      solution: "QUADS"
    },
    {
      number: 2,
      text: "Place to recover with steam after a heavy workout.",
      direction: 'down',
      startRow: 0, // row 1 = 0
      startCol: 4, // col 5 = 4 (moved two columns right)
      length: 3,
      solution: "SPA"
    },
    {
      number: 3,
      text: "Fitness goal often paired with \"muscle.\"",
      direction: 'down',
      startRow: 0, // T at (0,6), O at (1,6), N at (2,6), E at (3,6)
      startCol: 6, // starting at top right corner
      length: 4,
      solution: "TONE"
    },
    {
      number: 10,
      text: "Oval where sprinters push for personal bests.",
      direction: 'down',
      startRow: 2, // row 3 = 2
      startCol: 3, // col 4 = 3
      length: 5,
      solution: "TRACK"
    }
  ],
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
    console.log('Initializing Day 8 grid...');
    const newCells: Cell[] = [];
    const gridSize = 7;
    
    // Initialize all cells as blocked first
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

    // Define the specific active cells based on the exact crossword pattern from template
    // Grid pattern (from the user's image):
    // Q . S . . . T
    // U . P . . . O  
    // A S H T A . N
    // D . . R . . E
    // S Q U A T S .
    // . . . C . . .
    // . K E T O . .
    
    const activeCells = new Set<string>();
    
    // QUADS (1D down): col 0, rows 0-3
    activeCells.add(`0-0`); // Q
    activeCells.add(`1-0`); // U
    activeCells.add(`2-0`); // A
    activeCells.add(`3-0`); // D
    
    // SPA (2D down): col 4, rows 0-2 
    activeCells.add(`0-4`); // S
    activeCells.add(`1-4`); // P  
    activeCells.add(`2-4`); // A (intersects with ASHTA's final A)
    
    // TONE (3D down): starts at top right corner (0,6), then continues straight down
    activeCells.add(`0-6`); // T
    activeCells.add(`1-6`); // O
    activeCells.add(`2-6`); // N
    activeCells.add(`3-6`); // E
    
    // ASHTA (7A across): row 2, cols 0-4
    activeCells.add(`2-0`); // A (shared with QUADS)
    activeCells.add(`2-1`); // S
    activeCells.add(`2-2`); // H (changed from A to H)
    activeCells.add(`2-3`); // T (shared with TRACK)  
    activeCells.add(`2-4`); // A
    
    // TRACK (10D down): row 2 col 3, then rows 3-6 col 3
    activeCells.add(`2-3`); // T (shared with ASHTA)
    activeCells.add(`3-3`); // R
    activeCells.add(`4-3`); // A (shared with SQUATS)
    activeCells.add(`5-3`); // C
    activeCells.add(`6-3`); // K (part of KETO too)
    
    // SQUATS (15A across): row 4, cols 0-5
    activeCells.add(`4-0`); // S (shared with QUADS)
    activeCells.add(`4-1`); // Q
    activeCells.add(`4-2`); // U
    activeCells.add(`4-3`); // A (shared with TRACK)
    activeCells.add(`4-4`); // T
    activeCells.add(`4-5`); // S
    
    // KETO (21A across): row 6, cols 3-6 (starts from TRACK's K, ends at bottom right)
    activeCells.add(`6-3`); // K (shared with TRACK)
    activeCells.add(`6-4`); // E
    activeCells.add(`6-5`); // T
    activeCells.add(`6-6`); // O

    console.log('Active cells:', Array.from(activeCells));

    // Mark active cells as unblocked
    activeCells.forEach((cellId: string) => {
      const [row, col] = cellId.split('-').map(Number);
      const idx = row * gridSize + col;
      if (newCells[idx]) {
        newCells[idx].isBlocked = false;
      }
    });

    // Set answers and numbers for each clue
    gymPuzzle.clues.forEach((clue) => {
      // Regular linear positioning for all clues now that TONE is fixed
      for (let i = 0; i < clue.length; i++) {
        const r = clue.direction === 'across' ? clue.startRow : clue.startRow + i;
        const c = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
        const idx = r * gridSize + c;
        if (newCells[idx] && r < gridSize && c < gridSize && !newCells[idx].isBlocked) {
          newCells[idx].answer = clue.solution[i];
          if (i === 0) newCells[idx].number = clue.number;
        }
      }
    });

    console.log('Cells after initialization:', newCells.filter(c => !c.isBlocked).map(c => ({ id: c.id, answer: c.answer, number: c.number })));
    setCells(newCells);
  }, []);

  const isValidAnswer = useCallback((cell: Cell, value: string) => {
    const cluesForCell = gymPuzzle.clues.filter(clue => {
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
    const matches = gymPuzzle.clues.filter(clue => {
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
    
    // Always start at top-left corner (0,0)
    setSelectedCell('0-0');
    
    // Find the clue that starts at or includes position (0,0)
    const topLeftClue = gymPuzzle.clues.find(clue => {
      if (clue.direction === 'across') {
        return clue.startRow === 0 && clue.startCol <= 0 && clue.startCol + clue.length > 0;
      } else {
        return clue.startCol === 0 && clue.startRow <= 0 && clue.startRow + clue.length > 0;
      }
    }) || gymPuzzle.clues[0]; // Fallback to first clue if none found
    
    setCurrentClue(topLeftClue);
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
    const t = setTimeout(() => {
      setShowLoadingScreen(false);
      handleStart();
    }, 2500);
    return () => clearTimeout(t);
  }, [handleStart]);

  useEffect(() => {
    // Force scroll to Day 8 button (rightmost position) for mobile
    const scrollToDay8 = () => {
      if (scrollAreaRef.current) {
        // Try multiple selectors to find the scroll container
        const viewports = [
          scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]'),
          scrollAreaRef.current.querySelector('.scrollArea'),
          scrollAreaRef.current.querySelector('[data-orientation="horizontal"]'),
          scrollAreaRef.current.firstElementChild
        ].filter(Boolean) as HTMLElement[];

        viewports.forEach(viewport => {
          if (viewport && viewport.scrollTo) {
            // Scroll to maximum right position for Day 8
            const maxScroll = viewport.scrollWidth - viewport.clientWidth;
            console.log('Scrolling viewport to:', maxScroll, 'scrollWidth:', viewport.scrollWidth, 'clientWidth:', viewport.clientWidth);
            viewport.scrollLeft = maxScroll;
            viewport.scrollTo({ left: maxScroll, behavior: 'smooth' });
          }
        });
      }
    };

    // Multiple aggressive attempts with different timings
    const timers = [
      setTimeout(scrollToDay8, 0),
      setTimeout(scrollToDay8, 100),
      setTimeout(scrollToDay8, 300),
      setTimeout(scrollToDay8, 500),
      setTimeout(scrollToDay8, 1000),
      setTimeout(scrollToDay8, 2000)
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  if (showLoadingScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col justify-center items-center px-4">
        <div className="text-center animate-fade-in">
          <div className="animate-scale-in">
            <img src={minHeheLogoSrc} alt="minHehe Logo" className="h-32 w-auto mx-auto mb-6 animate-pulse" />
          </div>
          <h1 className="text-6xl font-bold text-foreground mb-4 animate-fade-in">minHehe</h1>
          <p className="text-xl text-muted-foreground animate-fade-in">Gym Edition - Day 8</p>
          <p className="text-sm text-muted-foreground mt-2 animate-fade-in">Loading your fitness puzzle...</p>
        </div>
        
        <div className="mt-16 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Made by Benny in Sweden</span>
            <div className="flex">
              <div className="w-4 h-4 relative">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill="#006AA7"
                    className="animate-pulse"
                  />
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
          <div className="px-2 py-2 md:px-4 md:py-3 pr-24 md:pr-28 h-full flex items-center">
            <div className="flex items-start gap-2 text-xs md:text-sm w-full">
              <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                {currentClue.number}{currentClue.direction === 'across' ? 'A' : 'D'}
              </span>
              <div className="flex-1 min-w-0 max-w-[calc(100%-6rem)]">
                <p className="text-foreground font-medium leading-snug break-words hyphens-auto" 
                   style={{ 
                     wordWrap: 'break-word',
                     overflowWrap: 'break-word',
                     lineHeight: '1.3'
                   }}>
                  {currentClue.text}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timer in top right - smaller for Day 8 */}
      <div className="fixed top-1 right-1 z-50 scale-75 md:scale-100 md:top-2 md:right-2">
        <GameTimer
          timeElapsed={timeElapsed}
          setTimeElapsed={setTimeElapsed}
          isRunning={gameStarted && !gameCompleted}
          gameCompleted={gameCompleted}
        />
      </div>

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
              gridSize={7}
              fontSize="lg"
            />
          </div>
        </div>

        <div className="flex justify-center py-1 px-2 md:py-2 md:px-4">
          <GameControls
            gameStarted={gameStarted}
            gameCompleted={gameCompleted}
            onStartGame={handleStart}
            onCheckAnswers={handleCheck}
          />
        </div>

        <div className="hidden lg:block fixed right-4 top-1/2 transform -translate-y-1/2 w-80">
          <CluesPanel clues={gymPuzzle.clues} />
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