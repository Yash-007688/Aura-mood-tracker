import { useState, useEffect } from 'react';
import { MoodEntry } from './types';
import MoodSelector from './components/MoodSelector';
import Stats from './components/Stats';
import Timeline from './components/Timeline';
import BreathingExercise from './components/BreathingExercise';
import { Sparkles, Heart, Activity, Compass, Wind } from 'lucide-react';
import { motion } from 'motion/react';

// Demo entries to populate on the first visit so the interface feels alive and helpful
const DEMO_ENTRIES: MoodEntry[] = [
  {
    id: 'demo-1',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // 2 days ago
    mood: 'happy',
    notePrompt: 'What is a little win you want to celebrate?',
    note: 'Finished reading a beautiful novel and cooked a delicious home-style dinner.',
    reflection: 'What a warm and fulfilling day! Savoring small moments of creative accomplishment is a beautiful form of self-love.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'demo-2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    mood: 'stressed',
    notePrompt: 'What is demanding too much of your energy today?',
    note: 'Felt overwhelmed by project deadlines and meetings stacked back-to-back.',
    reflection: 'Deadlines can place a heavy weight on your shoulders. Remember that your worth is not defined by constant productivity; please allow yourself to take slow, healing breaths.',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'demo-3',
    date: new Date().toISOString().split('T')[0], // Today
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

  // Load entries from localStorage or pre-populate with demos
  useEffect(() => {
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

  const handleSaveEntry = async (newEntry: Omit<MoodEntry, 'id' | 'createdAt'> & { reflection: string }) => {
    const entry: MoodEntry = {
      ...newEntry,
      id: `entry-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    // Check if an entry for the same date already exists.
    // If it does, we can keep both or replace. Let's keep both, but user can track multiple moods per day.
    const updatedEntries = [entry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('mood_tracker_entries', JSON.stringify(updatedEntries));
  };

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.filter((e) => e.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('mood_tracker_entries', JSON.stringify(updatedEntries));
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-indigo-50/20 to-teal-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Calming Pastel Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-teal-100 flex items-center justify-center shadow-inner">
              <Compass className="text-indigo-600/80 animate-pulse" size={24} />
            </div>
            <div>
              <h1 className="font-sans font-bold text-slate-800 text-2xl tracking-tight flex items-center gap-1.5">
                Aura <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full border border-indigo-100">Companion</span>
              </h1>
              <p className="text-slate-500 text-xs font-sans mt-0.5">
                Your gentle harbor for emotional reflection and mindful guidance
              </p>
            </div>
          </div>

          {/* Core Controls */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/40">
            <button
              onClick={() => setActiveTab('tracker')}
              id="btn-tab-tracker"
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tracker'
                  ? 'bg-white text-slate-800 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
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
                  ? 'bg-white text-slate-800 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wind size={14} />
              Breathing Oasis
            </button>
          </div>
        </header>

        {/* Dynamic Main Body based on current active tab */}
        {activeTab === 'tracker' ? (
          <div className="space-y-8">
            {/* Quick Stats overview */}
            <Stats entries={entries} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Logging & Box Breathing Mini-companion */}
              <div className="lg:col-span-7 space-y-6">
                <MoodSelector onSaveEntry={handleSaveEntry} recentHistory={entries} />
              </div>

              {/* Right Column: Mini Meditation and dynamic tip */}
              <div className="lg:col-span-5 space-y-6">
                <BreathingExercise />
                
                {/* AI-driven self-compassion widget */}
                <div className="bg-gradient-to-br from-indigo-50/50 via-teal-50/50 to-white rounded-2xl p-6 border border-indigo-100/50 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-indigo-600 animate-pulse" />
                    <h4 className="font-sans font-semibold text-slate-800 text-sm tracking-tight">Today's Wisdom</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                    &ldquo;Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.&rdquo;
                  </p>
                  <p className="text-[10px] text-slate-400 font-sans mt-2 italic">
                    — Thich Nhat Hanh
                  </p>
                </div>
              </div>
            </div>

            {/* Historical Timeline stream */}
            <div className="border-t border-slate-100 pt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-sans font-bold text-slate-800 text-base tracking-tight flex items-center gap-1.5">
                    <Heart size={16} className="text-rose-400" />
                    Your Emotional Journey
                  </h3>
                  <p className="text-slate-500 text-xs font-sans mt-0.5">
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
              <h2 className="text-2xl font-sans font-bold text-slate-800 tracking-tight">Gentle Box Breathing</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                A highly effective grounding exercise used by athletes, meditators, and leaders to instantly relieve physiological stress and restore mental clarity.
              </p>
            </div>
            <BreathingExercise />
            <div className="bg-white/80 rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-sans font-semibold text-slate-800 text-sm">How to Practice Box Breathing:</h3>
              <ol className="list-decimal list-inside space-y-3 text-xs text-slate-600 font-sans leading-relaxed">
                <li><strong className="text-slate-800">Inhale:</strong> Take a deep, slow breath through your nose as the circle expands, filling your lungs for 4 seconds.</li>
                <li><strong className="text-slate-800">Hold:</strong> Suspend your breath gently in your chest, keeping your shoulders relaxed for 4 seconds.</li>
                <li><strong className="text-slate-800">Exhale:</strong> Let the breath roll out of your mouth completely as the circle contracts, empty for 4 seconds.</li>
                <li><strong className="text-slate-800">Hold:</strong> Rest in the empty stillness at the bottom of the breath for 4 seconds before starting again.</li>
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
