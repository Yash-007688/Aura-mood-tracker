import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Play, Pause, RotateCcw } from 'lucide-react';

type BreathPhase = 'Inhale' | 'Hold (In)' | 'Exhale' | 'Hold (Out)';

interface PhaseConfig {
  name: BreathPhase;
  duration: number; // in seconds
  scale: number;
  color: string;
  instruction: string;
}

const PHASES: PhaseConfig[] = [
  { name: 'Inhale', duration: 4, scale: 1.5, color: 'bg-emerald-200/40 border-emerald-400', instruction: 'Breathe in slowly through your nose...' },
  { name: 'Hold (In)', duration: 4, scale: 1.5, color: 'bg-teal-200/40 border-teal-400', instruction: 'Gently suspend your breath...' },
  { name: 'Exhale', duration: 4, scale: 1.0, color: 'bg-sky-200/40 border-sky-400', instruction: 'Exhale fully, letting go of tension...' },
  { name: 'Hold (Out)', duration: 4, scale: 1.0, color: 'bg-purple-200/40 border-purple-400', instruction: 'Rest in the quiet stillness...' }
];

export default function BreathingExercise() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(PHASES[0].duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentPhase = PHASES[phaseIndex];

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Move to next phase
            const nextIndex = (phaseIndex + 1) % PHASES.length;
            setPhaseIndex(nextIndex);
            return PHASES[nextIndex].duration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phaseIndex]);

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  const resetExercise = () => {
    setIsActive(false);
    setPhaseIndex(0);
    setSecondsRemaining(PHASES[0].duration);
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-teal-100 shadow-sm flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
            <Wind size={18} />
          </div>
          <h3 className="font-sans font-medium text-slate-800 text-sm tracking-tight">Box Breathing Oasis</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleActive}
            id="btn-breathing-toggle"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
            title={isActive ? 'Pause' : 'Start'}
          >
            {isActive ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={resetExercise}
            id="btn-breathing-reset"
            className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Reset"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="h-44 w-full flex items-center justify-center relative overflow-hidden">
        {/* Animated breathing circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: isActive ? currentPhase.scale : 1.1,
              backgroundColor: isActive ? 'transparent' : 'rgba(16, 185, 129, 0.05)'
            }}
            transition={{
              duration: isActive ? currentPhase.duration : 2,
              ease: 'easeInOut'
            }}
            className={`w-28 h-28 rounded-full border-2 border-dashed ${
              isActive ? currentPhase.color : 'border-emerald-200'
            } absolute opacity-30`}
          />
          <motion.div
            animate={{
              scale: isActive ? currentPhase.scale : 1.0
            }}
            transition={{
              duration: isActive ? currentPhase.duration : 2,
              ease: 'easeInOut'
            }}
            className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center shadow-inner transition-colors duration-700 ${
              isActive ? currentPhase.color : 'bg-emerald-50/50 border-emerald-200'
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isActive ? currentPhase.name : 'Ready'}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-center"
              >
                <div className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
                  {isActive ? currentPhase.name : 'Breathe'}
                </div>
                {isActive && (
                  <div className="text-xl font-bold text-slate-700 mt-0.5">
                    {secondsRemaining}s
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <div className="w-full text-center mt-2 px-4">
        <p className="text-xs text-slate-500 font-sans leading-relaxed h-10 flex items-center justify-center">
          {isActive ? currentPhase.instruction : 'Practice Box Breathing (4s Inhale, 4s Hold, 4s Exhale, 4s Hold) to restore emotional balance.'}
        </p>
      </div>
    </div>
  );
}
