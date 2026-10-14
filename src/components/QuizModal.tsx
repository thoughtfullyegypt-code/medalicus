import React, { useState, useEffect } from 'react';
import { QUIZ_QUESTIONS } from '../data/coronaryData';
import { QuizQuestion, ProjectionPreset } from '../types';
import confetti from 'canvas-confetti';
import { 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Compass
} from 'lucide-react';

interface QuizModalProps {
  onClose: () => void;
  onSetPreset: (preset: ProjectionPreset) => void;
  onHighlightVessel: (vesselId: string) => void;
  onUpdateScore: (newScore: number, newStreak: number) => void;
  currentScore: number;
  currentStreak: number;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  onClose,
  onSetPreset,
  onHighlightVessel,
  onUpdateScore,
  currentScore,
  currentStreak
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const question: QuizQuestion = QUIZ_QUESTIONS[currentIdx % QUIZ_QUESTIONS.length];

  // When question changes, align the C-arm and highlight target vessel
  useEffect(() => {
    onSetPreset(question.preset);
    onHighlightVessel(question.vesselId);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
  }, [currentIdx]);

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === question.correctAnswer;
    if (isCorrect) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
      onUpdateScore(currentScore + 10, currentStreak + 1);
    } else {
      onUpdateScore(currentScore, 0); // Reset streak on error
    }
  };

  const handleNext = () => {
    setCurrentIdx(prev => prev + 1);
  };

  const isCorrect = selectedOption === question.correctAnswer;

  return (
    <div className="bg-[#0f1724]/95 backdrop-blur-lg border border-teal-500/40 rounded-xl p-4 shadow-2xl text-xs space-y-3.5 max-w-md w-full select-none">
      {/* Quiz Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white text-sm">Name the Vessel</span>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-950 px-1.5 py-0.2 rounded border border-teal-800">
                Q{currentIdx + 1}/{QUIZ_QUESTIONS.length}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Active Recall Under Fluoroscopic Angulation</p>
          </div>
        </div>

        {/* Current Score & Streak */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <div className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-teal-300">
            {currentScore} pts
          </div>
          {currentStreak > 0 && (
            <div className="bg-amber-950/80 text-amber-400 border border-amber-800/80 px-2 py-0.5 rounded flex items-center space-x-1">
              <span>🔥</span>
              <span>{currentStreak}</span>
            </div>
          )}
        </div>
      </div>

      {/* Projection Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Compass className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-slate-400 text-[11px]">Current C-Arm Angle:</span>
          <span className="font-mono font-bold text-teal-300 text-[11px]">{question.preset.shorthand}</span>
        </div>
        <span className="text-[10px] text-slate-400">Target highlighted in Cyan</span>
      </div>

      {/* Question Prompt */}
      <div className="text-slate-200 font-medium text-xs">
        Which coronary artery or branch is highlighted under this <span className="text-teal-300 font-bold">{question.preset.name}</span> projection?
      </div>

      {/* Multiple Choice Options */}
      <div className="space-y-1.5">
        {question.options.map((opt, i) => {
          let btnStyle = 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200';
          if (isAnswered) {
            if (opt === question.correctAnswer) {
              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
            } else if (opt === selectedOption) {
              btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 font-bold';
            } else {
              btnStyle = 'bg-slate-900/40 border-slate-800/50 text-slate-500 opacity-60';
            }
          }

          return (
            <button
              key={i}
              disabled={isAnswered}
              onClick={() => handleSelectOption(opt)}
              className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium transition flex items-center justify-between ${btnStyle}`}
            >
              <span>{opt}</span>
              {isAnswered && opt === question.correctAnswer && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {isAnswered && opt === selectedOption && opt !== question.correctAnswer && (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Hint Accordion */}
      {!isAnswered && (
        <div>
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center space-x-1 text-[11px] text-teal-400 hover:text-teal-300 transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHint ? 'Hide Orientation Clue' : 'Need a hint? (Show orientation clue)'}</span>
          </button>
          {showHint && (
            <p className="mt-1.5 p-2 bg-teal-950/30 border border-teal-800/40 rounded text-teal-300 text-[11px] leading-relaxed">
              💡 {question.hint}
            </p>
          )}
        </div>
      )}

      {/* Post-Answer Explanation Box */}
      {isAnswered && (
        <div className={`p-2.5 rounded-lg border space-y-1.5 animate-fadeIn ${
          isCorrect ? 'bg-emerald-950/40 border-emerald-700/60' : 'bg-slate-900 border-slate-700'
        }`}>
          <div className="flex items-center space-x-1 font-semibold text-xs">
            {isCorrect ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Correct! +10 Points</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-300">Incorrect. The correct answer is {question.correctAnswer}</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}

      {/* Next / Close Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 rounded hover:bg-slate-800 transition"
        >
          Exit Quiz Mode
        </button>

        {isAnswered && (
          <button
            onClick={handleNext}
            className="flex items-center space-x-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition text-xs shadow-md"
          >
            <span>Next Question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
