# AI Plant Health & Disease Identification Module

This module contains the computer vision deep learning pipeline for plant leaf disease classification.

## Folder Architecture

- `models/`: PyTorch deep neural network architecture definitions (`CropDiseaseNet` with ResNet50/EfficientNet backbone).
- `datasets/`: PyTorch `Dataset` & `DataLoader` class interfaces with image augmentation.
- `inference/`: `PlantDiseasePredictor` class interface for runtime inference in FastAPI backend.
- `training/`: Training loop scripts (`train.py`) and hyperparameter configurations (`config.yaml`).

## Integration
In Phase 5, trained weights will be saved to `ai/models/saved_models/` and loaded into the inference engine.
