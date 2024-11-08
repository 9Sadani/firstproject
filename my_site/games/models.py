from django.db import models
from django.contrib.auth.models import User
class Game(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    template_name = models.CharField(max_length=100, default="games/game_detail.html")  # Шаблон по умолчанию

    def __str__(self):
        return self.name

class GameScore(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="game_scores")
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="game_scores")
    score = models.IntegerField(default=0)
    date_played = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.game.name} - {self.score}"