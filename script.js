const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('finalScore');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const gameOverMessage = document.getElementById('gameOverMessage');

const gridSize = 20; // Number of cells in a row/column
const tileSize = 20; // Size of each cell in pixels
canvas.width = gridSize * tileSize;
canvas.height = gridSize * tileSize;

let snake, food, dx, dy, score, gameLoopTimeout, gameActive;

const directions = {
    ArrowUp: { dx: 0, dy: -1 },
    ArrowDown: { dx: 0, dy: 1 },
    ArrowLeft: { dx: -1, dy: 0 },
    ArrowRight: { dx: 1, dy: 0 },
};

function initializeGame() {
    snake = [{ x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }];
    dx = 1; // Initial direction: right
    dy = 0;
    score = 0;
    scoreDisplay.textContent = score;
    placeFood();
    gameActive = true;
    gameOverMessage.style.display = 'none';
    startButton.style.display = 'none'; // Hide start button once game begins
    if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
    gameLoop();
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
    };
    // Ensure food doesn't spawn on the snake
    for (const segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            placeFood(); // Recursively try again
            return;
        }
    }
}

function drawRect(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * tileSize, y * tileSize, tileSize -1 , tileSize -1); // -1 for grid lines
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
        drawRect(segment.x, segment.y, index === 0 ? '#006400' : '#008000'); // Darker green for head
    });

    // Draw food
    drawRect(food.x, food.y, '#FF0000'); // Red for food
}

function updateGame() {
    if (!gameActive) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        endGame();
        return;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }

    snake.unshift(head); // Add new head

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = score;
        placeFood();
    } else {
        snake.pop(); // Remove tail if no food eaten
    }
}

function gameLoop() {
    if (!gameActive) return;

    updateGame();
    drawGame();

    // Adjust speed based on score (optional, makes it harder)
    const speed = 150 - Math.min(score * 5, 100); // Max speed cap
    gameLoopTimeout = setTimeout(gameLoop, speed);
}

function endGame() {
    gameActive = false;
    clearTimeout(gameLoopTimeout);
    finalScoreDisplay.textContent = score;
    gameOverMessage.style.display = 'block';
    startButton.style.display = 'none'; // Keep start hidden
    restartButton.style.display = 'inline-block'; // Show restart
}

function handleKeyPress(event) {
    const newDirection = directions[event.key];
    if (newDirection) {
        // Prevent reversing direction directly
        const isOppositeDirection = (newDirection.dx === -dx && dx !== 0) || (newDirection.dy === -dy && dy !== 0);
        if (!isOppositeDirection) {
            dx = newDirection.dx;
            dy = newDirection.dy;
        }
    }
}

startButton.addEventListener('click', () => {
    initializeGame();
    // Focus canvas to ensure key presses are captured, or document itself
    // document.body.focus(); // Or canvas.focus() if canvas has tabindex
});
restartButton.addEventListener('click', () => {
    gameOverMessage.style.display = 'none';
    restartButton.style.display = 'none';
    initializeGame();
});

// Listen for arrow key presses
document.addEventListener('keydown', handleKeyPress);

// Initial state: show start button, hide game over message
gameOverMessage.style.display = 'none';
restartButton.style.display = 'none';
startButton.style.display = 'inline-block'; 