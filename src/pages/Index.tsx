import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// ✅ You can import the same dynamic puzzle loader if you want it to be auto-generated
//    (this way, the homepage always stays in sync with available puzzles)
const puzzleModules = import.meta.glob("../puzzles/day*.(ts|tsx)", { eager: true });

const availableDays: string[] = [];

for (const path in puzzleModules) {
  const match = path.match(/day(\d+)\.(ts|tsx)$/);
  if (match) {
    availableDays.push(match[1]);
  }
}

availableDays.sort((a, b) => Number(a) - Number(b));

const Index = () => {
  return (
    <div className="h-[100dvh] flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to MinHeHe</h1>
      <p className="mb-12 text-lg text-muted-foreground">
        Select a puzzle day below to start playing
      </p>

      {/* ✅ Dynamic navigation just like Day.tsx */}
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
