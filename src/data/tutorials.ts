export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  action?: () => void;
  duration?: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  category: 'getting-started' | 'recording' | 'editing' | 'audio' | '3d' | 'export';
  steps: TutorialStep[];
  prerequisites?: string[];
  tags: string[];
}

export const TUTORIALS: Tutorial[] = [
  // ============================================================
  // GETTING STARTED
  // ============================================================
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of Happy Recorder 3D',
    icon: '🚀',
    duration: '2:30',
    level: 'beginner',
    completed: false,
    category: 'getting-started',
    tags: ['basics', 'introduction'],
    steps: [
      {
        id: 'step-1',
        title: 'Welcome to Happy Recorder 3D',
        description: 'Happy Recorder 3D is an open-source screen recorder with a joyful 3D interface. Let\'s get started!',
        duration: '0:30',
      },
      {
        id: 'step-2',
        title: 'Understanding the Interface',
        description: 'The main interface has 6 sections: Home, Record, Editor, Recordings, Tutorials, and Settings.',
        duration: '1:00',
      },
      {
        id: 'step-3',
        title: 'Your First Recording',
        description: 'Click the "START RECORDING" button on the home screen to begin your first recording.',
        duration: '1:00',
      },
    ],
  },
  {
    id: 'record-screen',
    title: 'Record Your Screen',
    description: 'How to capture your screen with different modes',
    icon: '🎥',
    duration: '3:15',
    level: 'beginner',
    completed: false,
    category: 'recording',
    tags: ['screen', 'recording'],
    steps: [
      {
        id: 'step-1',
        title: 'Choosing Screen Mode',
        description: 'Select between: Full Screen, Window, Region, or Monitor.',
        duration: '0:45',
      },
      {
        id: 'step-2',
        title: 'Selecting a Region',
        description: 'For region recording, click and drag to select the area you want to capture.',
        duration: '0:45',
      },
      {
        id: 'step-3',
        title: 'Recording Settings',
        description: 'Adjust quality (720p/1080p/4K) and FPS (30/60/120) before recording.',
        duration: '0:45',
      },
      {
        id: 'step-4',
        title: 'Start Recording',
        description: 'Click "START RECORDING" and a 3-second countdown will begin before recording starts.',
        duration: '1:00',
      },
    ],
  },
  {
    id: 'record-camera',
    title: 'Record Your Camera',
    description: 'Add camera overlay to your recordings',
    icon: '📷',
    duration: '4:00',
    level: 'beginner',
    completed: false,
    category: 'recording',
    tags: ['camera', 'overlay'],
    steps: [
      {
        id: 'step-1',
        title: 'Enabling Camera',
        description: 'Toggle the Camera switch in the Record screen to enable camera recording.',
        duration: '0:30',
      },
      {
        id: 'step-2',
        title: 'Camera Position',
        description: 'Choose where your camera appears: Top-Left, Top-Right, Bottom-Left, Bottom-Right, or Center.',
        duration: '0:45',
      },
      {
        id: 'step-3',
        title: 'Camera Shape',
        description: 'Choose between Circle, Rounded, or Square shapes for your camera overlay.',
        duration: '0:45',
      },
      {
        id: 'step-4',
        title: 'Camera Border',
        description: 'Add a border with custom color to make your camera feed stand out.',
        duration: '0:30',
      },
      {
        id: 'step-5',
        title: 'Recording with Camera',
        description: 'Your camera will appear as a picture-in-picture overlay during recording.',
        duration: '1:30',
      },
    ],
  },

  // ============================================================
  // EDITING
  // ============================================================
  {
    id: 'edit-recording',
    title: 'Edit a Recording',
    description: 'Trim, cut, and enhance your videos',
    icon: '✂️',
    duration: '5:20',
    level: 'intermediate',
    completed: false,
    category: 'editing',
    tags: ['editing', 'trim', 'cut'],
    prerequisites: ['getting-started'],
    steps: [
      {
        id: 'step-1',
        title: 'Opening the Editor',
        description: 'After stopping a recording, you\'ll be taken to the Editor automatically. You can also open any recording from the Recordings library.',
        duration: '0:30',
      },
      {
        id: 'step-2',
        title: 'Using the Timeline',
        description: 'The timeline shows your video as clips. Drag the playhead to navigate, or use the play/pause buttons.',
        duration: '1:00',
      },
      {
        id: 'step-3',
        title: 'Trimming a Clip',
        description: 'Select the Trim tool, then drag the edges of a clip to trim the start or end.',
        duration: '1:00',
      },
      {
        id: 'step-4',
        title: 'Cutting a Clip',
        description: 'Select the Cut tool and click on the timeline to split a clip into two parts.',
        duration: '0:45',
      },
      {
        id: 'step-5',
        title: 'Splitting Clips',
        description: 'Use the Split tool to divide a clip at a specific point, allowing you to remove sections.',
        duration: '0:45',
      },
      {
        id: 'step-6',
        title: 'Crop and Resize',
        description: 'Select the Crop tool to adjust the dimensions of your video.',
        duration: '1:20',
      },
    ],
  },
  {
    id: 'background-music',
    title: 'Add Background Music',
    description: 'Import and edit music for your recordings',
    icon: '🎵',
    duration: '3:45',
    level: 'intermediate',
    completed: false,
    category: 'audio',
    tags: ['music', 'audio'],
    steps: [
      {
        id: 'step-1',
        title: 'Importing Music',
        description: 'Click "Add Music" in the Editor and select an audio file from your computer.',
        duration: '0:30',
      },
      {
        id: 'step-2',
        title: 'Adjusting Volume',
        description: 'Use the volume slider to balance your voice, system audio, and music.',
        duration: '0:45',
      },
      {
        id: 'step-3',
        title: 'Fade In/Out',
        description: 'Add a smooth fade in at the start and fade out at the end of your music.',
        duration: '0:45',
      },
      {
        id: 'step-4',
        title: 'Trimming Music',
        description: 'Trim your music to fit your video length exactly.',
        duration: '0:45',
      },
      {
        id: 'step-5',
        title: 'Looping Music',
        description: 'Enable loop to have your music repeat if your video is longer than the track.',
        duration: '1:00',
      },
    ],
  },

  // ============================================================
  // 3D FEATURES
  // ============================================================
  {
    id: '3d-elements',
    title: 'Add 3D Elements',
    description: 'Incorporate 3D objects into your videos',
    icon: '🧊',
    duration: '6:10',
    level: 'advanced',
    completed: false,
    category: '3d',
    tags: ['3d', 'threejs', 'animation'],
    steps: [
      {
        id: 'step-1',
        title: 'Understanding 3D in Happy Recorder',
        description: 'Happy Recorder 3D uses Three.js to render 3D objects. You can add cubes, spheres, devices, and more.',
        duration: '0:45',
      },
      {
        id: 'step-2',
        title: 'Adding a 3D Object',
        description: 'In the Editor, click the "3D Element" button and choose from Cube, Sphere, Pyramid, Device, or Network Node.',
        duration: '0:45',
      },
      {
        id: 'step-3',
        title: 'Positioning 3D Objects',
        description: 'Drag objects in the 3D preview or adjust X, Y, Z coordinates to position them.',
        duration: '1:00',
      },
      {
        id: 'step-4',
        title: 'Animating 3D Objects',
        description: 'Add animations like Spin, Float, Bounce, or Pulse to make your 3D objects come alive.',
        duration: '1:30',
      },
      {
        id: 'step-5',
        title: 'Device Models',
        description: 'Use the Device model to add a laptop, monitor, phone, or tablet to explain a concept.',
        duration: '1:00',
      },
      {
        id: 'step-6',
        title: 'Network Node Visualization',
        description: 'Create network diagrams with nodes and connections to explain system architecture.',
        duration: '1:10',
      },
    ],
  },

  // ============================================================
  // EXPORT
  // ============================================================
  {
    id: 'export-video',
    title: 'Export Your Video',
    description: 'Export recordings in different formats',
    icon: '📤',
    duration: '2:50',
    level: 'beginner',
    completed: false,
    category: 'export',
    tags: ['export', 'render'],
    steps: [
      {
        id: 'step-1',
        title: 'Export Settings',
        description: 'Choose your export format (MP4, MOV, AVI), quality, and resolution.',
        duration: '0:45',
      },
      {
        id: 'step-2',
        title: 'Export Progress',
        description: 'Watch the export progress bar as your video is rendered and encoded.',
        duration: '0:45',
      },
      {
        id: 'step-3',
        title: 'Finding Your Video',
        description: 'Exported videos are saved in the HappyRecorder3D/Exports folder or your custom export path.',
        duration: '0:45',
      },
      {
        id: 'step-4',
        title: 'Sharing Your Video',
        description: 'Share your exported video via email, upload to YouTube, or send to your team.',
        duration: '0:35',
      },
    ],
  },

  // ============================================================
  // CODE SNAPSHOTS
  // ============================================================
  {
    id: 'code-snapshots',
    title: 'Code Snapshots',
    description: 'Capture code during your recordings',
    icon: '💻',
    duration: '4:30',
    level: 'intermediate',
    completed: false,
    category: 'recording',
    tags: ['code', 'snapshot', 'developer'],
    steps: [
      {
        id: 'step-1',
        title: 'What are Code Snapshots?',
        description: 'Code snapshots let you capture code at specific moments during your recording for later reference.',
        duration: '0:45',
      },
      {
        id: 'step-2',
        title: 'Taking a Snapshot',
        description: 'While recording, click the "Add Code Snapshot" button and select a file from your project.',
        duration: '0:45',
      },
      {
        id: 'step-3',
        title: 'Selecting Lines',
        description: 'You can highlight specific lines of code to focus on the most important parts.',
        duration: '0:45',
      },
      {
        id: 'step-4',
        title: 'Adding Notes',
        description: 'Add notes to your snapshots explaining what you\'re showing.',
        duration: '0:45',
      },
      {
        id: 'step-5',
        title: 'Git Integration',
        description: 'Snapshots automatically capture Git commit and branch info for context.',
        duration: '0:45',
      },
      {
        id: 'step-6',
        title: 'Exporting Snapshots',
        description: 'Export all snapshots from a recording as a JSON file for documentation.',
        duration: '0:45',
      },
    ],
  },

  // ============================================================
  // PROJECT MODE
  // ============================================================
  {
    id: 'project-mode',
    title: 'Project Mode',
    description: 'Record school and work projects with metadata',
    icon: '📁',
    duration: '3:00',
    level: 'beginner',
    completed: false,
    category: 'recording',
    tags: ['project', 'metadata'],
    steps: [
      {
        id: 'step-1',
        title: 'What is Project Mode?',
        description: 'Project Mode is designed for school, college, engineering, and workplace projects with metadata tracking.',
        duration: '0:30',
      },
      {
        id: 'step-2',
        title: 'Setting Project Details',
        description: 'Enter your Project Name and Purpose (Demonstration, Presentation, Assignment, etc.).',
        duration: '0:45',
      },
      {
        id: 'step-3',
        title: 'Recording with Context',
        description: 'Project metadata is saved with your recording, making it easy to organize.',
        duration: '0:45',
      },
      {
        id: 'step-4',
        title: 'Finding Project Recordings',
        description: 'Filter recordings by Project mode to find all your project-related content.',
        duration: '1:00',
      },
    ],
  },

  // ============================================================
  // BUG REPORT MODE
  // ============================================================
  {
    id: 'bug-report',
    title: 'Bug Report Mode',
    description: 'Create professional bug reports with video',
    icon: '🐛',
    duration: '3:15',
    level: 'intermediate',
    completed: false,
    category: 'recording',
    tags: ['bug', 'report', 'developer'],
    steps: [
      {
        id: 'step-1',
        title: 'What is Bug Report Mode?',
        description: 'Bug Report Mode helps developers create detailed bug reports with video evidence.',
        duration: '0:30',
      },
      {
        id: 'step-2',
        title: 'Bug Details',
        description: 'Enter the Bug Title, Application Name, and Version to provide context.',
        duration: '0:45',
      },
      {
        id: 'step-3',
        title: 'Recording the Bug',
        description: 'Record the steps to reproduce the bug, capturing the screen and your explanation.',
        duration: '0:45',
      },
      {
        id: 'step-4',
        title: 'Exporting Bug Reports',
        description: 'Export your bug report with video and metadata for your team or issue tracker.',
        duration: '1:15',
      },
    ],
  },

  // ============================================================
  // TUTORIAL MODE
  // ============================================================
  {
    id: 'tutorial-mode',
    title: 'Tutorial Mode',
    description: 'Create instructional content with cursor effects',
    icon: '🎓',
    duration: '4:00',
    level: 'intermediate',
    completed: false,
    category: 'recording',
    tags: ['tutorial', 'teaching', 'cursor'],
    steps: [
      {
        id: 'step-1',
        title: 'What is Tutorial Mode?',
        description: 'Tutorial Mode is optimized for creating instructional content with enhanced cursor effects.',
        duration: '0:30',
      },
      {
        id: 'step-2',
        title: 'Cursor Highlighting',
        description: 'Enable cursor highlighting to make your pointer visible to viewers.',
        duration: '0:45',
      },
      {
        id: 'step-3',
        title: 'Click Effects',
        description: 'Click effects show visual feedback when you click, making it clear what you\'re selecting.',
        duration: '0:45',
      },
      {
        id: 'step-4',
        title: 'Zoom Effects',
        description: 'Enable zoom effects to focus on specific areas of the screen.',
        duration: '0:45',
      },
      {
        id: 'step-5',
        title: 'Keyboard Display',
        description: 'Show keyboard shortcuts on screen as you press them.',
        duration: '0:45',
      },
      {
        id: 'step-6',
        title: 'Creating Great Tutorials',
        description: 'Tips for creating engaging tutorials: plan your content, speak clearly, and use visual aids.',
        duration: '0:30',
      },
    ],
  },

  // ============================================================
  // KEYBOARD SHORTCUTS
  // ============================================================
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Learn all the keyboard shortcuts',
    icon: '⌨️',
    duration: '2:00',
    level: 'beginner',
    completed: false,
    category: 'getting-started',
    tags: ['shortcuts', 'hotkeys'],
    steps: [
      {
        id: 'step-1',
        title: 'Recording Shortcuts',
        description: 'Ctrl+R: Start Recording, Ctrl+Shift+R: Stop Recording, Ctrl+P: Pause/Resume.',
        duration: '0:30',
      },
      {
        id: 'step-2',
        title: 'Editor Shortcuts',
        description: 'Ctrl+S: Save Project, Ctrl+Z: Undo, Ctrl+Shift+Z: Redo, Space: Play/Pause.',
        duration: '0:30',
      },
      {
        id: 'step-3',
        title: 'Navigation Shortcuts',
        description: 'Ctrl+1-6: Navigate between screens (Home, Record, Editor, Recordings, Tutorials, Settings).',
        duration: '0:30',
      },
      {
        id: 'step-4',
        title: 'Customizing Shortcuts',
        description: 'Go to Settings > Shortcuts to customize keyboard shortcuts to your preference.',
        duration: '0:30',
      },
    ],
  },

  // ============================================================
  // PERFORMANCE TIPS
  // ============================================================
  {
    id: 'performance-tips',
    title: 'Performance Tips',
    description: 'Optimize performance for smooth recording',
    icon: '⚡',
    duration: '2:30',
    level: 'intermediate',
    completed: false,
    category: 'getting-started',
    tags: ['performance', 'optimization'],
    steps: [
      {
        id: 'step-1',
        title: 'Hardware Acceleration',
        description: 'Enable hardware acceleration in Settings > Performance for better recording performance.',
        duration: '0:30',
      },
      {
        id: 'step-2',
        title: 'Choosing the Right Quality',
        description: 'For everyday use, 1080p at 60FPS is a good balance. Use 4K only when needed.',
        duration: '0:30',
      },
      {
        id: 'step-3',
        title: 'Memory Usage',
        description: 'Adjust memory usage in Settings > Performance based on your system capabilities.',
        duration: '0:30',
      },
      {
        id: 'step-4',
        title: 'Recording Tips',
        description: 'Close unnecessary applications, use a fast SSD, and ensure adequate free space.',
        duration: '1:00',
      },
    ],
  },
];

