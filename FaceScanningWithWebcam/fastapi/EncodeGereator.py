import cv2
import face_recognition
import numpy as np
import os
import pickle
import urllib.request
from PIL import Image


def encode_generator(image_bytes, image_name):
    # Convert bytes to image
    image_np = np.frombuffer(image_bytes, np.uint8)
    user_image_bgr = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

    if user_image_bgr is None:
        raise ValueError("Cannot decode image")

    # Convert to RGB for face_recognition
    user_image_rgb = cv2.cvtColor(user_image_bgr, cv2.COLOR_BGR2RGB)

    # Detect and encode
    encodings = face_recognition.face_encodings(user_image_rgb)
    if len(encodings) == 0:
        raise ValueError("No face found in image")

    encoding = encodings[0]
    print("Encoding Complete")

    # Load existing encodings (if available)
    encodeImgWithName = []
    if os.path.exists("EncodeFile.p"):
        try:
            with open("EncodeFile.p", "rb") as f:
                encodeImgWithName = pickle.load(f)
            print("File loaded")
        except Exception as e:
            print(f"ไม่สามารถโหลดไฟล์ EncodeFile.p ได้: {e}")
            

    # Append new encoding
    encodeImgWithName.append((image_name, encoding))

    # Save back to file
    with open("EncodeFile.p", "wb") as file:
        pickle.dump(encodeImgWithName, file)
    print("File saved")


    