"""
AI Inference Engine & Pipeline Service for Agricultural Crop Health & Disease Diagnostics.
Handles image validation, ImageNet preprocessing, PyTorch forward pass, softmax probabilities,
confidence thresholding, and Grad-CAM visual heatmaps.
"""
import os
import io
import uuid
from typing import Dict, Any, Union, Tuple, List, Optional
import torch
import torch.nn.functional as F
from PIL import Image, ImageOps
import torchvision.transforms as transforms

from ai.models.crop_disease_net import CropDiseaseNet, DISEASE_METADATA
from ai.inference.gradcam import GradCAM

# Standard ImageNet Normalization Constants
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# Mandatory Low-Confidence Fallback Notice
LOW_CONFIDENCE_MESSAGE = "Unable to confidently identify the condition. Please capture a clearer image or consult an agricultural expert."

class PlantDiseasePredictor:
    """
    Production Computer Vision Inference Service.
    Isolated from FastAPI router layer for clean architectural separation.
    """
    def __init__(
        self,
        model_path: Optional[str] = None,
        backbone: str = "mobilenet_v3_small",
        confidence_threshold: float = 50.0
    ):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.backbone = backbone
        self.confidence_threshold = confidence_threshold
        self.model_path = model_path

        # Initialize network architecture with transfer learning backbone
        self.model = CropDiseaseNet(
            num_classes=len(DISEASE_METADATA),
            backbone=self.backbone,
            pretrained=True
        )
        self.is_loaded = False
        self._initialize_weights()

        # Image Transformation Pipeline
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
        ])

    def _initialize_weights(self):
        """Loads weights from file if available, or prepares pretrained backbone."""
        target_path = self.model_path or "ai/models/saved_models/crop_disease_model.pt"
        if os.path.exists(target_path):
            try:
                state_dict = torch.load(target_path, map_location=self.device)
                self.model.load_state_dict(state_dict)
                print(f"[AI Model Engine] Loaded custom weights from {target_path}")
            except Exception as e:
                print(f"[AI Model Engine Warning] Could not load checkpoint from {target_path}: {e}")
        
        self.model.to(self.device)
        self.model.eval()
        self.is_loaded = True

    def validate_image(self, image_input: Union[str, bytes, Image.Image]) -> Tuple[bool, Optional[str], Optional[Image.Image]]:
        """
        Validation Pipeline:
        1. Checks raw byte length (non-empty).
        2. Validates image opening & format (JPEG, PNG, WEBP).
        3. Verifies dimensions (minimum 32x32) & converts to RGB.
        """
        try:
            if isinstance(image_input, Image.Image):
                img = image_input.copy()
            elif isinstance(image_input, bytes):
                if len(image_input) == 0:
                    return False, "Uploaded image file is empty (0 bytes).", None
                img = Image.open(io.BytesIO(image_input))
            elif isinstance(image_input, str):
                img = Image.open(image_input)
            else:
                return False, f"Unsupported image input type: {type(image_input)}", None

            # Validate dimensions
            width, height = img.size
            if width < 32 or height < 32:
                return False, "Uploaded image dimensions are too small for vision processing (minimum 32x32 pixels).", None

            # Convert to RGB mode (stripping alpha channel if PNG/WEBP)
            img = img.convert("RGB")
            return True, None, img

        except Exception as e:
            return False, f"Invalid or corrupted image format: {str(e)}", None

    def predict(
        self,
        image_input: Union[str, bytes, Image.Image],
        crop_type: str = "Tomato"
    ) -> Dict[str, Any]:
        """
        Complete Inference Pipeline:
        Image -> Validation -> Preprocessing -> Model Forward -> Class Probabilities -> Threshold Check -> Grad-CAM -> Output
        """
        # Step 1: Image Validation
        is_valid, error_msg, pil_img = self.validate_image(image_input)
        if not is_valid or pil_img is None:
            return {
                "success": False,
                "error": error_msg or "Image validation failed."
            }

        # Step 2: Image Preprocessing
        img_tensor = self.transform(pil_img).unsqueeze(0).to(self.device) # [1, 3, 224, 224]

        # Step 3: Model Inference & Softmax Probabilities
        self.model.eval()
        with torch.no_grad():
            logits = self.model(img_tensor) # [1, num_classes]
            probabilities = F.softmax(logits, dim=1)[0] # [num_classes]

        probs_np = probabilities.cpu().numpy()

        # Build full class probabilities distribution map (display_name -> percentage)
        class_probabilities: Dict[str, float] = {}
        for idx, meta in enumerate(DISEASE_METADATA):
            class_name = meta["display_name"]
            score_pct = round(float(probs_np[idx]) * 100.0, 1)
            class_probabilities[class_name] = score_pct

        # Step 4: Crop-Specific Filtering & Top Prediction Determination
        target_crop_indices = CropDiseaseNet.get_indices_for_crop(crop_type)
        
        # Find top class index among crop-specific classes
        top_crop_idx = target_crop_indices[0]
        top_crop_prob = probs_np[top_crop_idx]
        for idx in target_crop_indices:
            if probs_np[idx] > top_crop_prob:
                top_crop_prob = probs_np[idx]
                top_crop_idx = idx

        top_confidence_pct = round(float(top_crop_prob) * 100.0, 1)
        meta = DISEASE_METADATA[top_crop_idx]

        # Step 5: Grad-CAM Visual Explainability Map Generation
        gradcam_url: Optional[str] = None
        try:
            target_layer = self.model.get_target_layer()
            gradcam_engine = GradCAM(self.model, target_layer)
            _, gradcam_url = gradcam_engine.generate_heatmap(
                input_tensor=img_tensor.clone(),
                target_class_idx=top_crop_idx,
                original_image=pil_img
            )
            gradcam_engine.remove_hooks()
        except Exception as grad_err:
            print(f"[Grad-CAM Notice] Could not generate visual heatmap: {grad_err}")
            gradcam_url = None

        # Step 6: Confidence Threshold Safeguard Check
        is_low_confidence = top_confidence_pct < self.confidence_threshold

        if is_low_confidence:
            return {
                "success": True,
                "analysis_id": f"analysis-{uuid.uuid4().hex[:8]}",
                "crop_type": crop_type.capitalize(),
                "health_status": "warning",
                "disease": LOW_CONFIDENCE_MESSAGE,
                "scientific_name": None,
                "confidence": top_confidence_pct,
                "explanation": f"AI estimated confidence ({top_confidence_pct}%) is below the {self.confidence_threshold}% minimum threshold for a reliable diagnostic assessment. Visual leaf characteristics could not be matched with sufficient certainty.",
                "recommended_actions": [
                    "Capture a clearer, well-lit photograph focusing directly on affected foliage area.",
                    "Ensure adequate ambient light without excessive shadow cast or sunlight glare.",
                    "Consult a certified local agricultural extension officer or agronomic expert."
                ],
                "severity": "low",
                "class_probabilities": class_probabilities,
                "gradcam_image": gradcam_url,
                "is_low_confidence": True,
                "ai_disclaimer": "AI prediction only. Not a guaranteed agricultural diagnosis."
            }

        # Successful high-confidence diagnostic prediction
        return {
            "success": True,
            "analysis_id": f"analysis-{uuid.uuid4().hex[:8]}",
            "crop_type": meta["crop"],
            "health_status": meta["health_status"],
            "disease": meta["display_name"],
            "scientific_name": meta.get("scientific_name"),
            "confidence": top_confidence_pct,
            "explanation": f"Likely condition identified via AI prediction: {meta['explanation']}",
            "recommended_actions": meta["recommended_actions"],
            "severity": meta["severity"],
            "class_probabilities": class_probabilities,
            "gradcam_image": gradcam_url,
            "is_low_confidence": False,
            "ai_disclaimer": "AI prediction only. Not a guaranteed agricultural diagnosis."
        }

# Global Singleton Instance of Predictor Service
predictor_service = PlantDiseasePredictor()
