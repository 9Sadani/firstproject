from django.urls import path
from . import views

urlpatterns = [
    path('', views.games, name='games'),
    path('<int:game_id>/', views.game_detail, name='game_detail'),
    path('update_score/', views.update_score, name='update_score'),

]