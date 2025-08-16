from record3d import Record3DStream
import cv2
from threading import Event
import numpy as np


class StreamingManager:
    def __init__(self):
        self.event = Event()
        self.session = None
        self.DEVICE_TYPE__TRUEDEPTH = 0
        self.DEVICE_TYPE__LIDAR = 1
        self.intrinsics = None
        self.pose = None

    def on_new_frame(self):
        self.event.set()  # notify to stop waiting

    def on_stream_stopped(self):
        print('stream stopped')

    def connect_device(self, dev_idx):
        print('looking for device')
        devs = Record3DStream.get_connected_devices()
        print('{} device(s) found'.format(len(devs)))
        for dev in devs:
            print('\tID: {}\n\tUDID: {}\n'.format(dev.product_id, dev.udid))

        dev = devs[dev_idx]
        self.session = Record3DStream()
        self.session.on_new_frame = self.on_new_frame
        self.session.on_stream_stopped = self.on_stream_stopped
        self.session.connect(dev)  # start connecting
        self.intrinsics = self.session.get_intrinsic_mat()
        self.pose = self.session.get_camera_pose()


    def get_intrinsic_mat_from_coeffs(self, coeffs):
        return np.array([[coeffs.fx, 0, coeffs.tx],
                         [0, coeffs.fy, coeffs.ty],
                         [0, 0, 1]])

    def get_frames(self):
        while True:
            self.event.wait()

            depth = self.session.get_depth_frame()
            rgb = self.session.get_rgb_frame()

            # postprocess
            if self.session.get_device_type() == self.DEVICE_TYPE__TRUEDEPTH:
                depth = cv2.flip(depth, 1)
                rgb = cv2.flip(rgb, 1)

            rgb = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)

            self.event.clear()

            yield rgb, depth  # tuple


if __name__ == '__main__':
    manager = StreamingManager()
    manager.connect_device(dev_idx=0)

    for rgb_frame, depth_frame in manager.get_frames():
        cv2.imshow('rgb', rgb_frame)
        cv2.imshow('depth', depth_frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cv2.destroyAllWindows()
