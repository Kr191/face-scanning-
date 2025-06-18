import cv2
import face_recognition
import numpy as np



img1 = face_recognition.load_image_file("MESSI.jpg")
img1 = cv2.cvtColor(img1, cv2.COLOR_BGR2RGB)

img2 = face_recognition.load_image_file("images/Ethan.jpg")
img2 = cv2.cvtColor(img2, cv2.COLOR_BGR2RGB)

faceLoc = face_recognition.face_locations(img1)[0]
encodeImg1 = face_recognition.face_encodings(img1)[0]
cv2.rectangle(img1, (faceLoc[3], faceLoc[0]), (faceLoc[1], faceLoc[2]), (255, 0, 255), 2)

faceLoc2 = face_recognition.face_locations(img2)[0]
encodeImg2 = face_recognition.face_encodings(img2)[0]
cv2.rectangle(img2, (faceLoc2[3], faceLoc2[0]), (faceLoc2[1], faceLoc2[2]), (255, 0, 255), 2)

result =face_recognition.compare_faces([encodeImg1], encodeImg2)
faceDist = face_recognition.face_distance([encodeImg1], encodeImg2)
print(result, faceDist) 
cv2.putText(img1, f"Result: {result} and Distance: {round(faceDist[0], 3)}", (50, 50), cv2.FONT_HERSHEY_COMPLEX, 1, (0, 255, 0), 2)

cv2.imshow("Image1", img1)
cv2.imshow("Image2", img2)
cv2.waitKey(0)

# video_capture = cv2.VideoCapture(0)

# while True:
#     _, img = video_capture.read()
#     cv2.imshow('face detection', img)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# video_capture.release()
# cv2.destroyAllWindows()



