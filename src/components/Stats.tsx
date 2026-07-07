import { useMemo, useState } from 'react';
import { MoodEntry, MOODS_CONFIG, MoodType } from '../types';
import { Award, BarChart2, Calendar, Smile, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StatsProps {
  entries: MoodEntry[];
}

const MOOD_VALUES: Record<MoodType, number> = {
  happy: 5,
  calm: 4,
  others: 3,
  sad: 2,
  anxious: 2,
  stressed: 1
};

export default function Stats({ entries }: StatsProps) {
  const [weeklyReport, setWeeklyReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; entry: MoodEntry } | null>(null);

  // Calculate Streak
  const streak = useMemo(() => {
    if (entries.length === 0) return 0;

    const uniqueDates = Array.from(new Set(entries.map(e => e.date))).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

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
        break;
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

  // Custom SVG Line Chart Data
  const chartData = useMemo(() => {
    if (entries.length === 0) return [];
    // Sort oldest to newest, limit to last 7 entries
    return [...entries]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-7);
  }, [entries]);

  const svgDimensions = { width: 500, height: 160, padding: 25 };

  const svgPath = useMemo(() => {
    if (chartData.length < 2) return '';
    const points = chartData.map((entry, index) => {
      const x = svgDimensions.padding + (index * (svgDimensions.width - svgDimensions.padding * 2)) / (chartData.length - 1);
      const val = MOOD_VALUES[entry.mood];
      const y = svgDimensions.height - svgDimensions.padding - ((val - 1) * (svgDimensions.height - svgDimensions.padding * 2)) / 4;
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Control points for smooth bezier curve
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY2 = points[i].y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }
    return path;
  }, [chartData]);

  const svgAreaPath = useMemo(() => {
    if (chartData.length < 2) return '';
    const points = chartData.map((entry, index) => {
      const x = svgDimensions.padding + (index * (svgDimensions.width - svgDimensions.padding * 2)) / (chartData.length - 1);
      const val = MOOD_VALUES[entry.mood];
      const y = svgDimensions.height - svgDimensions.padding - ((val - 1) * (svgDimensions.height - svgDimensions.padding * 2)) / 4;
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY2 = points[i].y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }
    // Close the area path to the bottom of the chart
    path += ` L ${points[points.length - 1].x} ${svgDimensions.height - svgDimensions.padding}`;
    path += ` L ${points[0].x} ${svgDimensions.height - svgDimensions.padding} Z`;
    return path;
  }, [chartData]);

  const generateWeeklyReport = async () => {
    if (entries.length === 0) return;
    setIsGeneratingReport(true);
    setReportError(null);
    try {
      const response = await fetch('/api/generate-weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: entries })
      });
      if (!response.ok) {
        throw new Error('Failed to generate weekly wellness report.');
      }
      const data = await response.json();
      setWeeklyReport(data.report);
    } catch (err: any) {
      setReportError(err.message || 'An error occurred.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-amber-100 dark:border-amber-950/40 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-600 dark:text-amber-400">
              <Award size={18} />
            </div>
            <h3 className="font-sans font-medium text-slate-800 dark:text-slate-200 text-sm tracking-tight">Your Reflection Streak</h3>
          </div>

          <div className="flex items-baseline gap-2 my-auto py-2">
            <span className="text-5xl font-sans font-bold tracking-tight text-slate-800 dark:text-slate-100">{streak}</span>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">days in a row</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-4">
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
          className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-emerald-100 dark:border-emerald-950/40 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Smile size={18} />
            </div>
            <h3 className="font-sans font-medium text-slate-800 dark:text-slate-200 text-sm tracking-tight">Emotional Landscape</h3>
          </div>

          <div className="flex flex-col gap-2 my-auto py-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-sans font-bold tracking-tight text-slate-800 dark:text-slate-100">{entries.length}</span>
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">total entries</span>
            </div>

            {dominantMood && (
              <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-slate-50/70 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 rounded-xl w-fit">
                <span className="text-lg">{MOODS_CONFIG[dominantMood].emoji}</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-sans">
                  Most frequent: <span className="font-medium text-slate-800 dark:text-slate-100 capitalize">{MOODS_CONFIG[dominantMood].label}</span>
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-4">
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
          className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-indigo-100 dark:border-indigo-950/40 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
              <BarChart2 size={18} />
            </div>
            <h3 className="font-sans font-medium text-slate-800 dark:text-slate-200 text-sm tracking-tight">Mood Breakdown</h3>
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
                      <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                        <span>{config.emoji}</span>
                        <span className="capitalize">{config.label}</span>
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">
                        {stat.count} ({stat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
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

      {/* SVG Mood Flow & Gemini Wellness Report */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Custom SVG Line Chart */}
          <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-150 dark:border-slate-800 shadow-sm lg:col-span-7 flex flex-col justify-between">
            <div>
              <h3 className="font-sans font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-tight mb-1 flex items-center gap-1.5">
                <span>Mood Flow Over Time</span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-full text-slate-500 font-normal">Last 7 logs</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-sans mb-4">
                Hover over the waves to inspect specific notes.
              </p>
            </div>

            <div className="relative flex justify-center items-center py-2 bg-slate-50/40 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 rounded-xl overflow-visible">
              {chartData.length < 2 ? (
                <div className="h-36 flex items-center justify-center text-xs text-slate-400">
                  Add more logs to visualize your emotional flow.
                </div>
              ) : (
                <div className="relative w-full max-w-[500px]">
                  <svg viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`} className="overflow-visible w-full h-auto">
                    <defs>
                      <linearGradient id="moodAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Guideline waves */}
                    {[1, 2, 3, 4, 5].map((val) => {
                      const y = svgDimensions.height - svgDimensions.padding - ((val - 1) * (svgDimensions.height - svgDimensions.padding * 2)) / 4;
                      return (
                        <g key={val}>
                          <line
                            x1={svgDimensions.padding}
                            y1={y}
                            x2={svgDimensions.width - svgDimensions.padding}
                            y2={y}
                            stroke="#e2e8f0"
                            className="dark:stroke-slate-800"
                            strokeDasharray="4 4"
                          />
                        </g>
                      );
                    })}

                    {/* Gradient Fill under the line */}
                    <path d={svgAreaPath} fill="url(#moodAreaGrad)" />

                    {/* The Smooth Trend Line */}
                    <path d={svgPath} fill="none" stroke="url(#trendLineGrad)" strokeWidth="3.5" strokeLinecap="round" />
                    <linearGradient id="trendLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>

                    {/* Interactive nodes */}
                    {chartData.map((entry, index) => {
                      const x = svgDimensions.padding + (index * (svgDimensions.width - svgDimensions.padding * 2)) / (chartData.length - 1);
                      const val = MOOD_VALUES[entry.mood];
                      const y = svgDimensions.height - svgDimensions.padding - ((val - 1) * (svgDimensions.height - svgDimensions.padding * 2)) / 4;
                      const config = MOODS_CONFIG[entry.mood];

                      return (
                        <g key={entry.id} className="cursor-pointer">
                          <circle
                            cx={x}
                            cy={y}
                            r="6"
                            fill="#ffffff"
                            stroke={val > 3 ? '#10b981' : val === 3 ? '#6366f1' : '#f43f5e'}
                            strokeWidth="3.5"
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredPoint({
                                x: x,
                                y: y - 10,
                                entry
                              });
                            }}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Tooltip Overlay */}
                  <AnimatePresence>
                    {hoveredPoint && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bg-slate-900/95 backdrop-blur text-white text-[10px] p-3 rounded-xl shadow-xl z-30 max-w-[200px] pointer-events-none border border-slate-700/50"
                        style={{
                          left: `${(hoveredPoint.x / svgDimensions.width) * 100}%`,
                          top: `${(hoveredPoint.y / svgDimensions.height) * 100}%`,
                          transform: 'translate(-50%, -100%)'
                        }}
                      >
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <span>{MOODS_CONFIG[hoveredPoint.entry.mood].emoji}</span>
                          <span className="capitalize">{MOODS_CONFIG[hoveredPoint.entry.mood].label}</span>
                          <span className="text-[9px] font-normal text-slate-400 font-mono ml-auto">
                            {new Date(hoveredPoint.entry.date).toLocaleDateString()}
                          </span>
                        </div>
                        {hoveredPoint.entry.note ? (
                          <p className="italic text-slate-200 line-clamp-3">
                            "{hoveredPoint.entry.note}"
                          </p>
                        ) : (
                          <span className="text-slate-400 italic">No notes written.</span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Gemini Weekly report compilation */}
          <div className="bg-gradient-to-br from-indigo-50/30 to-teal-50/20 dark:from-slate-900/40 dark:to-slate-900/20 backdrop-blur-md rounded-2xl p-6 border border-indigo-100/50 dark:border-slate-800/80 shadow-sm lg:col-span-5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <h3 className="font-sans font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-tight flex items-center gap-1.5">
                <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>Weekly AI Wellness Companion</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-sans leading-relaxed">
                Allow Gemini to review your entries and compile deep self-care reflections, patterns, and wellness micro-goals.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto max-h-48 custom-scrollbar">
              {weeklyReport ? (
                <div className="p-4 bg-white/70 dark:bg-slate-950/40 border border-indigo-50 dark:border-slate-900 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed whitespace-pre-wrap select-text markdown-content">
                  {weeklyReport}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <Sparkles size={24} className="opacity-30 mb-1" />
                  <span className="text-[10px]">Click below to create your Aura wellness summary report.</span>
                </div>
              )}
            </div>

            {reportError && (
              <div className="flex items-center gap-1.5 text-rose-500 text-[10px] bg-rose-50/50 p-2 rounded-lg">
                <AlertCircle size={12} />
                <span>{reportError}</span>
              </div>
            )}

            <button
              onClick={generateWeeklyReport}
              disabled={isGeneratingReport || entries.length === 0}
              className="w-full py-2.5 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 hover:bg-slate-900 dark:hover:bg-white disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 cursor-pointer shadow-sm"
            >
              {isGeneratingReport ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  Weaving Report...
                </>
              ) : (
                <>
                  <Sparkles size={12} />
                  Compile Weekly Report
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
