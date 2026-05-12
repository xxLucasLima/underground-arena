/**
 * Pure-data name pools. Designers can extend without code changes.
 * The generator combines first + last + nickname adjective + nickname noun.
 */
export const FIRST_NAMES = [
  'Victor', 'Marcus', 'Leo', 'Ivan', 'Dimitri', 'Hugo', 'Felix', 'Diego',
  'Rafael', 'Tito', 'Cassius', 'Jaxon', 'Sergei', 'Andre', 'Mateo', 'Bruno',
  'Khalid', 'Tariq', 'Roman', 'Oskar', 'Nikolai', 'Adrian', 'Kenji', 'Hiro',
];

export const LAST_NAMES = [
  'Cruz', 'Kane', 'Silva', 'Petrov', 'Volkov', 'Vargas', 'Mendoza', 'Okafor',
  'Reyes', 'Sokolov', 'Ortega', 'Bishop', 'Halsey', 'Drago', 'Knox', 'Vega',
  'Marek', 'Calderon', 'Donovan', 'Sato', 'Park', 'Abramov', 'Strauss', 'Costa',
];

/**
 * Nicknames are built from adjective + noun.
 * Each pair has tags so the generator can match archetype flavor.
 *  - 'striker', 'power' → punchers/heavies
 *  - 'snake' → submission specialists
 *  - 'shadow', 'ghost' → counter punchers
 *  - 'bear', 'titan' → grapplers
 *  - 'storm' → kickboxers
 *  - 'mind' → tacticians
 *  - 'beast', 'wrecker' → brawlers
 *  - 'generic' → fallback
 */
export const NICKNAME_ADJ = [
  { word: 'The', tags: ['generic'] },
  { word: 'Iron', tags: ['power', 'striker', 'hammer', 'sledge'] },
  { word: 'Mad', tags: ['beast', 'wrecker', 'bull'] },
  { word: 'Silent', tags: ['ghost', 'shadow'] },
  { word: 'Steel', tags: ['hammer', 'power'] },
  { word: 'Wild', tags: ['beast', 'wrecker', 'bull'] },
  { word: 'Cold', tags: ['ghost', 'phantom', 'snake'] },
  { word: 'Lightning', tags: ['storm', 'cyclone', 'thunder'] },
];

export const NICKNAME_NOUN = [
  { word: 'Hammer', tags: ['hammer', 'power', 'striker', 'sledge'] },
  { word: 'Bloodhound', tags: ['hunter', 'tracker', 'generic'] },
  { word: 'Cobra', tags: ['snake', 'cobra', 'constrictor'] },
  { word: 'Bonecrusher', tags: ['bonecrusher', 'crusher', 'power'] },
  { word: 'Ghost', tags: ['ghost', 'phantom', 'shadow'] },
  { word: 'Bull', tags: ['bull', 'beast', 'wrecker'] },
  { word: 'Titan', tags: ['titan', 'bear', 'crusher'] },
  { word: 'Storm', tags: ['storm', 'cyclone', 'thunder'] },
  { word: 'Surgeon', tags: ['surgeon', 'mind', 'professor'] },
  { word: 'Phantom', tags: ['phantom', 'ghost', 'shadow'] },
  { word: 'Sledge', tags: ['sledge', 'hammer', 'power'] },
  { word: 'Beast', tags: ['beast', 'wrecker', 'bull'] },
  { word: 'Snake', tags: ['snake', 'cobra'] },
];
