import asyncio
import websockets
import json
import cv2
import time

from streaming import StreamingManager
from motion import MotionDetector
from physics import PhysicsCalculator
from game import Game
from inference import get_model
import supervision as sv
from trackers import SORTTracker

# Initialize components
game = Game()

streaming = StreamingManager()
streaming.connect_device(dev_idx=0)

# video_path = "test badminton 1.mp4"
# video_path = "testdepth2.mp4"
# cap = cv2.VideoCapture(video_path)

# motion = MotionDetector(threshold=25)
motion = MotionDetector(threshold=40)
model = get_model("badminton-crsqf/1")

tracker = SORTTracker(lost_track_buffer=15, minimum_consecutive_frames=5)

physics = PhysicsCalculator()

path_points = []
max_path_length = 5
MAX_LINE_LENGTH = 300


async def send_coordinates(websocket, path):
    print("WebSocket connection established")
    try:
        while True:
            if physics.last_position:
                game_data = {
                    "x": physics.last_position[0],
                    "y": physics.last_position[1],
                    "z": physics.last_position[2],
                    "timestamp": physics.last_time,
                    "team1_points": game.team1.points,
                    "team2_points": game.team2.points,
                    "team1_sets": game.team1.sets,
                    "team2_sets": game.team2.sets,
                    "set": game.set,
                    "points_to_win": game.points_to_win,
                    "sets_to_win": game.sets_to_win(),
                    "best_of_sets": game.best_of_sets,
                    "deuce_enabled": game.deuce_enabled,
                }
                await websocket.send(json.dumps(game_data))
                # print(f"Sent coordinates: {game_data}")
            await asyncio.sleep(0.1)
    except websockets.exceptions.ConnectionClosed:
        print("WebSocket connection closed")


async def process_video():
    def check_for_point(self, X, Y, Z, current_time, last_point_time):
        if Y >= 48 and current_time - last_point_time > 8:
            side = "Player 1" if X < 640 // 2 else "Player 2"
            if side == "Player 1":
                game.team2.add_point() 
            else:
                game.team1.add_point()
            
            print(f"({X:.2f}, {Y:.2f}, {Z:.2f}) on {side}'s side")
        last_point_time = current_time


    def draw_text(X, Y, Z, color, line=1):
        text = f"({X:.2f}, {Y:.2f}, {Z:.2f})"
        cv2.putText(
            motion_frame_annotated,
            text,
            (int(X), int(Y)),
            cv2.FONT_HERSHEY_SIMPLEX,
            fontScale=0.5,
            color=color,
            thickness=line
        )
        if line:
            path_points.append((int(X), int(Y)))

            if len(path_points) > max_path_length:
                path_points.pop(0)

    def calculate_distance(point1, point2):
        if point2 is None:
            return 0
        return ((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2) ** 0.5

    frame_generator = streaming.get_frames()
    while True:
    # while cap.isOpened():
        # ret, rgbd_frame = cap.read()
        # if not ret:
        #     break
        #
        # height, width, _ = rgbd_frame.shape
        # depth_frame = rgbd_frame[:, :width // 2]
        # rgb_frame = rgbd_frame[:, width // 2:]

        try:
            rgb_frame, depth_frame = next(frame_generator)
            rgb_frame = cv2.rotate(rgb_frame, cv2.ROTATE_90_COUNTERCLOCKWISE)
            depth_frame = cv2.rotate(depth_frame, cv2.ROTATE_90_COUNTERCLOCKWISE)
        except StopIteration:
            await asyncio.sleep(0.01)
            continue

        if rgb_frame is None or depth_frame is None:
            await asyncio.sleep(0.01)
            continue

        # Generate motion frame
        motion_frame = None
        for frame in motion._isolated_motion([rgb_frame]):
            motion_frame = frame
            break  # Only process the first motion frame

        if motion_frame is None:
            await asyncio.sleep(0.01)
            continue

            # for motion_frame in motion._isolated_motion([rgbd_frame]):
        result = model.infer(motion_frame, confidence=0.15)[0]
        detections = sv.Detections.from_inference(result).with_nms(threshold=0.3)
        detections = tracker.update(detections)

        motion_frame_annotated = motion_frame.copy()
        current_time = time.time()

        last_position = physics.last_position

        shuttles = []
        if len(detections) > 0:
            for detection in detections:
                if detection[3] == 2:
                    shuttles.append(detection)

        if len(shuttles) > 0:
            max_conf_idx = max(range(len(shuttles)),
                               key=lambda i: shuttles[i][3])
            shuttle = shuttles[max_conf_idx]

            detection_xyxy = shuttle[0]
            X, Y = (
                int((detection_xyxy[0] + detection_xyxy[2]) / 2),
                int((detection_xyxy[1] + detection_xyxy[3]) / 2),
            )

            if calculate_distance((X, Y),
                                  last_position) <= MAX_LINE_LENGTH or physics.last_time <= current_time:
                # hsv_image = cv2.cvtColor(depth_frame, cv2.COLOR_BGR2HSV)
                # Z = hsv_image[Y, X, 0] / 255
                # Z = depth_frame[Y, X] / 255
                Z = 1

                if Z >= 0.15:
                    draw_text(X, Y, Z, (0, 255, 0), 3)
                    physics.update_pos((X, Y, Z), current_time)

        else:
            estimated_position = physics.guess_pos(current_time)
            if estimated_position:
                X, Y, Z = estimated_position
                if Z >= 0.15:
                    if calculate_distance((X, Y),
                                          last_position) <= 50 or physics.last_time + 1 <= current_time:
                        draw_text(X, Y, Z, (0, 0, 255), 1)
                    else:
                        draw_text(X, Y, Z, (255, 0, 0), 0)

        for i in range(1, len(path_points)):
            alpha = i / len(path_points)
            color = (255 * alpha, 255 * alpha, 255 * alpha)
            if calculate_distance(path_points[i - 1], path_points[i]) <= MAX_LINE_LENGTH:
                cv2.line(motion_frame_annotated, path_points[i - 1], path_points[i], color, 2)

        # overlayed_frame = cv2.addWeighted(rgbd_frame, 0.5, motion_frame_annotated, 1, 0)
        overlayed_frame = cv2.addWeighted(rgb_frame, 0.08, motion_frame_annotated, 1, 0)
        cv2.imshow("Motion Frame", overlayed_frame)
        cv2.imshow("Depth Frame", depth_frame)
        # end of to be tabbed

        if cv2.waitKey(1) & 0xFF == ord('q'):
            # cap.release()
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
