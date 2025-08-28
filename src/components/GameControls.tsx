import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, CheckCircle } from 'lucide-react';

interface GameControlsProps {
  gameStarted: boolean;
  gameCompleted: boolean;
  onStartGame: () => void;
  onCheckAnswers: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameStarted,
  gameCompleted,
  onStartGame,
  onCheckAnswers
}) => {
  return (
    <div className="flex items-center justify-center gap-3">
      {!gameStarted && !gameCompleted && (
        <Button 
          onClick={onStartGame}
          className="flex items-center gap-2"
          size="lg"
        >
          <Play className="w-4 h-4" />
          Start Game
        </Button>
      )}

      {gameStarted && (
        <>
          <Button 
            onClick={onCheckAnswers}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Check Answers
          </Button>
          
          <Button 
            onClick={onStartGame}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </Button>
        </>
      )}

      {gameCompleted && (
        <Button 
          onClick={onStartGame}
          className="flex items-center gap-2"
          size="lg"
        >
          <Play className="w-4 h-4" />
          New Game
        </Button>
      )}
    </div>
  );
};