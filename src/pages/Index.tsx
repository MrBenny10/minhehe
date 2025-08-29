import { CrosswordGame } from '@/components/CrosswordGame';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="relative">
      <CrosswordGame />
      
      {/* Navigation */}
      <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50 flex gap-2">
        <Button variant="secondary" size="sm" disabled>Day 1</Button>
        <Link to="/day2">
          <Button variant="outline" size="sm">Day 2</Button>
        </Link>
        <Link to="/day3">
          <Button variant="outline" size="sm">Day 3</Button>
        </Link>
      </div>

      {/* Professional footer */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-40 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Made by Benny in Sweden</span>
          <div className="flex">
            <span className="text-blue-500">💙</span>
            <span className="text-yellow-400">💛</span>
          </div>
          <span>with AI</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
