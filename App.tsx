
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameLevel, GameScreen, Character, Question } from './types';
import { CHARACTERS } from './constants';

const YoussefLogo = () => (
  <div className="flex items-center justify-center select-none py-4 md:py-8">
    <div className="flex items-end gap-1 px-4 py-2 md:px-6 md:py-3 bg-[#121212]/5 rounded-2xl border border-white/20 backdrop-blur-md shadow-sm transition-transform hover:scale-105 duration-300">
      <div className="flex flex-col items-center justify-between w-12 h-12 md:w-16 md:h-16 bg-[#062812] border-[3px] border-[#39ff14] shadow-[0_0_20px_rgba(57,255,20,0.4)] rounded-sm p-1 leading-none">
        <span className="text-[#39ff14] text-[8px] md:text-[10px] self-start font-bold">39</span>
        <span className="text-white text-xl md:text-3xl font-bold -mt-1">Y</span>
        <span className="text-[#39ff14] text-[6px] md:text-[7px] font-bold uppercase tracking-tighter">Yttrium</span>
      </div>
      <span className="text-slate-800 text-2xl md:text-4xl font-bold px-1 pb-1 tracking-tight">oussef</span>
      <div className="flex flex-col items-center justify-between w-12 h-12 md:w-16 md:h-16 bg-[#062812] border-[3px] border-[#39ff14] shadow-[0_0_20px_rgba(57,255,20,0.4)] rounded-sm p-1 leading-none ml-1">
        <span className="text-[#39ff14] text-[8px] md:text-[10px] self-start font-bold">105</span>
        <span className="text-white text-xl md:text-3xl font-bold -mt-1">Dh</span>
        <span className="text-[#39ff14] text-[6px] md:text-[7px] font-bold uppercase tracking-tighter">Dubnium</span>
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
    // 1. اختيار الشخصية الهدف (الصح)
    const availableCharacters = CHARACTERS.filter(c => c.id !== lastCorrectId.current);
    const correctAnswer = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
    lastCorrectId.current = correctAnswer.id;

    // 2. اختيار 3 خيارات خاطئة عشوائية
    const otherOptions = CHARACTERS
      .filter(c => c.id !== correctAnswer.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    // 3. دمج الخيارات
    const options = [correctAnswer, ...otherOptions].sort(() => 0.5 - Math.random());

    // 4. استخراج المواصفات الحقيقية للهدف فقط
    const { estatura, pelo, ojos, personalidad, caracteristica } = correctAnswer.traits;
    
    const realTraits = [
      `es ${estatura}`,
      `tiene el pelo ${pelo}`,
      `tiene los ojos ${ojos}`,
      `es una persona ${personalidad}`,
      formatCaracteristica(caracteristica)
    ];

    // تحديد عدد الصفات حسب المستوى
    const numToShow = selectedLevel === GameLevel.EASY ? 3 : 4;
    const selectedTraits = [...realTraits].sort(() => 0.5 - Math.random()).slice(0, numToShow);

    let description = "";
    if (selectedTraits.length > 0) {
      const last = selectedTraits.pop();
      const initial = selectedTraits.join(", ");
      description = initial 
        ? `${initial.charAt(0).toUpperCase() + initial.slice(1)}, y ${last}.`
        : `${last!.charAt(0).toUpperCase() + last!.slice(1)}.`;
    }

    setCurrentQuestion({
      description,
      options,
      correctAnswer
    });
    setFeedback(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== GameScreen.PLAYING || feedback || !currentQuestion) return;
      if (['1', '2', '3', '4'].includes(e.key)) {
        handleOptionClick(currentQuestion.options[parseInt(e.key) - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, feedback, currentQuestion]);

  const selectLevel = (lvl: GameLevel) => {
    setLevel(lvl);
    setScore(0);
    setTotalRounds(0);
    generateQuestion(lvl);
    setScreen(GameScreen.PLAYING);
  };

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

  const renderStart = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <YoussefLogo />
      <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl w-full max-w-2xl border-b-8 border-blue-100">
        <h1 className="title-font text-5xl md:text-7xl text-blue-600 mb-6 uppercase">¿Quién es?</h1>
        <p className="text-slate-500 text-xl md:text-2xl mb-10">Domina las descripciones en español.</p>
        <button onClick={() => setScreen(GameScreen.LEVEL_SELECT)} className="bg-green-500 hover:bg-green-600 text-white title-font text-3xl px-12 py-6 rounded-full shadow-[0_8px_0_rgb(22,163,74)] active:translate-y-2 active:shadow-none transition-all">¡JUGAR!</button>
      </div>
    </div>
  );

  const renderLevelSelect = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <YoussefLogo />
      <h2 className="title-font text-4xl text-blue-600 mb-10">Dificultad</h2>
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        <button onClick={() => selectLevel(GameLevel.EASY)} className="flex-1 bg-white p-10 rounded-3xl shadow-xl border-4 border-transparent hover:border-green-400 transition-all">
          <div className="text-6xl mb-4">🟢</div>
          <span className="title-font text-2xl text-green-600">Fácil</span>
        </button>
        <button onClick={() => selectLevel(GameLevel.MEDIUM)} className="flex-1 bg-white p-10 rounded-3xl shadow-xl border-4 border-transparent hover:border-orange-400 transition-all">
          <div className="text-6xl mb-4">🟡</div>
          <span className="title-font text-2xl text-orange-600">Medio</span>
        </button>
      </div>
    </div>
  );

  const renderPlaying = () => {
    if (!currentQuestion) return null;
    return (
      <div className="flex flex-col items-center min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
        <div className="w-full flex justify-between items-center mb-6">
          <button onClick={() => setScreen(GameScreen.LEVEL_SELECT)} className="bg-white px-4 py-2 rounded-xl shadow font-bold text-slate-500">← Salir</button>
          <div className="flex gap-4">
            <div className="bg-white px-6 py-2 rounded-xl shadow-sm border-b-4 border-green-500 font-bold text-green-600">{score} Puntos</div>
            <div className="bg-white px-6 py-2 rounded-xl shadow-sm border-b-4 border-blue-500 font-bold text-blue-600">{totalRounds + 1}/10</div>
          </div>
        </div>

        <div className="w-full bg-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden mb-10 text-center flex flex-col items-center justify-center min-h-[250px]">
          <div className="bg-blue-600 text-white px-6 py-1 rounded-full text-xs font-black uppercase tracking-widest absolute top-4 shadow">Descripción</div>
          <p className="title-font text-3xl md:text-5xl text-slate-800 italic leading-snug">"{currentQuestion.description}"</p>
          {feedback && (
            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
              <div className="text-9xl mb-4">{feedback === 'correct' ? '🎯' : '💀'}</div>
              <h2 className={`title-font text-4xl ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>{feedback === 'correct' ? '¡SÍ!' : '¡GAME OVER!'}</h2>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {currentQuestion.options.map((char, i) => (
            <div key={char.id} className="relative group">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold z-10 border-2 border-white">{i + 1}</div>
              <button disabled={!!feedback} onClick={() => handleOptionClick(char)} className={`w-full aspect-square rounded-[2rem] overflow-hidden border-4 transition-all shadow-lg ${feedback === 'correct' && char.id === currentQuestion.correctAnswer.id ? 'border-green-500 scale-105' : 'border-white hover:border-blue-400'}`}>
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
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <YoussefLogo />
          <div className="bg-white p-16 rounded-[4rem] shadow-2xl border-t-[12px] border-blue-500 max-w-lg w-full">
            <div className="text-9xl mb-6">🏆</div>
            <h2 className="title-font text-5xl text-blue-600 mb-6">¡Completado!</h2>
            <p className="text-8xl title-font text-green-500 mb-10">{score}/10</p>
            <button onClick={() => setScreen(GameScreen.LEVEL_SELECT)} className="bg-blue-600 text-white title-font text-2xl w-full py-5 rounded-3xl shadow-xl hover:bg-blue-700">REINTENTAR</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
