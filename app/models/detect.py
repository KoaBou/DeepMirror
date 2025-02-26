import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torch.optim as optim
import cv2
from app.models.backbone import ShallowNeuralNetwork, SmallCNN

def load_checkpoint(model, checkpoint_path):
    """
    Loads a saved model checkpoint.

    Args:
        model (torch.nn.Module): The model to load weights into.
        optimizer (torch.optim.Optimizer): The optimizer to load state (optional).
        checkpoint_path (str): Path to the saved checkpoint file.

    Returns:
        model, optimizer, start_epoch, best_val_acc, history
    """
    checkpoint = torch.load(checkpoint_path, map_location=torch.device('cpu'))

    model.load_state_dict(checkpoint['model_state_dict'])
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    optimizer.load_state_dict(checkpoint['optimizer_state_dict'])

    start_epoch = checkpoint.get('epoch', 0)
    best_val_acc = checkpoint.get('best_val_acc', 0.0)
    history = checkpoint.get('history', [])

    print(f"Loaded model from {checkpoint_path}, starting from epoch {start_epoch}, best validation accuracy: {best_val_acc:.4f}")

    return model, optimizer, start_epoch, best_val_acc, history

class DeepfakeDetector:
    def __init__(self, checkpoint_path, model_type):
        if model_type == "ShallowNN":
            self.model = ShallowNeuralNetwork()
        elif model_type == "SmallCNN":
            self.model = SmallCNN()
        else:
            raise ValueError("Unknown model type!")
        self.model,  self.optimizer, self.start_epoch, self.best_val_acc, self.history = load_checkpoint(self.model, checkpoint_path)
        self.transform  =   transforms.Compose([
                            transforms.ToPILImage(),
                            transforms.Resize((224, 224)),
                            transforms.ToTensor(),
                            transforms.Normalize([0.5], [0.5])
                        ])      
        self.model.eval()  # Set to evaluation mode

    def predict(self, image):
        """Classify if the image is a deepfake."""
        face_tensor = self.transform(image).unsqueeze(0)  # Add batch dimension
        with torch.no_grad():
            output = self.model(face_tensor)
            deepfake_prob = torch.softmax(output, dim=1)[0][1].item()  # Probability of fake
        return deepfake_prob

def detect_deepfake(face_img):
    """Wrapper function for deepfake detection."""
    detector = DeepfakeDetector()
    return detector.predict(face_img)