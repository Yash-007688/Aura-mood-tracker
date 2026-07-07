import { useState, useEffect } from 'react';
import { MoodEntry } from './types';
import MoodSelector from './components/MoodSelector';
import Stats from './components/Stats';
import Timeline from './components/Timeline';
import BreathingExercise from './components/BreathingExercise';
import { Sparkles, Heart, Activity, Compass, Wind, Moon, Sun, Download, Upload } from 'lucide-react';

const DEMO_ENTRIES: MoodEntry[] = [
  {
    id: 'demo-1',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    mood: 'happy',
    notePrompt: 'What is a little win you want to celebrate?',
    note: 'Finished reading a beautiful novel and cooked a delicious home-style dinner.',
    reflection: 'What a warm and fulfilling day! Savoring small moments of creative accomplishment is a beautiful form of self-love.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'demo-2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    mood: 'stressed',
    notePrompt: 'What is demanding too much of your energy today?',
    note: 'Felt overwhelmed by project deadlines and meetings stacked back-to-back.',
    reflection: 'Deadlines can place a heavy weight on your shoulders. Remember that your worth is not defined by constant productivity; please allow yourself to take slow, healing breaths.',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'demo-3',
    date: new Date().toISOString().split('T')[0],
    mood: 'calm',
    notePrompt: 'What is keeping you grounded and peaceful today?',
    note: 'Took a morning walk under the cool shade of oak trees. Listened to birds.',
    reflection: 'Nature has a profound way of holding space for us. Immersing your senses in the quiet rustle of leaves is a wonderful way to ground your energy.',
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'tracker' | 'breathing'>('tracker');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Initialize Theme and Entries
  useEffect(() => {
    // Load dark mode
    const savedTheme = localStorage.getItem('aura_dark_mode');
    const isDark = savedTheme === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load entries
    const saved = localStorage.getItem('mood_tracker_entries');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing saved mood entries:', e);
        setEntries(DEMO_ENTRIES);
      }
    } else {
      setEntries(DEMO_ENTRIES);
      localStorage.setItem('mood_tracker_entries', JSON.stringify(DEMO_ENTRIES));
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('aura_dark_mode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSaveEntry = async (newEntry: Omit<MoodEntry, 'id' | 'createdAt'>) => {
    const entry: MoodEntry = {
      ...newEntry,
      id: `entry-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const updatedEntries = [entry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('mood_tracker_entries', JSON.stringify(updatedEntries));
  };

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.filter((e) => e.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('mood_tracker_entries', JSON.stringify(updatedEntries));
  };

  // Export Data Utilities
  const exportAsJSON = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aura-mood-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    const headers = ['Date', 'Mood', 'Custom Name', 'Prompt', 'Note', 'Reflection', 'Coping Skill Activated', 'Created At'];
    const rows = entries.map(e => [
      e.date,
      e.mood,
      e.customMoodName || '',
      `"${(e.notePrompt || '').replace(/"/g, '""')}"`,
      `"${(e.note || '').replace(/"/g, '""')}"`,
      `"${(e.reflection || '').replace(/"/g, '""')}"`,
      e.copingSkillActivated ? 'TRUE' : 'FALSE',
      e.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aura-mood-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import Data Utilities
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          // Basic verification
          const valid = imported.every(x => x.mood && x.date && x.id);
          if (valid) {
            setEntries(imported);
            localStorage.setItem('mood_tracker_entries', JSON.stringify(imported));
            alert('Your mood history has been imported successfully.');
          } else {
            alert('Invalid file format. Make sure it is a valid Aura backup.');
          }
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-indigo-50/20 to-teal-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-teal-100 dark:from-indigo-950 dark:to-teal-950 flex items-center justify-center shadow-inner">
              <Compass className="text-indigo-600/80 dark:text-indigo-400 animate-pulse" size={24} />
            </div>
            <div>
              <h1 className="font-sans font-bold text-slate-800 dark:text-slate-100 text-2xl tracking-tight flex items-center gap-1.5">
                Aura <span className="text-xs bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/60">Companion</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-sans mt-0.5">
                Your gentle harbor for emotional reflection and mindful guidance
              </p>
            </div>
          </div>

          {/* Controls Bar: Theme + Import/Export + Tabs */}
          <div className="flex flex-wrap items-center gap-3 justify-center">
            
            {/* Import/Export backup buttons */}
            <div className="flex bg-slate-100/85 dark:bg-slate-800/85 p-1 rounded-xl border border-slate-200/40 dark:border-slate-700/40 text-slate-600 dark:text-slate-300">
              <button
                onClick={exportAsJSON}
                className="p-1.5 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Backup Data (JSON)"
              >
                <Download size={14} />
              </button>
              <button
                onClick={exportAsCSV}
                className="p-1.5 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer text-xs font-bold font-mono px-2"
                title="Export Spreadsheet (CSV)"
              >
                CSV
              </button>
              <label
                className="p-1.5 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Restore Backup"
              >
                <Upload size={14} />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>

            {/* Dark Mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 bg-slate-100/85 dark:bg-slate-800/85 rounded-xl border border-slate-200/40 dark:border-slate-700/40 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Tab switchers */}
            <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/40 dark:border-slate-700/40">
              <button
                onClick={() => setActiveTab('tracker')}
                id="btn-tab-tracker"
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'tracker'
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Activity size={14} />
                Reflections
              </button>
              <button
                onClick={() => setActiveTab('breathing')}
                id="btn-tab-breathing"
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'breathing'
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Wind size={14} />
                Breathing Oasis
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        {activeTab === 'tracker' ? (
          <div className="space-y-8">
            {/* Analytics Dashboard Grid */}
            <Stats entries={entries} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Mood Selector/Logger */}
              <div className="lg:col-span-7 space-y-6">
                <MoodSelector onSaveEntry={handleSaveEntry} recentHistory={entries} />
              </div>

              {/* Box Breathing Mini Panel */}
              <div className="lg:col-span-5 space-y-6">
                <BreathingExercise />
                
                {/* Daily Quote widget */}
                <div className="bg-gradient-to-br from-indigo-50/50 via-teal-50/50 to-white dark:from-slate-900/30 dark:via-slate-900/10 dark:to-slate-900/40 rounded-2xl p-6 border border-indigo-100/50 dark:border-indigo-950/40 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                    <h4 className="font-sans font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-tight">Today's Wisdom</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                    &ldquo;Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.&rdquo;
                  </p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-sans mt-2 italic">
                    — Thich Nhat Hanh
                  </p>
                </div>
              </div>
            </div>

            {/* Historical Feed Timeline */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-sans font-bold text-slate-800 dark:text-slate-100 text-base tracking-tight flex items-center gap-1.5">
                    <Heart size={16} className="text-rose-450" />
                    Your Emotional Journey
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-sans mt-0.5">
                    Review your past entries and reread Gemini's comforting guidance
                  </p>
                </div>
              </div>
              <Timeline entries={entries} onDeleteEntry={handleDeleteEntry} />
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2 py-4">
              <h2 className="text-2xl font-sans font-bold text-slate-800 dark:text-slate-100 tracking-tight">Gentle Mindful Breathing</h2>
              <p className="text-xs text-slate-500 dark:text-slate-450 max-w-md mx-auto">
                Restore balance, lower heart rates, and stabilize nervous systems instantly by matching patterns with visual and auditory guides.
              </p>
            </div>
            <BreathingExercise />
            <div className="bg-white/80 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
              <h3 className="font-sans font-semibold text-slate-800 dark:text-slate-200 text-sm">How to Practice Mindful Breathing:</h3>
              <ol className="list-decimal list-inside space-y-3 text-xs text-slate-650 dark:text-slate-400 font-sans leading-relaxed">
                <li><strong className="text-slate-800 dark:text-slate-200">Select technique:</strong> Switch between Box Breathing, 4-7-8 Breathing, or Equal Breathing based on your current physical/mental needs.</li>
                <li><strong className="text-slate-800 dark:text-slate-200">Inhale:</strong> Take a deep, slow breath through your nose as the guiding circle expands, following instructions.</li>
                <li><strong className="text-slate-800 dark:text-slate-200">Sound feedback:</strong> Toggle the speaker icon in the guide to generate relaxing synthesized audio waves dynamically sync'd with your breathing.</li>
                <li><strong className="text-slate-800 dark:text-slate-200">Maintain focus:</strong> Bring your focus gently back to the breath whenever your mind drifts away.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-[11px] text-slate-400 font-sans pt-12 pb-4">
          <p>Created as a safe, comforting space. Aura is here to walk alongside your path to mindfulness.</p>
        </footer>

      </div>
    </div>
  );
}
