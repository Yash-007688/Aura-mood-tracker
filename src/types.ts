export type MoodType = 'happy' | 'sad' | 'anxious' | 'stressed' | 'calm' | 'others';

export interface MoodConfig {
  type: MoodType;
  label: string;
  emoji: string;
  color: string; // Tailwind bg color (pastel)
  textColor: string; // Tailwind text color
  borderColor: string; // Tailwind border color
  hoverColor: string; // Tailwind hover color
  prompts: string[];
}

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  mood: MoodType;
  customMoodName?: string;
  notePrompt: string;
  note: string;
  reflection: string;
  createdAt: string;
  copingSkillActivated?: boolean;
  copingExercise?: string;
  isCrisis?: boolean;
}

export const MOODS_CONFIG: Record<MoodType, MoodConfig> = {
  happy: {
    type: 'happy',
    label: 'Happy',
    emoji: '☀️',
    color: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    hoverColor: 'hover:bg-amber-100/70',
    prompts: [
      'What brought a smile to your face today?',
      'Is there something or someone you are grateful for today?',
      'What is a little win you want to celebrate?',
      'How can you keep this beautiful energy flowing?'
    ]
  },
  sad: {
    type: 'sad',
    label: 'Sad',
    emoji: '🌧️',
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-100/70',
    prompts: [
      'Do you want to talk about it?',
      'What is feeling heavy on your heart today?',
      'What is one kind thing you can do for yourself right now?',
      'Is there a comforting thought you want to write down?'
    ]
  },
  anxious: {
    type: 'anxious',
    label: 'Anxious',
    emoji: '🍃',
    color: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:bg-purple-100/70',
    prompts: [
      'What is spinning in your mind right now?',
      'Let\'s ground ourselves. What are 3 gentle things you can see or feel around you?',
      'What is a worry you would like to release today?',
      'If your anxiety had a voice, what would it be trying to protect you from?'
    ]
  },
  stressed: {
    type: 'stressed',
    label: 'Stressed',
    emoji: '⚡',
    color: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    hoverColor: 'hover:bg-rose-100/70',
    prompts: [
      'What is demanding too much of your energy today?',
      'What is one small task you can let go of or delegate for now?',
      'How does your body feel right now? Where are you holding tension?',
      'What does taking a 5-minute break look like for you today?'
    ]
  },
  calm: {
    type: 'calm',
    label: 'Calm',
    emoji: '🌸',
    color: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    hoverColor: 'hover:bg-emerald-100/70',
    prompts: [
      'What is keeping you grounded and peaceful today?',
      'How can you carry this gentle peace with you into tomorrow?',
      'Describe the environment around you that feels soothing.',
      'What is a gentle sensory detail (a sound, scent, or sight) you are enjoying?'
    ]
  },
  others: {
    type: 'others',
    label: 'Something Else',
    emoji: '🔮',
    color: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    hoverColor: 'hover:bg-indigo-100/70',
    prompts: [
      'How would you describe your unique feeling today?',
      'What is on your mind that doesn\'t fit standard labels?',
      'What feels most true for you in this exact moment?',
      'Is there an emotion you are still trying to understand?'
    ]
  }
};

export type BreathingTechnique = 'box' | '478' | 'equal';

export interface TechniqueConfig {
  name: string;
  description: string;
  phases: {
    name: string;
    duration: number;
    scale: number;
    color: string;
    instruction: string;
  }[];
}

export const BREATHING_TECHNIQUES: Record<BreathingTechnique, TechniqueConfig> = {
  box: {
    name: 'Box Breathing',
    description: 'Relieve stress, clear the mind, and balance energy.',
    phases: [
      { name: 'Inhale', duration: 4, scale: 1.5, color: 'bg-emerald-200/40 border-emerald-400', instruction: 'Breathe in slowly through your nose...' },
      { name: 'Hold (In)', duration: 4, scale: 1.5, color: 'bg-teal-200/40 border-teal-400', instruction: 'Gently suspend your breath...' },
      { name: 'Exhale', duration: 4, scale: 1.0, color: 'bg-sky-200/40 border-sky-400', instruction: 'Exhale fully, letting go of tension...' },
      { name: 'Hold (Out)', duration: 4, scale: 1.0, color: 'bg-purple-200/40 border-purple-400', instruction: 'Rest in the quiet stillness...' }
    ]
  },
  '478': {
    name: '4-7-8 Breathing',
    description: 'Act as a natural tranquilizer for the nervous system.',
    phases: [
      { name: 'Inhale', duration: 4, scale: 1.4, color: 'bg-emerald-200/40 border-emerald-400', instruction: 'Inhale quietly through your nose for 4s...' },
      { name: 'Hold', duration: 7, scale: 1.5, color: 'bg-teal-200/40 border-teal-400', instruction: 'Hold your breath for 7s...' },
      { name: 'Exhale', duration: 8, scale: 1.0, color: 'bg-sky-200/40 border-sky-400', instruction: 'Exhale completely with a whoosh sound for 8s...' }
    ]
  },
  equal: {
    name: 'Equal Breathing (Sama Vritti)',
    description: 'Establish a steady, calming rhythm for focus and balance.',
    phases: [
      { name: 'Inhale', duration: 4, scale: 1.5, color: 'bg-emerald-200/40 border-emerald-400', instruction: 'Breathe in steadily for 4s...' },
      { name: 'Exhale', duration: 4, scale: 1.0, color: 'bg-sky-200/40 border-sky-400', instruction: 'Breathe out steadily for 4s...' }
    ]
  }
};

