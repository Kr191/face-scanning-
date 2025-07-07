import cv2
import face_recognition
import numpy as np
import os
import pickle
import urllib.request
from PIL import Image


# def encode_generator():
#     folderPath = "images"
#     imglist = []
#     pathList = os.listdir(folderPath)
#     image_name = []

#     for path in pathList:
#         imglist.append(cv2.imread(os.path.join(folderPath, path)))
#         image_name.append(os.path.splitext(path)[0])

    
#     def encode_image(imgs):
#         encodeList = []

#         for img in imgs:
#             img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
#             encoding = face_recognition.face_encodings(img)[0]
#             encodeList.append(encoding)
#         return encodeList

#     encodeAllImage = encode_image(imglist)
#     encodeImgWithName = [encodeAllImage, image_name]
#     print("Encoding Complete")

#     file = open("EncodeFile.p", "wb")
#     pickle.dump(encodeImgWithName, file)
#     file.close()
#     print("File saved")

# encode_generator()

def encode_generator(image, image_name):
    
    image = np.frombuffer(image, np.uint8)
    user_image = cv2.imdecode(image, cv2.IMREAD_COLOR)

    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    encoding = face_recognition.face_encodings(user_image)[0]
    # encodeImgWithName = list(zip(user_image_name, encoding))
    print("Encoding Complete")

    encodeImgWithName = []
    if os.path.exists("EncodeFile.p"):
        with open("EncodeFile.p", "rb") as f:
            encodeImgWithName = pickle.load(f)

    encodeImgWithName.append((image_name, encoding))

    file = open("EncodeFile.p", "wb")
    pickle.dump(encodeImgWithName, file)
    file.close()
    print("File saved")


    