import React, { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CrosswordGrid } from '@/components/CrosswordGrid';
import { CluesPanel } from '@/components/CluesPanel';
import { GameTimer } from '@/components/GameTimer';
import { GameControls } from '@/components/GameControls';
import { CompletionModal } from '@/components/CompletionModal';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import minHeheLogoSrc from '@/assets/minhehe-logo.png';
import type { Clue, Cell, Puzzle } from '@/components/CrosswordGame';

const coldplayPuzzle: Puzzle = {
  size: 13, // 13 cols × 8 rows  
  clues: [
    // Across
    {
      number: 1,
      text: '2000 single from Parachutes (7)',
      direction: 'across',
      startRow: 4, // row 5, col 2 → 0-indexed = (4,1)
      startCol: 1,
      length: 7,
      solution: 'TROUBLE',
    },
    {
      number: 2,
      text: 'First word of "___ la Vida" (4)',
      direction: 'across',
      startRow: 4, // row 5, col 10 → 0-indexed = (4,9)
      startCol: 9,
      length: 4,
      solution: 'VIVA',
    },
    {
      number: 3,
      text: '"A Sky Full of ___" (5)',
      direction: 'across',
      startRow: 7, // row 8, col 8 → 0-indexed = (7,7)
      startCol: 7,
      length: 5,
      solution: 'STARS',
    },

    // Down
    {
      number: 4,
      text: '"Higher ___" (2021 single) (5)',
      direction: 'down',
      startRow: 3, // row 4, col 4 → 0-indexed = (3,3)
      startCol: 3,
      length: 5,
      solution: 'POWER',
    },
    {
      number: 5,
      text: 'A Rush of Blood to the Head, for one (5)',
      direction: 'down',
      startRow: 2, // row 3, col 6 → 0-indexed = (2,5)
      startCol: 5,
      length: 5,
      solution: 'ALBUM',
    },
    {
      number: 6,
      text: '2021 LP Music of the ___ (7)',
      direction: 'down',
      startRow: 1, // row 2, col 8 → 0-indexed = (1,7)
      startCol: 7,
      length: 7,
      solution: 'SPHERES',
    },
    {
      number: 7,
      text: 'Desk used to blend audio live/in-studio (5)',
      direction: 'down',
      startRow: 3, // row 4, col 11 → 0-indexed = (3,10)
      startCol: 10,
      length: 5,
      solution: 'MIXER',
    },
    {
      number: 8,
      text: 'Rihanna collab \'Princess of ___\' (2012) (5)',
      direction: 'down',
      startRow: 0, // row 1, col 13 → 0-indexed = (0,12)
      startCol: 12,
      length: 5,
      solution: 'CHINA',
    },
  ],
};

