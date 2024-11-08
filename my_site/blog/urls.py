from django.urls import path
from .views import (
    PostListView,
    PostDetailView,
    PostCreateView,
    PostUpdateView,
    PostDeleteView,
    UserPostListView,
    like_comment,
    send_message,
    load_messages,
    user_list,
    follow_user,
    unfollow_user,
    delete_message,

)
from . import views

urlpatterns = [
    path('', PostListView.as_view(), name='blog-home'),
    path('user/<str:username>', UserPostListView.as_view(), name='user-posts'),
    path('post/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('comment/<int:pk>/like/', like_comment, name='comment-like'),
    path('post/new/', PostCreateView.as_view(), name='post-create'),
    path('post/<int:pk>/update/', PostUpdateView.as_view(), name='post-update'),
    path('post/<int:pk>/delete/', PostDeleteView.as_view(), name='post-delete'),
    path('about/', views.about, name='blog-about'),
    path('messages/send/', send_message, name='send_message'),
    path('messages/<int:receiver_id>/load/', load_messages, name='load_messages'),
    path('messages/delete/', delete_message, name='delete-message'),
    path('users/', user_list, name='user_list'),
    path('follow/<str:username>/', follow_user, name='follow-user'),
    path('unfollow/<str:username>/', unfollow_user, name='unfollow-user'),
    path('comment/<int:comment_id>/delete/', views.delete_comment, name='delete-comment'),
]