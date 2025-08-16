import asyncio
import websockets
import json
import cv2
import time

# Your existing imports and initialization
from streaming import StreamingManager
from motion import MotionDetector
from physics import PhysicsCalculator
from inference import get_model
import supervision as sv
from trackers import SORTTracker

# Initialize components
streaming = StreamingManager()
streaming.connect_device(dev_idx=0)

video_path = "test badminton 1.mp4"
# video_path = "testdepth2.mp4"
cap = cv2.VideoCapture(video_path)

motion = MotionDetector(threshold=30)
model = get_model("shuttlecock-cqzy3/1")

tracker = SORTTracker(lost_track_buffer=15, minimum_consecutive_frames=10)

physics = PhysicsCalculator()

path_points = []
max_path_length = 50


async def send_coordinates(websocket, path):
    print("WebSocket connection established")
    try:
        while True:
            if physics.last_position:
                coordinates = {
                    "x": physics.last_position[0],
                    "y": physics.last_position[1],
                    "z": physics.last_position[2],
                    "timestamp": physics.last_time
                }
                await websocket.send(json.dumps(coordinates))
                print(f"Sent coordinates: {coordinates}")
            await asyncio.sleep(0.1)
    except websockets.exceptions.ConnectionClosed:
        print("WebSocket connection closed")


async def process_video():
    def draw_text(X, Y, Z, color, line=True):
        text = f"({X:.2f}, {Y:.2f}, {Z:.2f})"
        cv2.putText(
            motion_frame_annotated,
            text,
            (int(X), int(Y)),
            cv2.FONT_HERSHEY_SIMPLEX,
            fontScale=0.5,
            color=color,
            thickness=1
        )
        if line:
            path_points.append((int(X), int(Y)))

            if len(path_points) > max_path_length:
                path_points.pop(0)

    def calculate_distance(point1, point2):
        if point2 is None:
            return 0
        return ((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2) ** 0.5

    while cap.isOpened():
        ret, rgbd_frame = cap.read()
        if not ret:
            break

        # height, width, _ = rgbd_frame.shape
        # depth_frame = rgbd_frame[:, :width // 2]
        # rgb_frame = rgbd_frame[:, width // 2:]

        # for rgb_frame, depth_frame in streaming.get_frames():
        # for motion_frame in motion._isolated_motion([rgb_frame]):
        for motion_frame in motion._isolated_motion([rgbd_frame]):
            result = model.infer(motion_frame, confidence=0.1)[0]
            detections = sv.Detections.from_inference(result).with_nms(threshold=0.3)
            detections = tracker.update(detections)

            motion_frame_annotated = motion_frame.copy()
            current_time = time.time()

            estimated_position = physics.guess_pos(current_time)

            last_position = physics.last_position
            if len(detections) > 0:
                if last_position is not None:
                    distances = [
                        calculate_distance(
                            ((detection[0][0] + detection[0][2]) / 2, (detection[0][1] + detection[0][3]) / 2),
                            last_position
                        )
                        for detection in detections
                    ]
                    closest_idx = distances.index(min(distances))
                else:
                    closest_idx = detections.confidence.argmax()

                detections = detections[closest_idx:closest_idx + 1]

                detection_xyxy = detections.xyxy[0]
                X_2D, Y_2D = (
                    int((detection_xyxy[0] + detection_xyxy[2]) / 2),
                    int((detection_xyxy[1] + detection_xyxy[3]) / 2),
                )

                if calculate_distance((X_2D, Y_2D),
                                      last_position) <= 300 or physics.last_time + physics.timeout / 2 < current_time:
                    # hsv_image = cv2.cvtColor(depth_frame, cv2.COLOR_BGR2HSV)
                    # depth_value = hsv_image[Y_2D, X_2D, 0] / 255
                    depth_value = 1
                    X, Y, Z = streaming.pixel_to_3d(X_2D, Y_2D, depth_value)

                    if Z >= 0.15:
                        draw_text(X_2D, Y_2D, Z, (0, 255, 0))
                        physics.update_pos((X_2D, Y_2D, Z), current_time)

            else:
                if estimated_position and estimated_position[2] >= 0.15:
                    X_2D, Y_2D, Z = estimated_position
                    if calculate_distance((X_2D, Y_2D),
                                          last_position) <= 300 or physics.last_time + physics.timeout / 2 < current_time:
                        draw_text(X_2D, Y_2D, Z, (0, 0, 255))
                    else:
                        draw_text(X_2D, Y_2D, Z, (255, 0, 0), False)

            for i in range(1, len(path_points)):
                alpha = i / len(path_points)
                color = (255 * alpha, 255 * alpha, 255 * alpha)
                if calculate_distance(path_points[i - 1], path_points[i]) <= 300:
                    cv2.line(motion_frame_annotated, path_points[i - 1], path_points[i], color, 2)

            overlayed_frame = cv2.addWeighted(rgbd_frame, 0.5, motion_frame_annotated, 1, 0)
            # overlayed_frame = cv2.addWeighted(rgb_frame, 0.5, motion_frame_annotated, 1, 0)
            cv2.imshow("Motion Frame", overlayed_frame)
            # cv2.imshow("Depth Frame", depth_frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                cap.release()
                cv2.destroyAllWindows()

            await asyncio.sleep(0.01)


async def main():
    websocket_server = websockets.serve(send_coordinates, "localhost", 6767)
    await asyncio.gather(
        websocket_server,
        process_video()
    )


if __name__ == "__main__":
    asyncio.run(main())
