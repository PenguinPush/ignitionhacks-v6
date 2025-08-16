from team import Team


class Game:

    def __init__(self, points_to_win=21, best_of_sets=3, deuce_enabled=True):
        self.team1 = Team()
        self.team2 = Team()
        self.teams = [self.team1, self.team2]

        self.set = 1

        self.points_to_win = points_to_win
        self.best_of_sets = best_of_sets
        self.deuce_enabled = deuce_enabled

    def sets_to_win(self):
        return self.best_of_sets // 2

    def get_points(self):
        return [self.team1.points, self.team2.points]

    def get_sets(self):
        return [self.team1.sets, self.team2.sets]

    def set_points(self, team1, team2):
        self.team1.points = team1
        self.team2.points = team2

    def add_point(self, team):
        target = self.teams[team + 1]
        target.points += 1

        self.update_game()

    def update_sets(self):
        for team in self.teams:
            if team.points >= self.points_to_win:
                team.sets += 1
                self.new_set()
                break

        self.update_game()

    def update_game(self):
        for team in self.teams:
            if team.sets >= self.sets_to_win():
                # reset game
                self.__init__(self.points_to_win, self.best_of_sets, self.deuce_enabled)

    def new_set(self):
        self.set += 1
        for team in self.teams:
            team.points = 0


