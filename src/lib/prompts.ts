import { MindfulPrompt } from '@/types';

export const PHOTO_PROMPTS: MindfulPrompt[] = [
  {
    id: 'photo-nature',
    type: 'photo',
    title: 'Nature\'s Beauty',
    description: 'Find something natural',
    instruction: 'Take a photo of a plant, flower, tree, or natural texture'
  },
  {
    id: 'photo-pattern',
    type: 'photo',
    title: 'Pattern Hunt',
    description: 'Look for interesting patterns',
    instruction: 'Capture a repeating pattern in your surroundings'
  },
  {
    id: 'photo-color',
    type: 'photo',
    title: 'Color Splash',
    description: 'Find vibrant colors',
    instruction: 'Photograph something with an interesting color combination'
  },
  {
    id: 'photo-texture',
    type: 'photo',
    title: 'Texture Discovery',
    description: 'Feel and observe textures',
    instruction: 'Take a photo of an interesting texture (rough, smooth, etc.)'
  },
  {
    id: 'photo-shape',
    type: 'photo',
    title: 'Shape Search',
    description: 'Notice geometric shapes',
    instruction: 'Find and photograph circles, squares, triangles in your environment'
  },
  {
    id: 'photo-light',
    type: 'photo',
    title: 'Light & Shadow',
    description: 'Observe lighting',
    instruction: 'Capture interesting light patterns or shadows'
  }
];

export const SENSORY_PROMPTS: MindfulPrompt[] = [
  {
    id: 'sensory-up',
    type: 'sensory',
    title: 'Look Up',
    description: 'Shift your gaze upward',
    instruction: 'Look up and notice 3 things you haven\'t seen before - clouds, buildings, birds'
  },
  {
    id: 'sensory-down',
    type: 'sensory',
    title: 'Look Down',
    description: 'Ground yourself',
    instruction: 'Look down and observe the ground texture, patterns, or small details'
  },
  {
    id: 'sensory-left',
    type: 'sensory',
    title: 'Look Left',
    description: 'Expand your awareness',
    instruction: 'Turn your head left and notice colors, shapes, and movements'
  },
  {
    id: 'sensory-right',
    type: 'sensory',
    title: 'Look Right',
    description: 'Broaden your perspective',
    instruction: 'Look right and find something interesting or beautiful'
  },
  {
    id: 'sensory-sound',
    type: 'sensory',
    title: 'Listen Deeply',
    description: 'Focus on sounds',
    instruction: 'Close your eyes and identify 3 different sounds around you'
  },
  {
    id: 'sensory-touch',
    type: 'sensory',
    title: 'Feel the World',
    description: 'Engage your sense of touch',
    instruction: 'Touch 3 different surfaces and notice their temperatures and textures'
  },
  {
    id: 'sensory-smell',
    type: 'sensory',
    title: 'Notice Scents',
    description: 'Awaken your sense of smell',
    instruction: 'Take 3 deep breaths and identify any scents in the air'
  },
  {
    id: 'sensory-color',
    type: 'sensory',
    title: 'Color Hunt',
    description: 'Find specific colors',
    instruction: 'Look for something blue, then green, then yellow in your surroundings'
  }
];

export const BREATHING_PROMPTS: MindfulPrompt[] = [
  {
    id: 'breath-4-7-8',
    type: 'breathing',
    title: '4-7-8 Breathing',
    description: 'Calm your nervous system',
    instruction: 'Breathe in for 4, hold for 7, exhale for 8. Repeat 3 times.'
  },
  {
    id: 'breath-box',
    type: 'breathing',
    title: 'Box Breathing',
    description: 'Find focus and balance',
    instruction: 'Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat 4 times.'
  },
  {
    id: 'breath-deep',
    type: 'breathing',
    title: 'Deep Belly Breathing',
    description: 'Release tension',
    instruction: 'Place hand on belly. Breathe deeply so your hand rises. Exhale slowly.'
  }
];

export const REFLECTION_PROMPTS: MindfulPrompt[] = [
  {
    id: 'reflection-gratitude',
    type: 'reflection',
    title: 'Gratitude Moment',
    description: 'Practice thankfulness',
    instruction: 'Think of 3 things you\'re grateful for right now'
  },
  {
    id: 'reflection-body',
    type: 'reflection',
    title: 'Body Check-in',
    description: 'Connect with your body',
    instruction: 'Notice how your feet feel, then scan up through your entire body'
  },
  {
    id: 'reflection-intention',
    type: 'reflection',
    title: 'Set an Intention',
    description: 'Focus your mind',
    instruction: 'What do you want to bring to the rest of your walk? Set a simple intention.'
  }
];

export function getRandomPrompt(settings: {
  photoPrompts: boolean;
  sensoryExercises: boolean;
  breathingExercises: boolean;
  reflectionExercises: boolean;
}): MindfulPrompt {
  const availablePrompts: MindfulPrompt[] = [];
  
  if (settings.photoPrompts) availablePrompts.push(...PHOTO_PROMPTS);
  if (settings.sensoryExercises) availablePrompts.push(...SENSORY_PROMPTS);
  if (settings.breathingExercises) availablePrompts.push(...BREATHING_PROMPTS);
  if (settings.reflectionExercises) availablePrompts.push(...REFLECTION_PROMPTS);
  
  if (availablePrompts.length === 0) {
    return SENSORY_PROMPTS[0]; // fallback
  }
  
  return availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
}

export function getRandomStepsInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}