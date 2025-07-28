# Face Scanning with Webcam

A full-stack real-time face recognition and attendance system using React, FastAPI, MongoDB, and Supabase.

---

## Features

- **Real-time face detection** in browser using `face-api.js`
- **Face recognition** and attendance logging via FastAPI backend
- **User registration** with image upload
- **Attendance history** stored in MongoDB and images in Supabase Storage
- **Only logs the first successful frame per user per session**
- **Dockerized** for easy deployment

---

## Architecture

```
[React Frontend] <---> [FastAPI Backend] <---> [MongoDB] & [Supabase Storage]
```

- **Frontend:** React + Vite + face-api.js
- **Backend:** FastAPI + face_recognition + OpenCV
- **Database:** MongoDB (user & attendance info)
- **Storage:** Supabase (user images & attendance images)

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/face-scanning-with-webcam.git
cd face-scanning-with-webcam
```

### 2. Backend (FastAPI)

- Install Python dependencies:

  ```bash
  cd fastapi
  pip install -r requirements.txt
  ```

- Start FastAPI server:

  ```bash
  uvicorn urls:api --reload
  ```

### 3. Frontend (React)

- Install Node dependencies:

  ```bash
  cd react-facescanningapp
  npm install
  ```

- Place face-api.js models in `react-facescanningapp/public/models`  
  (Download from [face-api.js model repo](https://github.com/justadudewhohacks/face-api.js-models))

- Start React app:

  ```bash
  npm run dev
  ```

### 4. Docker (optional)

- Build and run both services:

  ```bash
  docker-compose up --build
  ```

---

## Usage

1. **Register a user:**  
   Go to `/register`, fill in user info, and upload a face image.

2. **Start webcam:**  
   Go to `/webcam`, allow webcam access.  
   The app detects faces in real time and sends frames to the backend only when a face is detected.

3. **Attendance logging:**  
   When a recognized user logs in, their attendance and image are recorded (only once per session).

4. **View processed images:**  
   The processed image (with overlays) is displayed for a short time after successful recognition.

---

## API Endpoints

### `/api/adduser` (POST)

- Registers a new user with image.
- Reloads encodings after adding.

### `/api/process_frame` (POST)

- Receives a frame from frontend.
- Returns processed image and recognition result.

### `/api/reload_encodings` (POST)

- Reloads face encodings from disk.

---

## Environment Variables

- **FastAPI:**
  - MongoDB URI
  - Supabase credentials
- **React:**
  - `VITE_API_URL` for backend endpoint

Set these in `.env` files in each service.

---

## How It Works

- **Frontend:**

  - Uses `face-api.js` to detect faces in real time.
  - Sends a frame to backend only when a face is detected and not recently sent.
  - Shows processed image and navigates on successful login.

- **Backend:**
  - Uses `face_recognition` to match faces.
  - Logs attendance only once per user per session.
  - Stores images in Supabase and logs in MongoDB.

---

## Contributing

Pull requests and issues are welcome!

---

**For more details, see the code in [`fastapi/`](fastapi/webcam.py), [`react-facescanningapp/`](react-facescanningapp/src/User_page/Webcam.jsx), and the Docker setup.**
