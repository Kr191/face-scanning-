# from pymongo import MongoClient
# from datetime import datetime
# mongoclient = MongoClient("mongodb://localhost:27017/")
# db = mongoclient["user_database"]
# collection = db["users"]
# collection_login = db["logged_in_time"]
# now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
# login_today = collection_login.find_one({"loggedInAt": {"$regex": f"^{now[:9]}"}})
# print(list(collection_login.find({})))
import pickle
file = open("fastapi/EncodeFile.p", "rb")
encodedImgWithName = pickle.load(file) 
file.close()
encode = [encode for encode in encodedImgWithName]
print(encode)

