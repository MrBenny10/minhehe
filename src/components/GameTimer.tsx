import React, { useEffect } from 'react';
import { Clock } from 'lucide-react';

interface GameTimerProps {
  timeElapsed: number;
  setTimeElapsed: React.Dispatch<React.SetStateAction<number>>;
  isRunning: boolean;
  gameCompleted?: boolean;
}

export const GameTimer: React.FC<GameTimerProps> = ({
  timeElapsed,
  setTimeElapsed,
  isRunning,
  gameCompleted = false
}) => {
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, setTimeElapsed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-foreground">
        <Clock className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Time:</span>
      </div>
      <div className="text-2xl font-mono font-bold text-primary">
        {formatTime(timeElapsed)}
      </div>
      {isRunning && (
        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
      )}
      {gameCompleted && (
        <div className="w-2 h-2 bg-primary rounded-full" />
      )}
    </div>
  );
};