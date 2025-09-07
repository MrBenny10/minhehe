import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// ✅ Import all puzzles so we know which days exist
const puzzleModules = import.meta.glob(
  ["../puzzles/day*.ts", "../puzzles/day*.tsx"],
  { eager: true }
);

const availableDays: string[] = [];

// ✅ Extract day numbers
for (const path in puzzleModules) {
  const match = path.match(/day(\d+)\.(ts|tsx)$/);
  if (match) {
    availableDays.push(match[1]); // e.g. "9"
  }
}

// ✅ Sort numerically
availableDays.sort((a, b) => Number(a) - Number(b));

const Index = () => {
  return (
    <div className="h-[100dvh] flex flex-col justify-center items-center bg-gradient-to-br from-background via-background to-muted">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to MinHeHe</h1>
      <p className="text-lg text-muted-foreground mb-10">
        Select a crossword to play:
      </p>

      {/* ✅ Footer navigation */}
      <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4">
        <ScrollArea className="w-full whitespace-nowrap rounded-md bg-background/80 backdrop-blur-sm border p-1">
          <div className="flex gap-2">
            {availableDays.map((day) => (
              <Link key={day} to={`/day/${day}`}>
                <Button variant="outline" size="sm" className="shrink-0">
                  Day {day}
                </Button>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default Index;
