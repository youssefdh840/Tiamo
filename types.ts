
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
  pelo: 'largo' | 'corto' | 'negro' | 'rubio';
  ojos: 'marrones' | 'verdes' | 'azules';
  personalidad: 'amable' | 'simpático' | 'serio' | 'inteligente';
}

export interface Character {
  id: number;
  image: string;
  traits: CharacterTraits;
}

export interface Question {
  description: string;
  options: Character[];
  correctAnswer: Character;
}
