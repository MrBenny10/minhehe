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

const crispsPuzzle: Puzzle = {
  size: 13, // 13 cols × 8 rows  
  clues: [
    // Across
    {
      number: 1,
      text: 'Curly cheese-flavoured corn snack brand (7)',
      direction: 'across',
      startRow: 4, // row 5, col 2 → 0-indexed = (4,1)
      startCol: 1,
      length: 7,
      solution: 'QUAVERS',
    },
    {
      number: 2,
      text: 'First half of a tangy classic (4)',
      direction: 'across',
      startRow: 4, // row 5, col 10 → 0-indexed = (4,9)
      startCol: 9,
      length: 4,
      solution: 'SALT',
    },
    {
      number: 3,
      text: 'Very plain crisps are "___" salted (5)',
      direction: 'across',
      startRow: 7, // row 8, col 8 → 0-indexed = (7,7)
      startCol: 7,
      length: 5,
      solution: 'READY',
    },

    // Down
    {
      number: 4,
      text: 'Smoky flavour you\'ll find on crisps (5)',
      direction: 'down',
      startRow: 3, // row 4, col 4 → 0-indexed = (3,3)
      startCol: 3,
      length: 5,
      solution: 'BACON',
    },
    {
      number: 5,
      text: 'Giant UK crisps brand (7)',
      direction: 'down',
      startRow: 0, // row 1, col 6 → 0-indexed = (0,5)
      startCol: 5,
      length: 7,
      solution: 'WALKERS',
    },
    {
      number: 6,
      text: '___ Munch, pickled onion favourite (7)',
      direction: 'down',
      startRow: 1, // row 2, col 8 → 0-indexed = (1,7)
      startCol: 7,
      length: 7,
      solution: 'MONSTER',
    },
    {
      number: 7,
      text: 'Lighter style in a Walkers range (5)',
      direction: 'down',
      startRow: 3, // row 4, col 11 → 0-indexed = (3,10)
      startCol: 10,
      length: 5,
      solution: 'BAKED',
    },
    {
      number: 8,
      text: 'Triangular tortilla chips brand (7)',
      direction: 'down',
      startRow: 0, // row 1, col 13 → 0-indexed = (0,12)
      startCol: 12,
      length: 7,
      solution: 'DORITOS',
    }
  ]
};

