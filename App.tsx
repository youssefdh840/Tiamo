
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
  
  const lastCorrectId = useRef<number | null>(null);

  const generateQuestion = useCallback((selectedLevel: GameLevel) => {
    const availableCharacters = CHARACTERS.filter(c => c.id !== lastCorrectId.current);
    const shuffled = [...availableCharacters].sort(() => 0.5 - Math.random());
    
    const options = shuffled.slice(0, 4);
    const correctAnswer = options[Math.floor(Math.random() * options.length)];
    lastCorrectId.current = correctAnswer.id;

    let description = "";
    const { estatura, pelo, ojos, personalidad } = correctAnswer.traits;

    if (selectedLevel === GameLevel.EASY) {
      const choices = [
        `Es ${estatura} y tiene el pelo ${pelo}.`,
        `Tiene el pelo ${pelo} y ojos ${ojos}.`,
        `Es ${estatura} y tiene ojos ${ojos}.`
      ];
      description = choices[Math.floor(Math.random() * choices.length)];
    } else {
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
    if (feedback) return;

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
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border-b-8 border-blue-200 w-full max-w-xl">
        <h1 className="title-font text-5xl md:text-7xl text-blue-600 mb-8 drop-shadow-sm">
          ¿Quién es?
        </h1>
        <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed">
          ¡Aprende a describir personas en español de forma divertida!
        </p>
        <button
          onClick={handleStartGame}
          className="bg-green-500 hover:bg-green-600 text-white title-font text-3xl px-12 py-6 rounded-full shadow-[0_8px_0_rgb(22,163,74)] transition-all active:translate-y-1 active:shadow-none"
        >
          ¡EMPEZAR!
        </button>
      </div>
    </div>
  );

  const renderLevelSelect = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-6">
      <h2 className="title-font text-4xl text-blue-600 mb-10 text-center">Selecciona un nivel</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        <button
          onClick={() => selectLevel(GameLevel.EASY)}
          className="flex flex-col items-center p-8 bg-white rounded-[2rem] shadow-xl border-4 border-green-200 hover:border-green-400 transition-all hover:scale-105 group"
        >
          <div className="text-6xl mb-4">🟢</div>
          <span className="title-font text-2xl text-green-600">Nivel Fácil</span>
          <p className="text-slate-500 mt-2 text-center text-sm">Descripciones físicas sencillas</p>
        </button>
        <button
          onClick={() => selectLevel(GameLevel.MEDIUM)}
          className="flex flex-col items-center p-8 bg-white rounded-[2rem] shadow-xl border-4 border-orange-200 hover:border-orange-400 transition-all hover:scale-105 group"
        >
          <div className="text-6xl mb-4">🟡</div>
          <span className="title-font text-2xl text-orange-600">Nivel Medio</span>
          <p className="text-slate-500 mt-2 text-center text-sm">Físico + Rasgos de personalidad</p>
        </button>
      </div>
      <button
        onClick={() => setScreen(GameScreen.START)}
        className="mt-12 text-blue-500 font-bold hover:underline"
      >
        Volver al inicio
      </button>
    </div>
  );

  const renderPlaying = () => {
    if (!currentQuestion) return null;

    return (
      <div className="flex flex-col items-center min-h-screen p-4 max-w-5xl mx-auto">
        {/* Marcadores */}
        <div className="w-full flex justify-between items-center mb-6 gap-2">
          <button
            onClick={() => setScreen(GameScreen.LEVEL_SELECT)}
            className="bg-white text-blue-600 font-bold px-4 py-2 rounded-xl shadow-sm text-sm"
          >
            ← Salir
          </button>
          <div className="flex gap-2">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border-b-2 border-green-400 text-sm">
              <span className="font-bold text-green-600">{score} Aciertos</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border-b-2 border-blue-400 text-sm">
              <span className="font-bold text-slate-600">{totalRounds + 1}/10</span>
            </div>
          </div>
        </div>

        {/* Panel de Descripción مع مسافة علوية أكبر (pt-28) لمنع تداخل الشارة الزرقاء */}
        <div className="w-full bg-white px-8 pb-10 pt-28 rounded-[3rem] shadow-xl border-4 border-blue-50 mb-8 text-center relative overflow-hidden">
          <div className="bg-blue-500 text-white px-10 py-3 rounded-full text-xs font-bold absolute top-6 left-1/2 -translate-x-1/2 uppercase tracking-widest whitespace-nowrap shadow-md z-10">
            Busca a la persona
          </div>
          <p className="title-font text-2xl md:text-3xl text-slate-800 leading-relaxed italic">
            "{currentQuestion.description}"
          </p>
          
          {feedback && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/95 z-20">
              <div className="text-center">
                <div className="text-7xl mb-2 animate-bounce">
                  {feedback === 'correct' ? '✅' : '❌'}
                </div>
                <h3 className={`title-font text-3xl ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                  {feedback === 'correct' ? '¡Correcto!' : '¡Oops! Prueba otra vez'}
                </h3>
              </div>
            </div>
          )}
        </div>

        {/* Galería de Imágenes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {currentQuestion.options.map((char) => (
            <button
              key={char.id}
              disabled={!!feedback}
              onClick={() => handleOptionClick(char)}
              className={`group relative aspect-square bg-white rounded-[2rem] border-4 transition-all overflow-hidden shadow-md ${
                feedback === 'correct' && char.id === currentQuestion.correctAnswer.id
                  ? 'border-green-500 scale-105 z-10'
                  : 'border-white hover:border-blue-200'
              }`}
            >
              <img
                src={char.image}
                alt={`Imagen ${char.id}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                onError={(e) => {
                   console.warn("فشل تحميل الصورة:", char.image);
                   (e.target as HTMLImageElement).src = `https://placehold.co/400x400/f8fafc/64748b?text=Img+${char.id}`;
                }}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center p-6">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-t-8 border-blue-500 max-w-sm w-full">
        <div className="text-8xl mb-6">🏆</div>
        <h2 className="title-font text-4xl text-blue-600 mb-2">¡Terminado!</h2>
        <p className="text-xl text-slate-500 mb-10">
          Puntos: <span className="title-font text-green-500 text-4xl">{score}</span> / 10
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setScreen(GameScreen.LEVEL_SELECT)}
            className="bg-blue-500 hover:bg-blue-600 text-white title-font text-xl px-10 py-4 rounded-2xl shadow-lg active:translate-y-1 transition-all"
          >
            VOLVER A JUGAR
          </button>
          <button
            onClick={() => setScreen(GameScreen.START)}
            className="bg-slate-100 text-slate-500 font-bold px-10 py-4 rounded-2xl"
          >
            MENÚ PRINCIPAL
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {screen === GameScreen.START && renderStart()}
      {screen === GameScreen.LEVEL_SELECT && renderLevelSelect()}
      {screen === GameScreen.PLAYING && renderPlaying()}
      {screen === GameScreen.SUMMARY && renderSummary()}
    </div>
  );
};

export default App;
