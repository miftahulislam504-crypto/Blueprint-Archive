export interface SkillCategory {
  name: string;
  color: string;
  skills: string[];
}

// Starter data grounded in what's actually been used across CIVION, this
// project, Chemistry Unfiltered, BrotherFit, and the CivilOS/EngineX
// ecosystem. The original plan listed 10 separate categories (Frontend,
// Backend, Database, 3D, Graphics, Cloud, AI, Engineering, Programming,
// Animation) — merged some of those here since several would've been thin
// or overlapping (e.g. Database folded into Backend, Graphics into 3D).
// Split them back out any time; nothing else depends on there being
// exactly six.
export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: 'Frontend',
    color: '#5CE1FF',
    skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    name: 'Backend & Database',
    color: '#7ef2a8',
    skills: ['Firebase', 'Firestore', 'Firebase Auth'],
  },
  {
    name: '3D & Graphics',
    color: '#4B3F9E',
    skills: ['Three.js', 'React Three Fiber', 'Drei', 'GLSL Shaders'],
  },
  {
    name: 'Animation',
    color: '#ff9ecb',
    skills: ['GSAP', 'Lenis', 'Framer Motion'],
  },
  {
    name: 'State & Tooling',
    color: '#ffd166',
    skills: ['Zustand', 'Git (browser-based)', 'Vercel'],
  },
  {
    name: 'Engineering',
    color: '#e0e0e0',
    skills: ['BNBC 2020', 'ACI 318-19', 'Structural Analysis'],
  },
];
