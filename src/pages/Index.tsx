import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Auto-import all puzzles
const puzzleModules = import.meta.glob("../puzzles/day*.ts", { eager: true });

const availableDays: string[] = [];

for (const path in puzzleModules) {
  const match = path.match(/day(\d+)\.ts$/);
  if (match) {
    availableDays.push(match[1]); // e.g. "8"
  }
}

availableDays.sort((a, b) => Number(a) - Number(b));

const latestDay = availableDays[availableDays.length - 1]; // Last one = newest

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-4xl font-bold">Welcome to minHehe</h1>
      <p className="text-lg text-muted-foreground">
        Play a new mini crossword every day!
      </p>

      {latestDay ? (
        <Link to={`/day${latestDay}`}>
          <Button size="lg" className="mt-4">
            Play Today’s Puzzle (Day {latestDay})
          </Button>
        </Link>
      ) : (
        <p>No puzzles available yet.</p>
      )}

      {/* Optional: list all days */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {availableDays.map((day) => (
          <Link key={day} to={`/day${day}`}>
            <Button variant="outline" size="sm">
              Day {day}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Index;
