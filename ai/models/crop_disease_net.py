"""
PyTorch Deep Learning Architecture for Agricultural Crop Disease Classification
Backbone: ResNet (ResNet18 / ResNet50) fine-tuned for Plant Foliage Health Diagnostics.
"""
from typing import Dict, Any, List, Optional
import torch
import torch.nn as nn
from torchvision import models

# Complete agricultural disease taxonomy and diagnostic metadata catalog
DISEASE_METADATA: List[Dict[str, Any]] = [
    {
        "id": "TOMATO_EARLY_BLIGHT",
        "crop": "Tomato",
        "display_name": "Tomato Early Blight",
        "scientific_name": "Alternaria solani",
        "health_status": "disease_detected",
        "severity": "moderate",
        "explanation": "Dark concentric rings (target-spot pattern) surrounded by chlorotic halos on lower foliage, progressing upwards during humid warmth.",
        "recommended_actions": [
            "Apply copper-based organic bio-fungicide within 24-48 hours",
            "Prune bottom 10-15 cm canopy foliage to promote air circulation",
            "Transition to ground drip irrigation to prevent foliar moisture retention"
        ]
    },
    {
        "id": "TOMATO_LATE_BLIGHT",
        "crop": "Tomato",
        "display_name": "Tomato Late Blight",
        "scientific_name": "Phytophthora infestans",
        "health_status": "disease_detected",
        "severity": "severe",
        "explanation": "Rapid water-soaked lesions expanding into dark necrotic foliage areas with pale fungal sporulation underneath during cool, damp cycles.",
        "recommended_actions": [
            "Immediately excise and discard severely affected canopy foliage",
            "Apply systemic fungicide (Mancozeb or Chlorothalonil)",
            "Cease overhead misting and lower relative humidity in greenhouse"
        ]
    },
    {
        "id": "TOMATO_LEAF_MOLD",
        "crop": "Tomato",
        "display_name": "Tomato Leaf Mold",
        "scientific_name": "Passalora fulva",
        "health_status": "warning",
        "severity": "moderate",
        "explanation": "Pale yellowish-green blotches on upper leaf surface with velvety olive-brown fungal growth on the underside.",
        "recommended_actions": [
            "Increase high-tunnel ventilation and reduce canopy density",
            "Apply sulfur-based or copper soap fungicide",
            "Ensure daytime relative humidity stays below 85%"
        ]
    },
    {
        "id": "TOMATO_SEPTORIA",
        "crop": "Tomato",
        "display_name": "Tomato Septoria Leaf Spot",
        "scientific_name": "Septoria lycopersici",
        "health_status": "disease_detected",
        "severity": "moderate",
        "explanation": "Numerous small circular lesions (2-3 mm) with gray or tan centers and dark brown margins studded with minute pycnidia.",
        "recommended_actions": [
            "Remove diseased bottom leaves promptly and incinerate debris",
            "Mulch base of plants heavily to prevent soil-splash reinfection",
            "Apply preventative broad-spectrum bio-fungicide"
        ]
    },
    {
        "id": "TOMATO_HEALTHY",
        "crop": "Tomato",
        "display_name": "Tomato - Healthy Foliage",
        "scientific_name": "Solanum lycopersicum",
        "health_status": "healthy",
        "severity": "none",
        "explanation": "Vibrant emerald green leaf color, intact cuticle layers, balanced stomatal activity, and zero fungal or bacterial lesions.",
        "recommended_actions": [
            "Maintain current standard irrigation and scheduled organic fertilization",
            "Perform routine bi-weekly leaf tissue and soil moisture scans"
        ]
    },
    {
        "id": "POTATO_EARLY_BLIGHT",
        "crop": "Potato",
        "display_name": "Potato Early Blight",
        "scientific_name": "Alternaria solani",
        "health_status": "disease_detected",
        "severity": "moderate",
        "explanation": "Target-like brown necrotic spots bordered by yellow halos primarily attacking maturing lower foliage and accelerating senescence.",
        "recommended_actions": [
            "Apply protective fungicide (Azoxystrobin or Chlorothalonil)",
            "Maintain adequate nitrogen and potassium fertility to preserve canopy vigor",
            "Avoid sprinkler irrigation during late afternoon hours"
        ]
    },
    {
        "id": "POTATO_LATE_BLIGHT",
        "crop": "Potato",
        "display_name": "Potato Late Blight",
        "scientific_name": "Phytophthora infestans",
        "health_status": "disease_detected",
        "severity": "severe",
        "explanation": "Aggressive, dark necrotic lesions with translucent watery fringes, accompanied by white mildew growth under wet canopy conditions.",
        "recommended_actions": [
            "Isolate affected parcel and destroy infected vegetative haulms",
            "Apply targeted systemic oomycete fungicide (Metalaxyl / Dimethomorph)",
            "Delay tuber harvest until vines are fully desiccant-killed"
        ]
    },
    {
        "id": "POTATO_HEALTHY",
        "crop": "Potato",
        "display_name": "Potato - Healthy Foliage",
        "scientific_name": "Solanum tuberosum",
        "health_status": "healthy",
        "severity": "none",
        "explanation": "Uniform chlorophyll distribution, vigorous compound leaves, no fungal sporulation or leaf necrosis detected.",
        "recommended_actions": [
            "Continue calibrated drip irrigation and balanced nitrogen-potash feeding",
            "Scout weekly for Colorado potato beetle or early blight symptoms"
        ]
    },
    {
        "id": "RICE_BROWN_SPOT",
        "crop": "Rice",
        "display_name": "Rice Brown Spot",
        "scientific_name": "Bipolaris oryzae",
        "health_status": "disease_detected",
        "severity": "moderate",
        "explanation": "Oval or circular brown spots with distinct gray centers on leaf blades. Strongly exacerbated by nutrient-depleted soils and potassium deficit.",
        "recommended_actions": [
            "Apply top-dressing of muriate of potash and micronutrient zinc sulfate",
            "Maintain continuous shallow flooding (3-5 cm) to suppress fungal sporulation",
            "Apply foliar bio-control agent (Pseudomonas fluorescens) at tillering"
        ]
    },
    {
        "id": "RICE_LEAF_BLAST",
        "crop": "Rice",
        "display_name": "Rice Leaf Blast",
        "scientific_name": "Magnaporthe oryzae",
        "health_status": "disease_detected",
        "severity": "severe",
        "explanation": "Spindle-shaped elliptical lesions with pointed ends, gray center, and brown margin. Rapid coalescence causes complete leaf desiccation.",
        "recommended_actions": [
            "Apply tricyclazole or isoprothiolane fungicide immediately upon detection",
            "Avoid excessive nitrogen fertilization which increases blast susceptibility",
            "Ensure proper field drainage followed by clean irrigation reflooding"
        ]
    },
    {
        "id": "RICE_BACTERIAL_BLIGHT",
        "crop": "Rice",
        "display_name": "Rice Bacterial Blight",
        "scientific_name": "Xanthomonas oryzae pv. oryzae",
        "health_status": "disease_detected",
        "severity": "severe",
        "explanation": "Water-soaked stripes starting from leaf tips and margins, turning yellow to straw-colored with wavy edges and bacterial ooze.",
        "recommended_actions": [
            "Drain infected field for 2-3 days to dry out leaf canopy",
            "Spray copper hydroxide or bactericide formulation",
            "Eradicate weed hosts and avoid clipping seedling tips before transplanting"
        ]
    },
    {
        "id": "RICE_HEALTHY",
        "crop": "Rice",
        "display_name": "Rice - Healthy Foliage",
        "scientific_name": "Oryza sativa",
        "health_status": "healthy",
        "severity": "none",
        "explanation": "Lush upright green tillers, intact blade margins, zero blast lesions, and normal photosynthetic reflectance.",
        "recommended_actions": [
            "Maintain optimal standing water depth according to growth stage",
            "Proceed with split urea and potash fertilizer scheduling"
        ]
    },
    {
        "id": "MAIZE_NORTHERN_BLIGHT",
        "crop": "Maize",
        "display_name": "Northern Corn Leaf Blight",
        "scientific_name": "Exserohilum turcicum",
        "health_status": "disease_detected",
        "severity": "moderate",
        "explanation": "Long elliptical cigar-shaped grayish-green lesions (3-15 cm) extending parallel to leaf veins across the lower and middle canopy.",
        "recommended_actions": [
            "Apply foliar strobilurin or triazole fungicide if lesions appear before silking",
            "Rotate field with non-host legume crop in subsequent planting cycle",
            "Incorporate crop stubble deeply to hasten fungal residue decay"
        ]
    },
    {
        "id": "MAIZE_COMMON_RUST",
        "crop": "Maize",
        "display_name": "Maize Common Rust",
        "scientific_name": "Puccinia sorghi",
        "health_status": "warning",
        "severity": "low",
        "explanation": "Small golden-brown to cinnamon-brown pustules scattered densely over both upper and lower leaf surfaces, releasing powdery spores.",
        "recommended_actions": [
            "Monitor pustule density; fungicide rarely required unless severity exceeds 15% before pollination",
            "Plant rust-resistant hybrid varieties in future seasons",
            "Ensure balanced plant nutrition avoiding excess nitrate"
        ]
    },
    {
        "id": "MAIZE_GRAY_LEAF_SPOT",
        "crop": "Maize",
        "display_name": "Maize Gray Leaf Spot",
        "scientific_name": "Cercospora zeae-maydis",
        "health_status": "disease_detected",
        "severity": "moderate",
        "explanation": "Strictly rectangular blocky tan lesions delimited by parallel leaf veins, later turning grayish as fungal conidia develop.",
        "recommended_actions": [
            "Apply preventative fungicide at late vegetative (V12) to tassel (VT) stage",
            "Practice minimum 1-year rotation away from corn",
            "Utilize tillage to break down infested previous season residue"
        ]
    },
    {
        "id": "MAIZE_HEALTHY",
        "crop": "Maize",
        "display_name": "Maize - Healthy Foliage",
        "scientific_name": "Zea mays",
        "health_status": "healthy",
        "severity": "none",
        "explanation": "Strong erect leaf architecture with deep dark green coloration, broad photosynthetic surface, and zero fungal lesions.",
        "recommended_actions": [
            "Continue standard sidedress nitrogen application",
            "Monitor soil volumetric moisture at root depth during tassel emergence"
        ]
    }
]

