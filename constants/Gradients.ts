export interface GradientPreset {
    id: string;
    name: string;
    colors: string[];
    start: { x: number; y: number };
    end: { x: number; y: number };
  }
  
  export const GRADIENT_PRESETS: GradientPreset[] = [
    {
      id: 'royal',
      name: 'Royal Blue',
      colors: ['#536976', '#292E49'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 }
    },
    {
      id: 'ocean',
      name: 'Ocean Blue',
      colors: ['#2193b0', '#6dd5ed'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 }
    },
    {
      id: 'emerald',
      name: 'Emerald Water',
      colors: ['#348F50', '#56B4D3'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 }
    },
    {
      id: 'mojito',
      name: 'Mojito',
      colors: ['#1D976C', '#93F9B9'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 }
    },
    {
      id: 'sunset',
      name: 'Sunset',
      colors: ['#ff7e5f', '#feb47b'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 }
    },
    {
      id: 'fire',
      name: 'Fire',
      colors: ['#f12711', '#f5af19'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 }
    },
    {
      id: 'purple',
      name: 'Purple Love',
      colors: ['#cc2b5e', '#753a88'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 }
    },
    {
      id: 'pink',
      name: 'Pink Dream',
      colors: ['#ff9a9e', '#fecfef', '#fecfef'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 }
    }
  ];
