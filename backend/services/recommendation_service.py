from datetime import datetime
from typing import List, Dict, Any
from backend.models.recommendation import Recommendation, RecommendationListResponse
from backend.services.sensor_service import sensor_service

# Farmer-Friendly Multilingual Recommendation Content
LOCALIZED_CONTENT: Dict[str, Dict[str, Dict[str, Any]]] = {
    "rec-irrig-01": {
        "en": {
            "title": "Root-Zone Moisture Deficit - Run Drip Irrigation",
            "category": "Irrigation",
            "issue": lambda val: f"Soil moisture has dropped to {val}% VWC (healthy range: 40-60%).",
            "explanation": "Warm weather and strong sunshine have dried the topsoil. Plants need water in the root zone to stay healthy.",
            "actionable_steps": [
                "Run drip irrigation for 35 to 45 minutes during early morning hours.",
                "Check moisture readings on your dashboard after 1 hour.",
                "Inspect drip emitters to ensure water flows smoothly without clogs."
            ]
        },
        "te": {
            "title": "నేలలో తేమ తగ్గింది - సాగునీటి తడి అందించండి",
            "category": "సాగునీరు / నీటి తడులు",
            "issue": lambda val: f"నేలలో తేమ శాతం {val}% కి పడిపోయింది (సరైన పరిధి: 40-60%).",
            "explanation": "ఎండ వేడిమికి పైనేల త్వరగా ఆరిపోయింది. మొక్కల వేర్లు వాడిపోకుండా ఉండటానికి వెంటనే తేమ అవసరం.",
            "actionable_steps": [
                "ఉదయాన్నే చల్లటి వేళల్లో 35 నుండి 45 నిమిషాల పాటు డ్రిప్ ద్వారా నీరు అందించండి.",
                "నీరు పెట్టిన గంట తర్వాత నేలలో తేమ ఎంత పెరిగిందో డాష్‌బోర్డ్‌లో చూడండి.",
                "డ్రిప్ పైపుల్లో మట్టి అడ్డం పడకుండా డ్రిప్పర్లను ఒకసారి సరిచూసుకోండి."
            ]
        },
        "hi": {
            "title": "मिट्टी में नमी की कमी - सिंचाई की तुरंत आवश्यकता",
            "category": "सिंचाई प्रबंधन",
            "issue": lambda val: f"मिट्टी में नमी का स्तर घटकर {val}% रह गया है (उचित दायरा: 40-60%)।",
            "explanation": "धूप और गर्मी से ऊपरी मिट्टी सूख गई है। पौधों को सूखने से बचाने के लिए पानी देना जरूरी है।",
            "actionable_steps": [
                "सुबह के ठंडे समय 35 से 45 मिनट के लिए ड्रिप सिंचाई चलाएं।",
                "सिंचाई के एक घंटे बाद मिट्टी में नमी का स्तर फिर से जांचें।",
                "ड्रिप पाइपों की जांच करें ताकि कचरा न फंसे।"
            ]
        },
        "ta": {
            "title": "மண் ஈரப்பதம் குறைவு - உடனடியாக பாசனம் செய்யவும்",
            "category": "நீர்ப்பாசனம்",
            "issue": lambda val: f"மண் ஈரப்பதம் {val}% ஆக குறைந்துள்ளது (ஏற்ற அளவு: 40-60%).",
            "explanation": "வெயிலின் தாக்கத்தால் மேல் மண் வறண்டுள்ளது. பயிர் வாடாமல் இருக்க உடனே தண்ணீர் பாய்ச்ச வேண்டும்.",
            "actionable_steps": [
                "காலை வேளையில் 35 முதல் 45 நிமிடங்கள் வரை சொட்டு நீர் பாசனம் செய்யவும்.",
                "தண்ணீர் விட்ட ஒரு மணி நேரம் கழித்து மண் ஈரப்பதத்தை சரிபார்க்கவும்.",
                "சொட்டு நீர் குழாய்களில் அடைப்பு இல்லாமல் சீராக தண்ணீர் செல்கிறதா என பார்க்கவும்."
            ]
        },
        "kn": {
            "title": "ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಕೊರತೆ - ತಕ್ಷಣ ನೀರು ಹರಿಸಿ",
            "category": "ನೀರಾವರಿ",
            "issue": lambda val: f"ಮಣ್ಣಿನ ತೇವಾಂಶವು {val}% ಕ್ಕೆ ಇಳಿದಿದೆ (ಸೂಕ್ತ ಮಟ್ಟ: 40-60%).",
            "explanation": "ಬಿಸಿಲಿನ ತಾಪಕ್ಕೆ ಮೇಲ್ಮಣ್ಣು ಒಣಗಿದೆ. ಗಿಡಗಳು ಬಾಡದಂತೆ ತಡೆಯಲು ನೀರುಣಿಸುವುದು ಅತ್ಯಗತ್ಯ.",
            "actionable_steps": [
                "ಮುಂಜಾನೆ ತಂಪಾದ ವೇಳೆಯಲ್ಲಿ 35 ರಿಂದ 45 ನಿಮಿಷ ಹನಿ ನೀರಾವರಿ ಮಾಡಿ.",
                "ನೀರು ಹರಿಸಿದ 1 ಗಂಟೆಯ ನಂತರ ತೇವಾಂಶದ ಮಟ್ಟವನ್ನು ಪರಿಶೀಲಿಸಿ.",
                "ಹನಿ ನೀರಾವರಿ ಪೈಪ್‌ಗಳಲ್ಲಿ ಕಸ ಸಿಲುಕದಂತೆ ನೋಡಿಕೊಳ್ಳಿ."
            ]
        },
        "ml": {
            "title": "മണ്ണിലെ ഈർപ്പക്കുറവ് - ഉടനടി നനയ്ക്കുക",
            "category": "ജലസേചനം",
            "issue": lambda val: f"മണ്ണിലെ ഈർപ്പം {val}% ആയി കുറഞ്ഞു (ആവശ്യമായ അളവ്: 40-60%).",
            "explanation": "ചൂട് കൂടിയതിനാൽ മണ്ണിലെ വെള്ളം വറ്റിപ്പോയി. ചെടികൾ വാടാതിരിക്കാൻ വേഗത്തിൽ നനയ്ക്കണം.",
            "actionable_steps": [
                "രാവിലെ തണുപ്പുള്ള സമയത്ത് 35 മുതൽ 45 മിനിറ്റ് വരെ തുള്ളിനന നൽകുക.",
                "നനച്ച് ഒരു മണിക്കൂറിന് ശേഷം ഈർപ്പത്തിന്റെ അളവ് വീണ്ടും പരിശോധിക്കുക.",
                "തുള്ളിനന പൈപ്പുകളിലെ തടസ്സങ്ങൾ മാറ്റുക."
            ]
        }
    },
    "rec-fert-01": {
        "en": {
            "title": "Nitrogen Depletion - Add Fertilizer Top-Dressing",
            "category": "Fertilizer",
            "issue": lambda val: f"Nitrogen reserves are at {val} mg/kg (healthy target: 140-200 mg/kg).",
            "explanation": "Rapid crop growth has used up soil nitrogen. Adding nitrogen now helps keep leaves green and stems sturdy.",
            "actionable_steps": [
                "Side-dress 20 kg per acre of Neem-coated Urea or well-decomposed cow dung manure.",
                "Apply in the cool morning while soil has mild moisture.",
                "Avoid applying before heavy rain storms to prevent fertilizer runoff."
            ]
        },
        "te": {
            "title": "నత్రజని (నైట్రోజన్) తగ్గింది - పైపాటు ఎరువు వేయండి",
            "category": "ఎరువుల యాజమాన్యం",
            "issue": lambda val: f"నేలలో నత్రజని నిల్వలు {val} mg/kg కి తగ్గాయి (సరైన పరిధి: 140-200 mg/kg).",
            "explanation": "మొక్కలు వేగంగా పెరగడం వల్ల నేలలోని నత్రజని ఖర్చయింది. ఆకులు పసుపుబారకుండా పైపాటు ఎరువు వేయడం అవసరం.",
            "actionable_steps": [
                "ఎకరానికి 20 కిలోల వేపపూత పూసిన యూరియా లేదా పశువుల ఎరువును మొక్కల మొదళ్ల వద్ద వేయండి.",
                "నేలలో తగినంత తేమ ఉన్నప్పుడు, ఉదయాన్నే చల్లటి వేళల్లో ఎరువు వేయండి.",
                "భారీ వర్షం పడే సూచనలు ఉన్నప్పుడు ఎరువు వేయవద్దు."
            ]
        },
        "hi": {
            "title": "नाइट्रोजन की कमी - ऊपर से खाद डालें",
            "category": "उर्वरक प्रबंधन",
            "issue": lambda val: f"मिट्टी में नाइट्रोजन का स्तर घटकर {val} mg/kg हो गया है (उचित दायरा: 140-200 mg/kg)।",
            "explanation": "फसल की तेज बढ़वार से मिट्टी का नाइट्रोजन कम हो गया है। पत्तियों को हरा-भरा रखने के लिए खाद जरूरी है।",
            "actionable_steps": [
                "प्रति एकड़ 20 किलो नीम लेपित यूरिया या सड़ी हुई गोबर खाद पौधों की जड़ों के पास डालें।",
                "खाद हमेशा सुबह के समय और जब मिट्टी में हल्की नमी हो तभी डालें।",
                "तेज बारिश की संभावना हो तो खाद न डालें।"
            ]
        },
        "ta": {
            "title": "தழைச்சத்து குறைவு - மேலுரம் இடவும்",
            "category": "உரமிடுதல்",
            "issue": lambda val: f"மண்ணில் நைட்ரஜன் அளவு {val} mg/kg ஆக குறைந்துள்ளது (ஏற்ற அளவு: 140-200 mg/kg).",
            "explanation": "பயிர் வேகமாக வளர்ந்ததால் மண்ணில் உள்ள சத்துக்கள் குறைந்துள்ளன. இலைகள் மஞ்சளாவதை தடுக்க மேலுரம் தேவை.",
            "actionable_steps": [
                "ஏக்கருக்கு 20 கிலோ வேப்பம்பிண்ணாக்கு கலந்த யூரியா அல்லது மக்கிய தொழுவுரம் இடவும்.",
                "மண்ணில் மிதமான ஈரம் இருக்கும் போது காலை வேளையில் உரமிடவும்.",
                "கனமழை பெய்யும் வாய்ப்பு இருந்தால் உரமிடுவதை தவிர்க்கவும்."
            ]
        },
        "kn": {
            "title": "ಸಾರಜನಕ ಕೊರತೆ - ಮೇಲ್ಗೊಬ್ಬರ ಹಾಕಿ",
            "category": "ಗೊಬ್ಬರ ನಿರ್ವಹಣೆ",
            "issue": lambda val: f"ಮಣ್ಣಿನಲ್ಲಿ ಸಾರಜನಕದ ಪ್ರಮಾಣ {val} mg/kg ಗೆ ಇಳಿದಿದೆ (ಸೂಕ್ತ ಮಟ್ಟ: 140-200 mg/kg).",
            "explanation": "ಬೆಳೆ ಶೀಘ್ರವಾಗಿ ಬೆಳೆದ ಕಾರಣ ಮಣ್ಣಿನ ಪೋಷಕಾಂಶ ಕಡಿಮೆಯಾಗಿದೆ. ಎಲೆಗಳು ಹಳದಿಯಾಗದಂತೆ ಕಾಪಾಡಲು ಗೊಬ್ಬರ ಅಗತ್ಯ.",
            "actionable_steps": [
                "ಎಕರೆಗೆ 20 ಕೆಜಿ ಬೇವಿನ ಲೇಪಿತ ಯೂರಿಯಾ ಅಥವಾ ಕಳಿತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರವನ್ನು ಗಿಡಗಳ ಬುಡಕ್ಕೆ ಹಾಕಿ.",
                "ಮಣ್ಣಿನಲ್ಲಿ ಹದವಾದ ತೇವಾಂಶವಿದ್ದಾಗ ಬೆಳಿಗ್ಗೆ ಗೊಬ್ಬರ ಹಾಕಿ.",
                "ಭಾರಿ ಮಳೆ ಬರುವ ಸೂಚನೆ ಇದ್ದರೆ ಗೊಬ್ಬರ ಹಾಕಬೇಡಿ."
            ]
        },
        "ml": {
            "title": "നൈട്രജൻ കുറവ് - മേൽവളം ചേർക്കുക",
            "category": "വളപ്രയോഗം",
            "issue": lambda val: f"മണ്ണിലെ നൈട്രജൻ {val} mg/kg ആയി കുറഞ്ഞു (ആവശ്യമായ അളവ്: 140-200 mg/kg).",
            "explanation": "ചെടികൾ വേഗത്തിൽ വളർന്നതിനാൽ മണ്ണിലെ വളം കുറഞ്ഞു. ഇലകൾ മഞ്ഞളിക്കാതിരിക്കാൻ മേൽവളം ആവശ്യമാണ്.",
            "actionable_steps": [
                "ഏക്കറിന് 20 കിലോ വേപ്പെണ്ണ പുരട്ടിയ യൂറിയയോ ഉണങ്ങിപ്പൊടിഞ്ഞ ചാണകമോ നൽകുക.",
                "മണ്ണിൽ നേരിയ നനവുള്ളപ്പോൾ രാവിലെ വളം ചേർക്കുക.",
                "കനത്ത മഴയുള്ളപ്പോൾ വളം ഇടരുത്."
            ]
        }
    },
    "rec-soil-01": {
        "en": {
            "title": "Acidic Soil Care - Add Agricultural Lime",
            "category": "Soil Amendment",
            "issue": lambda val: f"Soil pH has dropped to {val} (healthy target: 6.0-7.0).",
            "explanation": "Soil has become sour. This locks up phosphorus and calcium, preventing roots from absorbing fertilizers easily.",
            "actionable_steps": [
                "Broadcast 150 kg per acre of agricultural lime or clean wood ash and lightly rake into topsoil.",
                "Add well-rotted cow dung manure to naturally balance soil sweetness.",
                "Re-check soil pH on your dashboard in 2 to 3 weeks."
            ]
        },
        "te": {
            "title": "నేలలో పులుపుదనం (ఆమ్లత) పెరిగింది - సున్నం లేదా బూడిద వేయండి",
            "category": "నేల సంరక్షణ & పునరుద్ధరణ",
            "issue": lambda val: f"నేల pH {val} కి తగ్గింది (సరైన పరిధి: 6.0-7.0).",
            "explanation": "భూమి పుల్లగా మారింది. ఇలా ఉన్నప్పుడు మనం వేసే ఎరువులను మొక్కల వేర్లు సరిగ్గా పీల్చుకోలేవు.",
            "actionable_steps": [
                "ఎకరానికి 150 కిలోల వ్యవసాయ సున్నం లేదా కట్టెల బూడిదను నేలపై చల్లి తేలికగా దున్నండి.",
                "మంచి సేంద్రియ పశువుల ఎరువును వేసి నేలను సహజంగా బలపరచండి.",
                "రెండు మూడు వారాల తర్వాత మీ డాష్‌బోర్డ్‌లో నేల pH ఎంత మెరుగయిందో గమనించండి."
            ]
        },
        "hi": {
            "title": "मिट्टी में अम्लीयता बढ़ी - बुझा चूना या राख डालें",
            "category": "मिट्टी सुधार",
            "issue": lambda val: f"मिट्टी का पीएच घटकर {val} हो गया है (उचित स्तर: 6.0-7.0)।",
            "explanation": "मिट्टी में खट्टापन बढ़ने से पौधे खाद को ठीक से नहीं सोख पाते हैं।",
            "actionable_steps": [
                "प्रति एकड़ 150 किलो कृषि चूना या लकड़ी की राख खेत में बिखेरकर हल्की जुताई करें।",
                "सड़ी गोबर की खाद डालकर मिट्टी को प्राकृतिक रूप से उपजाऊ बनाएं।",
                "दो से तीन सप्ताह बाद डैशबोर्ड पर सुधार की जांच करें।"
            ]
        },
        "ta": {
            "title": "மண்ணில் அமிலத்தன்மை அதிகரிப்பு - விவசாய சுண்ணாம்பு இடவும்",
            "category": "மண் மேலாண்மை",
            "issue": lambda val: f"மண் pH {val} ஆக குறைந்துள்ளது (சரியான அளவு: 6.0-7.0).",
            "explanation": "மண் புளிப்புத்தன்மை அடைந்துள்ளது. இதனால் செடிகளால் உரங்களை முழுமையாக உறிஞ்ச முடியாது.",
            "actionable_steps": [
                "ஏக்கருக்கு 150 கிலோ விவசாய சுண்ணாம்பு அல்லது சாம்பல் தூவி லேசாக கிளறி விடவும்.",
                "மக்கிய இயற்கை எரு சேர்த்து மண்ணை வளப்படுத்தவும்.",
                "இரண்டு அல்லது மூன்று வாரங்களில் pH அளவை மீண்டும் சரிபார்க்கவும்."
            ]
        },
        "kn": {
            "title": "ಮಣ್ಣಿನಲ್ಲಿ ಆಮ್ಲೀಯತೆ ಹೆಚ್ಚಳ - ಕೃಷಿ ಸುಣ್ಣ ಅಥವಾ ಬೂದಿ ಬೆರೆಸಿ",
            "category": "ಮಣ್ಣು ಸುಧಾರಣೆ",
            "issue": lambda val: f"ಮಣ್ಣಿನ ಪಿಹೆಚ್ {val} ಕ್ಕೆ ಇಳಿದಿದೆ (ಸೂಕ್ತ ಮಟ್ಟ: 6.0-7.0).",
            "explanation": "ಮಣ್ಣು ಹುಳಿಯಾಗಿದೆ. ಇದರಿಂದಾಗಿ ಗಿಡಗಳಿಗೆ ನಾವು ಹಾಕಿದ ಗೊಬ್ಬರ ಸರಿಯಾಗಿ ಸಿಗುವುದಿಲ್ಲ.",
            "actionable_steps": [
                "ಎಕರೆಗೆ 150 ಕೆಜಿ ಕೃಷಿ ಸುಣ್ಣ ಅಥವಾ ಕಟ್ಟಿಗೆಯ ಬೂದಿಯನ್ನು ಹೊಲದಲ್ಲಿ ಸಮನಾಗಿ ಹರಡಿ ಲಘುವಾಗಿ ಉಳುಮೆ ಮಾಡಿ.",
                "ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಬೆರೆಸಿ ಮಣ್ಣಿನ ಸತ್ವ ಹೆಚ್ಚಿಸಿ.",
                "ಎರಡು ಮೂರು ವಾರಗಳ ನಂತರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಪಿಹೆಚ್ ಸುಧಾರಣೆಯನ್ನು ಗಮನಿಸಿ."
            ]
        },
        "ml": {
            "title": "മണ്ണിലെ അമ്ലത്വം കൂടി - കുമ്മായം ചേർക്കുക",
            "category": "മണ്ണ് പോഷണം",
            "issue": lambda val: f"മണ്ണിലെ pH {val} ആയി കുറഞ്ഞു (ആവശ്യമായ അളവ്: 6.0-7.0).",
            "explanation": "മണ്ണ് പുളിച്ച അവസ്ഥയിലാണ്. ഇത് ചെടികൾ വളം വലിച്ചെടുക്കുന്നത് തടയും.",
            "actionable_steps": [
                "ഏക്കറിന് 150 കിലോ കാർഷിക കുമ്മായമോ ചാരമോ വിതറി മണ്ണിൽ ഇളക്കി ചേർക്കുക.",
                "ചാണകപ്പൊടിയും കമ്പോസ്റ്റും ചേർത്ത് മണ്ണ് സംരക്ഷിക്കുക.",
                "രണ്ടോ മൂന്നോ ആഴ്ചകൾക്ക് ശേഷം pH മാറ്റം പരിശോധിക്കുക."
            ]
        }
    }
}

