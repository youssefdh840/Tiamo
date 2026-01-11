
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

export interface Character {
  id: number;
  name: string;
  image: string;
  traits: string[];
}

export interface Question {
  description: string;
  options: Character[];
  correctAnswer: Character;
}
