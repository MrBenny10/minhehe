import { CrosswordGame } from '@/components/CrosswordGame';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="relative">
      <CrosswordGame />
      {/* Navigation below grid */}
      <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50 flex gap-2">
        <Button variant="default" size="sm" disabled>Day 1</Button>
        <Link to="/day2">
          <Button variant="outline" size="sm">Day 2</Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
