// 5 across, 5 down
const samplePuzzle = {
  size: 5, // you can bump this if your layout needs more room
  clues: [
    // Across
    {
      number: 1,
      text: 'Place to pour a pint',
      direction: 'across' as const,
      startRow: 0,  // <-- pick your coordinates
      startCol: 0,  // <-- pick your coordinates
      length: 3,
      solution: 'PUB',
    },
    {
      number: 3,
      text: 'Host of the 2028 Olympics, for short',
      direction: 'across' as const,
      startRow: 0,
      startCol: 0,
      length: 3,
      solution: 'USA',
    },
    {
      number: 5,
      text: 'Black suit',
      direction: 'across' as const,
      startRow: 0,
      startCol: 0,
      length: 5,
      solution: 'CLUBS',
    },
    {
      number: 7,
      text: 'Political commentator Jen',
      direction: 'across' as const,
      startRow: 0,
      startCol: 0,
      length: 5,
      solution: 'PSAKI',
    },
    {
      number: 9,
      text: "Kick one's feet up",
      direction: 'across' as const,
      startRow: 0,
      startCol: 0,
      length: 5,
      solution: 'RELAX',
    },

    // Down
    {
      number: 2,
      text: 'Sign of life',
      direction: 'down' as const,
      startRow: 0,
      startCol: 0,
      length: 5,
      solution: 'PULSE',
    },
    {
      number: 4,
      text: 'Regular patron\'s order, with "the"',
      direction: 'down' as const,
      startRow: 0,
      startCol: 0,
      length: 5,
      solution: 'USUAL',
    },
    {
      number: 6,
      text: 'Loaf with a chocolate swirl',
      direction: 'down' as const,
      startRow: 0,
      startCol: 0,
      length: 5,
      solution: 'BABKA',
    },
    {
      number: 8,
      text: 'Skill practiced on dummies, for short',
      direction: 'down' as const,
      startRow: 0,
      startCol: 0,
      length: 3,
      solution: 'CPR',
    },
    {
      number: 10,
      text: 'Age at which Tiger Woods made his first hole-in-one',
      direction: 'down' as const,
      startRow: 0,
      startCol: 0,
      length: 3,
      solution: 'SIX',
    },
  ],
};