from backend.models.recommendation import (
    Recommendation,
    RecommendationListResponse,
    PlantSoilFusionInput,
    FusedRecommendation,
    FusedRecommendationResponse
)
from backend.services.sensor_service import sensor_service
from backend.services.recommendation_engine import recommendation_engine

class RecommendationService:
    def __init__(self):
        self.engine = recommendation_engine

    def evaluate_fused(self, input_data: PlantSoilFusionInput) -> FusedRecommendationResponse:
        """
        Phase 9 Core Entrypoint:
        Fuses plant disease vision inferences with live physical soil sensor telemetry.
        """
        return self.engine.evaluate(input_data)

    def get_recommendations(
        self,
        field_id: str = "field-north-01",
        lang: str = "en",
        crop_type: str = "Tomato"
    ) -> RecommendationListResponse:
        """
        Generates actionable recommendations based on active sensor telemetry in natural farmer-friendly language.
        Integrates latest plant vision analysis when available and populates Phase 9 fields.
        """
        supported_langs = ["en", "te", "hi", "ta", "kn", "ml"]
        target_lang = lang if lang in supported_langs else "en"

        # Check if there is a recent plant analysis in plant_service
        from backend.services.plant_service import plant_service
        latest_plant = plant_service.get_latest_analysis()
        
        disease_name = latest_plant.disease if latest_plant else None
        confidence_val = latest_plant.confidence if latest_plant else None
        health_status_val = latest_plant.health_status if latest_plant else "healthy"
        active_crop = latest_plant.crop_type if latest_plant else crop_type

        # Run Phase 9 Intelligent Fusion Engine
        fusion_input = PlantSoilFusionInput(
            crop_type=active_crop,
            disease_prediction=disease_name,
            disease_confidence=confidence_val,
            plant_health_status=health_status_val,
            field_id=field_id,
            lang=target_lang
        )
        fused_resp = self.engine.evaluate(fusion_input)

        # Map to RecommendationListResponse items with both legacy & Phase 9 fields
        recs: List[Recommendation] = []
        for fused in fused_resp.recommendations:
            recs.append(Recommendation(
                id=fused.id,
                title=fused.recommendation,
                category=fused.category,
                severity=fused.severity,
                issue=fused.reason,
                explanation=fused.suggested_action,
                actionable_steps=fused.actionable_steps,
                recommendation=fused.recommendation,
                reason=fused.reason,
                suggested_action=fused.suggested_action,
                supporting_sensor_values=fused.supporting_sensor_values,
                stress_type=fused.stress_type,
                created_at=fused.created_at
            ))

        return RecommendationListResponse(
            field_id=field_id,
            total_count=len(recs),
            recommendations=recs
        )

recommendation_service = RecommendationService()
