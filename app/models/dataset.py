from PIL import Image
import torchvision.transforms as transforms
import torch


# Custom Dataset for PyTorch
class DeepfakeDataset(Dataset):
    def __init__(self, image_paths, labels, model_type='default', augment=False):
        self.image_paths = image_paths
        self.labels = labels

        # Set image size based on model architecture
        if model_type == 'meso':
            self.img_size = 256
        elif model_type == 'vgg':
            self.img_size = 224
        elif model_type == 'efficientnet-b4':
            self.img_size = 380
        elif model_type == 'xception':
            self.img_size = 299
        else:
            self.img_size = 224  # Default size for models like ResNet or others

        # Define normalization based on whether using pretrained models or not
        # ImageNet normalization for pretrained models
        self.mean = [0.485, 0.456, 0.406]
        self.std = [0.229, 0.224, 0.225]

        # Set up transformations
        if augment:
            self.transform = transforms.Compose([
                transforms.Resize((self.img_size, self.img_size)),  # Resize to model-specific size
                transforms.RandomHorizontalFlip(),
                transforms.RandomRotation(10),
                transforms.ToTensor(),
                # transforms.Normalize(mean=self.mean, std=self.std)
            ])
        else:
            self.transform = transforms.Compose([
                transforms.Resize((self.img_size, self.img_size)),  # Resize to model-specific size
                transforms.ToTensor(),
                # transforms.Normalize(mean=self.mean, std=self.std)
            ])
        # self.transform = transforms.Compose([
        #     transforms.Resize((self.img_size, self.img_size)),
        #     transforms.ToTensor(),
        # ])

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        try:
            img = Image.open(img_path).convert('RGB')
            img = self.transform(img)
            return img, self.labels[idx]
        except Exception as e:
            print(f"Error loading image {img_path}: {e}")
            # Return a black image with the correct dimensions as a fallback
            return torch.zeros(3, self.img_size, self.img_size), self.labels[idx]