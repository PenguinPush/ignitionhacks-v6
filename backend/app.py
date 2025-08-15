import cv2
import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from inference_sdk import InferenceHTTPClient
import tempfile

# motion.py class
from motion import MotionDetector

# Load .env file for ROBOFLOW_API_KEY
load_dotenv()

app = Flask(__name__)

@app.route("/api/submit_video", methods=["POST"])
def submit_video():
    try:
        # Initialize Roboflow client
        CLIENT = InferenceHTTPClient(
            api_url="https://serverless.roboflow.com",
            api_key=os.getenv("ROBOFLOW_API_KEY")
        )

        # Get uploaded file 
        video_file = request.files.get("video")
        if not video_file:
            return jsonify({"error": "No video uploaded"}), 400

        # Save temp video file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            video_path = tmp.name
            video_file.save(video_path)

        # Use motion.py to convert video to black/white with motion detection 
        motion_detector = MotionDetector(threshold=25)
        with tempfile.NamedTemporaryFile(delete=False, suffix="_motion.mp4") as motion_tmp:
            motion_video_path = motion_tmp.name
        motion_detector.process_video(video_path, motion_video_path)

        # Open motion-processed video
        cap = cv2.VideoCapture(motion_video_path)
        if not cap.isOpened():
            return jsonify({"error": "Unable to open motion video"}), 500

        all_detections = []
        frame_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break  # End of video

            frame_count += 1

            # Optional: skip frames for large videos (1 FPS logic)
            if frame_count % 5 != 0:
                continue

            # Save frame as temporary image
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as frame_tmp:
                frame_path = frame_tmp.name
                cv2.imwrite(frame_path, frame)

            # Send frame to Roboflow
            try:
                result = CLIENT.infer(frame_path, model_id="shuttlecock-cqzy3/1")
                all_detections.append({
                    "frame": frame_count,
                    "detections": result
                })
            except Exception as inference_error:
                all_detections.append({
                    "frame": frame_count,
                    "error": str(inference_error)
                })

            os.remove(frame_path)  # Clean up frame

        cap.release()
        os.remove(video_path)          # Clean up original video
        os.remove(motion_video_path)   # Clean up motion-processed video

        return jsonify({
            "total_frames": frame_count,
            "detections": all_detections
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
if __name__ == "__main__":
    app.run(debug=True)