class CropDiseaseNet(nn.Module):
    """
    Transfer learning network supporting lightweight backbones (MobileNetV3, EfficientNet, ResNet)
    specialized for fine-grained agricultural disease identification.
    """
    def __init__(self, num_classes: int = len(DISEASE_METADATA), backbone: str = "mobilenet_v3_small", pretrained: bool = True):
        super(CropDiseaseNet, self).__init__()
        self.backbone_name = backbone.lower()
        self.num_classes = num_classes

        if "mobilenet" in self.backbone_name:
            weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
            base_model = models.mobilenet_v3_small(weights=weights)
            in_features = base_model.classifier[0].in_features
            base_model.classifier = nn.Sequential(
                nn.Linear(in_features, 512),
                nn.Hardswish(inplace=True),
                nn.Dropout(p=0.2),
                nn.Linear(512, num_classes)
            )
            self.backbone = base_model
        elif "efficientnet" in self.backbone_name:
            weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
            base_model = models.efficientnet_b0(weights=weights)
            in_features = base_model.classifier[1].in_features
            base_model.classifier = nn.Sequential(
                nn.Dropout(p=0.3),
                nn.Linear(in_features, 512),
                nn.SiLU(inplace=True),
                nn.Dropout(p=0.2),
                nn.Linear(512, num_classes)
            )
            self.backbone = base_model
        elif "50" in self.backbone_name:
            weights = models.ResNet50_Weights.DEFAULT if pretrained else None
            base_model = models.resnet50(weights=weights)
            in_features = base_model.fc.in_features
            base_model.fc = nn.Sequential(
                nn.Dropout(p=0.3),
                nn.Linear(in_features, 512),
                nn.BatchNorm1d(512),
                nn.ReLU(inplace=True),
                nn.Dropout(p=0.2),
                nn.Linear(512, num_classes)
            )
            self.backbone = base_model
        else: # resnet18 default
            weights = models.ResNet18_Weights.DEFAULT if pretrained else None
            base_model = models.resnet18(weights=weights)
            in_features = base_model.fc.in_features
            base_model.fc = nn.Sequential(
                nn.Dropout(p=0.3),
                nn.Linear(in_features, 512),
                nn.BatchNorm1d(512),
                nn.ReLU(inplace=True),
                nn.Dropout(p=0.2),
                nn.Linear(512, num_classes)
            )
            self.backbone = base_model

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)

    def get_target_layer(self) -> nn.Module:
        """Returns the final convolutional feature layer for Grad-CAM explainability hooks."""
        if "mobilenet" in self.backbone_name:
            return self.backbone.features[-1]
        elif "efficientnet" in self.backbone_name:
            return self.backbone.features[-1]
        elif hasattr(self.backbone, "layer4"):
            return self.backbone.layer4[-1]
        else:
            # Fallback for generic backbone
            for module in reversed(list(self.backbone.modules())):
                if isinstance(module, nn.Conv2d):
                    return module
            raise RuntimeError("No convolutional target layer found for Grad-CAM.")

    @staticmethod
    def get_class_metadata(class_idx: int) -> Dict[str, Any]:
        """Returns agricultural diagnostic metadata for the predicted class index."""
        if 0 <= class_idx < len(DISEASE_METADATA):
            return DISEASE_METADATA[class_idx]
        return DISEASE_METADATA[0]

    @staticmethod
    def get_indices_for_crop(crop_name: str) -> List[int]:
        """Returns valid class indices filtered by crop type (e.g. 'Tomato')."""
        normalized = crop_name.strip().lower()
        indices = [
            i for i, meta in enumerate(DISEASE_METADATA)
            if meta["crop"].lower() == normalized
        ]
        return indices if indices else list(range(len(DISEASE_METADATA)))

