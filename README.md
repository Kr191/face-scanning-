# Face Scanning with Webcam

A full-stack real-time face recognition and attendance system using React, FastAPI, MongoDB, and Supabase.

---

## Features

- **Real-time face detection** in browser using `face-api.js`
- **Face recognition** and attendance logging via FastAPI backend
- **User registration** with image upload
- **Attendance history** stored in MongoDB and images in Supabase Storage
- **Only logs the first successful frame per user per session. After log in successful it going to navigate to inside web page**
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

#### FastAPI Usage & Tips

- **Development:**  
  Use `uvicorn urls:api --reload` for hot-reloading during development.
- **API Docs:**  
  Visit [http://localhost:8000/docs](http://localhost:8000/docs) for interactive Swagger API documentation.
- **Environment Variables:**  
  Set MongoDB URI and Supabase credentials in a `.env` file or as environment variables.
- **Reload Encodings:**  
  Encodings are loaded once at startup. To reload after adding a user, call the `/api/reload_encodings` endpoint or use the reload logic in `/api/adduser`.
- **Troubleshooting:**
  - If you get encoding errors, check your image format and ensure only one face per image.
  - For database issues, verify your MongoDB and Supabase connections.

### 3. Frontend (React + Vite)

- Install Node dependencies:

  ```bash
  cd react-facescanningapp
  npm install
  ```

- Place face-api.js models in `react-facescanningapp/public/models`  
  (Download from [face-api.js model repo](https://github.com/justadudewhohacks/face-api.js-models))

#### Running the Development Server

- Start the React app in development mode:

  ```bash
  npm run dev
  ```

- By default, Vite will serve your app at [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

#### Building for Production

- To build the app for production deployment:

  ```bash
  npm run build
  ```

- The output will be in the `dist` folder. You can serve this with any static file server or integrate with your backend.

#### Previewing the Production Build

- To preview the production build locally:

  ```bash
  npm run preview
  ```

#### Environment Variables

- Set your backend API URL in `.env`:

  ```
  VITE_API_URL= YOUR BASE URL
  ```

- Access it in your code via `import.meta.env.VITE_API_URL`.

#### Troubleshooting

- If you see errors about missing models, make sure you have downloaded and placed the required face-api.js model files in `public/models`.
- If you change environment variables, restart the dev server.
- For webcam issues, ensure your browser has permission to access the camera.
- For CORS errors, ensure your FastAPI backend allows requests from your frontend origin.

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
   When a recognized user logs in, their attendance and image are recorded (only once per session). Once you log in already it will navigate you to inside web page

4. **View processed images:**  
   The processed image is displayed for a short time after successful recognition.

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

- **Frontend (React + Vite):**

  - Uses `face-api.js` to detect faces in real time.
  - Sends a frame to backend only when a face is detected and not recently sent (throttled).
  - Shows processed image and navigates on successful login.
  - Built and served with Vite for fast development and optimized production builds.

- **Backend (FastAPI):**
  - Uses `face_recognition` to match faces.
  - Logs attendance only once per user per session.
  - Stores images in Supabase and logs in MongoDB.
  - Provides REST API endpoints for user registration, frame processing, and encoding reload.

---

## Contributing

Pull requests and issues are welcome!

---

\*\*For more details, see the code in [`fastapi/`](fastapi/webcam.py), [`react-facescanningapp/`](react-facescanningapp/src/User_page/Webcam.jsx),
