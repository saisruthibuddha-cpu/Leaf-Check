"""
Grad-CAM (Gradient-weighted Class Activation Mapping) Explainability Generator
Visualizes spatial focus regions of PyTorch convolutional backbones for plant leaf disease analysis.
"""
import io
import base64
from typing import Optional, Tuple
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
import torch.nn.functional as F

class GradCAM:
    """
    Computes class activation maps for a target convolutional layer in PyTorch models.
    """
    def __init__(self, model: nn.Module, target_layer: nn.Module):
        self.model = model
        self.target_layer = target_layer
        self.activations: Optional[torch.Tensor] = None
        self.gradients: Optional[torch.Tensor] = None

        # Register PyTorch hooks for feature maps and gradients
        self.forward_handle = self.target_layer.register_forward_hook(self._forward_hook)
        self.backward_handle = self.target_layer.register_full_backward_hook(self._backward_hook)

    def _forward_hook(self, module: nn.Module, input: Tuple[torch.Tensor, ...], output: torch.Tensor):
        self.activations = output.detach()

    def _backward_hook(self, module: nn.Module, grad_input: Tuple[torch.Tensor, ...], grad_output: Tuple[torch.Tensor, ...]):
        self.gradients = grad_output[0].detach()

    def generate_heatmap(
        self,
        input_tensor: torch.Tensor,
        target_class_idx: int,
        original_image: Optional[Image.Image] = None
    ) -> Tuple[np.ndarray, str]:
        """
        Executes backward pass for target class index and generates normalized heatmap
        and base64-encoded JPEG image with visual overlay.
        """
        self.model.eval()
        input_tensor.requires_grad_(True)

        # Forward pass
        output = self.model(input_tensor)
        
        # Zero previous gradients
        self.model.zero_grad()

        # Score for target class
        score = output[0, target_class_idx]
        score.backward(retain_graph=True)

        if self.activations is None or self.gradients is None:
            raise RuntimeError("Failed to capture Grad-CAM activations or gradients from target layer.")

        # Compute Global Average Pooling of gradients
        gradients = self.gradients[0] # [C, H, W]
        activations = self.activations[0] # [C, H, W]

        weights = torch.mean(gradients, dim=(1, 2), keepdim=True) # [C, 1, 1]

        # Weighted combination of activation maps
        cam = torch.sum(weights * activations, dim=0) # [H, W]

        # Apply ReLU to keep only features that contribute positively to target class
        cam = F.relu(cam)

        # Convert to numpy array & normalize
        cam_np = cam.cpu().numpy()
        if np.max(cam_np) > 0:
            cam_np = cam_np / np.max(cam_np)
        else:
            cam_np = np.zeros_like(cam_np)

        # Resize heatmap to target image resolution (224x224)
        target_size = original_image.size if original_image else (224, 224)
        heatmap_img = Image.fromarray((cam_np * 255).astype(np.uint8)).resize(target_size, resample=Image.BILINEAR)
        heatmap_arr = np.array(heatmap_img) / 255.0

        # Generate RGB Heatmap Overlay
        if original_image:
            orig_rgb = np.array(original_image.convert("RGB"))
        else:
            orig_rgb = np.ones((target_size[1], target_size[0], 3), dtype=np.uint8) * 128

        # Color map: Red (high focus) -> Yellow -> Blue (low focus)
        colored_heatmap = np.zeros((heatmap_arr.shape[0], heatmap_arr.shape[1], 3), dtype=np.uint8)
        colored_heatmap[:, :, 0] = (heatmap_arr * 255).astype(np.uint8)                     # Red
        colored_heatmap[:, :, 1] = ((1.0 - np.abs(heatmap_arr - 0.5) * 2) * 255).astype(np.uint8) # Green
        colored_heatmap[:, :, 2] = ((1.0 - heatmap_arr) * 255).astype(np.uint8)             # Blue

        # Blend original image and heatmap overlay (60% original, 40% heatmap)
        blended = (orig_rgb * 0.65 + colored_heatmap * 0.35).astype(np.uint8)
        result_pil = Image.fromarray(blended)

        # Convert result PIL Image to base64 JPEG URI
        buffered = io.BytesIO()
        result_pil.save(buffered, format="JPEG", quality=85)
        base64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        gradcam_url = f"data:image/jpeg;base64,{base64_str}"

        return cam_np, gradcam_url

    def remove_hooks(self):
        """Removes forward and backward PyTorch hooks."""
        self.forward_handle.remove()
        self.backward_handle.remove()
