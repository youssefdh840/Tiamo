import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameLevel, GameScreen, Character, Question } from './types';
import { CHARACTERS } from './constants';

const YoussefLogo = () => (
  <div className="flex items-center justify-center select-none py-4">
    <div className="flex items-end gap-1 px-4 py-2 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md shadow-sm transition-transform hover:scale-105 duration-300">
      <div className="flex flex-col items-center justify-between w-10 h-10 md:w-14 md:h-14 bg-[#062812] border-[3px] border-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.3)] rounded-sm p-1 leading-none">
        <span className="text-[#39ff14] text-[7px] md:text-[9px] self-start font-bold">39</span>
        <span className="text-white text-lg md:text-2xl font-bold -mt-1">Y</span>
        <span className="text-[#39ff14] text-[5px] md:text-[6px] font-bold uppercase tracking-tighter">Yttrium</span>
      </div>
      <span className="text-slate-800 text-xl md:text-3xl font-bold px-1 pb-1 tracking-tight">oussef</span>
      <div className="flex flex-col items-center justify-between w-10 h-10 md:w-14 md:h-14 bg-[#062812] border-[3px] border-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.3)] rounded-sm p-1 leading-none ml-0.5">
        <span className="text-[#39ff14] text-[7px] md:text-[9px] self-start font-bold">105</span>
        <span className="text-white text-lg md:text-2xl font-bold -mt-1">Dh</span>
        <span className="text-[#39ff14] text-[5px] md:text-[6px] font-bold uppercase tracking-tighter">Dubnium</span>
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

  const generateQuestion = useCallback((selectedLevel: GameLevel) => {
    // 1. Pick target
    const availableCharacters = CHARACTERS.filter(c => c.id !== lastCorrectId.current);
    const correctAnswer = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
    lastCorrectId.current = correctAnswer.id;

    // 2. Pick distractors
    const otherOptions = CHARACTERS
      .filter(c => c.id !== correctAnswer.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    // 3. Shuffle options
    const options = [correctAnswer, ...otherOptions].sort(() => 0.5 - Math.random());

    // 4. Generate description from traits
    const realTraits = [...correctAnswer.traits];
    // Increased numToShow for more challenge as requested
    const numToShow = selectedLevel === GameLevel.EASY ? 4 : 6;
    const shuffledTraits = realTraits.sort(() => 0.5 - Math.random());
    const finalTraits = shuffledTraits.slice(0, Math.min(numToShow, realTraits.length));

    let description = "";
    if (finalTraits.length > 0) {
      const lastTrait = finalTraits.pop();
      const initialTraits = finalTraits.join(", ");
      description = initialTraits 
        ? `${initialTraits.charAt(0).toUpperCase() + initialTraits.slice(1)}, y ${lastTrait}.`
        : `${lastTrait!.charAt(0).toUpperCase() + lastTrait!.slice(1)}.`;
    }

    setCurrentQuestion({
      description,
      options,
      correctAnswer
    });
    setFeedback(null);
  }, []);

  const handleOptionClick = (char: Character) => {
    if (feedback || !currentQuestion) return;

    if (char.id === currentQuestion.correctAnswer.id) {
      setFeedback('correct');
      setScore(s => s + 1);
      setTimeout(() => {
        setTotalRounds(r => {
          if (r + 1 >= 10) {
            setScreen(GameScreen.SUMMARY);
            return r + 1;
          }
          generateQuestion(level!);
          return r + 1;
        });
      }, 1200);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setScore(0);
        setTotalRounds(0);
        generateQuestion(level!);
        setFeedback(null);
      }, 1500);
    }
  };

  const selectLevel = (lvl: GameLevel) => {
    setLevel(lvl);
    setScore(0);
    setTotalRounds(0);
    generateQuestion(lvl);
    setScreen(GameScreen.PLAYING);
  };

  const renderStart = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-blue-50">
      <YoussefLogo />
      <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-2xl w-full max-w-2xl border-b-[12px] border-blue-100">
        <h1 className="title-font text-5xl md:text-7xl text-blue-600 mb-6 tracking-tight">¿Quién es?</h1>
        <p className="text-slate-400 text-lg md:text-xl mb-12 italic font-bold">Aprende español describiendo personajes</p>
        <button 
          onClick={() => setScreen(GameScreen.LEVEL_SELECT)} 
          className="bg-green-500 hover:bg-green-600 text-white title-font text-3xl px-16 py-8 rounded-full shadow-[0_10px_0_rgb(22,163,74)] active:translate-y-2 active:shadow-none transition-all"
        >
          ¡COMENZAR!
        </button>
      </div>
    </div>
  );

  const renderLevelSelect = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50">
      <YoussefLogo />
      <h2 className="title-font text-4xl text-blue-600 mb-12">Escoge Nivel</h2>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        <button onClick={() => selectLevel(GameLevel.EASY)} className="flex-1 bg-white p-12 rounded-[3rem] shadow-xl border-4 border-transparent hover:border-green-400 transition-all">
          <div className="text-7xl mb-4">🟢</div>
          <span className="title-font text-3xl text-green-600">Fácil</span>
          <p className="mt-2 text-slate-400 text-sm font-bold uppercase">4 Rasgos</p>
        </button>
        <button onClick={() => selectLevel(GameLevel.MEDIUM)} className="flex-1 bg-white p-12 rounded-[3rem] shadow-xl border-4 border-transparent hover:border-orange-400 transition-all">
          <div className="text-7xl mb-4">🟡</div>
          <span className="title-font text-3xl text-orange-600">Medio</span>
          <p className="mt-2 text-slate-400 text-sm font-bold uppercase">6 Rasgos</p>
        </button>
      </div>
    </div>
  );

  const renderPlaying = () => {
    if (!currentQuestion) return null;
    return (
      <div className="flex flex-col items-center min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
        <div className="w-full flex justify-between items-center mb-10">
          <button onClick={() => setScreen(GameScreen.LEVEL_SELECT)} className="bg-white px-6 py-2 rounded-2xl shadow-sm font-bold text-slate-400">← Salir</button>
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-xl border-b-4 border-green-500 text-green-600 font-bold">{score} Puntos</div>
            <div className="bg-white px-4 py-2 rounded-xl border-b-4 border-blue-500 text-blue-600 font-bold">{totalRounds + 1}/10</div>
          </div>
        </div>

        <div className="w-full max-w-2xl bg-white p-12 rounded-[3rem] shadow-2xl relative border-8 border-white mb-16 text-center flex flex-col items-center justify-center min-h-[350px]">
          <div className="bg-blue-600 text-white px-8 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] absolute -top-4 shadow-lg">
            DESCRIPCIÓN DEL OBJETIVO
          </div>
          <p className="title-font text-4xl md:text-5xl text-slate-800 italic leading-tight px-4">
            "{currentQuestion.description}"
          </p>
          
          {feedback && (
            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-50 rounded-[3rem] backdrop-blur-sm">
              <div className="text-9xl mb-4 animate-bounce">{feedback === 'correct' ? '🎯' : '💀'}</div>
              <h2 className={`title-font text-5xl ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                {feedback === 'correct' ? '¡SÍ!' : '¡OUCH!'}
              </h2>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-12 w-full max-w-4xl">
          {currentQuestion.options.map((char, i) => (
            <div key={char.id} className="relative">
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-[#2d3748] text-white rounded-full flex items-center justify-center font-black z-20 border-4 border-white shadow-xl">
                {i + 1}
              </div>
              <button 
                disabled={!!feedback} 
                onClick={() => handleOptionClick(char)} 
                className={`w-full aspect-square rounded-full overflow-hidden border-8 transition-all shadow-xl bg-white ${
                  feedback === 'correct' && char.id === currentQuestion.correctAnswer.id 
                    ? 'border-green-500 scale-110' 
                    : 'border-white hover:border-blue-400 hover:-translate-y-2'
                }`}
              >
                <img src={char.image} alt="" className="w-full h-full object-cover" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {screen === GameScreen.START && renderStart()}
      {screen === GameScreen.LEVEL_SELECT && renderLevelSelect()}
      {screen === GameScreen.PLAYING && renderPlaying()}
      {screen === GameScreen.SUMMARY && (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-blue-50">
          <YoussefLogo />
          <div className="bg-white p-16 rounded-[4rem] shadow-2xl border-t-[16px] border-blue-500 max-w-lg w-full">
            <div className="text-9xl mb-8">🏆</div>
            <h2 className="title-font text-5xl text-blue-600 mb-6 uppercase">¡Logrado!</h2>
            <p className="text-9xl title-font text-green-500 mb-10">{score}/10</p>
            <button onClick={() => setScreen(GameScreen.LEVEL_SELECT)} className="bg-blue-600 text-white title-font text-2xl w-full py-6 rounded-full shadow-xl hover:bg-blue-700 active:translate-y-2 transition-all">JUGAR OTRA VEZ</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;