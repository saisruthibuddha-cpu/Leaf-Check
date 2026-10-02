import { PlantAnalysisResult, SupportedCrop } from './types';

export interface MockSoilMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  optimalRange: string;
  status: 'healthy' | 'warning' | 'alert';
  description: string;
  trendHistory: number[];
}

export interface MockRecommendation {
  id: string;
  title: string;
  category: 'Irrigation' | 'Fertilizer' | 'Pest Control' | 'Soil Health';
  severity: 'urgent' | 'high' | 'medium' | 'low';
  issue: string;
  explanation: string;
  actionableSteps: string[];
  createdAt: string;
}

export const MOCK_SOIL_METRICS: MockSoilMetric[] = [
  {
    id: 'moisture',
    name: 'Soil Moisture',
    value: 42.5,
    unit: '% VWC',
    optimalRange: '40% - 60%',
    status: 'healthy',
    description: 'Optimal volumetric water content for current vegetative growth phase.',
    trendHistory: [38, 40, 44, 41, 45, 43, 42.5]
  },
  {
    id: 'temperature',
    name: 'Soil Temperature',
    value: 24.8,
    unit: '°C',
    optimalRange: '20°C - 28°C',
    status: 'healthy',
    description: 'Root zone thermal condition is optimal for nutrient uptake.',
    trendHistory: [22.1, 23.4, 25.0, 24.2, 26.1, 25.3, 24.8]
  },
  {
    id: 'ph',
    name: 'Soil pH Level',
    value: 6.4,
    unit: 'pH',
    optimalRange: '6.0 - 7.0',
    status: 'healthy',
    description: 'Slightly acidic soil pH promotes maximum micro-nutrient bioavailability.',
    trendHistory: [6.5, 6.5, 6.4, 6.4, 6.3, 6.4, 6.4]
  },
  {
    id: 'nitrogen',
    name: 'Nitrogen (N)',
    value: 112,
    unit: 'mg/kg',
    optimalRange: '140 - 200 mg/kg',
    status: 'warning',
    description: 'Nitrogen levels are slightly below recommended threshold for high yield.',
    trendHistory: [135, 130, 124, 120, 118, 115, 112]
  },
  {
    id: 'phosphorus',
    name: 'Phosphorus (P)',
    value: 48,
    unit: 'mg/kg',
    optimalRange: '30 - 60 mg/kg',
    status: 'healthy',
    description: 'Sufficient phosphorus available for root establishment and flowering.',
    trendHistory: [50, 49, 49, 48, 48, 47, 48]
  },
  {
    id: 'potassium',
    name: 'Potassium (K)',
    value: 185,
    unit: 'mg/kg',
    optimalRange: '150 - 250 mg/kg',
    status: 'healthy',
    description: 'Potassium reserve provides strong drought tolerance and disease resistance.',
    trendHistory: [190, 188, 186, 187, 185, 184, 185]
  }
];

/**
 * Phase 2 Mock Plant Analysis Database for Supported Crops:
 * Tomato, Potato, Rice, Maize
 */
