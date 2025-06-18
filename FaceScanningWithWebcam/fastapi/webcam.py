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


def main():

    cap = cv2.VideoCapture(0)
    cap.set(3, 1280)
    cap.set(4, 720)

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

    counter = 0
    matchFound = False
    unMatchFound = False
    last_logged_in_id = None
    last_logged_in_time = 0
    login_display_duration = 10
    freeze_timestamp = None
    target_h = 633
    target_w = 414

    while True:

        success, img = cap.read()
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        imgS = cv2.resize(img, (0, 0), None, 0.25, 0.25)
        imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)

        faceCurFrame = face_recognition.face_locations(imgS)
        encodeCurFrame = face_recognition.face_encodings(imgS, faceCurFrame)

        for encodeFace, faceLoc in zip(encodeCurFrame, faceCurFrame):
            matches = face_recognition.compare_faces(encodedImg, encodeFace)
            faceDist = face_recognition.face_distance(encodedImg, encodeFace)
            matchIndex = np.argmin(faceDist)
            # print(min(faceDist))
            # print(matchIndex)
            if round(min(faceDist), 2) >= 0.56:
                unMatchFound = True
                if unMatchFound:
                    offsetY = -170
                    offsetX = -50
                    y1, x2, y2, x1 = faceLoc
                    y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4
                    bbox = 55 + x1 + offsetX, 162 + y1 + offsetY, x2 - x1, y2 - y1
                    img = cvzone.cornerRect(img, bbox, rt=0)

                    imgModeResized = cv2.resize(imgMode[2], (target_w, target_h))
                    img[44 : 44 + target_h, 808 : 808 + target_w] = imgModeResized

            if matches[matchIndex]:
                # print("Found image name:", imgName[matchIndex])
                unMatchFound = False
                offsetY = -170
                offsetX = -50
                y1, x2, y2, x1 = faceLoc
                y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4
                bbox = 55 + x1 + offsetX, 162 + y1 + offsetY, x2 - x1, y2 - y1
                img = cvzone.cornerRect(img, bbox, rt=0)

                matchFound = True

        if matchFound:
            user_data = collection.find_one({"image_name": imgName[matchIndex]})

            login_today = collection_login.find_one(
                {
                    "user_id": user_data["_id"],
                    "loggedInAt": {"$regex": f"^{timestamp[:10]}"},
                }
            )

            url = f"{url}/storage/v1/object/public/facescanningwithwebcam/images/{imgName[matchIndex]}"
            response = urllib.request.urlopen(url)
            userImg = np.asarray(bytearray(response.read()), dtype=np.uint8)
            userImg = cv2.imdecode(userImg, cv2.IMREAD_COLOR)
            userImg = cv2.resize(userImg, (180, 180))

            if login_today is None:
                # Check if today is logged in ?
                if freeze_timestamp is None:
                    freeze_timestamp = timestamp
                    collection_login.insert_one(
                        {
                            "user_id": user_data["_id"],
                            "first_name": user_data["first_name"],
                            "last_name": user_data["last_name"],
                            "loggedInAt": freeze_timestamp,
                        }
                    )
                    print("Logged in at", freeze_timestamp)

                last_logged_in_id = user_data["_id"]
                last_logged_in_time = time.time()

                imgModeResized = cv2.resize(imgMode[1], (target_w, target_h))
                img[44 : 44 + target_h, 808 : 808 + target_w] = imgModeResized

                img[80 : 80 + 180, 925 : 925 + 180] = userImg
                cv2.putText(
                    img,
                    user_data["first_name"],
                    (835, 360),
                    cv2.FONT_ITALIC,
                    1,
                    (0, 0, 0),
                    2,
                )
                cv2.putText(
                    img,
                    user_data["last_name"],
                    (835, 480),
                    cv2.FONT_ITALIC,
                    1,
                    (0, 0, 0),
                    2,
                )
                cv2.putText(
                    img, freeze_timestamp, (835, 600), cv2.FONT_ITALIC, 1, (0, 0, 0), 2
                )

            else:
                current_time = time.time() - last_logged_in_time
                if (user_data["_id"] == last_logged_in_id) and (
                    current_time <= login_display_duration
                ):

                    imgModeResized = cv2.resize(imgMode[1], (target_w, target_h))
                    img[44 : 44 + target_h, 808 : 808 + target_w] = imgModeResized

                    img[80 : 80 + 180, 925 : 925 + 180] = userImg
                    cv2.putText(
                        img,
                        user_data["first_name"],
                        (835, 360),
                        cv2.FONT_ITALIC,
                        1,
                        (0, 0, 0),
                        2,
                    )
                    cv2.putText(
                        img,
                        user_data["last_name"],
                        (835, 480),
                        cv2.FONT_ITALIC,
                        1,
                        (0, 0, 0),
                        2,
                    )
                    cv2.putText(
                        img,
                        freeze_timestamp,
                        (835, 600),
                        cv2.FONT_ITALIC,
                        1,
                        (0, 0, 0),
                        2,
                    )
                    print(f"{current_time:.0f}")

                else:
                    counter += 1
                    if counter <= 5:
                        imgModeResized = cv2.resize(imgMode[0], (target_w, target_h))
                        img[44 : 44 + target_h, 808 : 808 + target_w] = imgModeResized
                        last_logged_in_id = ""
                        last_logged_in_time = 0
                        print("Already Log in", counter)
                        freeze_timestamp = None
                    else:
                        matchFound = False
                        counter = 0

        cv2.imshow("หน้ามึงอ่ะ", img)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break


if __name__ == "__main__":
    main()
