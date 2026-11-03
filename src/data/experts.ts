export interface ExpertItem {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  bringing: string[];
  adviceOn: string[];
  aboutMe: string;
  rating: number;
  reviews: number;
  price: number;
}

export interface ExpertCategoryItem {
  title: string;
  tagline: string;
  description: string;
  experts: {
    id: string;
    name: string;
    title: string;
    sessions: number;
    rating: number;
    price: number;
    image: string;
  }[];
  topExperts: {
    name: string;
    image: string;
  }[];
}

export const EXPERTS: ExpertItem[] = [
  {
    id: 'becca-chambers',
    name: 'Becca Chambers',
    title: 'Personal Brand Expert | VC CMO | LinkedIn Growth Strategist',
    bio: "I'm energetic, slightly unfiltered, and truly passionate about brand-building.",
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
    bringing: [
      '#1 creator for Advertising & PR and Personal Branding on LinkedIn',
      'Award-winning marketing and communications leader',
      'Startup advisor and founder brand expert',
      'Featured in The Wall Street Journal, Washington Post, Fortune, Forbes, and more',
    ],
    adviceOn: [
      'Personal Brand-Building',
      'LinkedIn Growth Strategy',
      'Neurodiversity in the Workplace',
      'Thought Leadership and Executive Comms Strategy',
      'Corporate Storytelling, Positioning, and Strategy',
    ],
    aboutMe:
      'Top LinkedIn Creator | VC CMO | Communications & Brand Strategist\n\nAlso known as "Becca from LinkedIn", I\'m a personal brand expert and corporate marketing leader with 15+ years of experience shaping global media, communications, and brand strategy for multi-billion dollar companies and startups alike.',
    rating: 5.0,
    reviews: 12,
    price: 300,
  },
];

export const EXPERT_CATEGORIES: Record<string, ExpertCategoryItem> = {
  'marketing-gtm': {
    title: 'Marketing & GTM',
    tagline: 'Grow without chaos—optimize GTM, retention, and operations.',
    description: 'These experts have guided members from Marketing & GTM - and they can help you too.',
    experts: [
      {
        id: 'becca-chambers',
        name: 'Becca Chambers',
        title: 'Personal Brand Expert | VC CMO',
        sessions: 150,
        rating: 5.0,
        price: 110,
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      },
      {
        id: 'trace-cohen',
        name: 'Trace Cohen',
        title: 'Grow at Partner | NY Venture',
        sessions: 45,
        rating: 4.9,
        price: 90,
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
      },
      {
        id: 'david-yii',
        name: 'David Yii',
        title: 'General Partner at Quidance',
        sessions: 90,
        rating: 5.0,
        price: 50,
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
      },
      {
        id: 'olivia-sullivan',
        name: 'Olivia O\'Sullivan',
        title: 'Partner & CMO @ Forum Ventures',
        sessions: 60,
        rating: 5.0,
        price: 80,
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
      },
    ],
    topExperts: [
      { name: 'Becca Chambers', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200' },
      { name: 'Trace Cohen', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' },
      { name: 'David Yii', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200' },
      { name: 'Olivia O\'Sullivan', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200' },
      { name: 'Suzy Engwall', image: 'https://images.unsplash.com/photo-1567532939604-b6c5b0adcc2c?auto=format&fit=crop&q=80&w=200' },
    ],
  },
};

