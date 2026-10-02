# 🎬 Leaf Check - Evaluator Demonstration Instructions

This document provides a guided walkthrough for demonstrating the **Leaf Check** platform. It follows the required 10-step demonstration flow showcasing **AI + Computer Vision + IoT + Soil Intelligence + Multilingual Assistance**.

---

## 📋 Demonstration Checklist
- [x] Backend running on `http://127.0.0.1:8000`
- [x] Frontend running on `http://localhost:3000`
- [x] Pre-loaded sample leaf images ready in `frontend/public/samples/`
- [x] Demo mode telemetry active

---

## 🚶 Step-by-Step 10-Stage Demo Script

### Step 1: Open Website
1. Open your browser and navigate to:
   👉 **[http://localhost:3000](http://localhost:3000)**
2. Observe the **White and Gold Outlining** luxury aesthetic with translucent glass cards floating over the clear, ambient blurred botanical background.
3. Note the navigation header displaying **Leaf Check** with gold emblem accents.

---

### Step 2: Select Language (Telugu / English)
1. In the top navigation bar, locate the language selector dropdown (globe icon).
2. Click the dropdown and select **తెలుగు (Telugu)**.
3. Observe all navigation labels, buttons, and badges transition seamlessly into natural Telugu (e.g. *హోమ్*, *పొలం డాష్‌బోర్డ్*, *ఆకు తెగులు తనిఖీ*, *నేల ఆరోగ్యం*).
4. Switch back to **English** (or keep Telugu to demonstrate localization).

---

### Step 3: Upload Crop Leaf Image
1. Click **Plant Disease Check** in the navbar (or click **⚡ Run 10-Step Demo Flow** on the home page).
2. In the target crop category selector, choose **Tomato** (or Potato, Rice, Maize).
3. Under **Quick Testing Presets**, click **Tomato**.
4. The local, high-resolution sample photograph of an early blight tomato leaf (`/samples/tomato.jpg`) loads instantly into the preview viewport with a gold radar scanning indicator.

---

### Step 4: AI Identifies Likely Condition
1. Click **Analyze Tomato Foliage** (or observe the automatic inference trigger).
2. The PyTorch deep learning model executes forward pass inference with Grad-CAM activation.

---

### Step 5: Show Confidence & Explanation
1. On the resulting diagnostic card:
   - **Disease Prediction**: `Tomato Early Blight`
   - **Severity Status**: `Disease Detected` badge (Amber Gold)
   - **Model Confidence**: `94.2%`
   - **Explanation**: Clear description of concentric rings caused by *Alternaria solani*.
   - **Grad-CAM Attention Map**: Visual heatmap highlighting the exact lesion area the neural network focused on.

---

### Step 6: Show Live Soil Sensor Readings
1. Under the **Plant & Soil Fused Guidance** card:
2. Observe the active physical soil telemetry benchmarks:
   - **Soil Moisture**: `32.5% VWC` (Below optimal 40–60% baseline)
   - **Soil Temperature**: `24.2°C`
   - **Soil pH**: `6.40` (Optimal for Tomato)
   - **Nitrogen (N)**: `118 mg/kg` (Mild deficit)
   - **Phosphorus (P)**: `46 mg/kg`
   - **Potassium (K)**: `182 mg/kg`

---

### Step 7: Show Soil-Health Score
1. Observe the composite **Soil Health Score** displayed (`82/100 - Good`).
2. Alternatively, click **Soil Health** in the navigation bar to inspect the detailed gauge breakdown for all 6 parameters and 24-hour historical trends.

---

### Step 8: Combine Plant + Soil Information (Cross-Domain Fusion)
1. Return to the **Plant & Soil Fused Guidance** section.
2. Note how the recommendation engine correlates:
   - **Leaf Pathology**: *Early Blight fungal spores*
   - **Physical Soil State**: *Low moisture (32.5%) & Nitrogen deficit (118 mg/kg)*
3. Notice that the engine flags **Compound Stress** — root drought stress weakens the plant's cuticle defense, accelerating the spread of Alternaria spores.

---

### Step 9: Generate Actionable Recommendation
1. Review the prioritized agronomic guidance:
   - **Recommendation Title**: *"Maintain Moderate Foliage Moisture and Prune Lower Canopy"*
   - **Severity**: `High` (Compound Stress)
   - **Reason**: *"Early blight spores thrive in damp canopies while dry root soil stresses plant natural defenses."*
   - **Suggested Action**: *"Ensure root zone hydration without splashing water onto infected lower leaves. Apply organic compost before next cycle."*
2. Confirm the **Safety Guarantee**: No dangerous chemical or synthetic pesticide prescriptions are made.

---

### Step 10: Ask Farmer AI Assistant a Question
1. Click the primary button: **💬 Ask Farmer AI Assistant About This Result**.
2. The **Farmer AI Assistant** modal opens with the current crop (`Tomato`) already pre-loaded into context.
3. Click the preset prompt (or type):
   - **English**: *"Why are my tomato leaves turning yellow?"*
   - **Telugu**: *"నా టమాటా ఆకులు ఎందుకు పసుపు రంగులోకి మారుతున్నాయి?"*
4. Click **Send**.
5. Observe the structured 4-part explanation:
   1. **Possible Reason**: Correlating Early Blight with active nitrogen deficit.
   2. **Evidence from Foliage**: Explaining concentric lesions from the 94.2% AI scan.
   3. **Evidence from Soil**: Highlighting 32.5% moisture and 118 mg/kg N reserves.
   4. **Recommended Next Step**: Practical, safe cultural guidance.
   5. **Safety Guardrail**: Encouraging consultation with local agricultural extension officers for low confidence or severe blight.

---

## 🌟 Summary: What Has Been Demonstrated
- 🧠 **AI & Computer Vision**: PyTorch CNN foliage classification with Grad-CAM interpretability.
- 📡 **IoT & Soil Intelligence**: Physical environmental telemetry (Moisture, Temp, pH, NPK) and health scoring.
- 🔄 **Agronomic Fusion Engine**: Cross-domain synthesis connecting soil chemistry with leaf symptoms.
- 🗣️ **Multilingual Accessibility**: Farmer-friendly advice in Telugu and English.
- 🛡️ **Safety Guardrails**: Non-certainty language and zero hazardous chemical prescriptions.