const Day5 = () => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [currentClue, setCurrentClue] = useState<Clue | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const initializeGrid = useCallback(() => {
    const gridData = Array.from({ length: 8 * 13 }, (_, index) => {
      const row = Math.floor(index / 13);
      const col = index % 13;
      
      // Grid layout based on the specified pattern (8 rows × 13 cols)
      const gridPattern = [
        ". . . . . W . . . . . . D",
        ". . . . . A . M . . . . O", 
        ". . . . . L . O . . . . R",
        ". . . B . K . N . . B . I",
        ". Q U A V E R S . S A L T",
        ". . . C . R . T . . K . O",
        ". . . O . S . E . . E . S",
        ". . . N . . . R E A D Y ."
      ];
      
      const char = gridPattern[row].split(' ')[col];
      const isBlocked = char === '.';
      
      // Find clue number for this cell
      let number: number | undefined;
      crispsPuzzle.clues.forEach(clue => {
        if (clue.startRow === row && clue.startCol === col) {
          number = clue.number;
        }
      });

      return {
        id: `${row}-${col}`,
        row,
        col,
        value: '',
        isBlocked,
        answer: isBlocked ? '' : char,
        number
      };
    });

    setCells(gridData);
  }, []);

  React.useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  const isValidAnswer = useCallback((cellId: string, value: string): boolean => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell || cell.isBlocked) return false;
    return cell.answer.toLowerCase() === value.toLowerCase();
  }, [cells]);

  const handleCellUpdate = useCallback((cellId: string, value: string) => {
    if (!isValidAnswer(cellId, value) && value !== '') return;
    
    const newCells = cells.map(cell => 
      cell.id === cellId ? { ...cell, value } : cell
    );
    setCells(newCells);

    // Check if puzzle is completed
    const isComplete = newCells.every(cell => 
      cell.isBlocked || cell.value !== ''
    );
    
    if (isComplete && !gameCompleted) {
      setGameCompleted(true);
      setShowCompletionModal(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [cells, isValidAnswer, gameCompleted]);

  const handleCellSelect = useCallback((cellId: string) => {
    setSelectedCell(cellId);
    
    const cell = cells.find(c => c.id === cellId);
    if (!cell) return;
    
    // Find clue that includes this cell
    const clue = crispsPuzzle.clues.find(c => {
      if (c.direction === 'across') {
        return cell.row === c.startRow && cell.col >= c.startCol && cell.col < c.startCol + c.length;
      } else {
        return cell.col === c.startCol && cell.row >= c.startRow && cell.row < c.startRow + c.length;
      }
    });
    
    setCurrentClue(clue || null);
  }, [cells]);

  const handleStart = useCallback(() => {
    setGameStarted(true);
    setGameCompleted(false);
    setShowCompletionModal(false);
    setTimeElapsed(0);
    initializeGrid();
  }, [initializeGrid]);

  const handleCheckAnswers = useCallback(() => {
    // Check if all answers are correct
    const isComplete = cells.every(cell => 
      cell.isBlocked || (cell.value !== '' && isValidAnswer(cell.id, cell.value))
    );
    
    if (isComplete) {
      setGameCompleted(true);
      setShowCompletionModal(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [cells, isValidAnswer]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={minHeheLogoSrc} 
                alt="MinHeHe Logo" 
                className="w-10 h-10 rounded-lg shadow-sm"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Day 5: UK Crisps
                </h1>
                <p className="text-sm text-muted-foreground">
                  Crispy crossword challenge
                </p>
              </div>
            </div>
            
            {gameStarted && (
              <GameTimer 
                timeElapsed={timeElapsed} 
                setTimeElapsed={setTimeElapsed}
                isRunning={gameStarted && !gameCompleted}
                gameCompleted={gameCompleted}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {!gameStarted ? (
            <div className="text-center py-12">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-6">🥔 UK Crisps Crossword</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Test your knowledge of British crisp brands and flavours in this crunchy crossword challenge!
                </p>
                <Button onClick={handleStart} size="lg" className="px-8">
                  Start Puzzle
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Crossword Grid */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-xl border border-border shadow-lg p-6">
                  <CrosswordGrid
                    cells={cells}
                    selectedCell={selectedCell}
                    currentClue={currentClue}
                    onCellUpdate={handleCellUpdate}
                    onCellSelect={handleCellSelect}
                    showingErrors={false}
                    gameStarted={gameStarted}
                  />
                </div>
              </div>

              {/* Clues and Controls */}
              <div className="space-y-6">
                <CluesPanel 
                  clues={crispsPuzzle.clues} 
                />
                
                <GameControls 
                  gameStarted={gameStarted}
                  gameCompleted={gameCompleted}
                  onStartGame={handleStart}
                  onCheckAnswers={handleCheckAnswers}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Navigation */}
      <div className="fixed bottom-6 left-6 flex gap-2 z-50">
        <Link to="/">
          <Button variant="outline" size="sm">Home</Button>
        </Link>
        <Link to="/day2">
          <Button variant="outline" size="sm">Day 2</Button>
        </Link>
        <Link to="/day3">
          <Button variant="outline" size="sm">Day 3</Button>
        </Link>
        <Link to="/day4">
          <Button variant="outline" size="sm">Day 4</Button>
        </Link>
        <Button variant="default" size="sm" disabled>Day 5</Button>
      </div>

      {/* Professional footer */}
      <footer className="mt-12 py-8 border-t border-border/50 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Day 5 • UK Crisps Crossword Challenge • MinHeHe Games
          </p>
        </div>
      </footer>

      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        completionTime={timeElapsed}
        onNewGame={handleStart}
      />
    </div>
  );
};

export default Day5;