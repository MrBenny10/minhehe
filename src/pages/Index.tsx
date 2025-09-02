import { CrosswordGame } from '@/components/CrosswordGame';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const Index = () => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Small delay to ensure ScrollArea content is fully rendered
    const timer = setTimeout(() => {
      if (scrollAreaRef.current) {
        const activeButton = scrollAreaRef.current.querySelector('button[disabled]') as HTMLElement;
        if (activeButton) {
          activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      <CrosswordGame />
      
      {/* Navigation */}
      <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4">
        <ScrollArea ref={scrollAreaRef} className="w-full whitespace-nowrap rounded-md bg-background/80 backdrop-blur-sm border p-1">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled className="shrink-0">Day 1</Button>
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
    </div>
  );
};

export default Index;
