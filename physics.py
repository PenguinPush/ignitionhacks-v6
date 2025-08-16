class PhysicsCalculator:
    def __init__(self):
        self.last_position = None
        self.last_velocity = None
        self.last_time = None

    def update_pos(self, position, timestamp):
        if self.last_position is not None and self.last_time is not None:
            deltatime = timestamp - self.last_time
            if deltatime > 0:
                self.update_velocity(position, deltatime)

        self.last_position = (
            position[0],
            position[1],
            position[2] if position[2] is not None else 0.0
        )
        self.last_time = timestamp

    def update_velocity(self, position, deltatime):
        velocity = (
            (position[0] - self.last_position[0]) / deltatime,
            (position[1] - self.last_position[1]) / deltatime,
            (position[2] - self.last_position[2]) / deltatime if position[2] is not None else 0.0
        )
        self.last_velocity = velocity

    def guess_velocity(self, deltatime):
        if self.last_velocity is not None:
            guessed_velocity = (
                self.last_velocity[0],
                self.last_velocity[1] + 550 * self.last_position[2] * deltatime,
                self.last_velocity[2] if self.last_velocity[2] is not None else 0.0
            )
            return guessed_velocity
        return None

    def guess_pos(self, timestamp):
        if self.last_position is not None and self.last_time is not None:
            deltatime = timestamp - self.last_time
            guessed_velocity = self.guess_velocity(deltatime)
            if guessed_velocity is not None:
                estimated_position = (
                    self.last_position[0] + guessed_velocity[0] * deltatime,
                    self.last_position[1] + guessed_velocity[1] * deltatime,
                    self.last_position[2] + guessed_velocity[2] * deltatime if guessed_velocity[2] is not None else 0.0
                )
                return estimated_position
        return None
