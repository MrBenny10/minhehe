import React from 'react';
import { Card } from '@/components/ui/card';
import { Clue } from './CrosswordGame';

interface CluesPanelProps {
  clues: Clue[];
}

export const CluesPanel: React.FC<CluesPanelProps> = ({ clues }) => {
  const acrossClues = clues.filter(clue => clue.direction === 'across');
  const downClues = clues.filter(clue => clue.direction === 'down');

  return (
    <Card className="p-6 h-fit">
      <h2 className="text-xl font-bold text-foreground mb-4">Clues</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded-sm text-sm mr-2">
              Across
            </span>
          </h3>
          <div className="space-y-2">
            {acrossClues.map((clue) => (
              <div
                key={`across-${clue.number}`}
                className="flex items-start gap-2 p-2 rounded-md hover:bg-muted transition-colors"
              >
                <span className="text-primary font-bold text-sm min-w-[1.5rem]">
                  {clue.number}.
                </span>
                <span className="text-foreground text-sm leading-relaxed">
                  {clue.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
            <span className="bg-accent text-accent-foreground px-2 py-1 rounded-sm text-sm mr-2">
              Down
            </span>
          </h3>
          <div className="space-y-2">
            {downClues.map((clue) => (
              <div
                key={`down-${clue.number}`}
                className="flex items-start gap-2 p-2 rounded-md hover:bg-muted transition-colors"
              >
                <span className="text-accent font-bold text-sm min-w-[1.5rem]">
                  {clue.number}.
                </span>
                <span className="text-foreground text-sm leading-relaxed">
                  {clue.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Tips:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Click a cell to select it</li>
          <li>• Type letters to fill cells</li>
          <li>• Use arrow keys to navigate</li>
          <li>• Press Backspace to clear</li>
        </ul>
      </div>
    </Card>
  );
};