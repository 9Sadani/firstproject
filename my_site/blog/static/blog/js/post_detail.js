document.addEventListener('DOMContentLoaded', function() {
  // Обработка кнопок лайков для комментариев
  document.querySelectorAll('.like-comment-button').forEach(button => {
    const likesCountElement = button.querySelector('.likes-count');

    button.addEventListener('click', function() {
      console.log('Кнопка Like нажата'); // Отладочная информация
      var commentId = this.getAttribute('data-comment-id');

      // Получаем CSRF токен
      var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

      fetch(`/comment/${commentId}/like/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrftoken,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {throw new Error(err.error || 'Ошибка на сервере');});
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          // Обновляем отображение сердечка и счетчика лайков
          if (data.liked) {
            this.innerHTML = `<i class="fa-solid fa-heart text-danger"></i>`; // Заполненное сердечко
          } else {
            this.innerHTML = `<i class="fa-regular fa-heart"></i>`; // Пустое сердечко
          }
          likesCountElement.innerHTML = data.likes_count; // Обновляем количество лайков
        }
      })
      .catch(error => {
        console.error('Ошибка:', error);
      });
    });
  });

  // Обработка кнопок удаления комментариев
  document.querySelectorAll('.delete-comment-button').forEach(button => {
    button.addEventListener('click', function() {
      const commentId = this.getAttribute('data-comment-id');
      const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

      if (confirm('Вы уверены, что хотите удалить этот комментарий?')) {
        fetch(`/comment/${commentId}/delete/`, {
          method: 'POST',
          headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Удаляем комментарий из DOM
            this.closest('.media').remove();
          } else {
            alert(data.error || 'Ошибка при удалении комментария.');
          }
        })
        .catch(error => console.error('Ошибка:', error));
      }
    });
  });
});
