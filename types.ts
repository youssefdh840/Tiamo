
export enum GameLevel {
  EASY = 'Fácil',
  MEDIUM = 'Medio'
}

export enum GameScreen {
  START = 'inicio',
  LEVEL_SELECT = 'niveles',
  PLAYING = 'jugando',
  SUMMARY = 'resumen'
}

export interface CharacterTraits {
  estatura: 'alto' | 'bajo' | 'de estatura media';
  pelo: 'negro' | 'castaño' | 'rubio' | 'pelirrojo';
  ojos: 'marrones' | 'verdes' | 'azules';
  personalidad: 'amable' | 'simpático' | 'serio' | 'inteligente';
  caracteristica: 'bigote' | 'gafas' | 'barba' | 'cara cuadrada' | 'cara alargada' | 'mujer morena' | 'mujer rubia';
}

export interface Character {
  id: number;
  name: string;
  image: string;
  traits: CharacterTraits;
}

export interface Question {
  description: string;
  options: Character[];
  correctAnswer: Character;
}
