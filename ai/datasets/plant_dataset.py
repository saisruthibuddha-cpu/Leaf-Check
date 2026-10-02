"""
PyTorch Dataset and Augmentation Pipeline for Agricultural Plant Disease Imagery.
Supports PlantVillage folder structure, custom leaf datasets, and automated training/validation batch loading.
"""
import os
import glob
from typing import Tuple, Optional, Callable, List
from PIL import Image
import torch
from torch.utils.data import Dataset, DataLoader, random_split
import torchvision.transforms as transforms
from ai.models.crop_disease_net import DISEASE_METADATA

# Standard ImageNet normalization coefficients
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

def get_train_transforms(image_size: int = 224) -> transforms.Compose:
    """Agricultural augmentation transform pipeline for deep learning training."""
    return transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.2),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
    ])

def get_val_transforms(image_size: int = 224) -> transforms.Compose:
    """Standard evaluation transformation pipeline."""
    return transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
    ])

class PlantVillageDataset(Dataset):
    """
    Agricultural leaf image dataset.
    Scans directory for subfolders matching disease taxonomy, or initializes in-memory samples.
    """
    def __init__(
        self,
        root_dir: Optional[str] = None,
        transform: Optional[Callable] = None,
        is_synthetic: bool = False,
        synthetic_samples: int = 64
    ):
        self.root_dir = root_dir
        self.transform = transform or get_val_transforms()
        self.samples: List[Tuple[Any, int]] = []
        self.is_synthetic = is_synthetic

        if self.is_synthetic:
            # Generate representative in-memory PIL images for verification & rapid pipeline testing
            for i in range(synthetic_samples):
                label = i % len(DISEASE_METADATA)
                # Deterministic synthetic leaf pattern (green background with simulated variation)
                img = Image.new("RGB", (224, 224), color=(34 + (i * 3) % 40, 120 + (i * 7) % 60, 45 + (i * 5) % 30))
                self.samples.append((img, label))
        elif root_dir and os.path.exists(root_dir):
            self._load_from_disk(root_dir)

    def _load_from_disk(self, root_dir: str):
        """Scans disk directory for class folders."""
        valid_extensions = ("*.jpg", "*.jpeg", "*.png", "*.webp")
        for class_idx, meta in enumerate(DISEASE_METADATA):
            # Check for folder matching class id or display name
            class_dirs = [
                os.path.join(root_dir, meta["id"]),
                os.path.join(root_dir, meta["display_name"].replace(" ", "_")),
                os.path.join(root_dir, meta["id"].lower())
            ]
            for c_dir in class_dirs:
                if os.path.isdir(c_dir):
                    for ext in valid_extensions:
                        for img_path in glob.glob(os.path.join(c_dir, ext)):
                            self.samples.append((img_path, class_idx))
                    break

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        if idx >= len(self.samples):
            raise IndexError("Dataset index out of bounds")

        item, label = self.samples[idx]

        if isinstance(item, str):
            image = Image.open(item).convert("RGB")
        elif isinstance(item, Image.Image):
            image = item
        else:
            raise TypeError(f"Unsupported item type in dataset: {type(item)}")

        if self.transform:
            image_tensor = self.transform(image)
        else:
            image_tensor = transforms.ToTensor()(image)

        return image_tensor, label

def get_dataloaders(
    root_dir: Optional[str] = None,
    batch_size: int = 16,
    val_split: float = 0.2,
    use_synthetic: bool = False
) -> Tuple[DataLoader, DataLoader]:
    """
    Creates PyTorch DataLoaders for training and validation splits.
    """
    train_transform = get_train_transforms()
    val_transform = get_val_transforms()

    if use_synthetic or not root_dir or not os.path.exists(root_dir):
        full_dataset = PlantVillageDataset(is_synthetic=True, synthetic_samples=64, transform=train_transform)
    else:
        full_dataset = PlantVillageDataset(root_dir=root_dir, transform=train_transform)

    total_len = len(full_dataset)
    val_len = max(1, int(total_len * val_split))
    train_len = total_len - val_len

    train_data, val_data = random_split(full_dataset, [train_len, val_len])

    train_loader = DataLoader(train_data, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_data, batch_size=batch_size, shuffle=False)

    return train_loader, val_loader
