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
import time

# Check GPU availability at startup
# print("CUDA available:", torch.cuda.is_available())
# if torch.cuda.is_available():
#     print("GPU Name:", torch.cuda.get_device_name(0))
# print("ONNX Runtime providers:", ort.get_available_providers())

# Initialize DeepfakeDetector
detect_model = DeepfakeDetector()

# Load InsightFace Face Detector with GPU enforcement
face_detector = FaceAnalysis(name='buffalo_l')
face_detector.prepare(ctx_id=0, det_size=(64, 64))  # ctx_id=0 for GPU
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

    convertImage(image)
    print(image[:100])
    # results = detect_model.predict('camera.png')
    results = np.random.rand(1).tolist()[0]
    
    return json.dumps({'results': results})

# Global cache variables (place these near your model initialization)
cached_source = None
cached_source_faces = None

@app.route('/generate_deepfake', methods=['POST'])
def generate_deepfake():
    global cached_source, cached_source_faces
    try:
        data = request.json

        # Check if the source image in the request is new or else not update
        if 'source' not in data:
            return jsonify({'error': 'Source image is missing'}), 400
        
        start_time = time.time()
        if cached_source is None or data['source'] != cached_source:
            cached_source = data['source']
            source_img = base64_to_image(cached_source)
            cached_source_faces = face_detector.get(source_img)
        
        # Process the target image as usual
        target_img = base64_to_image(data['target'])
        target_faces = face_detector.get(target_img)

        # Check that faces were detected in both images
        if not cached_source_faces or len(cached_source_faces) == 0 or len(target_faces) == 0:
            return jsonify({'error': 'No face detected in either the source or target image'}), 400

        # Perform face swap using the first detected face in both images
        result_img = face_swapper.get(target_img, target_faces[0], cached_source_faces[0], paste_back=True)
        result_base64 = image_to_base64(result_img)

        end_time = time.time()
        processing_time = end_time - start_time  # Time in seconds
        print(processing_time)
        fps = 1 / processing_time if processing_time > 0 else 0

        return jsonify({'deepfake_image': result_base64, 'fps': fps})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)