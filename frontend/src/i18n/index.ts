/**
 * Centralized Translation System & Multilingual Domain Translation Layers
 * AI Crop Health Platform - Phase 8
 */
import { SupportedLanguage, TranslationDictionary } from './types';
import { en } from './en';
import { te } from './te';
import { hi } from './hi';
import { ta } from './ta';
import { kn } from './kn';
import { ml } from './ml';
import { PlantAnalysisResult, SensorParameterDetail } from '../data/types';
import { RecommendationItem } from '../services/recommendationService';

export * from './types';
export { en, te, hi, ta, kn, ml };

export const DICTIONARIES: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  te,
  hi,
  ta,
  kn,
  ml,
};

/**
 * Core translation resolver with English fallback and parameter interpolation
 */
export function getTranslation(
  lang: SupportedLanguage,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  let text = dict[key] || DICTIONARIES.en[key] || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    });
  }

  return text;
}

// ---------------------------------------------------------------------------
// AI Recommendations Translation Layer (Farmer-Friendly Natural Language)
// ---------------------------------------------------------------------------
interface LocalizedRecContent {
  title: string;
  category: string;
  issue: (readingVal?: number | string) => string;
  explanation: string;
  actionableSteps: string[];
}

const REC_TRANSLATIONS: Record<string, Record<SupportedLanguage, LocalizedRecContent>> = {
  'rec-irrig-01': {
    en: {
      title: 'Root-Zone Moisture Deficit Remediation',
      category: 'Irrigation',
      issue: (val) => `Soil moisture has dropped to ${val || '32.5'}% (target: 40-60%).`,
      explanation: 'Warm temperatures and sunshine have dried the topsoil. Plants need moisture so roots do not wilt.',
      actionableSteps: [
        'Run drip irrigation for 35 to 45 minutes in early morning hours.',
        'Check soil moisture probe reading again in 1 hour.',
        'Inspect drip drippers to ensure water is flowing freely without clogs.'
      ]
    },
    te: {
      title: 'నేలలో తేమ తగ్గింది - సాగునీటి తడి అందించండి',
      category: 'సాగునీరు / నీటి తడులు',
      issue: (val) => `నేలలో తేమ శాతం ${val || '32.5'}% కి పడిపోయింది (సరైన పరిధి: 40-60%).`,
      explanation: 'ఎండ వేడిమికి పైనేల త్వరగా ఆరిపోయింది. మొక్కల వేర్లు వాడిపోకుండా ఉండటానికి వెంటనే తేమ అవసరం.',
      actionableSteps: [
        'ఉదయాన్నే చల్లటి వేళల్లో 35 నుండి 45 నిమిషాల పాటు డ్రిప్ ద్వారా నీరు అందించండి.',
        'నీరు పెట్టిన గంట తర్వాత నేలలో తేమ ఎంత పెరిగిందో డాష్‌బోర్డ్‌లో చూడండి.',
        'డ్రిప్ పైపుల్లో మట్టి అడ్డం పడకుండా డ్రిప్పర్లను ఒకసారి సరిచూసుకోండి.'
      ]
    },
    hi: {
      title: 'मिट्टी में नमी की कमी - सिंचाई की तुरंत आवश्यकता',
      category: 'सिंचाई प्रबंधन',
      issue: (val) => `मिट्टी में नमी का स्तर घटकर ${val || '32.5'}% रह गया है (उचित दायरा: 40-60%)।`,
      explanation: 'धूप और गर्मी से ऊपरी मिट्टी सूख गई है। पौधों को सूखने से बचाने के लिए पानी देना जरूरी है।',
      actionableSteps: [
        'सुबह के ठंडे समय 35 से 45 मिनट के लिए ड्रिप सिंचाई चलाएं।',
        'सिंचाई के एक घंटे बाद मिट्टी में नमी का स्तर फिर से जांचें।',
        'ड्रिप पाइपों की जांच करें ताकि ड्रिपर में कचरा न फंसे।'
      ]
    },
    ta: {
      title: 'மண் ஈரப்பதம் குறைவு - உடனடியாக பாசனம் செய்யவும்',
      category: 'நீர்ப்பாசனம்',
      issue: (val) => `மண் ஈரப்பதம் ${val || '32.5'}% ஆக குறைந்துள்ளது (ஏற்ற அளவு: 40-60%).`,
      explanation: 'வெயிலின் தாக்கத்தால் மேல் மண் வறண்டுள்ளது. பயிர் வாடாமல் இருக்க உடனே தண்ணீர் பாய்ச்ச வேண்டும்.',
      actionableSteps: [
        'காலை வேளையில் 35 முதல் 45 நிமிடங்கள் வரை சொட்டு நீர் பாசனம் செய்யவும்.',
        'தண்ணீர் விட்ட ஒரு மணி நேரம் கழித்து மண் ஈரப்பதத்தை சரிபார்க்கவும்.',
        'சொட்டு நீர் குழாய்களில் அடைப்பு ஏதும் இல்லாமல் சீராக தண்ணீர் செல்கிறதா என பார்க்கவும்.'
      ]
    },
    kn: {
      title: 'ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಕೊರತೆ - ತಕ್ಷಣ ನೀರು ಹರಿಸಿ',
      category: 'ನೀರಾವರಿ',
      issue: (val) => `ಮಣ್ಣಿನ ತೇವಾಂಶವು ${val || '32.5'}% ಕ್ಕೆ ಇಳಿದಿದೆ (ಸೂಕ್ತ ಮಟ್ಟ: 40-60%).`,
      explanation: 'ಬಿಸಿಲಿನ ತಾಪಕ್ಕೆ ಮೇಲ್ಮಣ್ಣು ಒಣಗಿದೆ. ಗಿಡಗಳು ಬಾಡದಂತೆ ತಡೆಯಲು ನೀರುಣಿಸುವುದು ಅತ್ಯಗತ್ಯ.',
      actionableSteps: [
        'ಮುಂಜಾನೆ ತಂಪಾದ ವೇಳೆಯಲ್ಲಿ 35 ರಿಂದ 45 ನಿಮಿಷ ಹನಿ ನೀರಾವರಿ ಮಾಡಿ.',
        'ನೀರು ಹರಿಸಿದ 1 ಗಂಟೆಯ ನಂತರ ತೇವಾಂಶದ ಮಟ್ಟವನ್ನು ಪರಿಶೀಲಿಸಿ.',
        'ಹನಿ ನೀರಾವರಿ ಪೈಪ್‌ಗಳಲ್ಲಿ ಕಸ ಸಿಲುಕದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.'
      ]
    },
    ml: {
      title: 'മണ്ണിലെ ഈർപ്പക്കുറവ് - ഉടനടി നനയ്ക്കുക',
      category: 'ജലസേചനം',
      issue: (val) => `മണ്ണിലെ ഈർപ്പം ${val || '32.5'}% ആയി കുറഞ്ഞു (ആവശ്യമായ അളവ്: 40-60%).`,
      explanation: 'ചൂട് കൂടിയതിനാൽ മണ്ണിലെ വെള്ളം വറ്റിപ്പോയി. ചെടികൾ വാടാതിരിക്കാൻ വേഗത്തിൽ നനയ്ക്കണം.',
      actionableSteps: [
        'രാവിലെ തണുപ്പുള്ള സമയത്ത് 35 മുതൽ 45 മിനിറ്റ് വരെ തുള്ളിനന നൽകുക.',
        'നനച്ച് ഒരു മണിക്കൂറിന് ശേഷം ഈർപ്പത്തിന്റെ അളവ് വീണ്ടും പരിശോധിക്കുക.',
        'തുള്ളിനന പൈപ്പുകളിലെ തടസ്സങ്ങൾ മാറ്റുക.'
      ]
    }
  },
  'rec-fert-01': {
    en: {
      title: 'Nitrogen Depletion - Add Fertilizer Top-Dressing',
      category: 'Fertilizer',
      issue: (val) => `Nitrogen reserves are low at ${val || '118'} mg/kg (target: 140-200 mg/kg).`,
      explanation: 'Fast vegetative growth has drawn out soil nutrients. Extra nitrogen is needed so leaves stay green and strong.',
      actionableSteps: [
        'Side-dress 20 kg per acre of Neem-coated Urea or well-decomposed cow dung manure.',
        'Apply in the cool morning while soil has mild moisture.',
        'Avoid applying before heavy rain storms to prevent fertilizer runoff.'
      ]
    },
    te: {
      title: 'నత్రజని (నైట్రోజన్) తగ్గింది - పైపాటు ఎరువు వేయండి',
      category: 'ఎరువుల యాజమాన్యం',
      issue: (val) => `నేలలో నత్రజని నిల్వలు ${val || '118'} mg/kg కి తగ్గాయి (సరైన పరిధి: 140-200 mg/kg).`,
      explanation: 'మొక్కలు వేగంగా పెరగడం వల్ల నేలలోని నత్రజని ఖర్చయింది. ఆకులు పసుపుబారకుండా పైపాటు ఎరువు వేయడం అవసరం.',
      actionableSteps: [
        'ఎకరానికి 20 కిలోల వేపపూత పూసిన యూరియా లేదా బాగా చివికిన పశువుల ఎరువును మొక్కల మొదళ్ల వద్ద వేయండి.',
        'నేలలో తగినంత తేమ ఉన్నప్పుడు, ఉదయాన్నే చల్లటి వేళల్లో ఎరువు వేయండి.',
        'భారీ వర్షం పడే సూచనలు ఉన్నప్పుడు ఎరువు వేయవద్దు, వర్షపు నీటితో కొట్టుకుపోతుంది.'
      ]
    },
    hi: {
      title: 'नाइट्रोजन की कमी - ऊपर से खाद डालें',
      category: 'उर्वरक प्रबंधन',
      issue: (val) => `मिट्टी में नाइट्रोजन का स्तर घटकर ${val || '118'} mg/kg हो गया है (उचित दायरा: 140-200 mg/kg)।`,
      explanation: 'फसल की तेज बढ़वार से मिट्टी का नाइट्रोजन कम हो गया है। पत्तियों को हरा-भरा रखने के लिए खाद जरूरी है।',
      actionableSteps: [
        'प्रति एकड़ 20 किलो नीम लेपित यूरिया या सड़ी हुई गोबर खाद पौधों की जड़ों के पास डालें।',
        'खाद हमेशा सुबह के समय और जब मिट्टी में हल्की नमी हो तभी डालें।',
        'तेज बारिश की संभावना हो तो खाद न डालें ताकि वह बह न जाए।'
      ]
    },
    ta: {
      title: 'தழைச்சத்து குறைவு - மேலுரம் இடவும்',
      category: 'உரமிடுதல்',
      issue: (val) => `மண்ணில் நைட்ரஜன் அளவு ${val || '118'} mg/kg ஆக குறைந்துள்ளது (ஏற்ற அளவு: 140-200 mg/kg).`,
      explanation: 'பயிர் வேகமாக வளர்ந்ததால் மண்ணில் உள்ள சத்துக்கள் குறைந்துள்ளன. இலைகள் மஞ்சளாவதை தடுக்க மேலுரம் தேவை.',
      actionableSteps: [
        'ஏக்கருக்கு 20 கிலோ வேப்பம்பிண்ணாக்கு கலந்த யூரியா அல்லது மக்கிய தொழுவுரம் இடவும்.',
        'மண்ணில் மிதமான ஈரம் இருக்கும் போது காலை வேளையில் உரமிடவும்.',
        'கனமழை பெய்யும் வாய்ப்பு இருந்தால் உரமிடுவதை தவிர்க்கவும்.'
      ]
    },
    kn: {
      title: 'ಸಾರಜನಕ ಕೊರತೆ - ಮೇಲ್ಗೊಬ್ಬರ ಹಾಕಿ',
      category: 'ಗೊಬ್ಬರ ನಿರ್ವಹಣೆ',
      issue: (val) => `ಮಣ್ಣಿನಲ್ಲಿ ಸಾರಜನಕದ ಪ್ರಮಾಣ ${val || '118'} mg/kg ಗೆ ಇಳಿದಿದೆ (ಸೂಕ್ತ ಮಟ್ಟ: 140-200 mg/kg).`,
      explanation: 'ಬೆಳೆ ಶೀಘ್ರವಾಗಿ ಬೆಳೆದ ಕಾರಣ ಮಣ್ಣಿನ ಪೋಷಕಾಂಶ ಕಡಿಮೆಯಾಗಿದೆ. ಎಲೆಗಳು ಹಳದಿಯಾಗದಂತೆ ಕಾಪಾಡಲು ಗೊಬ್ಬರ ಅಗತ್ಯ.',
      actionableSteps: [
        'ಎಕರೆಗೆ 20 ಕೆಜಿ ಬೇವಿನ ಲೇಪಿತ ಯೂರಿಯಾ ಅಥವಾ ಕಳಿತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರವನ್ನು ಗಿಡಗಳ ಬುಡಕ್ಕೆ ಹಾಕಿ.',
        'ಮಣ್ಣಿನಲ್ಲಿ ಹದವಾದ ತೇವಾಂಶವಿದ್ದಾಗ ಬೆಳಿಗ್ಗೆ ಗೊಬ್ಬರ ಹಾಕಿ.',
        'ಭಾರಿ ಮಳೆ ಬರುವ ಸೂಚನೆ ಇದ್ದರೆ ಗೊಬ್ಬರ ಹಾಕಬೇಡಿ.'
      ]
    },
    ml: {
      title: 'നൈട്രജൻ കുറവ് - മേൽവളം ചേർക്കുക',
      category: 'വളപ്രയോഗം',
      issue: (val) => `മണ്ണിലെ നൈട്രജൻ ${val || '118'} mg/kg ആയി കുറഞ്ഞു (ആവശ്യമായ അളവ്: 140-200 mg/kg).`,
      explanation: 'ചെടികൾ വേഗത്തിൽ വളർന്നതിനാൽ മണ്ണിലെ വളം കുറഞ്ഞു. ഇലകൾ മഞ്ഞളിക്കാതിരിക്കാൻ മേൽവളം ആവശ്യമാണ്.',
      actionableSteps: [
        'ഏക്കറിന് 20 കിലോ വേപ്പെണ്ണ പുരട്ടിയ യൂറിയയോ ഉണങ്ങിപ്പൊടിഞ്ഞ ചാണകമോ നൽകുക.',
        'മണ്ണിൽ നേരിയ നനവുള്ളപ്പോൾ രാവിലെ വളം ചേർക്കുക.',
        'കനത്ത മഴയുള്ളപ്പോൾ വളം ഇടരുത്, ഒലിച്ചുപോകാൻ സാധ്യതയുണ്ട്.'
      ]
    }
  },
  'rec-soil-01': {
    en: {
      title: 'Acidic Soil Care - Add Agricultural Lime',
      category: 'Soil Amendment',
      issue: (val) => `Soil pH has dropped to ${val || '5.6'} (optimal: 6.0-7.0).`,
      explanation: 'Soil is becoming sour and acidic. This locks up phosphorus and calcium, preventing roots from absorbing food.',
      actionableSteps: [
        'Broadcast 150 kg per acre of agricultural lime or clean wood ash and lightly rake into topsoil.',
        'Add organic compost to naturally balance soil sweetness.',
        'Re-check soil pH on your dashboard in 2 to 3 weeks.'
      ]
    },
    te: {
      title: 'నేలలో పులుపుదనం (ఆమ్లత) పెరిగింది - సున్నం లేదా బూడిద వేయండి',
      category: 'నేల సంరక్షణ & పునరుద్ధరణ',
      issue: (val) => `నేల pH ${val || '5.6'} కి తగ్గింది (సరైన పరిధి: 6.0-7.0).`,
      explanation: 'భూమి పుల్లగా మారింది. ఇలా ఉన్నప్పుడు మనం వేసే ఎరువులను మొక్కల వేర్లు సరిగ్గా పీల్చుకోలేవు.',
      actionableSteps: [
        'ఎకరానికి 150 కిలోల వ్యవసాయ సున్నం లేదా శుభ్రమైన కట్టెల బూడిదను నేలపై చల్లి తేలికగా దున్నండి.',
        'మంచి సేంద్రియ పశువుల ఎరువును వేసి నేలను సహజంగా బలపరచండి.',
        'రెండు మూడు వారాల తర్వాత మీ డాష్‌బోర్డ్‌లో నేల pH ఎంత మెరుగయిందో గమనించండి.'
      ]
    },
    hi: {
      title: 'मिट्टी में अम्लीयता बढ़ी - बुझा चूना या राख डालें',
      category: 'मिट्टी सुधार',
      issue: (val) => `मिट्टी का पीएच घटकर ${val || '5.6'} हो गया है (उचित स्तर: 6.0-7.0)।`,
      explanation: 'मिट्टी में खट्टापन बढ़ने से पौधे खाद को ठीक से नहीं सोख पाते हैं।',
      actionableSteps: [
        'प्रति एकड़ 150 किलो कृषि चूना या लकड़ी की राख खेत में बिखेरकर हल्की जुताई करें।',
        'सड़ी गोबर की खाद डालकर मिट्टी को प्राकृतिक रूप से उपजाऊ बनाएं।',
        'दो से तीन सप्ताह बाद डैशबोर्ड पर पीएच सुधार की जांच करें।'
      ]
    },
    ta: {
      title: 'மண்ணில் அமிலத்தன்மை அதிகரிப்பு - விவசாய சுண்ணாம்பு இடவும்',
      category: 'மண் மேலாண்மை',
      issue: (val) => `மண் pH ${val || '5.6'} ஆக குறைந்துள்ளது (சரியான அளவு: 6.0-7.0).`,
      explanation: 'மண் புளிப்புத்தன்மை அடைந்துள்ளது. இதனால் செடிகளால் உரங்களை முழுமையாக உறிஞ்ச முடியாது.',
      actionableSteps: [
        'ஏக்கருக்கு 150 கிலோ விவசாய சுண்ணாம்பு அல்லது சாம்பல் தூவி லேசாக கிளறி விடவும்.',
        'மக்கிய இயற்கை எரு சேர்த்து மண்ணை வளப்படுத்தவும்.',
        'இரண்டு அல்லது மூன்று வாரங்களில் pH அளவை மீண்டும் சரிபார்க்கவும்.'
      ]
    },
    kn: {
      title: 'ಮಣ್ಣಿನಲ್ಲಿ ಆಮ್ಲೀಯತೆ ಹೆಚ್ಚಳ - ಕೃಷಿ ಸುಣ್ಣ ಅಥವಾ ಬೂದಿ ಬೆರೆಸಿ',
      category: 'ಮಣ್ಣು ಸುಧಾರಣೆ',
      issue: (val) => `ಮಣ್ಣಿನ ಪಿಹೆಚ್ ${val || '5.6'} ಕ್ಕೆ ಇಳಿದಿದೆ (ಸೂಕ್ತ ಮಟ್ಟ: 6.0-7.0).`,
      explanation: 'ಮಣ್ಣು ಹುಳಿಯಾಗಿದೆ. ಇದರಿಂದಾಗಿ ಗಿಡಗಳಿಗೆ ನಾವು ಹಾಕಿದ ಗೊಬ್ಬರ ಸರಿಯಾಗಿ ಸಿಗುವುದಿಲ್ಲ.',
      actionableSteps: [
        'ಎಕರೆಗೆ 150 ಕೆಜಿ ಕೃಷಿ ಸುಣ್ಣ ಅಥವಾ ಕಟ್ಟಿಗೆಯ ಬೂದಿಯನ್ನು ಹೊಲದಲ್ಲಿ ಸಮನಾಗಿ ಹರಡಿ ಲಘುವಾಗಿ ಉಳುಮೆ ಮಾಡಿ.',
        'ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಬೆರೆಸಿ ಮಣ್ಣಿನ ಸತ್ವ ಹೆಚ್ಚಿಸಿ.',
        'ಎರಡು ಮೂರು ವಾರಗಳ ನಂತರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಪಿಹೆಚ್ ಸುಧಾರಣೆಯನ್ನು ಗಮನಿಸಿ.'
      ]
    },
    ml: {
      title: 'മണ്ണിലെ അമ്ലത്വം കൂടി - കുമ്മായം ചേർക്കുക',
      category: 'മണ്ണ് പോഷണം',
      issue: (val) => `മണ്ണിലെ pH ${val || '5.6'} ആയി കുറഞ്ഞു (ആവശ്യമായ അളവ്: 6.0-7.0).`,
      explanation: 'മണ്ണ് പുളിച്ച അവസ്ഥയിലാണ്. ഇത് ചെടികൾ വളം വലിച്ചെടുക്കുന്നത് തടയും.',
      actionableSteps: [
        'ഏക്കറിന് 150 കിലോ കാർഷിക കുമ്മായമോ ചാരമോ വിതറി മണ്ണിൽ ഇളക്കി ചേർക്കുക.',
        'ചാണകപ്പൊടിയും കമ്പോസ്റ്റും ചേർത്ത് മണ്ണ് സംരക്ഷിക്കുക.',
        'രണ്ടോ മൂന്നോ ആഴ്ചകൾക്ക് ശേഷം pH മാറ്റം പരിശോധിക്കുക.'
      ]
    }
  }
};

