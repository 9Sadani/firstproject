from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from .forms import CommentForm
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Comment, Post, Message, Follow
from django.contrib.auth.models import User
import json
from django.views.generic import (
    ListView,
    DetailView,
    CreateView,
    UpdateView,
    DeleteView,
)

def home(request):
    context = {
        'posts': Post.objects.all()
    }
    return render(request, 'blog/home.html', context)


class PostListView(ListView):
    model = Post
    template_name = 'blog/home.html'
    context_object_name = 'posts'
    ordering = ['-date_posted']
    paginate_by = 6

class UserPostListView(ListView):
    model = Post
    template_name = 'blog/user_posts.html'
    context_object_name = 'posts'
    paginate_by = 4

    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs.get('username'))
        return Post.objects.filter(author=user).order_by('-date_posted')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        author = get_object_or_404(User, username=self.kwargs.get('username'))
        context['is_following'] = Follow.objects.filter(follower=self.request.user, following=author).exists()
        context['author'] = author
        return context

class PostDetailView(DetailView):
    model = Post
    template_name = 'blog/post_detail.html'  # Убедись, что путь к шаблону правильный

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form'] = CommentForm()  # Передача формы для комментариев
        return context

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.post = self.object
            comment.author = request.user
            comment.save()
        return redirect('post-detail', pk=self.object.pk)


class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    fields = ['title', 'content']

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)


class PostUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Post
    fields = ['title', 'content']

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

    def test_func(self):
        post = self.get_object()
        if self.request.user == post.author:
            return True
        return False


class PostDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Post
    success_url = '/'

    def test_func(self):
        post = self.get_object()
        if self.request.user == post.author:
            return True
        return False


@login_required
def about(request):
    # Все пользователи, кроме текущего
    users = User.objects.exclude(id=request.user.id)

    # Пользователи, на которых подписан текущий пользователь
    followed_users = request.user.following.all()  # Если ForeignKey настроен корректно

    return render(request, 'blog/about.html', {
        'users': users,
        'followed_users': followed_users,  # Передаем подписки в шаблон
    })

    # Лайки




def like_comment(request, pk):
    comment = get_object_or_404(Comment, pk=pk)

    if request.method == 'POST':
        if request.user.is_authenticated:
            liked = False  # Переменная для хранения статуса лайка

            # Проверяем, есть ли уже лайк от текущего пользователя
            if comment.likes.filter(id=request.user.id).exists():
                comment.likes.remove(request.user)  # Удаление лайка
                liked = False
            else:
                comment.likes.add(request.user)  # Добавление лайка
                liked = True

            # Возвращаем статус лайка и обновленное количество лайков
            return JsonResponse({
                'liked': liked,
                'likes_count': comment.likes.count()
            })

        return JsonResponse({'error': 'Вы должны быть авторизованы для лайка.'}, status=403)

    return JsonResponse({'error': 'Неверный метод запроса.'}, status=405)

@login_required
def delete_comment(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id)
    if request.user == comment.author:
        comment.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False, 'error': 'У вас нет прав на удаление этого комментария.'})


@login_required
def send_message(request):
    """Отправка сообщения от текущего пользователя."""
    data = json.loads(request.body)
    receiver_id = data.get('receiver_id')
    content = data.get('content')


    if not content:
        return JsonResponse({'error': 'Сообщение не может быть пустым'}, status=400)

    receiver = get_object_or_404(User, id=receiver_id)

    # Создаем сообщение
    message = Message.objects.create(sender=request.user, receiver=receiver, content=content)

    return JsonResponse({'status': 'success', 'message_id': message.id})

@login_required
def load_messages(request, receiver_id):
    """Загрузка сообщений между текущим пользователем и выбранным получателем."""
    receiver = get_object_or_404(User, id=receiver_id)
    messages = Message.objects.filter(
        sender=request.user, receiver=receiver
    ) | Message.objects.filter(
        sender=receiver, receiver=request.user
    ).order_by('timestamp')


    # Преобразуем сообщения в формат JSON
    messages_data = [
        {
            'sender': message.sender.username,
            'content': message.content,
            'timestamp': message.timestamp.strftime(' %H:%M:%S %d-%m-%Y'),
            'id': message.id,
        } for message in messages
    ]

    return JsonResponse({'messages': messages_data})


@login_required # Авторизован ли пользователь
def delete_message(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            message_id = data.get('message_id')
            message = get_object_or_404(Message, id=message_id, sender=request.user) # получить объект Message, что отправитель  текущий пользователь

            message.delete()

            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Неверный запрос'}, status=400) # Если запрос get условно, то ошибка



@login_required
def user_list(request):
    """Получаем всех пользователей и пользователей, на которых подписан текущий пользователь."""
    # Получаем всех пользователей, кроме текущего
    users = User.objects.exclude(id=request.user.id)

    # Получаем пользователей, на которых подписан текущий пользователь
    followed_users = request.user.following.related_name("following")  # Используем related_name из модели Follow

    return render(request, 'blog/about.html', {
        'users': users,
        'followed_users': followed_users,  # Передаем список подписанных пользователей в шаблон
    })

@login_required
def follow_user(request, username):
    user_to_follow = get_object_or_404(User, username=username)
    if request.user != user_to_follow:
        Follow.objects.get_or_create(follower=request.user, following=user_to_follow)
    return redirect('user-posts', username=username)

@login_required
def unfollow_user(request, username):
    user_to_unfollow = get_object_or_404(User, username=username)
    follow_relationship = Follow.objects.filter(follower=request.user, following=user_to_unfollow)
    if follow_relationship.exists():
        follow_relationship.delete()
    return redirect('user-posts', username=username)
