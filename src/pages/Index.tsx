import { CrosswordGame } from '@/components/CrosswordGame';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="relative">
      {/* Navigation */}
      <div className="fixed top-4 left-4 z-[60] flex gap-2">
        <Button variant="default" size="sm" disabled>Day 1</Button>
        <Link to="/day2">
          <Button variant="outline" size="sm">Day 2</Button>
        </Link>
      </div>
      <CrosswordGame />
    </div>
  );
};

export default Index;
