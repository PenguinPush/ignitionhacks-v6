import cv2
import numpy as np


class MotionDetector:
    def __init__(self, threshold=25):
        self.threshold = threshold
        self.prev_gray = None

    def _isolated_motion(self, input_stream):
        for frame in input_stream:
            gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            if self.prev_gray is None:
                self.prev_gray = gray_frame
                continue

            diff_frame = cv2.absdiff(self.prev_gray, gray_frame)
            _, motion_mask = cv2.threshold(diff_frame, self.threshold, 255, cv2.THRESH_BINARY)

            self.prev_gray = gray_frame

            black_background = np.zeros_like(frame)

            motion_pixels = cv2.bitwise_and(frame, frame, mask=motion_mask)
            frame_with_motion = cv2.add(black_background, motion_pixels)

            yield frame_with_motion

    def process_stream(self, video_source=0):
        cap = cv2.VideoCapture(video_source)

        def frame_generator():
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                yield frame

        for motion_frame in self._isolated_motion(frame_generator()):
            cv2.imshow("", motion_frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()

    def process_video(self, input_file, output_file):
        cap = cv2.VideoCapture(input_file)

        # Get video properties
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec for .mp4 files

        # Initialize video writer
        out = cv2.VideoWriter(output_file, fourcc, fps, (frame_width, frame_height))

        def frame_generator():
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                yield frame

        for motion_frame in self._isolated_motion(frame_generator()):
            out.write(motion_frame)

        cap.release()
        out.release()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="motion detector")
    parser.add_argument("--input", type=str)
    parser.add_argument("--output", type=str)
    args = parser.parse_args()

    detector = MotionDetector()

    if args.input and args.output:
        detector.process_video(input_file=args.input, output_file=args.output)
    else:
        detector.process_stream(video_source=0)

