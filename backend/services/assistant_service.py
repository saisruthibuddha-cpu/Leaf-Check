"""
Phase 10 Context-Aware Agricultural AI Assistant.
Answers farmer questions in English and natural Telugu by evaluating:
1. Selected crop
2. Latest plant vision diagnostic result & disease prediction
3. Physical ESP32 soil sensor readings (Moisture, Temp, pH, NPK)
4. Overall soil health score
5. Active agronomic recommendations

Strict Safety Guardrails:
- Never claims diagnostic certainty.
- Explicitly directs farmers to local Krishi Vigyan Kendra / agricultural extension officers when confidence is low.
- Zero dangerous chemical prescriptions.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
from backend.models.assistant import AssistantQueryRequest, AssistantQueryResponse
from backend.services.sensor_service import sensor_service
from backend.services.plant_service import plant_service
from backend.services.recommendation_engine import recommendation_engine, CROP_AGRONOMIC_TARGETS

class AssistantService:
    def __init__(self):
        pass

    def _extract_context(self, req: AssistantQueryRequest) -> Dict[str, Any]:
        """Gathers available crop, vision, and sensor telemetry context."""
        crop = (req.crop_type or "Tomato").strip().capitalize()
        
        # 1. Plant Vision Context
        latest_analysis = plant_service.get_latest_analysis()
        disease = req.disease_prediction or (latest_analysis.disease if latest_analysis else "Not yet scanned")
        confidence = req.disease_confidence if req.disease_confidence is not None else (latest_analysis.confidence if latest_analysis else 0.0)
        health_status = req.plant_health_status or (latest_analysis.health_status if latest_analysis else "unknown")
        explanation = req.analysis_explanation or (latest_analysis.explanation if latest_analysis else "")
        
        # 2. Soil Telemetry Context
        latest_sensor = sensor_service.get_latest_reading()
        moisture = req.soil_moisture if req.soil_moisture is not None else latest_sensor.soil_moisture
        temp = req.soil_temperature if req.soil_temperature is not None else latest_sensor.soil_temperature
        ph = req.ph if req.ph is not None else latest_sensor.ph
        nitrogen = req.nitrogen if req.nitrogen is not None else latest_sensor.nitrogen
        phosphorus = req.phosphorus if req.phosphorus is not None else latest_sensor.phosphorus
        potassium = req.potassium if req.potassium is not None else latest_sensor.potassium
        is_sensor_offline = latest_sensor.is_offline

        # 3. Soil Health Score Context
        soil_health_data = sensor_service.calculate_soil_health()
        health_score = req.soil_health_score if req.soil_health_score is not None else soil_health_data.estimated_score
        health_rating = soil_health_data.rating

        # 4. Crop Agronomic Targets
        crop_key = crop.lower()
        targets = CROP_AGRONOMIC_TARGETS.get(crop_key, CROP_AGRONOMIC_TARGETS["default"])

        return {
            "crop": crop,
            "disease": disease,
            "confidence": confidence,
            "health_status": health_status,
            "vision_explanation": explanation,
            "moisture": moisture,
            "temperature": temp,
            "ph": ph,
            "nitrogen": nitrogen,
            "phosphorus": phosphorus,
            "potassium": potassium,
            "is_sensor_offline": is_sensor_offline,
            "health_score": health_score,
            "health_rating": health_rating,
            "targets": targets,
            "existing_recommendations": req.existing_recommendations or []
        }

    def answer_farmer_query(self, req: AssistantQueryRequest) -> AssistantQueryResponse:
        """
        Main query processing pipeline:
        Synthesizes question intent with multi-modal crop telemetry.
        """
        ctx = self._extract_context(req)
        lang = req.lang if req.lang in ["en", "te"] else "en"
        question_lower = req.question.lower()

        # Classify Primary Question Intent
        intent = self._classify_intent(question_lower)

        # Generate English or Telugu Contextual Explanation
        if lang == "te":
            response = self._generate_telugu_response(req.question, intent, ctx)
        else:
            response = self._generate_english_response(req.question, intent, ctx)

        return response

    def _classify_intent(self, q: str) -> str:
        """Classifies the farmer's question into agronomic topics."""
        if any(w in q for w in ["yellow", "yellowing", "పసుపు", "ఆకులు పసుపు", "chlorosis"]):
            return "yellowing_leaves"
        elif any(w in q for w in ["water", "moisture", "dry", "irrigate", "watering", "నీరు", "తేమ", "తడి"]):
            return "water_irrigation"
        elif any(w in q for w in ["spot", "blight", "fungus", "disease", "rot", "మచ్చ", "తెగులు", "కుళ్ళు", "బూజు"]):
            return "leaf_disease"
        elif any(w in q for w in ["fertilizer", "urea", "nitrogen", "npk", "manure", "ఎరువు", "యూరియా", "నత్రజని"]):
            return "nutrition_fertilizer"
        elif any(w in q for w in ["ph", "acid", "alkali", "sour", "ఆమ్ల", "క్షార", "సున్నం"]):
            return "soil_ph"
        elif any(w in q for w in ["status", "health", "how is", "doing", "పరిస్థితి", "ఆరోగ్యం", "ఎలా ఉంది"]):
            return "general_health"
        else:
            return "general_inquiry"

    def _generate_english_response(
        self,
        question: str,
        intent: str,
        ctx: Dict[str, Any]
    ) -> AssistantQueryResponse:
        """Generates English response structured into the 4 required sections."""
        crop = ctx["crop"]
        disease = ctx["disease"]
        confidence = ctx["confidence"]
        moisture = ctx["moisture"]
        nitrogen = ctx["nitrogen"]
        ph = ctx["ph"]
        temp = ctx["temperature"]
        health_score = ctx["health_score"]
        targets = ctx["targets"]

        # Confidence level check
        has_low_conf = confidence < 60.0 or disease in ["Not yet scanned", "unknown", "Unknown"]
        conf_level = "Low Confidence — Consult Local Expert" if has_low_conf else "Moderate Likelihood (Advisory Only)"

        if intent == "yellowing_leaves":
            # Synthesize Yellowing Causes (N deficit, Disease, Moisture, pH)
            reasons_found = []
            if nitrogen < targets["n_min"]:
                reasons_found.append("low soil nitrogen availability")
            if disease not in ["Healthy", "Not yet scanned", "unknown"]:
                reasons_found.append(f"possible foliar pathogen stress ({disease})")
            if moisture < targets["moisture_min"]:
                reasons_found.append("root-zone water deficit")
            elif moisture > targets["moisture_max"]:
                reasons_found.append("excess soil moisture restricting root aeration")
            if ph < targets["ph_min"] or ph > targets["ph_max"]:
                reasons_found.append("sub-optimal soil pH locking out micronutrients")

            primary_reason = ", ".join(reasons_found) if reasons_found else "mild environmental transition"
            possible_reason = f"Based on your field's live data, the yellowing on your {crop} leaves may likely be associated with {primary_reason}."

            if disease not in ["Healthy", "Not yet scanned", "unknown"]:
                evidence_plant = f"Leaf vision diagnostics identified symptoms characteristic of {disease} (estimated confidence: {confidence:.1f}%). Concentric discoloration or lower leaf chlorosis is frequently observed with this condition."
            else:
                evidence_plant = f"The leaf image does not show advanced disease lesions (or has not yet been scanned), suggesting the yellowing may be driven primarily by soil nutrition or water balance rather than an infectious pathogen."

            evidence_soil = f"Active soil telemetry indicates nitrogen at {nitrogen:.1f} mg/kg (healthy baseline: {targets['n_min']}-{targets['n_max']} mg/kg), soil moisture at {moisture:.1f}% (target: {targets['moisture_min']}-{targets['moisture_max']}%), pH at {ph:.2f}, and an overall soil health score of {health_score}/100."

            recommended_step = f"1. Inspect and gently prune any heavily yellowed bottom leaves to improve canopy airflow. 2. Side-dress well-cured organic compost or vermicompost around root zones to gently replenish nitrogen. 3. Avoid excessive synthetic chemical fertilizers during active yellowing. Because AI diagnostics cannot guarantee absolute certainty, please consult your local Krishi Vigyan Kendra or agricultural extension officer if yellowing continues to spread."

        elif intent == "water_irrigation":
            is_dry = moisture < targets["moisture_min"]
            is_wet = moisture > targets["moisture_max"]
            
            if is_dry:
                possible_reason = f"Your {crop} root zone is experiencing water deficit stress as soil moisture has fallen below the optimal benchmark."
            elif is_wet:
                possible_reason = f"Soil moisture is above the ideal threshold, which may saturate root pores and hinder oxygen absorption."
            else:
                possible_reason = f"Soil moisture is currently within the healthy agronomic range for {crop}."

            evidence_plant = f"Leaf status is evaluated as '{disease}'. Plant foliage remains stable when root moisture is balanced."
            evidence_soil = f"Field moisture sensor reads {moisture:.1f}% VWC (target: {targets['moisture_min']}-{targets['moisture_max']}%), with ground temperature at {temp:.1f}°C."
            recommended_step = f"Check drip lines for consistent distribution. {'Schedule a gentle morning watering cycle.' if is_dry else 'Pause active irrigation and verify field drainage channels are clear.'} Re-check sensor readings in 1-2 hours."

        elif intent == "leaf_disease":
            possible_reason = f"Visual leaf symptoms indicate possible pathogen activity, most closely matching {disease}."
            evidence_plant = f"The AI computer vision pipeline identified leaf spots/lesions matching {disease} with an estimated confidence of {confidence:.1f}%."
            evidence_soil = f"Soil moisture is currently {moisture:.1f}% with temperature at {temp:.1f}°C and pH at {ph:.2f}. {'Wet soil and humidity can accelerate fungal spore germination.' if moisture > 60 else 'Soil moisture remains in a controlled range.'}"
            recommended_step = "Carefully remove and safely dispose of severely spotted leaves outside your crop field. Do not splash water onto upper leaves. For exact identification and safe biological management, take a leaf sample to your local agricultural extension service."

        elif intent == "nutrition_fertilizer":
            possible_reason = f"Soil nutrient assessment shows {'depleted nitrogen reserves' if nitrogen < targets['n_min'] else 'balanced macronutrient availability'} in your {crop} field."
            evidence_plant = f"Current leaf health status reflects: {disease} (Confidence: {confidence:.1f}%)."
            evidence_soil = f"Macronutrient telemetry reads: Nitrogen {nitrogen:.0f} mg/kg (target: {targets['n_min']}-{targets['n_max']}), Phosphorus {ctx['phosphorus']:.0f} mg/kg, Potassium {ctx['potassium']:.0f} mg/kg, pH {ph:.2f}, Health Score: {health_score}/100."
            recommended_step = f"{'Incorporate well-rotted farmyard manure or vermicompost to gently elevate nitrogen.' if nitrogen < targets['n_min'] else 'Macronutrients are in good balance; maintain regular monitoring.'} Always perform a standard soil test before applying synthetic fertilizers."

        elif intent == "soil_ph":
            is_acid = ph < targets["ph_min"]
            possible_reason = f"Your topsoil pH is measured at {ph:.2f}, which is {'acidic' if is_acid else 'alkaline'} for optimal {crop} cultivation."
            evidence_plant = f"Foliar diagnostics report condition: {disease}."
            evidence_soil = f"pH probe reads {ph:.2f} (optimal range: {targets['ph_min']} - {targets['ph_max']}), with overall soil health score of {health_score}/100."
            recommended_step = f"{'Consider incorporating agricultural lime or decomposed compost to buffer acidity.' if is_acid else 'Apply organic green manure or gypsum to regulate alkalinity.'} Consult an agronomy officer for tailored field amendments."

        else: # general health
            possible_reason = f"Your {crop} plot is currently operating with an overall soil health score of {health_score}/100 ({ctx['health_rating']})."
            evidence_plant = f"Latest foliage diagnosis: {disease} (Confidence: {confidence:.1f}%)."
            evidence_soil = f"Moisture: {moisture:.1f}%, Temp: {temp:.1f}°C, pH: {ph:.2f}, N-P-K: {nitrogen:.0f}-{ctx['phosphorus']:.0f}-{ctx['potassium']:.0f} mg/kg."
            recommended_step = "Maintain daily telemetry polling and monitor foliage weekly for changes. When in doubt, seek guidance from your local agricultural extension desk."

        # Synthesize Conversational Text
        full_response = (
            f"**Namaste! Here is what your field data indicates regarding your {crop}:**\n\n"
            f"1. **Possible Reason:** {possible_reason}\n\n"
            f"2. **Evidence from Plant Image:** {evidence_plant}\n\n"
            f"3. **Relevant Soil Measurements:** {evidence_soil}\n\n"
            f"4. **Recommended Next Step:** {recommended_step}\n\n"
            f"> *Note: {conf_level}. AI guidance is advisory and does not guarantee certainty.*"
        )

        return AssistantQueryResponse(
            question=question,
            lang="en",
            crop_type=crop,
            possible_reason=possible_reason,
            evidence_from_plant_image=evidence_plant,
            relevant_soil_measurements=evidence_soil,
            recommended_next_step=recommended_step,
            full_response=full_response,
            confidence_level=conf_level,
            context_utilized={
                "crop": crop,
                "disease": disease,
                "confidence": confidence,
                "moisture": moisture,
                "temperature": temp,
                "ph": ph,
                "nitrogen": nitrogen,
                "health_score": health_score
            }
        )

    def _generate_telugu_response(
        self,
        question: str,
        intent: str,
        ctx: Dict[str, Any]
    ) -> AssistantQueryResponse:
        """Generates natural, farmer-friendly Telugu response structured into 4 sections."""
        crop = ctx["crop"]
        crop_te = "టమోటా" if crop == "Tomato" else ("బంగాళాదుంప" if crop == "Potato" else ("వరి" if crop == "Rice" else "మొక్కజొన్న"))
        disease = ctx["disease"]
        confidence = ctx["confidence"]
        moisture = ctx["moisture"]
        nitrogen = ctx["nitrogen"]
        ph = ctx["ph"]
        temp = ctx["temperature"]
        health_score = ctx["health_score"]
        targets = ctx["targets"]

        has_low_conf = confidence < 60.0 or disease in ["Not yet scanned", "unknown", "Unknown"]
        conf_level = "పరిమిత ఖచ్చితత్వం — స్థానిక వ్యవసాయ అధికారిని సంప్రదించండి" if has_low_conf else "మితమైన సంభావ్యత (రైతు సలహా మాత్రమే)"

        if intent == "yellowing_leaves":
            possible_reason = f"మీ {crop_te} పంటలో ఆకులు పసుపుబారడానికి ప్రధానంగా నేలలో నత్రజని (నైట్రోజన్) తగ్గడం లేదా ఆకు తెగులు లక్షణాలు కారణం కావచ్చు."
            
            if disease not in ["Healthy", "Not yet scanned", "unknown"]:
                evidence_plant = f"ఆకు ఫోటోను పరిశీలించగా '{disease}' తెగులు లక్షణాలు కనిపించాయి (అంచనా ఖచ్చితత్వం: {confidence:.1f}%). ఈ తెగులు వచ్చినప్పుడు మొదట కింద ఆకులు పసుపుబారి క్రమంగా మచ్చలు ఏర్పడతాయి."
            else:
                evidence_plant = f"ఆకుపై ఎటువంటి తీవ్రమైన తెగులు మచ్చలు కనిపించలేదు, కాబట్టి ఈ పసుపు రంగు తెగులు వల్ల కాకుండా నేలలోని పోషకాలు లేదా తేమ లోపం వల్ల కావచ్చని భావిస్తున్నాము."

            evidence_soil = f"నేల సెన్సార్ కొలతల ప్రకారం: నత్రజని {nitrogen:.1f} mg/kg (ఉండాల్సిన పరిధి: {targets['n_min']}-{targets['n_max']}), తేమ శాతం {moisture:.1f}%, pH {ph:.2f}, మరియు నేల ఆరోగ్య స్కోరు {health_score}/100 గా ఉన్నాయి."

            recommended_step = f"1. బాగా పసుపుబారిన కింది ఆకులను తుంచి పొలానికి దూరంగా వేయండి. 2. మొక్కల మొదళ్ల వద్ద బాగా చివికిన పశువుల ఎరువు లేదా వర్మీ కంపోస్ట్ వేయండి. 3. వెంటనే బలమైన రసాయన ఎరువులు వేయవద్దు. ఏఐ నిర్ధారణ పూర్తి ఖచ్చితమైనది కాకపోవచ్చు కాబట్టి, సమస్య తగ్గకపోతే మీ మండల వ్యవసాయ విస్తరణాధికారిని (AEO) లేదా కృషి విజ్ఞాన కేంద్రాన్ని (KVK) సంప్రదించండి."

        elif intent == "water_irrigation":
            is_dry = moisture < targets["moisture_min"]
            possible_reason = f"మీ {crop_te} పంట నేలలో తేమ శాతం {'తగ్గి మొక్కలు నీటి ఎద్దడికి గురవుతున్నాయి' if is_dry else 'అనుకూలమైన పరిధిలో ఉంది'}."
            evidence_plant = f"ఆకు స్థితి: {disease}."
            evidence_soil = f"ప్రస్తుత నేల తేమ {moisture:.1f}% (సరైన పరిధి: {targets['moisture_min']}-{targets['moisture_max']}%), ఉష్ణోగ్రత {temp:.1f}°C."
            recommended_step = f"{'ఉదయాన్నే చల్లటి వేళల్లో డ్రిప్ ద్వారా తేలికపాటి తడి అందించండి.' if is_dry else 'ప్రస్తుతం నీరు పెట్టవలసిన అవసరం లేదు; డ్రైనేజీ కాలువలను సరిచూసుకోండి.'} గంట తర్వాత మళ్ళీ రీడింగ్ చూడండి."

        elif intent == "leaf_disease":
            possible_reason = f"ఆకులపై తెగులు లక్షణాలు కనిపించాయి, ఇది ఎక్కువగా '{disease}' తెగులుగా గుర్తించబడింది."
            evidence_plant = f"కెమెరా పరీక్షలో ఆకులపై మచ్చలు కనిపించాయి (విశ్వసనీయత: {confidence:.1f}%)."
            evidence_soil = f"నేలలో తేమ {moisture:.1f}%, ఉష్ణోగ్రత {temp:.1f}°C, pH {ph:.2f} గా నమోదయ్యాయి."
            recommended_step = "తెగులు సోకిన ఆకులను జాగ్రత్తగా తుంచి నాశనం చేయండి. ఆకులపై నీరు చిమ్మవద్దు. సరైన నివారణ కోసం ఒక ఆకు నమూనాను స్థానిక రైతు భరోసా కేంద్రం లేదా వ్యవసాయాధికారికి చూపించండి."

        elif intent == "nutrition_fertilizer":
            possible_reason = f"మీ {crop_te} నేలలో {'నత్రజని పోషకం తగ్గింది' if nitrogen < targets['n_min'] else 'ప్రధాన పోషకాలు సమతుల్యంగా ఉన్నాయి'}."
            evidence_plant = f"పంట ఆకుల స్థితి: {disease}."
            evidence_soil = f"నత్రజని {nitrogen:.0f} mg/kg, భాస్వరం {ctx['phosphorus']:.0f} mg/kg, పొటాషియం {ctx['potassium']:.0f} mg/kg, ఆరోగ్య స్కోరు {health_score}/100."
            recommended_step = f"{'ఎకరానికి పశువుల ఎరువు లేదా వర్మీ కంపోస్ట్ వేయండి.' if nitrogen < targets['n_min'] else 'ప్రస్తుతం అదనపు రసాయనిక ఎరువులు అవసరం లేదు.'} రసాయనాలు వాడే ముందు మట్టి పరీక్ష చేయించుకోండి."

        else: # general
            possible_reason = f"మీ {crop_te} పొలం నేల ఆరోగ్యం ప్రస్తుతం {health_score}/100 స్కోరుతో ఉంది."
            evidence_plant = f"ఆకు పరీక్ష వివరాలు: {disease} (ఖచ్చితత్వం: {confidence:.1f}%)."
            evidence_soil = f"తేమ: {moisture:.1f}%, ఉష్ణోగ్రత: {temp:.1f}°C, pH: {ph:.2f}, నత్రజని: {nitrogen:.0f} mg/kg."
            recommended_step = "రోజువారీ సెన్సార్ రీడింగులను పరిశీలిస్తూ ఉండండి. పంటలో ఏవైనా ఆకస్మిక మార్పులు వస్తే స్థానిక వ్యవసాయ నిపుణులను సంప్రదించండి."

        full_response = (
            f"**నమస్కారం రైతు సోదరులారా! మీ {crop_te} పంట వివరాల విశ్లేషణ ఇక్కడ ఉంది:**\n\n"
            f"1. **సాధ్యమయ్యే కారణం (Possible Reason):** {possible_reason}\n\n"
            f"2. **ఆకు ఫోటో ఆధారాలు (Evidence from Plant Image):** {evidence_plant}\n\n"
            f"3. **నేల సెన్సార్ కొలతలు (Relevant Soil Measurements):** {evidence_soil}\n\n"
            f"4. **చేయవలసిన పనులు (Recommended Next Step):** {recommended_step}\n\n"
            f"> *గమనిక: {conf_level}. ఏఐ సమాచారం కేవలం మార్గదర్శకత్వానికి మాత్రమే, ఖచ్చితమైన నిర్ధారణ కాదు.*"
        )

        return AssistantQueryResponse(
            question=question,
            lang="te",
            crop_type=crop,
            possible_reason=possible_reason,
            evidence_from_plant_image=evidence_plant,
            relevant_soil_measurements=evidence_soil,
            recommended_next_step=recommended_step,
            full_response=full_response,
            confidence_level=conf_level,
            safety_disclaimer="గమనిక: ఈ సమాచారం లభ్యమైన సెన్సార్ మరియు ఆకు ఫోటోల ఆధారంగా రూపొందించిన సూచన మాత్రమే. పూర్తి ఖచ్చితమైన సమాచారం కోసం స్థానిక వ్యవసాయ విస్తరణాధికారులను లేదా కృషి విజ్ఞాన కేంద్రాన్ని సంప్రదించండి.",
            context_utilized={
                "crop": crop,
                "disease": disease,
                "confidence": confidence,
                "moisture": moisture,
                "temperature": temp,
                "ph": ph,
                "nitrogen": nitrogen,
                "health_score": health_score
            }
        )

assistant_service = AssistantService()
