import torch
import torch.nn as nn
import torchvision.transforms as transforms
import cv2

class SmallCNN(nn.Module):
    def __init__(self):
        super(SmallCNN, self).__init__()
        self.conv1 = nn.Conv2d(3, 16, 3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(16, 32, 3, padding=1)
        self.fc1 = nn.Linear(32 * 56 * 56, 128)  # Adjust based on input size 224x224
        self.fc2 = nn.Linear(128, 2)  # 2 classes: real or deepfake

    def forward(self, x):
        x = self.pool(torch.relu(self.conv1(x)))
        x = self.pool(torch.relu(self.conv2(x)))
        x = x.view(-1, 32 * 56 * 56)  # Flatten
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x

def load_checkpoint(model, checkpoint_path):
    checkpoint = torch.load(checkpoint_path, map_location=torch.device('cpu'))
    model.load_state_dict(checkpoint['model_state_dict'])
    print(f"Loaded model from {checkpoint_path}")
    return model

# Transformation for input images
transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])
])

class DeepfakeDetector:
    def __init__(self, checkpoint_path):
        self.model = SmallCNN()
        self.model = load_checkpoint(self.model, checkpoint_path)
        self.model.eval()  # Set to evaluation mode

    def predict(self, image):
        """Classify if the image is a deepfake."""
        face_tensor = transform(image).unsqueeze(0)  # Add batch dimension
        with torch.no_grad():
            output = self.model(face_tensor)
            deepfake_prob = torch.softmax(output, dim=1)[0][1].item()  # Probability of fake
        return deepfake_prob

def detect_deepfake(face_img):
    """Wrapper function for deepfake detection."""
    detector = DeepfakeDetector()
    return detector.predict(face_img)