import { TranslationDictionary } from './types';

export const en: TranslationDictionary = {
  // Navigation
  'nav.brand': 'Leaf Check',
  'nav.subtitle': 'Agricultural Intelligence',
  'nav.home': 'Home',
  'nav.dashboard': 'Farm Dashboard',
  'nav.plantAnalysis': 'Plant Disease Check',
  'nav.soilHealth': 'Soil Health',
  'nav.recommendations': 'Farmer Advisory',
  'nav.about': 'How It Works',
  'nav.assistant': 'AgriAI Chat',

  // Common UI Buttons & Controls
  'btn.analyzePlant': 'Check Plant Health',
  'btn.viewDashboard': 'Open Dashboard',
  'btn.pollSensors': 'Check Sensors Now',
  'btn.syncing': 'Updating data...',
  'btn.uploadImage': 'Choose Leaf Photo',
  'btn.removeImage': 'Remove Photo',
  'btn.retry': 'Try Again',
  'btn.analyzeAnother': 'Check Another Leaf',
  'btn.uploadClearer': 'Upload a Clearer Photo',
  'btn.filterAll': 'All Advice',
  'btn.sendMessage': 'Send Message',
  'btn.clearChat': 'Clear Chat',
  'btn.askAssistant': 'Ask Farmer Assistant',
  'btn.close': 'Close',

  // Status & Badges
  'status.online': 'Connected & Active',
  'status.offline': 'Disconnected',
  'status.active': 'Sensor Active',
  'status.healthy': 'Healthy / Good',
  'status.warning': 'Needs Attention',
  'status.critical': 'Urgent Action Needed',
  'status.diseaseDetected': 'Disease Spotted',
  'status.normal': 'Good Condition',
  'status.hardwareError': 'Sensor Fault',
  'status.optimal': 'Optimal Range',

  // Alerts & Notices
  'alert.aiNotice': 'Farmer Advisory Note: AI estimations provide guidance based on leaf images. For severe outbreaks, also consult your local agricultural extension officer.',
  'alert.sensorOffline': 'Sensor offline — displaying last available reading.',
  'alert.invalidReading': 'Sensor warning: Extreme or uncalibrated readings detected from ESP32 probe.',
  'alert.sensorError': 'Sensor fault: Please inspect sensor probe connection or wiring cable.',
  'alert.lowConfidenceTitle': 'Could not clearly recognize the leaf condition. Please take a closer, brighter photo of the affected leaf in daylight.',

  // Error Messages
  'error.general': 'Something went wrong. Please check connection and try again.',
  'error.sensorBackend': 'Could not reach soil sensor system. Displaying cached readings.',
  'error.imageTooLarge': 'Photo size exceeds 10MB. Please choose a smaller photo.',
  'error.unsupportedFormat': 'Please choose a standard photo format (JPG, PNG, or WEBP).',
  'error.uploadFailed': 'Failed to process leaf photo. Please try again.',

  // Landing Page
  'hero.title': 'Smart AI Guidance for Healthy Crops & Soil',
  'hero.subtitle': 'Check crop leaf diseases instantly, monitor soil moisture & fertilizer levels in real-time, and get simple practical farming tips in your own language.',
  'hero.badge': 'Simple, Farmer-Friendly Agricultural Platform',
  'hero.btnAnalyze': 'Check Plant Health Now',
  'hero.btnDashboard': 'Open Soil Dashboard',

  // Dashboard Page
  'dash.title': 'Real-Time Farm Soil & Crop Dashboard',
  'dash.subtitle': 'Live sensor readings from ESP32 field probe in your crop sector',
  'dash.phaseBadge': 'Phase 8 · Multilingual Farm Telemetry',
  'dash.plantHealthIndex': 'Crop Foliage Vigor',
  'dash.plantHealthDesc': 'Leaves look green and active. Zero severe disease symptoms spotted.',
  'dash.soilHealthScore': 'Overall Soil Quality Score',
  'dash.soilHealthDesc': 'Balanced score calculated from moisture, soil pH, and NPK nutrients.',
  'dash.diseaseRiskIndex': 'Disease Risk Level',
  'dash.diseaseRiskDesc': 'Weather and soil conditions are currently safe for crops.',
  'dash.esp32NodeStatus': 'Field Sensor Probe',
  'dash.physicalSoilMetrics': 'Live Soil Measurements',
  'dash.physicalSoilMetricsSub': 'Direct readings from physical field probes sent via Wi-Fi',
  'dash.activeRecs': 'Immediate Farm Actions Needed',
  'dash.lastSync': 'Last updated',

  // Soil Metric Names
  'metric.moisture': 'Soil Moisture',
  'metric.moisture.desc': 'Water available in the root zone. Keeps plants hydrated without drowning roots.',
  'metric.temperature': 'Soil Temperature',
  'metric.temperature.desc': 'Root-zone warmth. Important for seed germination and nutrient uptake.',
  'metric.ph': 'Soil pH (Acidity / Alkalinity)',
  'metric.ph.desc': 'Indicates if soil is sour or sweet. Affects how easily plants drink up fertilizers.',
  'metric.nitrogen': 'Nitrogen (N)',
  'metric.nitrogen.desc': 'Drives green leaf growth, thick stems, and healthy plant height.',
  'metric.phosphorus': 'Phosphorus (P)',
  'metric.phosphorus.desc': 'Helps roots spread deep into the ground and supports good flowering.',
  'metric.potassium': 'Potassium (K)',
  'metric.potassium.desc': 'Strengthens plants against heat, drought, and pest attacks.',

  // Plant Analysis Page
  'analysis.title': 'Leaf Disease Identification',
  'analysis.subtitle': 'Upload a close-up photo of any suspicious leaf to check for fungal or pest damage.',
  'analysis.selectCropLabel': 'Select Your Crop',
  'analysis.dragDropText': 'Tap here to upload a photo of the affected leaf',
  'analysis.supportsText': 'Works with photos from phone camera or gallery (JPG, PNG, WEBP)',
  'analysis.quickPresets': 'Try with sample crop leaf:',
  'analysis.runningInference': 'Examining leaf photo with agricultural AI...',
  'analysis.analyzingFoliage': 'Examining Leaf',
  'analysis.cropType': 'Crop',
  'analysis.estimatedConfidence': 'Prediction Confidence',
  'analysis.likelyCondition': 'Identified Condition',
  'analysis.scientificClass': 'Botanical Name',
  'analysis.gradcamTitle': 'AI Attention Map (What the AI noticed)',
  'analysis.gradcamExplanation': 'The bright highlighted spots show the exact leaf blemishes and discoloration the AI focused on to identify the disease.',
  'analysis.classProbsTitle': 'Possibility Breakdown',
  'analysis.diagnosticExplanation': 'Simple Explanation for Farmers',
  'analysis.recommendedNextSteps': 'What You Should Do Next',

  // Soil Health Page
  'soil.title': 'Soil Condition & Moisture Monitor',
  'soil.subtitle': 'Continuous field probe data measuring water content, ground temperature, pH, and soil nutrients.',
  'soil.probesHeader': 'Sensor Probes (6 Live Parameters)',
  'soil.probesSub': 'Tap any probe card to see how readings have changed over time.',
  'soil.actionRecs': 'Practical Soil Care Tips',
  'soil.healthyZone': 'Ideal Range',
  'soil.disclaimer': 'Notice: This score is calculated from field probe telemetry to help guide daily irrigation and fertilization.',

  // Recommendations Page
  'recs.title': 'Practical Farming Recommendations',
  'recs.subtitle': 'Step-by-step guidance tailored to your soil readings and crop needs.',
  'recs.irrigation': 'Watering & Irrigation',
  'recs.fertilizer': 'Fertilizer & Nutrition',
  'recs.pestControl': 'Disease & Pest Control',
  'recs.soilAmendment': 'Soil Care & Manure',
  'recs.priorityUrgent': 'Urgent Priority',
  'recs.priorityHigh': 'High Priority',
  'recs.priorityMedium': 'Medium Priority',
  'recs.priorityLow': 'Low Priority',
  'recs.actionProtocol': 'Step-by-step Action:',
  'recs.fusionEngine': 'Plant & Soil AI Fusion Engine',
  'recs.fusionSub': 'Combines leaf diagnosis with live soil sensors to detect water, nutrient, pH, climate, and disease stresses.',
  'recs.stressType': 'Stress Factor',
  'recs.reasonLabel': 'Reason / Agronomic Diagnosis',
  'recs.suggestedActionLabel': 'Suggested Preventive Action',
  'recs.supportingSensorsLabel': 'Supporting Sensor & Benchmark Values',
  'recs.targetCrop': 'Target Crop',
  'recs.simDisease': 'Leaf Diagnostic Input',
  'recs.evaluateBtn': 'Run Fusion Stress Analysis',
  'recs.evaluating': 'Evaluating Plant + Soil Telemetry...',
  'recs.liveFusion': 'Live Sensor & Leaf Fusion',
  'recs.safetyNotice': 'Safety Guardrail: General preventive and management guidance only. No unsafe pesticide or chemical fertilizer prescriptions.',

  // AI Assistant Chat Modal & Responses
  'chat.title': 'AgriAI Farmer Assistant',
  'chat.subtitle': 'Ask any farming question in your own language. We give simple, practical advice.',
  'chat.inputPlaceholder': 'Type your question here (e.g., How do I save my tomato plants from leaf blight?)...',
  'chat.greeting': 'Namaste! I am your AgriAI Farmer Assistant. How are your crops doing today? Ask me anything about watering, fertilizers, or yellowing leaves.',
  'chat.suggestedHeader': 'Common Farmer Questions:',
  'chat.q1': 'My tomato leaves have brown rings. What should I spray?',
  'chat.q2': 'Soil moisture is low. How long should I run drip irrigation?',
  'chat.q3': 'When should I apply urea fertilizer to maize crops?',
  'chat.q4': 'How to improve acidic soil using natural methods?',
  'chat.ans1': 'Brown rings with yellow edges on lower tomato leaves usually mean Early Blight. Pick off badly damaged lower leaves so the fungus does not splash up. Spray organic copper fungicide or Mancozeb early in the morning, and avoid wetting leaves when watering.',
  'chat.ans2': 'When soil moisture drops below 40%, water your crop early in the morning for 35 to 45 minutes using drip lines. Early morning watering prevents rapid evaporation and protects roots from drying out.',
  'chat.ans3': 'For maize, apply nitrogen (like neem-coated urea) in split doses: one third at sowing, one third when plants reach knee height (30 days), and the last third before tassel emergence. Always apply when soil is moist.',
  'chat.ans4': 'If your soil pH is below 6.0 (acidic), spread agricultural lime or wood ash evenly and mix into topsoil. Adding composted cow dung and biochar will also naturally balance the soil and help roots absorb fertilizers.',

  // Crops
  'crop.Tomato': 'Tomato',
  'crop.Potato': 'Potato',
  'crop.Rice': 'Paddy / Rice',
  'crop.Maize': 'Maize / Corn',

  // Common Disease Names & Farmer-Friendly Explanations
  'disease.TOMATO_EARLY_BLIGHT': 'Tomato Early Blight (Aakumaccha)',
  'disease.TOMATO_EARLY_BLIGHT_desc': 'Brown circular spots with yellow rings on lower leaves. Caused by warm wet weather. Spreads upwards if not controlled.',
  'disease.TOMATO_EARLY_BLIGHT_action': 'Remove infected bottom leaves, avoid sprinkler watering on foliage, and spray Mancozeb or Copper Oxychloride in the early morning.',
  
  'disease.TOMATO_LATE_BLIGHT': 'Tomato Late Blight (Mogi Tegulu)',
  'disease.TOMATO_LATE_BLIGHT_desc': 'Dark watery rotting patches on leaves and stems with white mold under cool cloudy conditions.',
  'disease.TOMATO_LATE_BLIGHT_action': 'Ensure good field drainage, remove rotting vines, and apply systemic fungicide like Metalaxyl or Cymoxanil immediately.',

  'disease.TOMATO_LEAF_MOLD': 'Tomato Leaf Mold (Buju Tegulu)',
  'disease.TOMATO_LEAF_MOLD_desc': 'Pale yellow patches on top of leaves with olive-green velvety mold underneath.',
  'disease.TOMATO_LEAF_MOLD_action': 'Prune dense vines to increase air circulation and reduce humidity in the crop canopy.',

  'disease.TOMATO_SEPTORIA': 'Tomato Septoria Leaf Spot',
  'disease.TOMATO_SEPTORIA_desc': 'Small round spots with gray centers and dark borders on older leaves.',
  'disease.TOMATO_SEPTORIA_action': 'Clear fallen debris around plant bases and apply preventative protective fungicide.',

  'disease.TOMATO_HEALTHY': 'Healthy Tomato Crop',
  'disease.TOMATO_HEALTHY_desc': 'Vibrant green healthy leaves with no visible disease marks or insect damage.',
  'disease.TOMATO_HEALTHY_action': 'Continue regular irrigation and balanced organic nutrition.',

  'disease.POTATO_EARLY_BLIGHT': 'Potato Early Blight',
  'disease.POTATO_EARLY_BLIGHT_desc': 'Target-like brown spots with yellow margins on maturing potato foliage.',
  'disease.POTATO_EARLY_BLIGHT_action': 'Maintain steady soil moisture and spray protective Mancozeb spray.',

  'disease.POTATO_LATE_BLIGHT': 'Potato Late Blight',
  'disease.POTATO_LATE_BLIGHT_desc': 'Dark water-soaked rotting lesions spreading rapidly during cool damp mornings.',
  'disease.POTATO_LATE_BLIGHT_action': 'Hill up soil around potato tubers to protect them from spores and spray approved blight fungicide.',

  'disease.POTATO_HEALTHY': 'Healthy Potato Crop',
  'disease.POTATO_HEALTHY_desc': 'Strong green foliage with clean leaflets and sturdy stems.',
  'disease.POTATO_HEALTHY_action': 'Monitor for aphids and keep soil ridged properly.',

  'disease.RICE_BROWN_SPOT': 'Paddy Brown Spot',
  'disease.RICE_BROWN_SPOT_desc': 'Oval reddish-brown spots on paddy leaves, often a sign of nutrient deficiency in the field.',
  'disease.RICE_BROWN_SPOT_action': 'Top-dress with potassium (potash) and zinc, and keep field adequately irrigated.',

  'disease.RICE_LEAF_BLAST': 'Paddy Leaf Blast (Aggi Tegulu)',
  'disease.RICE_LEAF_BLAST_desc': 'Eye-shaped or spindle-shaped lesions with grayish centers and brown borders.',
  'disease.RICE_LEAF_BLAST_action': 'Avoid excess urea application and spray Tricyclazole or Isoprothiolane at first sign of spots.',

  'disease.RICE_BACTERIAL_BLIGHT': 'Paddy Bacterial Leaf Blight',
  'disease.RICE_BACTERIAL_BLIGHT_desc': 'Yellow wavy dying edges starting from leaf tips and moving down.',
  'disease.RICE_BACTERIAL_BLIGHT_action': 'Drain stagnant water from the field, reduce nitrogen fertilizer, and spray Copper Hydroxide.',

  'disease.RICE_HEALTHY': 'Healthy Paddy Crop',
  'disease.RICE_HEALTHY_desc': 'Clean, upright green tillers with no blast or discoloration.',
  'disease.RICE_HEALTHY_action': 'Maintain recommended water depth and check for stem borer moths.',

  'disease.MAIZE_NORTHERN_BLIGHT': 'Corn Northern Leaf Blight',
  'disease.MAIZE_NORTHERN_BLIGHT_desc': 'Long cigar-shaped grayish lesions running along the corn leaves.',
  'disease.MAIZE_NORTHERN_BLIGHT_action': 'Use resistant seeds in future seasons and apply protective foliar spray if spots appear before tasseling.',

  'disease.MAIZE_COMMON_RUST': 'Corn Rust (Kumkuma Tegulu)',
  'disease.MAIZE_COMMON_RUST_desc': 'Small reddish-brown powdery blisters on both sides of the leaves.',
  'disease.MAIZE_COMMON_RUST_action': 'Usually manageable; if severe before cob formation, spray Mancozeb early in the day.',

  'disease.MAIZE_GRAY_LEAF_SPOT': 'Corn Gray Leaf Spot',
  'disease.MAIZE_GRAY_LEAF_SPOT_desc': 'Rectangular tan spots bounded by leaf veins.',
  'disease.MAIZE_GRAY_LEAF_SPOT_action': 'Rotate crops next season and plow crop residue under after harvest.',

  'disease.MAIZE_HEALTHY': 'Healthy Corn Crop',
  'disease.MAIZE_HEALTHY_desc': 'Broad, dark green leaves with strong stalk vigor.',
  'disease.MAIZE_HEALTHY_action': 'Apply second dose of nitrogen fertilizer at knee-high stage.',

  // Footer
  'footer.text': 'Leaf Check · Practical agricultural intelligence helping farmers protect crops and soil.',
};
