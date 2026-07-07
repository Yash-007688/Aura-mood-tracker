import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { BreathingTechnique, BREATHING_TECHNIQUES } from '../types';

class BreathingSynth {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;

  start() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.oscillator = this.ctx.createOscillator();
      this.gainNode = this.ctx.createGain();
      this.filter = this.ctx.createBiquadFilter();

      // Low frequency warm sine wave for calming effect
      this.oscillator.type = 'sine';
      this.oscillator.frequency.value = 130.81; // C3 note

      this.filter.type = 'lowpass';
      this.filter.frequency.value = 350;

      this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);

      this.oscillator.connect(this.filter);
      this.filter.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.oscillator.start();
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  setVolume(volume: number, duration: number = 0.5) {
    if (this.ctx && this.gainNode) {
      const targetVol = Math.max(0.001, volume * 0.12);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(targetVol, this.ctx.currentTime + duration);
    }
  }

  stop() {
    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
      }
      if (this.ctx) {
        this.ctx.close();
      }
    } catch (e) {
      console.error(e);
    }
  }
}

export default function BreathingExercise() {
  const [technique, setTechnique] = useState<BreathingTechnique>('box');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(BREATHING_TECHNIQUES.box.phases[0].duration);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const synthRef = useRef<BreathingSynth | null>(null);

  const currentTechniqueConfig = BREATHING_TECHNIQUES[technique];
  const currentPhase = currentTechniqueConfig.phases[phaseIndex];

  // Initialize/Dispose synth
  useEffect(() => {
    if (soundEnabled && isActive) {
      if (!synthRef.current) {
        synthRef.current = new BreathingSynth();
        synthRef.current.start();
      }
    } else {
      if (synthRef.current) {
        synthRef.current.stop();
        synthRef.current = null;
      }
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
        synthRef.current = null;
      }
    };
  }, [soundEnabled, isActive]);

  // Adjust volume based on current phase
  useEffect(() => {
    if (synthRef.current && isActive) {
      const phaseName = currentPhase.name.toLowerCase();
      if (phaseName.includes('inhale')) {
        synthRef.current.setVolume(1.0, currentPhase.duration);
      } else if (phaseName.includes('exhale')) {
        synthRef.current.setVolume(0.1, currentPhase.duration);
      } else if (phaseName.includes('hold')) {
        synthRef.current.setVolume(0.4, 1.0);
      } else {
        synthRef.current.setVolume(0.001, 1.0);
      }
    }
  }, [phaseIndex, isActive, technique]);

  // Core Timer
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            const nextIndex = (phaseIndex + 1) % currentTechniqueConfig.phases.length;
            setPhaseIndex(nextIndex);
            return currentTechniqueConfig.phases[nextIndex].duration;
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
  }, [isActive, phaseIndex, technique]);

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  const resetExercise = () => {
    setIsActive(false);
    setPhaseIndex(0);
    setSecondsRemaining(currentTechniqueConfig.phases[0].duration);
    if (synthRef.current) {
      synthRef.current.setVolume(0.001, 0.2);
    }
  };

  const handleTechniqueChange = (tech: BreathingTechnique) => {
    setTechnique(tech);
    setIsActive(false);
    setPhaseIndex(0);
    setSecondsRemaining(BREATHING_TECHNIQUES[tech].phases[0].duration);
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-teal-100 dark:border-teal-900/50 shadow-sm flex flex-col items-center">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 mb-4">
        
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Wind size={18} />
          </div>
          <div>
            <h3 className="font-sans font-medium text-slate-800 dark:text-slate-200 text-sm tracking-tight">Breathing Oasis</h3>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Technique Dropdown */}
          <select
            value={technique}
            onChange={(e) => handleTechniqueChange(e.target.value as BreathingTechnique)}
            disabled={isActive}
            className="text-xs bg-slate-50 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-200/50 disabled:opacity-50"
          >
            {Object.entries(BREATHING_TECHNIQUES).map(([key, config]) => (
              <option key={key} value={key}>{config.name}</option>
            ))}
          </select>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
              soundEnabled 
                ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-400' 
                : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
            }`}
            title={soundEnabled ? 'Disable sound guide' : 'Enable sound guide'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {/* Play/Pause */}
          <button
            onClick={toggleActive}
            id="btn-breathing-toggle"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
              isActive 
                ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-400' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-400'
            }`}
            title={isActive ? 'Pause' : 'Start'}
          >
            {isActive ? <Pause size={14} /> : <Play size={14} />}
          </button>
          
          {/* Reset */}
          <button
            onClick={resetExercise}
            id="btn-breathing-reset"
            className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
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
              isActive ? currentPhase.color : 'border-emerald-200 dark:border-emerald-900/60'
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
              isActive ? currentPhase.color : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isActive ? `${technique}-${currentPhase.name}` : 'Ready'}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-center"
              >
                <div className="text-[10px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
                  {isActive ? currentPhase.name : 'Breathe'}
                </div>
                {isActive && (
                  <div className="text-xl font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                    {secondsRemaining}s
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <div className="w-full text-center mt-2 px-4">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed h-12 flex flex-col items-center justify-center">
          <span className="font-semibold text-slate-700 dark:text-slate-300">{currentTechniqueConfig.name}</span>
          <span className="mt-0.5">{isActive ? currentPhase.instruction : currentTechniqueConfig.description}</span>
        </div>
      </div>
    </div>
  );
}