export const MOCK_PLANT_RESULTS: Record<SupportedCrop, PlantAnalysisResult[]> = {
  Tomato: [
    {
      analysisId: 'diag-tom-01',
      cropType: 'Tomato',
      healthStatus: 'disease_detected',
      disease: 'Tomato Early Blight',
      scientificName: 'Alternaria solani',
      confidence: 94,
      explanation: 'The computer vision model detected characteristic concentric dark brown lesions ("target spot" pattern) surrounded by chlorotic yellow halos on mature leaf tissue.',
      recommendedActions: [
        'Apply copper-based organic bio-fungicide within 24-48 hours',
        'Prune lower mature leaves (bottom 10-15 cm) to promote canopy air circulation',
        'Avoid overhead sprinkler irrigation; switch to root drip irrigation to keep foliage dry'
      ],
      severity: 'moderate',
      imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19657?auto=format&fit=crop&w=800&q=80',
      timestamp: '2026-09-16T19:15:00Z'
    },
    {
      analysisId: 'diag-tom-02',
      cropType: 'Tomato',
      healthStatus: 'healthy',
      disease: 'Healthy Leaf - No Pathogens Detected',
      scientificName: 'Solanum lycopersicum',
      confidence: 98,
      explanation: 'Vibrant green chlorophyll density, uniform stomatal structure, and zero necrotic lesions or fungal spore clusters observed.',
      recommendedActions: [
        'Maintain current fertigation and drip irrigation schedule',
        'Perform routine weekly visual inspection of lower stem canopy'
      ],
      severity: 'none',
      imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80',
      timestamp: '2026-09-16T19:15:00Z'
    }
  ],

  Potato: [
    {
      analysisId: 'diag-pot-01',
      cropType: 'Potato',
      healthStatus: 'disease_detected',
      disease: 'Potato Late Blight',
      scientificName: 'Phytophthora infestans',
      confidence: 96,
      explanation: 'Model detected water-soaked dark brown skin lesions with delicate white oomycete fungal mildew along leaf undersides under humid canopy micro-climates.',
      recommendedActions: [
        'Isolate infected crop zone and safely dispose of affected vine tissue',
        'Apply protective systemic fungicide (Mancozeb or Metalaxyl)',
        'Reduce irrigation volume to prevent excessive surface leaf moisture'
      ],
      severity: 'severe',
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
      timestamp: '2026-09-16T19:15:00Z'
    }
  ],

  Rice: [
    {
      analysisId: 'diag-rice-01',
      cropType: 'Rice',
      healthStatus: 'warning',
      disease: 'Rice Brown Spot',
      scientificName: 'Bipolaris oryzae',
      confidence: 89,
      explanation: 'Small oval reddish-brown lesions with gray necrotic centers identified along young leaf blades. Often associated with soil nutrient deficiency (Nitrogen/Potassium deficit).',
      recommendedActions: [
        'Apply balanced NPK top-dressing (Urea + Muriate of Potash)',
        'Ensure continuous shallow water depth (3-5 cm) in paddy sector',
        'Foliar spray with recommended bio-agent (Pseudomonas fluorescens)'
      ],
      severity: 'low',
      imageUrl: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80',
      timestamp: '2026-09-16T19:15:00Z'
    }
  ],

  Maize: [
    {
      analysisId: 'diag-corn-01',
      cropType: 'Maize',
      healthStatus: 'disease_detected',
      disease: 'Northern Corn Leaf Blight',
      scientificName: 'Exserohilum turcicum',
      confidence: 92,
      explanation: 'Elongated grayish-green elliptical cigar-shaped lesions spanning 2-10 cm along corn leaf veins detected by texture analysis.',
      recommendedActions: [
        'Apply foliar fungicide (Strobilurin or Triazole class) at early tasseling stage',
        'Rotate crops with non-host legumes for the upcoming season',
        'Till crop residue after harvest to reduce overwintering fungal spores'
      ],
      severity: 'moderate',
      imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
      timestamp: '2026-09-16T19:15:00Z'
    }
  ]
};

export const MOCK_RECOMMENDATIONS: MockRecommendation[] = [
  {
    id: 'rec-001',
    title: 'Nitrogen Depletion Warning',
    category: 'Fertilizer',
    severity: 'high',
    issue: 'Soil Nitrogen dropped below target range (112 mg/kg vs 140 mg/kg target).',
    explanation: 'Rapid vegetative growth during the past 14 days has consumed available nitrate reserves.',
    actionableSteps: [
      'Side-dress field Sector B with 25 kg/hectare Urea (46-0-0) or organic Neem-coated fertigation',
      'Apply fertigation in early morning to maximize uptake efficiency',
      'Re-test soil sensor telemetry in 72 hours'
    ],
    createdAt: '2 hours ago'
  },
  {
    id: 'rec-002',
    title: 'Fungicide Preventive Action',
    category: 'Pest Control',
    severity: 'urgent',
    issue: 'Early Blight symptoms confirmed on 12% of Tomato leaves.',
    explanation: 'High relative humidity combined with 24°C soil temp creates ideal spore germination conditions.',
    actionableSteps: [
      'Apply copper-based protective fungicide within 24 hours',
      'Ensure complete coverage of leaf undersides',
      'Avoid overhead sprinkler irrigation for the next 5 days'
    ],
    createdAt: '4 hours ago'
  }
];
