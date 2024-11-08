
    document.addEventListener('DOMContentLoaded', function() {

      let receiverId = null;
      // Обработчик поиска пользователей
      document.querySelector('#search-users').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        document.querySelectorAll('#user-list .user-item').forEach(function(userItem) {
          const username = userItem.querySelector('strong').textContent.toLowerCase();
          userItem.style.display = username.includes(searchTerm) ? '' : 'none';
        });
      });

      // Обработчик поиска подписок
         document.querySelector('#search-followed-users').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        document.querySelectorAll('#followed-users-list .user-item').forEach(function(userItem) {
          const username = userItem.querySelector('strong').textContent.toLowerCase();
          userItem.style.display = username.includes(searchTerm) ? '' : 'none';
        });
      });

      // Обработчик выбора пользователя для чата
      document.querySelectorAll('.user-item').forEach(function(userItem) {
        userItem.addEventListener('click', function() {
          receiverId = this.getAttribute('data-user-id');
          const username = this.querySelector('strong').textContent;
          const avatarUrl = this.getAttribute('data-avatar-url');

          // Обновляем заголовок и аватар в чате
          document.querySelector('#chat-with-user').textContent = 'Чат с ' + username;
          document.querySelector('#chat-avatar').src = avatarUrl;
          document.querySelector('#send-message').setAttribute('data-user-id', receiverId);
          document.querySelector('.chat-section').style.display = 'block';  // Показать окно чата
          loadMessages(receiverId);  // Загружаем сообщения для выбранного пользователя

            const intervalId = setInterval(() => {
            loadMessages(receiverId);
            }, 1000);


        });
      });

      // Функция для удаления сообщений

      function deleteMessage(messageId) {
            var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
          fetch(`/messages/delete/`, {
            method: 'POST',
            headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json'
             },
             body: JSON.stringify({
            'message_id': messageId
             })
          })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {throw new Error(err.error || 'Ошибка на сервере');});
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {

                    const messageElement = document.querySelector(`#delete-message-${messageId}`).parentElement;
                    messageElement.remove();
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
      }

      // Функция для загрузки сообщений

      function loadMessages(receiverId) {
        fetch(`/messages/${receiverId}/load/`)
        .then(response => response.json())
        .then(data => {
          const chatWindow = document.querySelector('#chat-window');
          chatWindow.innerHTML = '';  // Очищаем текущее содержимое

          data.messages.forEach(message => {
            const messageElement = document.createElement('div');

            // Определяем, от текущего ли пользователя сообщение
            const isSender = message.sender ===  document.getElementById('current-username').value;

            // Если сообщение от текущего пользователя - добавляем класс для выравнивания вправо
            messageElement.classList.add('message', isSender ? 'message-right' : 'message-left');
            // Что находится в самом сообщении
            messageElement.innerHTML = `
              <strong>${message.sender}:</strong> ${message.content}
              <br>
              <small class="text-muted">${message.timestamp}</small>
              ${isSender ? `<button id="delete-message-${message.id}" class="delete-message" style="float: right;">&times;</button>` : ''}
            `;
            chatWindow.appendChild(messageElement);
            if (isSender) {
                const deleteButton = messageElement.querySelector(`#delete-message-${message.id}`);
                deleteButton.addEventListener('click', function() {
                    deleteMessage(message.id);  // Вызов функции при клике на крестик
                    loadMessages(receiverId);
                });
            }
          });

          chatWindow.scrollTop = chatWindow.scrollHeight;  // Прокручиваем чат вниз
        })
        .catch(error => console.error('Ошибка при загрузке сообщений:', error));
      }


      document.querySelector('#send-message').addEventListener('click', function() {
         SendMessages(parseInt(this.getAttribute('data-user-id')));


      });


       // send message

        function SendMessages(receiverId) {

            var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            fetch(`/messages/send/`, {
              method: 'POST',
              headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json'
              },

              body: JSON.stringify({
                'content' : document.getElementById('message-content').value,
                'receiver_id' : receiverId
              })
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
              } else

              {
                loadMessages(receiverId);
              }
            })
            .catch(error => {
              console.error('Ошибка:', error);
            });
        }

        // smile
        window.addEventListener('click', function(event){
              if (event.target.classList.contains('smile'))
              {
                let edit = document.querySelector('#message-content');
                edit.value += event.target.attributes['my-data-smile'].value;
              }
        });

        document.querySelector('#toggle-smile-window').addEventListener('click', function() {
        const smileWindow = document.querySelector('#smile-window');
        if (smileWindow.style.display === 'none') {
            smileWindow.style.display = 'inline-block';  // Показываем окно
        } else {
            smileWindow.style.display = 'none';  // Скрываем окно
        }
    });

});
