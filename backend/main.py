from streaming import StreamingManager
from motion import MotionDetector
from physics import PhysicsCalculator
import cv2
from inference import get_model
import supervision as sv
import time

streaming = StreamingManager()
streaming.connect_device(dev_idx=0)

video_path = "../testdepth2.mp4"
cap = cv2.VideoCapture(video_path)

motion = MotionDetector(threshold=60)
model = get_model("shuttlecock-cqzy3/1")

physics = PhysicsCalculator()

while True:
    while cap.isOpened():
        ret, rgbd_frame = cap.read()
        if not ret:
            break

        height, width, _ = rgbd_frame.shape
        depth_frame = rgbd_frame[:, :width // 2]
        rgb_frame = rgbd_frame[:, width // 2:]

        # for rgb_frame, depth_frame in streaming.get_frames():
        for motion_frame in motion._isolated_motion([rgb_frame]):
            result = model.infer(motion_frame, confidence=0.3)[0]
            detections = sv.Detections.from_inference(result).with_nms(threshold=0.3)

            motion_frame_annotated = motion_frame.copy()
            current_time = time.time()

            estimated_position = physics.guess_pos(current_time)

            if len(detections) > 0:
                max_conf_idx = detections.confidence.argmax()
                detections = detections[max_conf_idx:max_conf_idx + 1]

                detection_xyxy = detections.xyxy[0]
                X_2D, Y_2D = (
                    int((detection_xyxy[0] + detection_xyxy[2]) / 2),
                    int((detection_xyxy[1] + detection_xyxy[3]) / 2),
                )

                hsv_image = cv2.cvtColor(depth_frame, cv2.COLOR_BGR2HSV)
                depth_value = hsv_image[Y_2D, X_2D, 0] / 255
                X, Y, Z = streaming.pixel_to_3d(X_2D, Y_2D, depth_value)

                if Z >= 0.15:
                    text = f"({X_2D:.2f}, {Y_2D:.2f}, {Z:.2f})"
                    cv2.putText(
                        motion_frame_annotated,
                        text,
                        (int(X_2D), int(Y_2D)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        fontScale=0.5,
                        color=(0, 255, 0),
                        thickness=1
                    )
                    physics.update_pos((X_2D, Y_2D, Z), current_time)

            else:
                if estimated_position and estimated_position[2] >= 0.15:
                    X_2D, Y_2D, Z = estimated_position
                    text = f"({X_2D:.2f}, {Y_2D:.2f}, {Z:.2f})"
                    cv2.putText(
                        motion_frame_annotated,
                        text,
                        (int(X_2D), int(Y_2D)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        fontScale=0.5,
                        color=(0, 0, 255),
                        thickness=1
                    )

            cv2.imshow("Motion Frame", motion_frame_annotated)
            cv2.imshow("Depth Frame", depth_frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                cap.release()
                cv2.destroyAllWindows()
                break
