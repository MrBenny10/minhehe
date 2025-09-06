import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import CrosswordGame from "@/components/CrosswordGame";

// Automatically import all puzzles in /puzzles/day*.ts
// Import all puzzles (works for both .ts and .tsx)
const puzzleModules = import.meta.glob("../puzzles/day*.(ts|tsx)", { eager: true });


const puzzles: Record<string, any> = {};
const availableDays: string[] = [];

for (const path in puzzleModules) {
  const match = path.match(/day(\d+)\.ts$/);
  if (match) {
    const day = match[1]; // e.g. "8"
    const mod = puzzleModules[path] as { puzzle: any };
    puzzles[day] = mod.puzzle;
    availableDays.push(day);
  }
}

// Sort day numbers so nav is always in order
availableDays.sort((a, b) => Number(a) - Number(b));

const Day = () => {
  const { dayNumber } = useParams();
  const puzzle = puzzles[dayNumber || ""];

  if (!puzzle) {
    return <p>No crossword found for Day {dayNumber}</p>;
  }

  return (
    <div className="relative">
      {/* ✅ The game */}
      <CrosswordGame day={Number(dayNumber)} puzzle={puzzle} />

      {/* ✅ Auto-generated navigation */}
      <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4">
        <ScrollArea className="w-full whitespace-nowrap rounded-md bg-background/80 backdrop-blur-sm border p-1">
          <div className="flex gap-2">
            {availableDays.map((day) => (
              <Link key={day} to={`/day${day}`}>
                <Button
                  variant={day === dayNumber ? "secondary" : "outline"}
                  size="sm"
                  className="shrink-0"
                  disabled={day === dayNumber}
                >
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

export default Day;