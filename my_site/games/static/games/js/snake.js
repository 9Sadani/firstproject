const canvas = document.getElementById("snakeGame");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 400;

let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
let score = 0;
let gameInterval;
let speed = 100; // начальная скорость
let pointsPerFood = 1; // Очки за поедание еды

function drawSnake() {
    for (let segment of snake) {
        ctx.fillStyle = "green";
        ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
    }
    drawSnakeHead(snake[0]);
}

function drawSnakeHead(head) {
    // Глаза
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(head.x * 20 + 9, head.y * 20 + 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(head.x * 20 + 9, head.y * 20 + 5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(head.x * 20 + 15, head.y * 20 + 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(head.x * 20 + 15, head.y * 20 + 5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Язык
    ctx.fillStyle = "pink";
    ctx.fillRect(head.x * 20 + 9, head.y * 20 + 15, 5, 2);
}

function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * 20, food.y * 20, 18, 18);
}

function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Проверка на столкновение со стенами
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
        endGame();
        return;
    }

    // Проверка на столкновение с телом змеи
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }

    if (head.x === food.x && head.y === food.y) {
        score += pointsPerFood; // Увеличение счета в зависимости от сложности
        document.getElementById("score").innerText = score;
        snake.unshift(head);
        food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
    } else {
        snake.unshift(head);
        snake.pop();
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveSnake();
    drawSnake();
    drawFood();
}

function changeDirection(event) {
    switch (event.key) {
        case "ArrowUp":
            if (direction.y === 0) direction = { x: 0, y: -1 };
            break;
        case "ArrowDown":
            if (direction.y === 0) direction = { x: 0, y: 1 };
            break;
        case "ArrowLeft":
            if (direction.x === 0) direction = { x: -1, y: 0 };
            break;
        case "ArrowRight":
            if (direction.x === 0) direction = { x: 1, y: 0 };
            break;
    }
}

function endGame() {
    clearInterval(gameInterval);
    document.getElementById("finalScore").innerText = score;
    document.getElementById("gameOver").classList.remove("hidden");
}

function startGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    score = 0;
    document.getElementById("score").innerText = score;
    food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(update, speed);
    document.getElementById("gameOver").classList.add("hidden");
}

function setDifficulty(event) {
    speed = parseInt(event.target.getAttribute("data-speed"));

    // Установка очков за еду в зависимости от сложности
    pointsPerFood = parseInt(event.target.getAttribute("data-points"));

    // Удаляем класс 'selected' у всех кнопок сложности
    document.querySelectorAll(".difficulty").forEach(button => {
        button.classList.remove("selected");
    });

    // Добавляем класс 'selected' к выбранной кнопке
    event.target.classList.add("selected");
}

function restartGame() {
    startGame();
}

window.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
    }
    changeDirection(event);
});

document.getElementById("startButton").addEventListener("click", startGame);
document.querySelectorAll(".difficulty").forEach(button => {
    button.addEventListener("click", setDifficulty);
});
document.getElementById("restartButton").addEventListener("click", restartGame);
