import { useMemo } from 'react';
import { MoodEntry, MOODS_CONFIG, MoodType } from '../types';
import { Award, BarChart2, Calendar, Smile } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsProps {
  entries: MoodEntry[];
}

export default function Stats({ entries }: StatsProps) {
  // Calculate Streak
  const streak = useMemo(() => {
    if (entries.length === 0) return 0;

    // Get unique dates sorted descending
    const uniqueDates = Array.from(new Set(entries.map(e => e.date))).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If the latest entry is neither today nor yesterday, streak is broken
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return 0;
    }

    let count = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = new Date(uniqueDates[i]);
      const next = new Date(uniqueDates[i + 1]);
      const diffTime = Math.abs(current.getTime() - next.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        count++;
      } else if (diffDays > 1) {
        break; // Streak broken
      }
    }
    return count;
  }, [entries]);

  // Calculate Mood breakdown
  const moodBreakdown = useMemo(() => {
    const total = entries.length;
    const counts: Record<MoodType, { count: number; percentage: number }> = {
      happy: { count: 0, percentage: 0 },
      sad: { count: 0, percentage: 0 },
      anxious: { count: 0, percentage: 0 },
      stressed: { count: 0, percentage: 0 },
      calm: { count: 0, percentage: 0 },
      others: { count: 0, percentage: 0 }
    };

    if (total === 0) return counts;

    entries.forEach((entry) => {
      if (counts[entry.mood]) {
        counts[entry.mood].count++;
      }
    });

    Object.keys(counts).forEach((key) => {
      const m = key as MoodType;
      counts[m].percentage = Math.round((counts[m].count / total) * 100);
    });

    return counts;
  }, [entries]);

  // Get dominant mood
  const dominantMood = useMemo(() => {
    if (entries.length === 0) return null;
    let maxCount = -1;
    let maxMood: MoodType | null = null;

    (Object.entries(moodBreakdown) as [MoodType, { count: number; percentage: number }][]).forEach(([key, val]) => {
      if (val.count > maxCount) {
        maxCount = val.count;
        maxMood = key;
      }
    });

    return maxMood;
  }, [entries, moodBreakdown]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-amber-100 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
            <Award size={18} />
          </div>
          <h3 className="font-sans font-medium text-slate-800 text-sm tracking-tight">Your Reflection Streak</h3>
        </div>

        <div className="flex items-baseline gap-2 my-auto py-2">
          <span className="text-5xl font-sans font-bold tracking-tight text-slate-800">{streak}</span>
          <span className="text-slate-500 text-sm font-medium">days in a row</span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed mt-4">
          {streak > 0
            ? 'Wonderful! Every log brings you closer to your inner harmony. Keep exploring your thoughts.'
            : 'Start logging today to build your streak and track your journey of self-compassion.'}
        </p>
      </motion.div>

      {/* Dominant Mood & Volume */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-emerald-100 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
            <Smile size={18} />
          </div>
          <h3 className="font-sans font-medium text-slate-800 text-sm tracking-tight">Emotional Landscape</h3>
        </div>

        <div className="flex flex-col gap-2 my-auto py-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-sans font-bold tracking-tight text-slate-800">{entries.length}</span>
            <span className="text-slate-500 text-sm font-medium">total entries</span>
          </div>

          {dominantMood && (
            <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-slate-50/70 border border-slate-100 rounded-xl w-fit">
              <span className="text-lg">{MOODS_CONFIG[dominantMood].emoji}</span>
              <span className="text-xs text-slate-600 font-sans">
                Most frequent: <span className="font-medium text-slate-800 capitalize">{MOODS_CONFIG[dominantMood].label}</span>
              </span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed mt-4">
          {entries.length > 0
            ? 'Your emotional patterns are unique. These reflections offer tools to guide your days.'
            : 'Your timeline is clean and ready. Add entries to unlock deep, supportive emotional summaries.'}
        </p>
      </motion.div>

      {/* Mood Distribution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-indigo-100 shadow-sm md:col-span-1"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
            <BarChart2 size={18} />
          </div>
          <h3 className="font-sans font-medium text-slate-800 text-sm tracking-tight">Mood Breakdown</h3>
        </div>

        {entries.length === 0 ? (
          <div className="h-28 flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5">
            <Calendar size={24} className="opacity-50" />
            <span>No log data to distribute yet.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {(Object.keys(MOODS_CONFIG) as MoodType[]).map((key) => {
              const config = MOODS_CONFIG[key];
              const stat = moodBreakdown[key];
              return (
                <div key={key} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <span>{config.emoji}</span>
                      <span className="capitalize">{config.label}</span>
                    </span>
                    <span className="text-slate-500 font-mono">
                      {stat.count} ({stat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${config.color.replace('bg-', 'bg-')}`}
                      style={{
                        backgroundColor: key === 'happy' ? '#f59e0b' : key === 'sad' ? '#3b82f6' : key === 'anxious' ? '#a855f7' : key === 'stressed' ? '#f43f5e' : key === 'calm' ? '#10b981' : '#6366f1'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
