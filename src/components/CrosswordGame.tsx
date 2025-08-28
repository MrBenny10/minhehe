// ...imports unchanged...

// 9×9 Swedish-themed crossword with clean intersections:
// (■ = blocked)
//
// 0 1 2 3 4 5 6 7 8
// 0 ■ ■ ■ ■ ■ ■ ■ ■ ■
// 1 U ■ ■ ■ ■ ■ ■ ■ ■
// 2 P ■ V O L V O ■ ■     1A VOLVO
// 3 P ■ ■ I K E A ■ ■     4A IKEA  (shifted right; block at col 1)
// 4 S S M O R G A S ■     6A SMORGAS
// 5 A ■ A B B A ■ ■ ■     5A ABBA  (moved to its own row)
// 6 L ■ S A M I ■ ■ ■     8A SAMI
// 7 A ■ ■ ■ ■ ■ ■ ■ ■
// 8 ■ ■ ■ ■ ■ ■ ■ ■ ■
//
// Down words:
// 2D LAGOM starts at (2,4)
// 3D UPPSALA starts at (1,0)
// 7D SKAL starts at (4,6)

const samplePuzzle = {
  size: 9,
  clues: [
    // Across
    {
      number: 1,
      text: 'Swedish carmaker (5)',
      direction: 'across' as const,
      startRow: 2,
      startCol: 2,
      length: 5,
      solution: 'VOLVO',
    },
    {
      number: 4,
      text: 'Flat-pack furniture giant (4)',
      direction: 'across' as const,
      startRow: 3,
      startCol: 2, // moved from col 1 → col 2 to insert a block before it
      length: 4,
      solution: 'IKEA',
    },
    {
      number: 6,
      text: "Part of 'smorgasbord' (7)",
      direction: 'across' as const,
      startRow: 4,
      startCol: 1,
      length: 7,
      solution: 'SMORGAS',
    },
    {
      number: 5,
      text: 'Famous Swedish pop group (4)',
      direction: 'across' as const,
      startRow: 5, // moved down so it’s not adjacent to IKEA
      startCol: 2,
      length: 4,
      solution: 'ABBA',
    },
    {
      number: 8,
      text: 'Indigenous people of northern Sweden (4)',
      direction: 'across' as const,
      startRow: 6,
      startCol: 2,
      length: 4,
      solution: 'SAMI',
    },

    // Down
    {
      number: 2,
      text: "Swedish ideal of 'just right' (5)",
      direction: 'down' as const,
      startRow: 2,
      startCol: 4,
      length: 5,
      solution: 'LAGOM',
    },
    {
      number: 3,
      text: 'Historic Swedish university city (7)',
      direction: 'down' as const,
      startRow: 1,
      startCol: 0,
      length: 7,
      solution: 'UPPSALA',
    },
    {
      number: 7,
      text: 'What Swedes say for "cheers!" (4)',
      direction: 'down' as const,
      startRow: 4,
      startCol: 6,
      length: 4,
      solution: 'SKAL',
    },
  ],
};

// ...rest of the component unchanged...
