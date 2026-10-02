from pydantic import BaseModel, Field
from typing import List, Optional

class CropInfo(BaseModel):
    id: str
    name: str = Field(..., description="Common crop name (Tomato, Potato, Rice, Maize)")
    scientific_name: str
    family: str
    optimal_soil_ph: str
    optimal_moisture_range: str
    growing_cycle_days: int
    common_diseases: List[str]
    description: str

class CropListResponse(BaseModel):
    total: int
    crops: List[CropInfo]
