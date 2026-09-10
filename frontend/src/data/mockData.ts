import { ConversationMeta, SuggestionPrompt, UserProfile, ChatMessage } from '../types/chat';
import { UI_STRINGS } from '../constants/uiStrings';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: UI_STRINGS.USER_DEFAULT_NAME,
  role: UI_STRINGS.USER_DEFAULT_ROLE,
  email: UI_STRINGS.USER_DEFAULT_EMAIL,
  initials: 'EM',
  tier: 'RESEARCH PRO',
  scansRemaining: '1,420 / 2,000 scans this cycle',
};

export const INITIAL_CONVERSATIONS: ConversationMeta[] = [
  {
    id: 'conv-1',
    title: 'Tomato Late Blight & Lesion Evaluation',
    updatedAt: '12 mins ago',
    previewSnippet: 'Phytophthora infestans detected with 97.2% confidence on lower leaves...',
    timeBucket: 'today',
    cropType: 'Tomato',
  },
  {
    id: 'conv-2',
    title: 'Wheat Stripe Rust Spread Assessment',
    updatedAt: '2 hours ago',
    previewSnippet: 'Puccinia striiformis stripe pustules spanning mid-tier canopy...',
    timeBucket: 'today',
    cropType: 'Wheat',
  },
  {
    id: 'conv-3',
    title: 'Apple Scab (Venturia inaequalis) Foliage Scan',
    updatedAt: 'Yesterday',
    previewSnippet: 'Olive-green velvety lesions mapped on leaf margin surface...',
    timeBucket: 'yesterday',
    cropType: 'Apple',
  },
  {
    id: 'conv-4',
    title: 'Corn Northern Leaf Blight Severity Index',
    updatedAt: 'Yesterday',
    previewSnippet: 'Cigar-shaped necrotic lesions measuring 2.5cm across leaf blades...',
    timeBucket: 'yesterday',
    cropType: 'Maize',
  },
  {
    id: 'conv-5',
    title: 'Grapevine Downy Mildew Canopy Check',
    updatedAt: '4 days ago',
    previewSnippet: 'Oil-spot chlorotic lesions observed with delicate white sporulation...',
    timeBucket: 'previous_week',
    cropType: 'Grape',
  },
  {
    id: 'conv-6',
    title: 'Potato Alternaria Leaf Spot Comparison',
    updatedAt: '6 days ago',
    previewSnippet: 'Concentric ring target-board lesions evaluated on Solanum tuberosum...',
    timeBucket: 'previous_week',
    cropType: 'Potato',
  },
];

export const SUGGESTION_PROMPTS: SuggestionPrompt[] = [
  {
    id: 'sug-1',
    title: 'Leaf Foliage Pathology Scan',
    description: 'Upload a macro photo of infected leaf blades for transformer-based pathogen classification.',
    promptText: 'I am uploading a leaf photo showing dark brown water-soaked lesions. Please classify the pathogen, calculate disease severity percentage, and prescribe immediate field interventions.',
    tag: 'Foliage Pathology',
    cropTarget: 'Solanaceous / Vegetables',
  },
  {
    id: 'sug-2',
    title: 'Nutrient Deficiency vs Fungal Infection',
    description: 'Differentiate interveinal chlorosis from early-stage viral or fungal leaf spot.',
    promptText: 'Explain how to differentiate interveinal chlorosis caused by magnesium deficiency from early viral mosaic mottling on young crop foliage.',
    tag: 'Physiological Stress',
    cropTarget: 'All Field Crops',
  },
  {
    id: 'sug-3',
    title: 'Targeted Fungicide & Biological Regimen',
    description: 'Calculate copper hydroxide, bio-fungicide, or systemic spray schedules based on weather humidity.',
    promptText: 'Provide a combined organic and chemical spray schedule for Late Blight in tomato greenhouses with high relative humidity (>85%).',
    tag: 'Agronomic Treatment',
    cropTarget: 'Horticulture',
  },
  {
    id: 'sug-4',
    title: 'Cereal Grain Rust & Bunt Analysis',
    description: 'Assess yellow or brown pustule formation on wheat flag leaves and estimate yield loss risk.',
    promptText: 'Analyze yellow linear pustule clusters on wheat flag leaves at the grain-filling stage, including estimated yield reduction if untreated.',
    tag: 'Cereal Pathology',
    cropTarget: 'Wheat & Barley',
  },
];

export const SAMPLE_INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'msg-1-1',
      role: 'user',
      content: 'I noticed irregular water-soaked dark patches spreading rapidly across our tomato crop foliage after the recent rain. The stems also show dark streaks. Can Vistara identify the pathogen and recommend urgent containment measures?',
      timestamp: '10:42 AM',
    },
    {
      id: 'msg-1-2',
      role: 'assistant',
      content: `### Pathology Diagnostic Assessment: Tomato Late Blight

Vistara has evaluated the foliar symptoms through the Transformer Vision-Language pipeline. The observed water-soaked brown lesions with pale halos and rapid stem necrosis are pathognomonic for **Late Blight**.

#### Pathogen Profile
* **Causal Organism**: *Phytophthora infestans* (Oomycete plant pathogen)
* **Confidence Level**: **97.4%**
* **Observed Severity**: **Moderate to High (Severity Index: 64%)**
* **Environmental Favorability**: High humidity (>80%) and cool-to-moderate temperatures (15°C - 22°C)

#### Recommended Field Containment Regimen
1. **Immediate Sanitation**: Prune and bag heavily infected lower foliage in plastic containers. Do not compost infected plant material.
2. **Targeted Oomycete Chemical Control**:
   - Apply *Cymoxanil + Mancozeb* (curative + protectant combination) at 2.0g per liter of water.
   - Alternatively, spray *Dimethomorph* or *Fluopicolide* with complete canopy under-leaf coverage.
3. **Preventive Organic Countermeasure**:
   - Copper oxychloride (50% WP) at 2.5g/L or *Bacillus subtilis* bio-fungicide for bordering buffer rows.
4. **Cultural Irrigation Adjustment**:
   - Discontinue overhead sprinkler irrigation immediately. Switch strictly to drip irrigation to prevent spore wash.`,
      timestamp: '10:43 AM',
      diagnosticData: {
        crop: 'Solanum lycopersicum (Tomato)',
        disease: 'Late Blight (Phytophthora infestans)',
        pathogenType: 'Oomycete',
        confidence: 97.4,
        severity: 'Severe',
        symptoms: [
          'Water-soaked dark green to black foliar lesions',
          'Necrotic brown discoloration on petiole junctions',
          'Delicate white fuzzy sporulation on leaf underside during high humidity',
        ],
        organicTreatment: 'Copper oxychloride (2.5g/L) + Neem seed kernel extract (5%)',
        chemicalTreatment: 'Cymoxanil + Mancozeb (2g/L) or Dimethomorph (1.5g/L)',
        preventativeAction: 'Halt overhead irrigation, prune lower leaves below 20cm, sanitize pruning shears',
      },
    },
  ],
};
