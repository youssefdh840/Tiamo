
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameLevel, GameScreen, Character, Question } from './types';
import { CHARACTERS } from './constants';

const YoussefLogo = () => (
  <div className="flex items-center justify-center select-none py-4 md:py-8">
    <div className="flex items-end gap-1 px-6 py-3 bg-[#121212]/5 rounded-2xl border border-white/20 backdrop-blur-md shadow-sm transition-transform hover:scale-105 duration-300">
      {/* Elemento Yttrium */}
      <div className="flex flex-col items-center justify-between w-14 h-14 md:w-16 md:h-16 bg-[#062812] border-[3px] border-[#39ff14] shadow-[0_0_20px_rgba(57,255,20,0.4)] rounded-sm p-1 leading-none">
        <span className="text-[#39ff14] text-[10px] self-start font-bold">39</span>
        <span className="text-white text-2xl md:text-3xl font-bold -mt-1">Y</span>
        <span className="text-[#39ff14] text-[7px] font-bold uppercase tracking-tighter">Yttrium</span>
      </div>

      {/* Texto oussef */}
      <span className="text-slate-800 text-3xl md:text-4xl font-bold px-1 pb-1 tracking-tight">oussef</span>

      {/* Elemento Dubnium */}
      <div className="flex flex-col items-center justify-between w-14 h-14 md:w-16 md:h-16 bg-[#062812] border-[3px] border-[#39ff14] shadow-[0_0_20px_rgba(57,255,20,0.4)] rounded-sm p-1 leading-none ml-1">
        <span className="text-[#39ff14] text-[10px] self-start font-bold">105</span>
        <span className="text-white text-2xl md:text-3xl font-bold -mt-1">Dh</span>
        <span className="text-[#39ff14] text-[7px] font-bold uppercase tracking-tighter">Dubnium</span>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>(GameScreen.START);
  const [level, setLevel] = useState<GameLevel | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  
  const lastCorrectId = useRef<number | null>(null);

  const formatCaracteristica = (trait: string) => {
    switch (trait) {
      case 'bigote': return 'tiene bigote';
      case 'gafas': return 'lleva gafas';
      case 'barba': return 'tiene barba';
      case 'cara cuadrada': return 'tiene la cara cuadrada';
      case 'cara alargada': return 'tiene la cara alargada';
      case 'mujer morena': return 'es una mujer morena';
      case 'mujer rubia': return 'es una mujer rubia';
      default: return '';
    }
  };

  const generateQuestion = useCallback((selectedLevel: GameLevel) => {
    const availableCharacters = CHARACTERS.filter(c => c.id !== lastCorrectId.current);
    const shuffledChars = [...availableCharacters].sort(() => 0.5 - Math.random());
    
    const options = shuffledChars.slice(0, 4);
    const correctAnswer = options[Math.floor(Math.random() * options.length)];
    lastCorrectId.current = correctAnswer.id;

    const { estatura, pelo, ojos, personalidad, caracteristica } = correctAnswer.traits;
    
    const allParts = [
      `es ${estatura}`,
      `tiene el pelo ${pelo}`,
      `tiene los ojos ${ojos}`,
      `es una persona ${personalidad}`,
      formatCaracteristica(caracteristica)
    ];

    let numTraits = 3;
    if (selectedLevel === GameLevel.MEDIUM) {
      numTraits = Math.random() > 0.5 ? 4 : 5;
    }

    const selectedParts = [...allParts].sort(() => 0.5 - Math.random()).slice(0, numTraits);

    let description = "";
    if (selectedParts.length > 0) {
      const lastPart = selectedParts.pop();
      const initialParts = selectedParts.join(", ");
      description = initialParts 
        ? `${initialParts.charAt(0).toUpperCase() + initialParts.slice(1)}, y ${lastPart}.`
        : `${lastPart!.charAt(0).toUpperCase() + lastPart!.slice(1)}.`;
    }

    setCurrentQuestion({
      description,
      options,
      correctAnswer
    });
    setFeedback(null);
  }, []);

  // Keyboard support for PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== GameScreen.PLAYING || feedback || !currentQuestion) return;
      
      const key = e.key;
      if (['1', '2', '3', '4'].includes(key)) {
        const index = parseInt(key) - 1;
        if (currentQuestion.options[index]) {
          handleOptionClick(currentQuestion.options[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, feedback, currentQuestion]);

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
      }, 1200);
    } else {
      // LOSE MECHANIC: Restart from the beginning
      setFeedback('wrong');
      setTimeout(() => {
        setScore(0);
        setTotalRounds(0);
        generateQuestion(level!);
        setFeedback(null);
      }, 1500);
    }
  };

  const renderStart = () => (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-slate-50">
      <YoussefLogo />
      <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl border-b-[12px] border-blue-100 w-full max-w-2xl transform transition-all duration-500 hover:shadow-blue-200/50">
        <h1 className="title-font text-6xl md:text-8xl text-blue-600 mb-8 drop-shadow-sm tracking-tight">
          ¿Quién es?
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 mb-12 font-medium">
          El desafío definitivo de descripción en español.
        </p>
        <button
          onClick={handleStartGame}
          className="group relative bg-green-500 hover:bg-green-600 text-white title-font text-4xl px-16 py-8 rounded-full shadow-[0_10px_0_rgb(22,163,74)] transition-all active:translate-y-2 active:shadow-none overflow-hidden"
        >
          <span className="relative z-10">¡JUGAR AHORA!</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </div>
    </div>
  );

  const renderLevelSelect = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50">
      <YoussefLogo />
      <h2 className="title-font text-5xl text-blue-600 mb-12 text-center">Escoge tu desafío</h2>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl justify-center items-stretch">
        <button
          onClick={() => selectLevel(GameLevel.EASY)}
          className="flex-1 flex flex-col items-center p-12 bg-white rounded-[3rem] shadow-xl border-4 border-transparent hover:border-green-400 transition-all hover:scale-105 group relative overflow-hidden"
        >
          <div className="text-8xl mb-6 group-hover:scale-110 transition-transform">🟢</div>
          <span className="title-font text-3xl text-green-600">Nivel Fácil</span>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        </button>
        <button
          onClick={() => selectLevel(GameLevel.MEDIUM)}
          className="flex-1 flex flex-col items-center p-12 bg-white rounded-[3rem] shadow-xl border-4 border-transparent hover:border-orange-400 transition-all hover:scale-105 group relative overflow-hidden"
        >
          <div className="text-8xl mb-6 group-hover:scale-110 transition-transform">🟡</div>
          <span className="title-font text-3xl text-orange-600">Nivel Medio</span>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        </button>
      </div>
      <button
        onClick={() => setScreen(GameScreen.START)}
        className="mt-16 text-slate-400 font-bold hover:text-blue-500 transition-colors uppercase tracking-widest text-sm"
      >
        ← Volver al inicio
      </button>
    </div>
  );

  const renderPlaying = () => {
    if (!currentQuestion) return null;

    return (
      <div className="flex flex-col items-center min-h-screen p-6 max-w-7xl mx-auto">
        {/* PC Header bar */}
        <div className="w-full flex justify-between items-center mb-10 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white shadow-sm">
          <button
            onClick={() => setScreen(GameScreen.LEVEL_SELECT)}
            className="group flex items-center gap-2 bg-white text-slate-500 hover:text-red-500 font-bold px-6 py-3 rounded-2xl transition-all shadow-sm border border-slate-100"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Abandonar partida
          </button>
          
          <div className="hidden md:block">
            <YoussefLogo />
          </div>

          <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border-b-4 border-green-500">
              <span className="text-xs uppercase text-slate-400 block font-bold leading-none mb-1">Puntuación</span>
              <span className="font-bold text-2xl text-green-600 leading-none">{score}</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border-b-4 border-blue-500">
              <span className="text-xs uppercase text-slate-400 block font-bold leading-none mb-1">Ronda</span>
              <span className="font-bold text-2xl text-blue-600 leading-none">{totalRounds + 1}<span className="text-slate-300 font-normal">/10</span></span>
            </div>
          </div>
        </div>

        {/* Question Panel */}
        <div className="w-full max-w-4xl bg-white px-10 py-12 rounded-[4rem] shadow-2xl border border-blue-50 mb-12 text-center relative overflow-hidden flex flex-col items-center justify-center transition-all">
          <div className="bg-blue-600 text-white px-8 py-2 rounded-full text-xs font-black absolute top-0 left-1/2 -translate-x-1/2 uppercase tracking-[0.3em] shadow-lg">
            Descripción del Objetivo
          </div>
          
          <div className="mt-4">
            <p className="title-font text-3xl md:text-5xl text-slate-800 leading-tight italic px-4 select-none">
              "{currentQuestion.description}"
            </p>
          </div>
          
          {feedback && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/98 z-30 backdrop-blur-sm transition-opacity duration-300">
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="text-9xl mb-4 drop-shadow-xl">
                  {feedback === 'correct' ? '🎯' : '💀'}
                </div>
                <h3 className={`title-font text-5xl ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                  {feedback === 'correct' ? '¡EXCELENTE!' : '¡GAME OVER! REINICIANDO...'}
                </h3>
                {feedback === 'wrong' && (
                  <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-sm">Has perdido. Vuelves a empezar.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Options Grid Optimized for PC */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl mb-12">
          {currentQuestion.options.map((char, index) => (
            <div key={char.id} className="relative group">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center font-black z-20 shadow-xl border-4 border-white group-hover:bg-blue-600 transition-colors">
                {index + 1}
              </div>
              <button
                disabled={!!feedback}
                onClick={() => handleOptionClick(char)}
                className={`group relative aspect-[4/5] bg-white rounded-[3rem] border-[6px] transition-all duration-300 overflow-hidden shadow-xl w-full flex flex-col ${
                  feedback === 'correct' && char.id === currentQuestion.correctAnswer.id
                    ? 'border-green-500 scale-105 z-10 shadow-green-200'
                    : 'border-white hover:border-blue-400 hover:-translate-y-2 hover:shadow-2xl'
                }`}
              >
                <img
                  src={char.image}
                  alt="personaje"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = `https://placehold.co/600x800/f1f5f9/94a3b8?text=?`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          ))}
        </div>
        
        <p className="text-slate-400 font-medium text-sm animate-pulse hidden lg:block">
          Usa los números <span className="bg-slate-200 px-2 py-1 rounded text-slate-600 font-bold mx-1">1</span> <span className="bg-slate-200 px-2 py-1 rounded text-slate-600 font-bold mx-1">2</span> <span className="bg-slate-200 px-2 py-1 rounded text-slate-600 font-bold mx-1">3</span> <span className="bg-slate-200 px-2 py-1 rounded text-slate-600 font-bold mx-1">4</span> para una respuesta rápida
        </p>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-slate-50">
      <YoussefLogo />
      <div className="bg-white p-16 rounded-[4rem] shadow-2xl border-t-[12px] border-blue-500 max-w-lg w-full transform transition-all hover:scale-[1.02]">
        <div className="text-9xl mb-8 animate-bounce">🏆</div>
        <h2 className="title-font text-5xl text-blue-600 mb-4">¡Partida Completada!</h2>
        <div className="flex flex-col items-center mb-12">
           <span className="text-slate-400 uppercase font-black tracking-widest text-xs mb-2">Puntuación Final</span>
           <p className="title-font text-green-500 text-8xl drop-shadow-md">
            {score}<span className="text-slate-200 text-5xl">/10</span>
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setScreen(GameScreen.LEVEL_SELECT)}
            className="bg-blue-600 hover:bg-blue-700 text-white title-font text-2xl px-12 py-6 rounded-3xl shadow-xl active:translate-y-1 transition-all"
          >
            NUEVA PARTIDA
          </button>
          <button
            onClick={() => setScreen(GameScreen.START)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold px-12 py-6 rounded-3xl transition-colors"
          >
            VOLVER AL MENÚ
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-blue-200 selection:text-blue-900">
      {screen === GameScreen.START && renderStart()}
      {screen === GameScreen.LEVEL_SELECT && renderLevelSelect()}
      {screen === GameScreen.PLAYING && renderPlaying()}
      {screen === GameScreen.SUMMARY && renderSummary()}
    </div>
  );
};

export default App;
