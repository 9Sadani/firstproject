from django.shortcuts import render, get_object_or_404
from .models import Game, GameScore
from django.http import JsonResponse
import json
from django.contrib.auth.decorators import login_required

def games(request):
    games_list = Game.objects.all()  # Получаем все игры из базы данных
    context = {
        'games': games_list,  # Передаем список игр в контекст шаблона
    }
    return render(request, 'games/games.html', context)


def game_detail(request, game_id):
    game = get_object_or_404(Game, id=game_id)

    played_users = GameScore.objects.filter(game=game).select_related('user').order_by('-score')
    players_data = [
        {
            "username": score.user.username,
            "score": score.score,
            "avatar": score.user.profile.image.url if score.user.profile.image else "path/to/default_avatar.png"
        }
        for score in played_users
    ]

    # Используем шаблон, указанный в поле template_name для каждой игры
    return render(request, game.template_name, {'game': game, 'players_data': players_data})

@login_required
def update_score(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        game_id = data.get('gameId')
        result = data.get('result')

        game = get_object_or_404(Game, id=game_id)
        user = request.user

        # Получаем или создаем запись GameScore для данного пользователя и игры
        score_obj, created = GameScore.objects.get_or_create(game=game, user=user)

        # Обновляем очки в зависимости от результата
        if result == "win":
            score_obj.score += 10  # Добавляем очки за победу
        elif result == "lose":
            score_obj.score -= 5  # Отнимаем очки за проигрыш

        score_obj.save()

        # Отправляем обновлённый список игроков
        played_users = GameScore.objects.filter(game=game).select_related('user').order_by('-score')
        players_data = [
            {"username": score.user.username, "score": score.score, "avatar": score.user.profile.image.url}
            for score in played_users
        ]

        return JsonResponse({"success": True, "players": players_data})

    return JsonResponse({"success": False})
