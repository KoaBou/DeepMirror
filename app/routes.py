from flask import render_template, request, json, jsonify
from app import app
import insightface
from app.models import DeepfakeDetector
from insightface.app import FaceAnalysis
import base64
import re
import cv2
import numpy as np
import onnxruntime as ort
import torch
import mediapipe as mp
from app.config import CHECKPOINT_PATH


# Check GPU availability at startup
# print("CUDA available:", torch.cuda.is_available())
# if torch.cuda.is_available():
#     print("GPU Name:", torch.cuda.get_device_name(0))
# print("ONNX Runtime providers:", ort.get_available_providers())
# Initialize MediaPipe Face Detection.
mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

# Initialize DeepfakeDetector with model type SmallCNN or ShallowNN
detect_model = DeepfakeDetector(checkpoint_path=CHECKPOINT_PATH, model_type = "SmallCNN")

# Load InsightFace Face Detector with GPU enforcement
face_detector = FaceAnalysis(name='buffalo_l')
face_detector.prepare(ctx_id=0, det_size=(640, 640))  # ctx_id=0 for GPU
# print("Face detector running on:", "GPU" if 'CUDAExecutionProvider' in ort.get_available_providers() else "CPU")

# Load Face Swapper with explicit GPU provider
session_options = ort.SessionOptions()
providers = ['CUDAExecutionProvider', 'CPUExecutionProvider'] if 'CUDAExecutionProvider' in ort.get_available_providers() else ['CPUExecutionProvider']

face_swapper = insightface.model_zoo.get_model(
    'inswapper_128.onnx',
    download=False,
    download_zip=False,
    session_options=session_options,
    providers=providers
)
# print("Face swapper running on:", providers[0])

def base64_to_image(base64_string):
    """Convert Base64 string to OpenCV image"""
    img_data = base64.b64decode(base64_string.split(',')[1])
    np_arr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

def image_to_base64(image):
    """Convert OpenCV image to Base64"""
    _, buffer = cv2.imencode('.jpg', image)
    return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode()}"

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html', title='Index')

@app.route('/detect')
def detect():
    return render_template('df-detect/detect.html', title='Detect')

@app.route('/generate')
def generate():
    return render_template('df-generate/generate.html', title='Generate')

def convertImage(imgData):
    imgstr = re.search(r'base64,(.*)', imgData).group(1)
    with open('camera.png', 'wb') as output:
        output.write(base64.b64decode(imgstr))

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    image = data['image']
    params = data['params']
    # Saves to 'camera.png'
    convertImage(image)
    img = cv2.imread('camera.png')
    deepfake_prob = detect_model.predict('camera.png')
    results = 'real' if deepfake_prob <0 else 'fake'
    return json.dumps({'results': results})

@app.route('/generate_deepfake', methods=['POST'])
def generate_deepfake():
    try:
        data = request.json
        source_img = base64_to_image(data['source'])  # Convert uploaded Base64 image to OpenCV format
        target_img = base64_to_image(data['target'])  # Convert webcam frame to OpenCV format

        # Detect faces
        source_faces = face_detector.get(source_img)
        target_faces = face_detector.get(target_img)

        # Ensure faces were detected
        if len(source_faces) == 0 or len(target_faces) == 0:
            return jsonify({'error': 'No face detected in either the source or target image'}), 400

        # Perform face swap using the first detected face
        target_img = face_swapper.get(target_img, target_faces[0], source_faces[0], paste_back=True)

        # Convert swapped image to Base64
        result_base64 = image_to_base64(target_img)

        return jsonify({'deepfake_image': result_base64})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)