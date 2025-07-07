import json
import webcam
from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from websockets.exceptions import ConnectionClosed
from pymongo import MongoClient
from pydantic import BaseModel
from bson.objectid import ObjectId
from datetime import datetime
import uuid
import EncodeGereator
from fastapi.middleware.cors import CORSMiddleware
import pickle
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import base64
from PIL import Image
import numpy as np
from io import BytesIO
import cv2

load_dotenv()

api = FastAPI()

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ALLOW_IP = {"127.0.0.1", "192.168.1.100"}

MONGODB_URI = os.getenv("MONGODB_URI")
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

mongoclient = MongoClient(MONGODB_URI)
db = mongoclient["user_database"]
collection = db["users"]
collection_login = db["logged_in_time"]


class User(BaseModel):
    first_name: str
    last_name: str
    image_name: str
    created_at: str
    updated_at: str


class UpdateUser(BaseModel):
    first_name: str
    last_name: str

class FrameRequest(BaseModel):
    image: str

@api.get("/")
async def web_cam_message():
    return {"message": "successfully"}


@api.post("/api/process_frame")
async def process_frame(data: FrameRequest):
    try:
        base64_str = data.image
        print("Base64 preview:", base64_str[:100])
        print("Length of base64 string:", len(base64_str))
        # Examine and cut prefix "data:image/xxx;base64,"
        if base64_str.startswith("data:image"):
            try:
                base64_str = base64_str.split(",", 1)[1]
            except IndexError:
                raise HTTPException(status_code=400, detail="Invalid base64 format: no comma found")

        # Convert base64 -> bytes
        try:
            image_bytes = base64.b64decode(base64_str)
        except Exception as e:
            print("Failed to decode base64:", e)
            raise HTTPException(status_code=400, detail="Invalid base64 encoding")

        # Convert to PIL Image
        try:
            image = Image.open(BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            print("PIL cannot open image:", e)
            raise HTTPException(status_code=400, detail="Cannot identify image format")

        # Convert RGB to BGR
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

        # Using webcam.py
        result_frame = webcam.web_cam(frame)
        if result_frame is None:
            return {"processed_image": None}
        # Convert result frame to base64
        _, buffer = cv2.imencode('.jpg', result_frame)
        b64 = base64.b64encode(buffer).decode('utf-8')
        processed_image = f"data:image/jpeg;base64,{b64}"

        return {"processed_image": processed_image}

    except HTTPException as e:
        raise e 
    # except Exception as e:
    #     print("⚠️ Unexpected error in process_frame:", e)
    #     raise HTTPException(status_code=500, detail="Internal server error")

@api.post("/api/adduser")
async def add_user(user_json: str = Form(...), file: UploadFile = File(...)):
    print("Raw user_json:", user_json)
    try:
        user_data = json.loads(user_json)
        user = User(**user_data)
    except Exception as e:
        print("Error while parsing JSON or creating User:", str(e))
        raise HTTPException(status_code=400, detail=f"Invalid user JSON: {str(e)}")

    user_dict = user.dict()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    user_dict["created_at"] = timestamp

    # add user's image to supabase storage
    file.filename = f"{uuid.uuid4()}.jpg"
    user_dict["image_name"] = file.filename  # add user's image name to mongoDB
    img = await file.read()
    EncodeGereator.encode_generator(img, file.filename)

    response = supabase.storage.from_("facescanningwithwebcam").upload(
        file=img,
        path=f"images/{file.filename}",
        file_options={"cache-control": "3600", "upsert": "false"},
    )

    if hasattr(response, "get") and response.get("error"):
        raise HTTPException(
            status_code=500, detail=f"Upload failed: {response['error']['message']}"
        )

    # add data to mongoDB
    adding = collection.insert_one(user_dict)
    print("user_data:", user_dict)

    # reload encodings after adding a new user
    if os.path.exists("EncodeFile.p"):
        reload = webcam.reload_encodings()
        

    return [
        {"message": "user added"},
        {
            "user_id": str(adding.inserted_id),
            "first_name": user_dict["first_name"],
            "last_name": user_dict["last_name"],
            "image_name": user_dict["image_name"],
            "created_at": user_dict["created_at"],
            "url": f"{url}/storage/v1/object/public/facescanningwithwebcam/images/{file.filename}",
        },
    ]


@api.get("/api/getusers")
async def get_users():
    all_users = []
    users = list(collection.find({}))
    if users == []:
        raise HTTPException(status_code=404, detail="No users found")
    else:
        for user in users:
            user["_id"] = str(user["_id"])
            all_users.append(user)
        return all_users


@api.get("/api/getuser/{user_id}")
async def get_user(user_id: str):
    try:
        object_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = collection.find_one({"_id": object_id})
    img_url = f'{url}/storage/v1/object/public/facescanningwithwebcam/images/{user["image_name"]}'
    
    if user:
        return {
            "_id": str(user["_id"]),
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "image_name": user["image_name"],
            "created_at": user["created_at"],
            "updated_at": user["updated_at"],
            "image_url": img_url
        }
    else:
        raise HTTPException(status_code=404, detail="User not found")


@api.get("/api/getalluserloggedin")
async def get_all_loggedin():
    all_user_loggedin = []
    all_logged_in = list(collection_login.find({}))
    if all_logged_in == []:
        raise HTTPException(status_code=404, detail="No users found")
    else:
        for logged_in in all_logged_in:
            logged_in["_id"] = str(logged_in["_id"])
            logged_in["user_id"] = str(logged_in["user_id"])
            all_user_loggedin.append(logged_in)
        return all_user_loggedin


@api.get("/api/getloggedin/{user_id}")
async def find_user_loggedin_from_id(user_id: str):
    try:
        object_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    all_time_login = []
    user_login = collection_login.find({"user_id": object_id})

    if not user_login:
        raise HTTPException(status_code=404, detail="No users found")
    else:
        for logged_in in user_login:
            logged_in["_id"] = str(logged_in["_id"])
            logged_in["user_id"] = str(logged_in["user_id"])
            all_time_login.append(logged_in)
        return all_time_login

@api.get("/api/eachuser/loggedin/{loggedin_id}")
async def find_user_loggedin_from_loggedin_id(loggedin_id: str):
    try:
        object_id = ObjectId(loggedin_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    loggedin_history = collection_login.find_one({"_id": object_id})

    if not loggedin_history:
        raise HTTPException(status_code=404, detail="No users found")
    else:
       loggedin_history["_id"] = str(loggedin_history["_id"])
       loggedin_history["user_id"] = str(loggedin_history["user_id"])
       loggedin_history["image_name"] = f'{url}/storage/v1/object/public/facescanningwithwebcam/images/loggedin_history/{loggedin_history["image_name"]}'
    
    return loggedin_history
    

@api.put("/api/updateuser/{user_id}")
async def update_user(user_id: str, update_user: UpdateUser):
    try:
        object_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    update_data = {}

    if update_user.first_name:
        update_data["first_name"] = update_user.first_name
    if update_user.last_name:
        update_data["last_name"] = update_user.last_name

    log_in_result = collection_login.update_many(
        {"user_id": object_id}, {"$set": update_data}
    )

    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")

    update_data["updated_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    result = collection.update_one({"_id": object_id}, {"$set": update_data})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
     # reload encodings after adding a new user
    if os.path.exists("EncodeFile.p"):
        reload = webcam.reload_encodings()

    return {"message": "User Updated Successfully"}


@api.delete("/api/deleteuser/{user_id}")
async def delete_user(user_id: str):
    try:
        object_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    delete_user_image = collection.find_one({"_id": object_id})

    delete_img_name = delete_user_image["image_name"]
    with open("EncodeFile.p", "rb") as file:
        data_encode = pickle.load(file)
    filtered_data = [
        delete_data for delete_data in data_encode if delete_data[0] != delete_img_name
    ]

    with open("EncodeFile.p", "wb") as save_file:
        pickle.dump(filtered_data, save_file)
    print("EncodeFile.p updated")

    path = f"images/{delete_user_image['image_name']}"
    response = supabase.storage.from_("facescanningwithwebcam").remove([path])

    result = collection.delete_one({"_id": object_id})

     # reload encodings after adding a new user
    if os.path.exists("EncodeFile.p"):
        reload = webcam.reload_encodings()
        
    if result.deleted_count == 1:
        return {"message": "Delete user Successfully"}
    else:
        raise HTTPException(status_code=404, detail="User not found")

# @api.middleware("http")
# async def ip_whitelist_middleware(request: Request, call_next):
#     path = request.url.path
#     client_ip = request.headers.get("X-Forwarded-For", request.client.host)  # รองรับ proxy

#     # เช็คเฉพาะ path ที่ต้องการป้องกัน
#     if path.startswith("/admin") or path.startswith("/api/check-admin-access"):
#         if client_ip not in ALLOW_IP:
#             return JSONResponse(status_code=403, content={"detail": "Access denied for IP: " + client_ip})

#     # ให้ผ่านต่อไปยัง endpoint ปกติ
#     response = await call_next(request)
#     return response

# @api.get("/api/check-admin-access")
# async def check_admin_access(request: Request):
#     client_ip = request.headers.get("X-Forwarded-For", request.client.host)
#     if client_ip in ALLOW_IP:
#         return {"status": "ok"}
#     return JSONResponse(status_code=403, content={"detail": "Access denied"})
