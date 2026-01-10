
import React, { useState, useCallback, useRef } from 'react';
import { GameLevel, GameScreen, Character, Question } from './types';
import { CHARACTERS } from './constants';

const App: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>(GameScreen.START);
  const [level, setLevel] = useState<GameLevel | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  
  // Ref to track the last correct character to avoid immediate repetition
  const lastCorrectId = useRef<number | null>(null);

  const generateQuestion = useCallback((selectedLevel: GameLevel) => {
    // Filter out the last correct answer to ensure variety
    const availableCharacters = CHARACTERS.filter(c => c.id !== lastCorrectId.current);
    const shuffled = [...availableCharacters].sort(() => 0.5 - Math.random());
    
    // Pick 4 unique characters
    const options = shuffled.slice(0, 4);
    const correctAnswer = options[Math.floor(Math.random() * options.length)];
    lastCorrectId.current = correctAnswer.id;

    // Generate Spanish description based on requested vocabulary
    let description = "";
    const { estatura, pelo, ojos, personalidad } = correctAnswer.traits;

    if (selectedLevel === GameLevel.EASY) {
      // Physical traits only - Simple beginner sentences
      const choices = [
        `Es ${estatura} y tiene el pelo ${pelo}.`,
        `Tiene el pelo ${pelo} y ojos ${ojos}.`,
        `Es ${estatura} y tiene ojos ${ojos}.`
      ];
      description = choices[Math.floor(Math.random() * choices.length)];
    } else {
      // Physical + personality - Slightly longer sentences
      const choices = [
        `Es ${estatura}, tiene el pelo ${pelo} y es ${personalidad}.`,
        `Tiene ojos ${ojos}, es ${estatura} y es muy ${personalidad}.`,
        `Es una persona ${personalidad}, tiene el pelo ${pelo} y es ${estatura}.`
      ];
      description = choices[Math.floor(Math.random() * choices.length)];
    }

    setCurrentQuestion({
      description,
      options,
      correctAnswer
    });
    setFeedback(null);
  }, []);

  const handleStartGame = () => {
    setScreen(GameScreen.LEVEL_SELECT);
  };

  const selectLevel = (selectedLevel: GameLevel) => {
    setLevel(selectedLevel);
    setScore(0);
    setTotalRounds(0);
    generateQuestion(selectedLevel);
    setScreen(GameScreen.PLAYING);
  };

  const handleOptionClick = (char: Character) => {
    if (feedback) return; // Prevent clicking during feedback

    if (char.id === currentQuestion?.correctAnswer.id) {
      setFeedback('correct');
      setScore(prev => prev + 1);
      setTimeout(() => {
        setTotalRounds(prev => {
          const next = prev + 1;
          if (next >= 10) {
            setScreen(GameScreen.SUMMARY);
          } else {
            generateQuestion(level!);
          }
          return next;
        });
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const renderStart = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center p-6">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl border-b-8 border-blue-200">
        <h1 className="title-font text-6xl md:text-8xl text-blue-600 mb-8 drop-shadow-sm">
          ¿Quién es?
        </h1>
        <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-lg mx-auto leading-relaxed">
          ¡Aprende a describir personas en español de forma divertida!
        </p>
        <button
          onClick={handleStartGame}
          className="bg-green-500 hover:bg-green-600 text-white title-font text-4xl px-16 py-8 rounded-full shadow-[0_10px_0_rgb(22,163,74)] transition-all active:translate-y-1 active:shadow-none"
        >
          ¡EMPEZAR!
        </button>
      </div>
    </div>
  );

  const renderLevelSelect = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-6">
      <h2 className="title-font text-5xl text-blue-600 mb-12 text-center">Selecciona un nivel</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-3xl">
        <button
          onClick={() => selectLevel(GameLevel.EASY)}
          className="flex flex-col items-center p-10 bg-white rounded-[2.5rem] shadow-xl border-4 border-green-200 hover:border-green-400 transition-all hover:scale-105 group"
        >
          <div className="text-7xl mb-6 group-hover:bounce transition-transform">🟢</div>
          <span className="title-font text-3xl text-green-600">Nivel Fácil</span>
          <p className="text-slate-500 mt-4 text-center">Descripciones físicas sencillas</p>
        </button>
        <button
          onClick={() => selectLevel(GameLevel.MEDIUM)}
          className="flex flex-col items-center p-10 bg-white rounded-[2.5rem] shadow-xl border-4 border-orange-200 hover:border-orange-400 transition-all hover:scale-105 group"
        >
          <div className="text-7xl mb-6 group-hover:bounce transition-transform">🟡</div>
          <span className="title-font text-3xl text-orange-600">Nivel Medio</span>
          <p className="text-slate-500 mt-4 text-center">Físico + Rasgos de personalidad</p>
        </button>
      </div>
      <button
        onClick={() => setScreen(GameScreen.START)}
        className="mt-16 text-blue-500 font-bold text-xl hover:underline"
      >
        Volver al inicio
      </button>
    </div>
  );

  const renderPlaying = () => {
    if (!currentQuestion) return null;

    return (
      <div className="flex flex-col items-center min-h-screen p-4 max-w-6xl mx-auto">
        {/* Marcadores */}
        <div className="w-full flex justify-between items-center mb-8 gap-4">
          <button
            onClick={() => setScreen(GameScreen.LEVEL_SELECT)}
            className="bg-white text-blue-600 font-bold px-6 py-3 rounded-2xl shadow-md hover:bg-blue-50 transition-colors"
          >
            ← Salir
          </button>
          <div className="flex gap-4">
            <div className="bg-white px-8 py-3 rounded-2xl shadow-md border-b-4 border-green-400">
              <span className="font-bold text-xl text-green-600">{score} Aciertos</span>
            </div>
            <div className="bg-white px-8 py-3 rounded-2xl shadow-md border-b-4 border-blue-400">
              <span className="font-bold text-xl text-slate-600">{totalRounds + 1} / 10</span>
            </div>
          </div>
        </div>

        {/* Panel de Descripción */}
        <div className="w-full bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-blue-100 mb-12 text-center relative overflow-hidden">
          <div className="bg-blue-500 text-white px-6 py-1 rounded-full text-sm font-bold absolute top-4 left-1/2 -translate-x-1/2 uppercase tracking-widest">
            Busca a la persona
          </div>
          <p className="title-font text-3xl md:text-4xl text-slate-800 mt-4 leading-relaxed italic">
            "{currentQuestion.description}"
          </p>
          
          {/* Overlay de Feedback */}
          {feedback && (
            <div className={`absolute inset-0 flex items-center justify-center bg-white/95 z-20 transition-opacity duration-300`}>
              <div className="text-center">
                <div className={`text-8xl mb-4 ${feedback === 'correct' ? 'animate-bounce' : 'animate-shake'}`}>
                  {feedback === 'correct' ? '✅' : '❌'}
                </div>
                <h3 className={`title-font text-4xl md:text-5xl ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                  {feedback === 'correct' ? '¡Correcto!' : 'Respuesta incorrecta'}
                </h3>
                {feedback === 'wrong' && (
                  <p className="text-slate-500 text-xl mt-4">¡Inténtalo otra vez!</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Galería de Imágenes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
          {currentQuestion.options.map((char) => (
            <button
              key={char.id}
              disabled={!!feedback}
              onClick={() => handleOptionClick(char)}
              className={`group relative aspect-square bg-white rounded-[2rem] border-8 transition-all overflow-hidden shadow-lg hover:shadow-2xl ${
                feedback === 'correct' && char.id === currentQuestion.correctAnswer.id
                  ? 'border-green-500 scale-105 z-10'
                  : 'border-white hover:border-blue-300'
              }`}
            >
              <img
                src={char.image}
                alt="Personaje"
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                onError={(e) => {
                   // Fallback visual if image file is missing locally
                   (e.target as HTMLImageElement).src = `https://placehold.co/400x400/e2e8f0/64748b?text=Falta+Imagen+${char.id}`;
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center p-6">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border-t-8 border-blue-500 max-w-lg w-full">
        <div className="text-9xl mb-8 animate-bounce">🏆</div>
        <h2 className="title-font text-5xl text-blue-600 mb-4">¡Buen trabajo!</h2>
        <p className="text-2xl text-slate-500 mb-12">
          Has conseguido <span className="title-font text-green-500 text-5xl">{score}</span> de 10 puntos.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setScreen(GameScreen.LEVEL_SELECT)}
            className="bg-blue-500 hover:bg-blue-600 text-white title-font text-2xl px-12 py-5 rounded-2xl shadow-[0_6px_0_rgb(37,99,235)] transition-all active:translate-y-1 active:shadow-none"
          >
            JUGAR DE NUEVO
          </button>
          <button
            onClick={() => setScreen(GameScreen.START)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 title-font text-2xl px-12 py-5 rounded-2xl transition-all"
          >
            VOLVER AL MENÚ
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 overflow-x-hidden">
      {screen === GameScreen.START && renderStart()}
      {screen === GameScreen.LEVEL_SELECT && renderLevelSelect()}
      {screen === GameScreen.PLAYING && renderPlaying()}
      {screen === GameScreen.SUMMARY && renderSummary()}
    </div>
  );
};

export default App;
