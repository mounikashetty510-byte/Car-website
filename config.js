/**
 * NOCTIS Configuration
 * Pure Vanilla Scrollytelling Engine Config
 */

const CONFIG = {
  // Frame sequences
  hero: {
    frameCount: 598,
    desktopPath: 'assets/frames/hero/frame_',
    mobilePath: 'assets/frames/hero-mobile/frame_',
    extension: '.webp',
    wrapperHeight: '600vh',
    // Chapters defined by [startProgress, endProgress]
    chapters: [
      {
        id: 'hero-ch1',
        range: [0.00, 0.16],
        title: 'NOCTIS',
        subtitle: 'The city is asleep.',
        hint: 'SCROLL TO WAKE IT',
        chapterNum: '01/04'
      },
      {
        id: 'hero-ch2',
        range: [0.24, 0.42],
        headline: "It doesn't need the city's light.",
        chapterNum: '02/04'
      },
      {
        id: 'hero-ch3',
        range: [0.50, 0.70],
        headline: 'It brings its own.',
        chapterNum: '03/04'
      },
      {
        id: 'hero-ch4',
        range: [0.80, 1.00],
        title: 'GT-E',
        specs: '0–100 KM/H 3.1S · 640 KM RANGE · DUAL MOTOR',
        linkText: 'Discover the GT-E',
        linkHref: '#lineup',
        chapterNum: '04/04'
      }
    ],
    // HUD telemetry
    hud: {
      maxSpeed: 118, // KM/H
      maxDistance: 4.2 // KM
    },
    fadeToBlackStart: 0.95
  },

  statement: {
    label: '02 — ENGINEERING',
    sentence: 'Every part was designed to disappear into one line of light.'
  },

  dismantle: {
    frameCount: 176,
    desktopPath: 'assets/frames/dismantle/frame_',
    mobilePath: 'assets/frames/dismantle-mobile/frame_',
    extension: '.webp',
    wrapperHeight: '350vh',
    title: 'Look closer.',
    revealThreshold: 0.70, // Callouts begin fading in after 70% progress
    callouts: [
      {
        id: 'callout-body',
        code: 'BODY',
        name: 'Carbon composite monocoque',
        // Pin dot coordinates on the vehicle (percentages of canvas/stage)
        x: 48,
        y: 28,
        // Text positioning relative to dot (left/right/top/bottom offsets)
        labelX: 58,
        labelY: 20,
        triggerProgress: 0.72
      },
      {
        id: 'callout-battery',
        code: 'BATTERY',
        name: '110 kWh structural pack',
        x: 58,
        y: 69,
        labelX: 70,
        labelY: 78,
        triggerProgress: 0.79
      },
      {
        id: 'callout-drive',
        code: 'DRIVE',
        name: 'Dual axial-flux motors, 680 kW',
        x: 34,
        y: 68,
        labelX: 18,
        labelY: 76,
        triggerProgress: 0.86
      },
      {
        id: 'callout-light',
        code: 'LIGHT',
        name: 'Single-line LED signature',
        x: 23,
        y: 53,
        labelX: 14,
        labelY: 42,
        triggerProgress: 0.93
      }
    ]
  },

  lineup: {
    sectionNum: '03 — THE LINEUP',
    sectionTitle: 'Five ways to drive the night.',
    defaultOpenIndex: 0,
    cars: [
      {
        id: 'gt-e',
        index: '01',
        name: 'GT-E',
        tagline: 'The grand tourer.',
        description: 'Sculpted for pure aerodynamic silence across infinite continent-crossing distances.',
        image: 'assets/cars/gt-e.webp',
        alt: 'NOCTIS GT-E matte graphite electric grand tourer coupe side profile',
        specs: [
          { label: 'RANGE', value: '640 km' },
          { label: '0–100 KM/H', value: '3.1 s' },
          { label: 'POWER', value: '680 kW' }
        ],
        swatches: [
          { name: 'Matte Graphite', color: '#2B2D31', active: true },
          { name: 'Stealth Black', color: '#0F1012', active: false },
          { name: 'Deep Xenon', color: '#1B2430', active: false },
          { name: 'Solar Amber', color: '#5C3814', active: false }
        ]
      },
      {
        id: 's',
        index: '02',
        name: 'S',
        tagline: 'Four doors, no compromise.',
        description: 'Executive poise engineered with the predatory acceleration of a single-seater.',
        image: 'assets/cars/s.webp',
        alt: 'NOCTIS S satin bone white electric sport sedan side profile',
        specs: [
          { label: 'RANGE', value: '600 km' },
          { label: '0–100 KM/H', value: '3.6 s' },
          { label: 'POWER', value: '520 kW' }
        ],
        swatches: [
          { name: 'Satin Bone', color: '#EDEAE4', active: true },
          { name: 'Carbon Shadow', color: '#1F2124', active: false },
          { name: 'Arctic Blue', color: '#3A4B5C', active: false },
          { name: 'Polished Slate', color: '#4A4E54', active: false }
        ]
      },
      {
        id: 'x',
        index: '03',
        name: 'X',
        tagline: 'Higher, never heavier.',
        description: 'Commanding height meeting low-drag glass surfaces and active torque distribution.',
        image: 'assets/cars/x.webp',
        alt: 'NOCTIS X midnight blue electric coupe SUV side profile',
        specs: [
          { label: 'RANGE', value: '560 km' },
          { label: '0–100 KM/H', value: '4.2 s' },
          { label: 'POWER', value: '480 kW' }
        ],
        swatches: [
          { name: 'Midnight Blue', color: '#121C2B', active: true },
          { name: 'Basalt Gray', color: '#26292E', active: false },
          { name: 'Obsidian', color: '#0A0B0D', active: false },
          { name: 'Frost White', color: '#E2E5E8', active: false }
        ]
      },
      {
        id: 'r',
        index: '04',
        name: 'R',
        tagline: 'Built for the track.',
        description: 'Active carbon aerodynamic surfaces, track telemetry, and unfiltered power.',
        image: 'assets/cars/r.webp',
        alt: 'NOCTIS R satin black electric track coupe with rear wing side profile',
        specs: [
          { label: 'RANGE', value: '420 km' },
          { label: '0–100 KM/H', value: '2.4 s' },
          { label: 'POWER', value: '900 kW' }
        ],
        swatches: [
          { name: 'Satin Black / Red', color: '#141517', active: true },
          { name: 'Nürburg Gray', color: '#35373B', active: false },
          { name: 'Pure Carbon', color: '#222326', active: false },
          { name: 'Gloss Crimson', color: '#5A1210', active: false }
        ]
      },
      {
        id: 'one',
        index: '05',
        name: 'ONE',
        tagline: 'The future, early.',
        description: 'An uncompromising manifestation of pure electric velocity and monolithic silver skin.',
        image: 'assets/cars/one.webp',
        alt: 'NOCTIS ONE liquid silver concept hypercar side profile',
        specs: [
          { label: 'RANGE', value: 'Concept' },
          { label: '0–100 KM/H', value: '< 1.9 s' },
          { label: 'POWER', value: '1100 kW' }
        ],
        swatches: [
          { name: 'Liquid Silver', color: '#C0C4C9', active: true },
          { name: 'Mercury Dark', color: '#4B4F55', active: false },
          { name: 'Xenon Core', color: '#97B3D0', active: false },
          { name: 'Void Black', color: '#050607', active: false }
        ]
      }
    ]
  },

  reserve: {
    title: 'Drive the night.',
    subtitle: 'Exclusive allocation reservations for the NOCTIS fleet are now open worldwide.',
    buttonText: 'RESERVE YOUR NOCTIS'
  }
};

