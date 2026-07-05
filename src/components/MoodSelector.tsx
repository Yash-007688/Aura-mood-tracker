import React, { useState, useEffect } from 'react';
import { MoodType, MOODS_CONFIG, MoodEntry, MoodConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Send, CheckCircle, MessageCircle, AlertTriangle, Shield, HeartHandshake } from 'lucide-react';

interface MoodSelectorProps {
  onSaveEntry: (entry: Omit<MoodEntry, 'id' | 'createdAt'>) => Promise<void>;
  recentHistory: MoodEntry[];
}

export default function MoodSelector({ onSaveEntry, recentHistory }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [customMood, setCustomMood] = useState<string>('');
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [latestResponse, setLatestResponse] = useState<{
    reflection: string;
    copingSkillActivated?: boolean;
    copingExercise?: string;
    isCrisis?: boolean;
  } | null>(null);

  // Set default prompt when mood changes
  useEffect(() => {
    if (selectedMood) {
      const config = MOODS_CONFIG[selectedMood];
      // Pick first prompt by default
      setSelectedPrompt(config.prompts[0]);
      setError(null);
      setLatestResponse(null);
    }
  }, [selectedMood]);

  const handleShufflePrompt = () => {
    if (!selectedMood) return;
    const config = MOODS_CONFIG[selectedMood];
    const currentIndex = config.prompts.indexOf(selectedPrompt);
    const nextIndex = (currentIndex + 1) % config.prompts.length;
    setSelectedPrompt(config.prompts[nextIndex]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    setIsGenerating(true);
    setError(null);

    try {
      const resolvedMoodLabel = selectedMood === 'others' && customMood.trim() 
        ? `something else: ${customMood.trim()}` 
        : MOODS_CONFIG[selectedMood].label;

      const response = await fetch('/api/generate-reflection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: resolvedMoodLabel,
          moodKey: selectedMood,
          notes: note.trim() ? `[Prompt: ${selectedPrompt}] ${note.trim()}` : '',
          history: recentHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Could not connect to the calming reflection generator.');
      }

      const data = await response.json();
      const reflection = data.reflection || "A gentle breath in, a gentle breath out. You're doing wonderful.";

      // Save to parent state/database
      await onSaveEntry({
        date: new Date().toISOString().split('T')[0],
        mood: selectedMood,
        customMoodName: selectedMood === 'others' && customMood.trim() ? customMood.trim() : undefined,
        notePrompt: selectedPrompt,
        note: note.trim(),
        reflection: reflection,
        copingSkillActivated: data.copingSkillActivated,
        copingExercise: data.copingExercise,
        isCrisis: data.isCrisis,
      });

      setLatestResponse({
        reflection,
        copingSkillActivated: data.copingSkillActivated,
        copingExercise: data.copingExercise,
        isCrisis: data.isCrisis,
      });
      // Keep result visible for a bit or let user click through
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while connecting with Gemini.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedMood(null);
    setCustomMood('');
    setSelectedPrompt('');
    setNote('');
    setLatestResponse(null);
    setError(null);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h2 className="font-sans font-semibold text-slate-800 text-lg tracking-tight mb-2 flex items-center gap-2">
        <span>How are you feeling in this exact moment?</span>
      </h2>
      <p className="text-slate-500 text-xs font-sans mb-6">
        Select a mood below. Your choice is always safe, valid, and welcomed here.
      </p>

      {/* Mood Options Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
        {Object.entries(MOODS_CONFIG).map(([key, config]) => {
          const mKey = key as MoodType;
          const isSelected = selectedMood === mKey;
          return (
            <motion.button
              key={key}
              type="button"
              id={`btn-mood-${key}`}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (!isGenerating && !latestResponse) {
                  setSelectedMood(mKey);
                }
              }}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center border text-center transition-all cursor-pointer ${
                config.color
              } ${config.borderColor} ${config.hoverColor} ${
                isSelected
                  ? 'ring-2 ring-slate-400 ring-offset-2 scale-[1.03] shadow-md border-transparent'
                  : 'opacity-70 shadow-sm hover:opacity-100'
              } ${isGenerating || latestResponse ? 'pointer-events-none opacity-50' : ''}`}
            >
              <span className="text-3xl mb-2 filter drop-shadow-sm select-none">{config.emoji}</span>
              <span className={`text-xs font-semibold ${config.textColor} tracking-tight`}>
                {config.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {selectedMood && !latestResponse && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 pt-6 space-y-4">
              {/* Optional custom label for 'others' */}
              {selectedMood === 'others' && (
                <div className="space-y-1.5 max-w-sm">
                  <label className="text-xs font-semibold text-slate-700 font-sans">
                    What word describes your feeling?
                  </label>
                  <input
                    type="text"
                    value={customMood}
                    onChange={(e) => setCustomMood(e.target.value)}
                    placeholder="e.g. excited, nostalgic, tired..."
                    maxLength={30}
                    id="input-custom-mood"
                    className="w-full px-4 py-2 text-xs border border-indigo-100 bg-indigo-50/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-300 transition-all font-sans placeholder-slate-400"
                  />
                </div>
              )}

              {/* Dynamic prompts and notes */}
              <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MessageCircle size={15} />
                    <span className="text-xs font-semibold font-sans uppercase tracking-wider text-slate-500">
                      Gentle prompt
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleShufflePrompt}
                    id="btn-shuffle-prompt"
                    className="flex items-center gap-1 text-[10px] font-semibold text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-indigo-50/50 shadow-sm"
                  >
                    <RefreshCw size={10} />
                    Try another prompt
                  </button>
                </div>

                <p className="text-sm text-slate-700 italic font-sans font-medium pl-1">
                  &ldquo;{selectedPrompt}&rdquo;
                </p>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Your thoughts are always safe here. Write anything, or leave it blank..."
                  rows={4}
                  id="textarea-mood-note"
                  className="w-full px-4 py-3 text-xs bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-100 focus:border-indigo-100 transition-all font-sans leading-relaxed resize-none"
                />
              </div>

              {/* Error warning */}
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 font-sans">
                  {error}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  id="btn-cancel-logging"
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-600 bg-slate-50 hover:bg-slate-100/70 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  id="btn-submit-logging"
                  className={`px-5 py-2 text-xs font-semibold text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer bg-slate-700 hover:bg-slate-800 hover:shadow-md disabled:bg-slate-400 disabled:shadow-none`}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Weaving reflection...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Log Mood & Get Reflection
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.form>
        )}

        {/* AI Reflection Success Card */}
        {latestResponse && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="border-t border-slate-100 pt-6"
          >
            {latestResponse.isCrisis ? (
              <div className="bg-gradient-to-br from-red-50 via-rose-50 to-orange-50/40 rounded-2xl p-6 border-2 border-red-500 shadow-md space-y-4">
                <div className="flex items-center gap-2 text-red-600">
                  <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
                    <AlertTriangle size={18} className="animate-bounce" />
                  </div>
                  <h4 className="font-sans font-black text-sm tracking-wider uppercase">
                    SECURITY GUARDRAIL: Crisis Support Activated
                  </h4>
                </div>

                <p className="text-slate-800 text-xs sm:text-sm font-semibold font-sans leading-relaxed">
                  Please reach out for support
                </p>

                <p className="text-slate-700 text-xs font-sans leading-relaxed">
                  {latestResponse.reflection}
                </p>

                <div className="bg-white/90 rounded-xl p-4 border border-rose-100 space-y-2.5 text-xs">
                  <div className="font-bold text-slate-800 font-sans flex items-center gap-1.5">
                    <HeartHandshake size={14} className="text-rose-500" />
                    Immediate Support Lifelines:
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-600 font-sans leading-relaxed">
                    <li><strong className="text-slate-800">USA & Canada:</strong> Call or text <span className="font-mono bg-slate-50 px-1 py-0.5 rounded border border-slate-200">988</span> for the Suicide & Crisis Lifeline.</li>
                    <li><strong className="text-slate-800">UK:</strong> Call <span className="font-mono bg-slate-50 px-1 py-0.5 rounded border border-slate-200">111</span> to reach the NHS mental health services, or <span className="font-mono bg-slate-50 px-1 py-0.5 rounded border border-slate-200">116 123</span> for Samaritans.</li>
                    <li><strong className="text-slate-800">Australia:</strong> Call <span className="font-mono bg-slate-50 px-1 py-0.5 rounded border border-slate-200">13 11 14</span> for Lifeline.</li>
                    <li><strong className="text-slate-800">International:</strong> Please find resources at <a href="https://findahelpline.com/" target="_blank" rel="noreferrer" className="text-rose-600 underline font-medium">findahelpline.com</a></li>
                  </ul>
                  <p className="text-[11px] text-slate-500 italic mt-1 font-sans">
                    You do not have to carry this alone. Please reach out to these trained professionals or a trusted person in your life right now.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleReset}
                    id="btn-complete-logging"
                    className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Return to Aura
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-50/40 via-purple-50/40 to-teal-50/30 rounded-2xl p-6 border border-indigo-100/75 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-600">
                  <div className="p-1.5 bg-indigo-50 rounded-lg">
                    <Sparkles size={16} />
                  </div>
                  <h4 className="font-sans font-semibold text-sm tracking-tight">AI Companion's Reflection</h4>
                </div>

                <blockquote className="text-slate-700 text-xs sm:text-sm leading-relaxed italic pl-4 border-l-2 border-indigo-200/80 font-sans">
                  &ldquo;{latestResponse.reflection}&rdquo;
                </blockquote>

                {/* Coping Toolkit Skill Trigger */}
                {latestResponse.copingSkillActivated && latestResponse.copingExercise && (
                  <div className="p-5 rounded-xl bg-teal-50/60 border border-teal-100/80 space-y-2.5 shadow-sm">
                    <div className="flex items-center gap-1.5 text-teal-800 font-bold text-xs uppercase tracking-wider font-sans">
                      <Shield size={14} className="text-teal-600" />
                      <span>Coping Toolkit Skill Activated</span>
                    </div>
                    <div className="text-slate-700 text-xs leading-relaxed whitespace-pre-line font-sans">
                      {latestResponse.copingExercise}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-2 border-t border-slate-100/50">
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle size={15} />
                    <span className="text-xs font-medium font-sans">Saved securely to history</span>
                  </div>
                  <button
                    onClick={handleReset}
                    id="btn-complete-logging"
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100/70 text-indigo-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Create new entry
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