const Day3: React.FC = () => {
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

    coldplayPuzzle.clues.forEach((clue) => {
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
    const cluesForCell = coldplayPuzzle.clues.filter(clue => {
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
    const matches = coldplayPuzzle.clues.filter(clue => {
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
    setCurrentClue(coldplayPuzzle.clues[0]); // Auto-select first clue
    // Auto-select first cell of first clue
    const firstClue = coldplayPuzzle.clues[0];
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

  if (showLoadingScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col justify-center items-center px-4">
        <div className="text-center animate-fade-in">
          <div className="animate-scale-in">
            <img src={minHeheLogoSrc} alt="minHehe Logo" className="h-32 w-auto mx-auto mb-6 animate-pulse" />
          </div>
          <h1 className="text-6xl font-bold text-foreground mb-4 animate-fade-in">minHehe</h1>
          <p className="text-xl text-muted-foreground animate-fade-in">Coldplay Edition - Day 3</p>
          <p className="text-sm text-muted-foreground mt-2 animate-fade-in">Loading your Coldplay puzzle...</p>
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
    <div className="h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Cosmic background with floating planets - behind everything */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {/* Animated stars scattered throughout */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        
        {/* Floating planets - top area */}
        <div className="absolute top-20 left-16 w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 animate-float shadow-lg shadow-red-500/20" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-32 right-12 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 animate-float shadow-lg shadow-cyan-500/20" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-16 left-1/3 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 animate-float shadow-lg shadow-indigo-500/20" style={{ animationDelay: '1.2s' }} />
        
        {/* Floating planets - bottom area */}
        <div className="absolute bottom-40 left-10 w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 animate-float shadow-lg shadow-blue-500/20" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-32 right-20 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 animate-float shadow-lg shadow-purple-500/20" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-24 left-1/4 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 animate-float shadow-lg shadow-yellow-500/30" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-16 right-16 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 animate-float shadow-lg shadow-green-500/20" style={{ animationDelay: '1.5s' }} />
        
        {/* Additional floating elements */}
        <div className="absolute top-1/4 right-1/4 w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 animate-float shadow-lg shadow-pink-500/20" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-1/2 left-12 w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 animate-float shadow-lg shadow-violet-500/20" style={{ animationDelay: '0.8s' }} />
        
        {/* Subtle cosmic rings scattered */}
        <div className="absolute top-1/3 left-1/4 w-20 h-20 border border-white/4 rounded-full animate-spin-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-white/5 rounded-full animate-spin-slow" />
        <div className="absolute bottom-1/3 left-1/5 w-18 h-18 border border-white/3 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        <div className="absolute top-1/5 right-1/3 w-16 h-16 border border-white/4 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        
        {/* Subtle nebula effects */}
        <div className="absolute top-10 left-1/2 w-32 h-32 bg-purple-500/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-blue-500/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-8 w-24 h-24 bg-pink-500/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>
      {gameStarted && currentClue && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/20">
          <div className="px-2 py-1.5 md:px-4 md:py-2">
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {currentClue.number}{currentClue.direction === 'across' ? 'A' : 'D'}
              </span>
              <p className="text-white font-medium truncate">{currentClue.text}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col h-full">
        {/* Timer at top */}
        <div className={cn(
          "flex justify-center py-1 px-2 md:py-2 md:px-4", 
          gameStarted && currentClue ? "pt-10 md:pt-12" : "pt-1 md:pt-2"
        )}>
          <GameTimer
            timeElapsed={timeElapsed}
            setTimeElapsed={setTimeElapsed}
            isRunning={gameStarted && !gameCompleted}
            gameCompleted={gameCompleted}
          />
        </div>

        {/* Main content area - crossword grid positioned at top */}
        <div className="flex flex-col items-center px-1 py-1 md:px-2 md:py-2">
          <div className="w-full max-w-full flex items-center justify-center">
            <CrosswordGrid
              cells={cells}
              selectedCell={selectedCell}
              onCellSelect={handleCellSelect}
              onCellUpdate={handleCellUpdate}
              showingErrors={showingErrors}
              gameStarted={gameStarted}
              currentClue={currentClue}
              gridSize={13}
            />
          </div>
        </div>
        
        {/* Spacer to push everything else down */}
        <div className="flex-1"></div>
        
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
          <CluesPanel clues={coldplayPuzzle.clues} />
        </div>
      </div>

      {/* Coldplay Logo between game and navigation */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
        <img 
          src="/lovable-uploads/2e1f1a16-b2f4-465f-892d-62a0aa54e6cb.png" 
          alt="Coldplay" 
          className="w-20 h-auto opacity-90"
        />
      </div>

      {/* Navigation below grid */}
      <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 flex gap-2">
        <Link to="/">
          <Button variant="outline" size="sm">Day 1</Button>
        </Link>
        <Link to="/day2">
          <Button variant="outline" size="sm">Day 2</Button>
        </Link>
        <Button variant="default" size="sm" disabled>Day 3</Button>
      </div>

      {/* Professional footer */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 text-center">
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

export default Day3;