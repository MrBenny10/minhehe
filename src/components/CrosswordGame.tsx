import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CrosswordGrid } from './CrosswordGrid';
import { CluesPanel } from './CluesPanel';
import { GameTimer } from './GameTimer';
import { GameControls } from './GameControls';
import { CompletionModal } from './CompletionModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export interface Cell {
  id: string;
  row: number;
  col: number;
  value: string;
  answer: string;
  isBlocked: boolean;
  number?: number;
  acrossClue?: string;
  downClue?: string;
}

export interface Clue {
  number: number;
  text: string;
  direction: 'across' | 'down';
  startRow: number;
  startCol: number;
  length: number;
}

// Sample crossword puzzle data
const samplePuzzle = {
  size: 5,
  answers: [
    ['HELLO', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', 'WORLD', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
  ],
  clues: [
    { number: 1, text: "Greeting word", direction: 'across' as const, startRow: 0, startCol: 0, length: 5 },
    { number: 2, text: "Earth, planet", direction: 'down' as const, startRow: 2, startCol: 2, length: 5 },
    { number: 3, text: "Global community", direction: 'across' as const, startRow: 2, startCol: 2, length: 5 }
  ]
};

export const CrosswordGame: React.FC = () => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [completionTime, setCompletionTime] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showingErrors, setShowingErrors] = useState(false);
  const { toast } = useToast();

  // Initialize the grid
  useEffect(() => {
    const newCells: Cell[] = [];
    for (let row = 0; row < samplePuzzle.size; row++) {
      for (let col = 0; col < samplePuzzle.size; col++) {
        const id = `${row}-${col}`;
        const isBlocked = !samplePuzzle.answers.some(answer => 
          answer && answer[0] !== '' && 
          ((row === samplePuzzle.clues.find(c => c.direction === 'across')?.startRow && 
            col >= samplePuzzle.clues.find(c => c.direction === 'across')?.startCol! && 
            col < samplePuzzle.clues.find(c => c.direction === 'across')?.startCol! + samplePuzzle.clues.find(c => c.direction === 'across')?.length!) ||
           (col === samplePuzzle.clues.find(c => c.direction === 'down')?.startCol && 
            row >= samplePuzzle.clues.find(c => c.direction === 'down')?.startRow! && 
            row < samplePuzzle.clues.find(c => c.direction === 'down')?.startRow! + samplePuzzle.clues.find(c => c.direction === 'down')?.length!))
        );

        // Find the answer for this cell
        let answer = '';
        samplePuzzle.clues.forEach(clue => {
          if (clue.direction === 'across' && row === clue.startRow) {
            if (col >= clue.startCol && col < clue.startCol + clue.length) {
              answer = clue.number === 1 ? 'HELLO'[col - clue.startCol] : 
                       clue.number === 3 ? 'WORLD'[col - clue.startCol] : '';
            }
          } else if (clue.direction === 'down' && col === clue.startCol) {
            if (row >= clue.startRow && row < clue.startRow + clue.length) {
              answer = clue.number === 2 ? 'WORLD'[row - clue.startRow] : '';
            }
          }
        });

        newCells.push({
          id,
          row,
          col,
          value: '',
          answer,
          isBlocked: answer === '',
          number: (row === 0 && col === 0) ? 1 : (row === 2 && col === 2) ? 2 : undefined
        });
      }
    }
    setCells(newCells);
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameCompleted(false);
    setShowCompletionModal(false);
    setTimeElapsed(0);
    setShowingErrors(false);
    // Reset all cell values
    setCells(prev => prev.map(cell => ({ ...cell, value: '' })));
  }, []);

  const checkAnswers = useCallback(() => {
    let allCorrect = true;
    const updatedCells = cells.map(cell => {
      if (!cell.isBlocked) {
        const isCorrect = cell.value.toUpperCase() === cell.answer.toUpperCase();
        if (!isCorrect) allCorrect = false;
        return cell;
      }
      return cell;
    });

    if (allCorrect && cells.some(cell => !cell.isBlocked && cell.value !== '')) {
      setCompletionTime(timeElapsed);
      setGameCompleted(true);
      setGameStarted(false);
      setShowCompletionModal(true);
      
      // Trigger confetti celebration
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };
      
      const confettiInterval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          clearInterval(confettiInterval);
          return;
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          particleCount: Math.floor(particleCount),
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.1, 0.3),
            y: Math.random() - 0.2
          },
          colors: ['#8b5cf6', '#a855f7', '#c084fc', '#e879f9', '#f0abfc']
        });
        
        confetti({
          particleCount: Math.floor(particleCount),
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.7, 0.9),
            y: Math.random() - 0.2
          },
          colors: ['#8b5cf6', '#a855f7', '#c084fc', '#e879f9', '#f0abfc']
        });
      }, 250);
      
      toast({
        title: "🎉 Congratulations!",
        description: `You completed the crossword in ${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}!`,
        variant: "default"
      });
    } else {
      setShowingErrors(true);
      setTimeout(() => setShowingErrors(false), 2000);
      toast({
        title: "Not quite right",
        description: "Some answers are incorrect. Keep trying!",
        variant: "destructive"
      });
    }
  }, [cells, timeElapsed, toast]);

  const updateCell = useCallback((id: string, value: string) => {
    if (!gameStarted || gameCompleted) return;
    
    setCells(prev => prev.map(cell => 
      cell.id === id ? { ...cell, value: value.toUpperCase() } : cell
    ));
  }, [gameStarted, gameCompleted]);

  return (
    <div className="min-h-screen bg-background p-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mini Crossword</h1>
          <p className="text-muted-foreground">Challenge yourself with this quick puzzle!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Controls and Timer */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <GameTimer 
                  timeElapsed={timeElapsed}
                  setTimeElapsed={setTimeElapsed}
                  isRunning={gameStarted}
                />
                <GameControls
                  gameStarted={gameStarted}
                  gameCompleted={gameCompleted}
                  onStartGame={startGame}
                  onCheckAnswers={checkAnswers}
                />
              </div>
            </Card>
          </div>

          {/* Crossword Grid */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <CrosswordGrid
                cells={cells}
                selectedCell={selectedCell}
                onCellSelect={setSelectedCell}
                onCellUpdate={updateCell}
                showingErrors={showingErrors}
                gameStarted={gameStarted}
              />
            </Card>
          </div>

          {/* Clues Panel */}
          <div className="lg:col-span-1">
            <CluesPanel clues={samplePuzzle.clues} />
          </div>
        </div>

        <CompletionModal 
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          completionTime={completionTime}
          onNewGame={startGame}
        />
      </div>
    </div>
  );
};