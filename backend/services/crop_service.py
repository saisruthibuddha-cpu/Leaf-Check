from backend.models.crop import CropInfo, CropListResponse

SUPPORTED_CROPS_DATA = [
    CropInfo(
        id="crop-tomato",
        name="Tomato",
        scientific_name="Solanum lycopersicum",
        family="Solanaceae",
        optimal_soil_ph="6.0 - 6.8",
        optimal_moisture_range="50% - 70% VWC",
        growing_cycle_days=90,
        common_diseases=["Early Blight", "Late Blight", "Septoria Leaf Spot", "Bacterial Spot", "Yellow Leaf Curl"],
        description="Warm-season crop requiring well-drained loamy soil, consistent moisture, and balanced potassium for fruit set."
    ),
    CropInfo(
        id="crop-potato",
        name="Potato",
        scientific_name="Solanum tuberosum",
        family="Solanaceae",
        optimal_soil_ph="5.5 - 6.5",
        optimal_moisture_range="45% - 65% VWC",
        growing_cycle_days=110,
        common_diseases=["Late Blight", "Early Blight", "Black Scurf", "Common Scab"],
        description="Tuber crop requiring loose, friable soil and vigilant late blight prevention during humid weather."
    ),
    CropInfo(
        id="crop-rice",
        name="Rice",
        scientific_name="Oryza sativa",
        family="Poaceae",
        optimal_soil_ph="5.5 - 7.0",
        optimal_moisture_range="70% - 90% VWC",
        growing_cycle_days=130,
        common_diseases=["Brown Spot", "Blast", "Sheath Blight", "Bacterial Leaf Streak"],
        description="Paddy staple grain requiring high water availability and adequate nitrogen-potassium ratio."
    ),
    CropInfo(
        id="crop-maize",
        name="Maize",
        scientific_name="Zea mays",
        family="Poaceae",
        optimal_soil_ph="5.8 - 7.0",
        optimal_moisture_range="50% - 65% VWC",
        growing_cycle_days=105,
        common_diseases=["Northern Leaf Blight", "Common Rust", "Gray Leaf Spot", "Smut"],
        description="Heavy nitrogen feeder requiring deep fertile soil, good aeration, and warm growing temperatures."
    )
]

class CropService:
    def get_all_crops(self) -> CropListResponse:
        return CropListResponse(total=len(SUPPORTED_CROPS_DATA), crops=SUPPORTED_CROPS_DATA)

crop_service = CropService()