/**
 * Get tutorials by category
 */
export function getTutorialsByCategory(category: Tutorial['category']): Tutorial[] {
  return TUTORIALS.filter(t => t.category === category);
}

/**
 * Get tutorials by level
 */
export function getTutorialsByLevel(level: Tutorial['level']): Tutorial[] {
  return TUTORIALS.filter(t => t.level === level);
}

/**
 * Get tutorials by tag
 */
export function getTutorialsByTag(tag: string): Tutorial[] {
  return TUTORIALS.filter(t => t.tags.includes(tag));
}

/**
 * Get completed tutorials
 */
export function getCompletedTutorials(): Tutorial[] {
  return TUTORIALS.filter(t => t.completed);
}

/**
 * Get in-progress tutorials (not completed)
 */
export function getInProgressTutorials(): Tutorial[] {
  return TUTORIALS.filter(t => !t.completed);
}

/**
 * Get tutorial progress percentage
 */
export function getTutorialProgress(): number {
  const completed = getCompletedTutorials().length;
  const total = TUTORIALS.length;
  return Math.round((completed / total) * 100);
}

/**
 * Get next tutorial to complete
 */
export function getNextTutorial(): Tutorial | null {
  const inProgress = getInProgressTutorials();
  // Prioritize beginner tutorials first
  const beginner = inProgress.filter(t => t.level === 'beginner');
  const intermediate = inProgress.filter(t => t.level === 'intermediate');
  const advanced = inProgress.filter(t => t.level === 'advanced');
  
  const next = beginner[0] || intermediate[0] || advanced[0] || null;
  return next;
}

export default TUTORIALS;