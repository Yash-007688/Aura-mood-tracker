import { useState } from 'react';
import { MoodEntry, MOODS_CONFIG, MoodType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Search, Filter, Calendar, Sparkles, MessageCircle, AlertTriangle, Shield } from 'lucide-react';

interface TimelineProps {
  entries: MoodEntry[];
  onDeleteEntry: (id: string) => void;
}

export default function Timeline({ entries, onDeleteEntry }: TimelineProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Filter and Search logs
  const filteredEntries = entries.filter((entry) => {
    const config = MOODS_CONFIG[entry.mood];
    const moodLabel = entry.customMoodName || config.label;
    const matchesSearch =
      entry.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      moodLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.reflection.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = selectedFilter === 'all' || entry.mood === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes or reflections..."
            id="input-search-timeline"
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50/50 hover:bg-slate-50 border border-slate-100 focus:border-slate-200 focus:bg-white rounded-xl focus:outline-none transition-all font-sans placeholder-slate-400"
          />
        </div>

        {/* Mood Filter Pill Group */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 text-slate-400 mr-1 text-xs">
            <Filter size={12} />
            <span className="font-medium">Filter:</span>
          </div>

          <button
            onClick={() => setSelectedFilter('all')}
            id="btn-filter-all"
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide uppercase transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100/70 border border-slate-100'
            }`}
          >
            All
          </button>

          {Object.entries(MOODS_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedFilter(key)}
              id={`btn-filter-${key}`}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide uppercase transition-all flex items-center gap-1 cursor-pointer ${
                selectedFilter === key
                  ? 'bg-slate-700 text-white shadow-sm'
                  : `${config.color} ${config.textColor} border ${config.borderColor}`
              }`}
            >
              <span>{config.emoji}</span>
              <span>{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* History Timeline Cards */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white/50 border border-dashed border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
          <Calendar size={32} className="text-slate-300 mb-3" />
          <p className="text-sm font-sans font-medium text-slate-500">No logs found matching your view.</p>
          <p className="text-xs font-sans text-slate-400 mt-1">
            {entries.length === 0
              ? 'Log your very first mood above to start mapping your journey.'
              : 'Try clearing your search query or selecting a different filter.'}
          </p>
        </div>
      ) : (
        <div className="relative border-l border-slate-100 pl-4 sm:pl-6 ml-3 space-y-6">
          <AnimatePresence initial={false}>
            {filteredEntries.map((entry, index) => {
              const config = MOODS_CONFIG[entry.mood];
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -10, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="relative group"
                >
                  {/* Timeline Dot with Emoji */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-sm select-none ${config.color}`}>
                      <span className="text-base">{config.emoji}</span>
                    </div>
                  </div>

                  {/* Log Content Card */}
                  <div className="bg-white hover:border-slate-200/80 rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Date */}
                        <span className="text-xs font-semibold text-slate-600 font-sans flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          {formatDate(entry.date)}
                        </span>
                        {/* Mood Label Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.color} ${config.textColor}`}>
                          {entry.customMoodName ? `Other: ${entry.customMoodName}` : config.label}
                        </span>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        id={`btn-delete-entry-${entry.id}`}
                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50/50 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete log entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left: User note response if any */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MessageCircle size={13} />
                          <span className="text-[10px] font-semibold uppercase tracking-wider font-sans">
                            Your Thoughts
                          </span>
                        </div>
                        {entry.note ? (
                          <div className="bg-slate-50/60 rounded-xl p-3.5 border border-slate-100">
                            {entry.notePrompt && (
                              <p className="text-[10px] text-slate-400 italic font-sans mb-1">
                                Prompt: &ldquo;{entry.notePrompt}&rdquo;
                              </p>
                            )}
                            <p className="text-slate-700 text-xs font-sans leading-relaxed whitespace-pre-wrap">
                              {entry.note}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs italic text-slate-400 pl-1 font-sans">
                            No notes were logged for this day.
                          </p>
                        )}
                      </div>

                      {/* Right: AI Reflection / coping tip / crisis safety / coping toolkit */}
                      <div className="space-y-3 lg:border-l lg:border-slate-100 lg:pl-4">
                        {entry.isCrisis ? (
                          <>
                            <div className="flex items-center gap-1.5 text-red-600 font-bold">
                              <AlertTriangle size={13} className="animate-pulse" />
                              <span className="text-[10px] font-black uppercase tracking-wider font-sans">
                                SECURITY GUARDRAIL: Crisis Support Activated
                              </span>
                            </div>
                            <div className="bg-gradient-to-br from-red-50 to-orange-50/40 border-2 border-red-400 rounded-xl p-3.5 shadow-inner space-y-2">
                              <p className="text-slate-800 text-xs font-bold font-sans">
                                Please reach out for support
                              </p>
                              <p className="text-slate-700 text-xs font-sans leading-relaxed">
                                {entry.reflection}
                              </p>
                              <div className="border-t border-red-100/60 pt-2 text-[10px] text-red-700 font-medium font-sans">
                                Support resources are available 24/7. Call or text <span className="font-mono bg-white border border-red-100 px-1 rounded">988</span> (US/Canada), or contact a trusted friend or helpline immediately.
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 text-indigo-500">
                              <Sparkles size={13} />
                              <span className="text-[10px] font-semibold uppercase tracking-wider font-sans">
                                Reflection & Coping Tip
                              </span>
                            </div>
                            <div className="bg-gradient-to-br from-indigo-50/20 via-purple-50/20 to-teal-50/10 border border-indigo-50 rounded-xl p-3.5 shadow-inner">
                              <p className="text-slate-700 text-xs font-sans leading-relaxed italic">
                                &ldquo;{entry.reflection}&rdquo;
                              </p>
                            </div>

                            {/* Coping Toolkit Skill Trigger */}
                            {entry.copingSkillActivated && entry.copingExercise && (
                              <div className="p-3.5 rounded-xl bg-teal-50/40 border border-teal-100/50 space-y-1.5 shadow-inner">
                                <div className="flex items-center gap-1.5 text-teal-800 font-bold text-[10px] uppercase tracking-wider font-sans">
                                  <Shield size={11} className="text-teal-600" />
                                  <span>Coping Toolkit Skill Activated</span>
                                </div>
                                <div className="text-slate-700 text-[11px] leading-relaxed whitespace-pre-line font-sans">
                                  {entry.copingExercise}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