/**
 * Translates a recommendation dynamically to the chosen language with farmer-friendly words
 */
export function translateRecommendation(
  rec: RecommendationItem,
  lang: SupportedLanguage
): RecommendationItem {
  if (lang === 'en') return rec;

  const matchKey = Object.keys(REC_TRANSLATIONS).find(k => k === rec.id) ||
    (rec.category.toLowerCase().includes('irrig') ? 'rec-irrig-01' :
     rec.category.toLowerCase().includes('fert') ? 'rec-fert-01' : 'rec-soil-01');

  const localized = REC_TRANSLATIONS[matchKey]?.[lang];
  if (!localized) return rec;

  return {
    ...rec,
    title: localized.title,
    category: localized.category,
    issue: localized.issue(),
    explanation: localized.explanation,
    actionableSteps: localized.actionableSteps,
  };
}

/**
 * Translates plant disease diagnosis results to farmer-friendly language
 */
export function translatePlantAnalysis(
  result: PlantAnalysisResult,
  lang: SupportedLanguage
): PlantAnalysisResult {
  if (lang === 'en') return result;

  const diseaseKey = `disease.${result.disease}`;
  const descKey = `disease.${result.disease}_desc`;
  const actionKey = `disease.${result.disease}_action`;

  const localizedDisease = getTranslation(lang, diseaseKey);
  const localizedDesc = getTranslation(lang, descKey);
  const localizedAction = getTranslation(lang, actionKey);

  const translatedActions = localizedAction !== actionKey ? [localizedAction] : result.recommendedActions;

  return {
    ...result,
    disease: localizedDisease !== diseaseKey ? localizedDisease : result.disease,
    explanation: localizedDesc !== descKey ? localizedDesc : result.explanation,
    recommendedActions: translatedActions,
  };
}

/**
 * Translates individual soil sensor parameter labels and healthy descriptions
 */
export function translateSensorParam(
  param: SensorParameterDetail,
  lang: SupportedLanguage
): SensorParameterDetail {
  const nameKey = `metric.${param.id}`;
  const descKey = `metric.${param.id}.desc`;

  const localizedName = getTranslation(lang, nameKey);
  const localizedDesc = getTranslation(lang, descKey);

  return {
    ...param,
    name: localizedName !== nameKey ? localizedName : param.name,
    description: localizedDesc !== descKey ? localizedDesc : param.description,
  };
}
