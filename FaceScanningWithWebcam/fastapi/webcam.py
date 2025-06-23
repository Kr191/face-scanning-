import cv2
import numpy as np
import cvzone
import face_recognition
import os
import pickle
from datetime import datetime
from pymongo import MongoClient
import urllib.request
import time
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

mongoclient = MongoClient(MONGODB_URI)
db = mongoclient["user_database"]
collection = db["users"]
collection_login = db["logged_in_time"]

# import UI
folderGraphicPath = "../graphic"
modePath = os.listdir(folderGraphicPath)
imgMode = []

for path in modePath:
    imgMode.append(cv2.imread(os.path.join(folderGraphicPath, path)))

# Load encoding file
file = open("EncodeFile.p", "rb")
encodedImgWithName = pickle.load(file)
file.close()
imgName = [name for name, encode in encodedImgWithName]
encodedImg = [encode for name, encode in encodedImgWithName]

def web_cam(frame: np.ndarray):
    target_h = 633
    target_w = 414

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    imgS = cv2.resize(frame, (0, 0), None, 0.25, 0.25)
    imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)

    faceCurFrame = face_recognition.face_locations(imgS)
    encodeCurFrame = face_recognition.face_encodings(imgS, faceCurFrame)

    for encodeFace, faceLoc in zip(encodeCurFrame, faceCurFrame):
        matches = face_recognition.compare_faces(encodedImg, encodeFace)
        faceDist = face_recognition.face_distance(encodedImg, encodeFace)
        matchIndex = np.argmin(faceDist)
        if round(min(faceDist), 2) >= 0.56:
            # Unmatched face
            offsetY = -170
            offsetX = -50
            y1, x2, y2, x1 = faceLoc
            y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4
            bbox = 55 + x1 + offsetX, 162 + y1 + offsetY, x2 - x1, y2 - y1
            frame = cvzone.cornerRect(frame, bbox, rt=0)
            imgModeResized = cv2.resize(imgMode[2], (target_w, target_h))
            frame[44 : 44 + target_h, 808 : 808 + target_w] = imgModeResized

        if matches[matchIndex]:
            # Matched face
            offsetY = -170
            offsetX = -50
            y1, x2, y2, x1 = faceLoc
            y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4
            bbox = 55 + x1 + offsetX, 162 + y1 + offsetY, x2 - x1, y2 - y1
            frame = cvzone.cornerRect(frame, bbox, rt=0)

            user_data = collection.find_one({"image_name": imgName[matchIndex]})

            # Check if user has already logged in today
            login_today = collection_login.find_one(
                {
                    "user_id": user_data["_id"],
                    "loggedInAt": {"$regex": f"^{timestamp[:10]}"},
                }
            )

            img_url = f"{url}/storage/v1/object/public/facescanningwithwebcam/images/{imgName[matchIndex]}"
            response = urllib.request.urlopen(img_url)
            userImg = np.asarray(bytearray(response.read()), dtype=np.uint8)
            userImg = cv2.imdecode(userImg, cv2.IMREAD_COLOR)
            userImg = cv2.resize(userImg, (180, 180))

            if login_today is None:
                # Log this login to the database (once per day)
                collection_login.insert_one(
                    {
                        "user_id": user_data["_id"],
                        "first_name": user_data["first_name"],
                        "last_name": user_data["last_name"],
                        "loggedInAt": timestamp,
                    }
                )
                print("Logged in at", timestamp)

            # Draw UI for matched user
            imgModeResized = cv2.resize(imgMode[1], (target_w, target_h))
            frame[44 : 44 + target_h, 808 : 808 + target_w] = imgModeResized
            frame[80 : 80 + 180, 925 : 925 + 180] = userImg
            cv2.putText(
                frame,
                user_data["first_name"],
                (835, 360),
                cv2.FONT_ITALIC,
                1,
                (0, 0, 0),
                2,
            )
            cv2.putText(
                frame,
                user_data["last_name"],
                (835, 480),
                cv2.FONT_ITALIC,
                1,
                (0, 0, 0),
                2,
            )
            cv2.putText(
                frame, timestamp, (835, 600), cv2.FONT_ITALIC, 1, (0, 0, 0), 2
            )
            break  # Only process the first matched face

    # Always return a frame, even if no face found or not matched
    return frame


if __name__ == "__main__":
    web_cam()
