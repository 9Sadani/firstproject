const board = document.getElementById('board');
const cells = Array.from(document.getElementsByClassName('cell'));
const status = document.getElementById('status');
const restartButton = document.getElementById('restartButton');
let gameOver = false;

// Получаем CSRF-токен для защиты POST-запроса
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

// Функция для проверки победы
const checkWin = (symbol) => {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return winPatterns.some(pattern =>
        pattern.every(index => cells[index].textContent === symbol)
    );
};

// Функция для проверки ничьей
const checkDraw = () => cells.every(cell => cell.textContent !== "");

// Функция для отправки данных о победе игрока на сервер
const userWon = () => {
    status.textContent = "Вы выиграли!";
    gameOver = true;
    restartButton.style.display = "block";

    fetch('/games/update_score/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            gameId: gameId,
            result: "win"
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateScoreboard(data.players);  // Обновляем список игроков
        } else {
            console.error("Ошибка при обновлении счета за победу");
        }
    });
};

// Функция для отправки данных о проигрыше игрока на сервер
const userLost = () => {
    status.textContent = "Вы проиграли!";
    gameOver = true;
    restartButton.style.display = "block";

    fetch('/games/update_score/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            gameId: gameId,
            result: "lose"
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateScoreboard(data.players);  // Обновляем список игроков
        } else {
            console.error("Ошибка при обновлении счета за проигрыш");
        }
    });
};

// Ход бота с вызовом userLost при проигрыше игрока
const botMove = () => {
    const emptyCells = cells.filter(cell => cell.textContent === "");
    if (emptyCells.length === 0) return;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    randomCell.textContent = "O";
    randomCell.classList.add('disabled');

    if (checkWin("O")) {
        status.textContent = "Бот выиграл!";
        gameOver = true;
        userLost();  // Вызов userLost при победе бота
    } else if (checkDraw()) {
        status.textContent = "Ничья!";
        gameOver = true;
        restartButton.style.display = "block";
    } else {
        status.textContent = "Ваш ход!";
    }
};

// Функция для обработки кликов пользователя и проверки победы
const checkPlayerWin = () => {
    if (checkWin("X")) {
        userWon();  // Вызов userWon при победе игрока
    } else if (checkDraw()) {
        status.textContent = "Ничья!";
        gameOver = true;
        restartButton.style.display = "block";
    } else {
        status.textContent = "Ход бота...";
        setTimeout(botMove, 500);
    }
};

// Обработка кликов на ячейки
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (gameOver || cell.textContent !== "") return;

        cell.textContent = "X";
        cell.classList.add('disabled');

        checkPlayerWin();
    });
});

// Функция для сброса игры
const resetGame = () => {
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('disabled');
    });
    status.textContent = "Ваш ход!";
    gameOver = false;
    restartButton.style.display = "none";
};

// Добавляем обработчик события для кнопки перезапуска
restartButton.addEventListener('click', resetGame);

// Функция для обновления списка игроков на экране
const updateScoreboard = (players) => {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    players.forEach(player => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item user-item';

        listItem.innerHTML = `
            <img class="rounded-circle" src="${player.avatar}" alt="${player.username}" width="35">
            <strong>${player.username}</strong>: ${player.score} очков
        `;

        userList.appendChild(listItem);
    });
};

// Получаем ссылку на поисковый ввод и список пользователей
const searchInput = document.getElementById('searchInput');
const userList = document.getElementById('user-list');

// Функция для фильтрации списка игроков по поисковому запросу
searchInput.addEventListener('input', () => {
    const filter = searchInput.value.toLowerCase();
    const items = userList.getElementsByClassName('user-item');

    Array.from(items).forEach(item => {
        const username = item.textContent.toLowerCase();
        if (username.includes(filter)) {
            item.style.display = ""; // Показываем элемент
        } else {
            item.style.display = "none"; // Скрываем элемент
        }
    });
});