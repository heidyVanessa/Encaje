// js/script.js

const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const ROWS = 20;
const COLUMNS = 10;
const BLOCK_SIZE = 30;
const BOARD = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));

let currentPiece;
let score = 0;
let highscore = localStorage.getItem("highscore") || 0;
let dropSpeed = 1000; // Velocidad por defecto (Fácil)
let gameInterval;

const PIECES = [
    { shape: [[1, 1], [1, 1]], color: 'orange' }, // Orange Ricky
    { shape: [[1, 0], [1, 1], [1, 0]], color: 'blue' }, // Blue Ricky
    { shape: [[0, 1, 1], [1, 1, 0]], color: 'red' }, // Cleveland Z
    { shape: [[1, 1, 0], [0, 1, 1]], color: 'green' }, // Rhode Island Z
    { shape: [[0, 1, 0], [1, 1, 1]], color: 'yellow' }, // Hero
    { shape: [[1, 1, 1], [1, 0, 0]], color: 'purple' }, // Teewee
    { shape: [[1, 0, 0], [1, 1, 1]], color: 'cyan' }, // Smashboy
];

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibuja la cuadrícula del tablero
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLUMNS; col++) {
            ctx.strokeStyle = "#444";
            ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    // Dibuja las piezas
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLUMNS; col++) {
            if (BOARD[row][col]) {
                ctx.fillStyle = BOARD[row][col];
                ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function drawPiece() {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                ctx.fillStyle = currentPiece.color;
                ctx.fillRect((currentPiece.x + col) * BLOCK_SIZE, (currentPiece.y + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function movePiece(direction) {
    if (direction === 'left') {
        if (canMove(currentPiece.x - 1, currentPiece.y)) {
            currentPiece.x--;
        }
    } else if (direction === 'right') {
        if (canMove(currentPiece.x + 1, currentPiece.y)) {
            currentPiece.x++;
        }
    } else if (direction === 'down') {
        if (canMove(currentPiece.x, currentPiece.y + 1)) {
            currentPiece.y++;
        } else {
            placePiece();
            checkFullLines();
            spawnPiece();
        }
    }
}

function rotatePiece() {
    const rotatedShape = currentPiece.shape[0].map((_, index) =>
        currentPiece.shape.map(row => row[index])
    );
    const originalShape = currentPiece.shape;
    currentPiece.shape = rotatedShape;
    if (!canMove(currentPiece.x, currentPiece.y)) {
        currentPiece.shape = originalShape;
    }
}

function canMove(x, y) {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                if (newX < 0 || newX >= COLUMNS || newY >= ROWS || BOARD[newY][newX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function placePiece() {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                BOARD[currentPiece.y + row][currentPiece.x + col] = currentPiece.color;
            }
        }
    }
}

function checkFullLines() {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (BOARD[row].every(cell => cell)) {
            BOARD.splice(row, 1);
            BOARD.unshift(Array(COLUMNS).fill(0));
            score += 100;
            if (score > highscore) {
                highscore = score;
                localStorage.setItem("highscore", highscore);
            }
            document.getElementById("score").textContent = score;
            document.getElementById("highscore").textContent = highscore;
        }
    }
}

function spawnPiece() {
    const randomPiece = PIECES[Math.floor(Math.random() * PIECES.length)];
    currentPiece = { ...randomPiece, x: Math.floor(COLUMNS / 2) - Math.floor(randomPiece.shape[0].length / 2), y: 0 };
    if (!canMove(currentPiece.x, currentPiece.y)) {
        clearInterval(gameInterval);
        alert("Game Over");
        resetGame();
    }
}

function resetGame() {
    BOARD.length = 0;
    BOARD.push(...Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0)));
    score = 0;
    document.getElementById("score").textContent = score;
    spawnPiece();
    gameInterval = setInterval(() => {
        movePiece('down');
        drawBoard();
        drawPiece();
    }, dropSpeed);
}

function startGame(level) {
    // Ajustar la velocidad según el nivel
    if (level === 'easy') dropSpeed = 900; // Fácil: velocidad más lenta
    if (level === 'medium') dropSpeed = 600; // Intermedio: velocidad un poco más rápida
    if (level === 'hard') dropSpeed = 400; // Difícil: velocidad un poco más rápida que intermedio

    document.querySelector(".level-select").style.display = "none";
    document.querySelector(".game-board").style.display = "block";
    spawnPiece();
    gameInterval = setInterval(() => {
        movePiece('down');
        drawBoard();
        drawPiece();
    }, dropSpeed);
}

function goToStart() {
    clearInterval(gameInterval);
    document.querySelector(".game-board").style.display = "none";
    document.querySelector(".level-select").style.display = "block";
}

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') movePiece('left');
    if (event.key === 'ArrowRight') movePiece('right');
    if (event.key === 'ArrowDown') movePiece('down');
    if (event.key === 'ArrowUp') rotatePiece();
});

// Función de reiniciar para solo reiniciar la partida actual
document.getElementById("restartButton").addEventListener("click", () => {
    resetGame();
});

function resizeCanvas() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Ajusta el tamaño del canvas manteniendo la proporción
    const scaleFactor = Math.min(screenWidth / 400, screenHeight / 800);
    canvas.style.width = `${300 * scaleFactor}px`;
    canvas.style.height = `${600 * scaleFactor}px`;
}

// Llamar a la función al cargar y al cambiar el tamaño de la pantalla
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

