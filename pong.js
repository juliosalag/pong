// Declaracion de constantes
const FPS = 60;
const COMPUTER_LEVEL = 0.05;

const NUM_BALLS = 5;

const BG_COLOR = 'BLACK';

const FONT_COLOR = 'BLUE';
const FONT_SIZE = '45px';
const FONT_FAMILY = 'impact';

const PADDLE_RIGHT_COLOR = 'RED';
const PADDLE_LEFT_COLOR = 'WHITE';
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;

const BALL_COLOR = 'WHITE';
const BALL_RADIUS = 10;
const BALL_DELTA_VELOCITY = 0.5;
const BALL_VELOCITY = 5;

const NET_COLOR = 'WHITE';
const NET_WIDTH = 4;
const NET_HEIGHT = 10;
const NET_PADDING = 15;

// Recuperamos el canvas
const canvas = document.getElementById('pong_canvas');
const contexto = canvas.getContext('2d');

// Creamos los objetos del juego
const net = {
    x: canvas.width / 2 - NET_WIDTH / 2,
    y: 0,
    width: NET_WIDTH,
    height: NET_HEIGHT,
    padding: NET_PADDING,
    color: NET_COLOR
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2 - BALL_RADIUS / 2,
    radius: BALL_RADIUS,
    speed: BALL_VELOCITY,
    velocityX: BALL_VELOCITY,
    velocityY: BALL_VELOCITY,
    color: BALL_COLOR
};

const playerA = {
    x: 0,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: PADDLE_LEFT_COLOR,
    score: 0
};

const playerB = {
    x: canvas.width - PADDLE_WIDTH,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: PADDLE_RIGHT_COLOR,
    score: 0
};

// HELPERS canvas //
function drawRectangle(x, y, w, h, color) {
    contexto.fillStyle = color;
    contexto.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    contexto.fillStyle = color;
    contexto.beginPath();
    contexto.arc(x, y, r, 0, 2 * Math.PI);
    contexto.closePath();
    contexto.fill();
}

function drawText(text, x, y, color = FONT_COLOR, fontSize = FONT_SIZE, fontFamily = FONT_FAMILY) {
    contexto.fillStyle = color;
    contexto.font = `${fontSize} ${fontFamily}`;
    contexto.fillText(text, x, y);
}

// HELPERS pong
function clearCanvas() {
    drawRectangle(0, 0, canvas.width, canvas.height, 'BLACK');
}

function drawNet() {
    for (let i = 0; i <= canvas.height; i += NET_PADDING) {
        drawRectangle(net.x, net.y + i, net.width, net.height, net.color);
    }
}

function drawBall() {
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

const computer = playerB;
const localPlayer = playerA;

function drawScoreboard() {
    drawText(localPlayer.score, canvas.width / 4, canvas.height / 5, 'WHITE');
    drawText(computer.score, 3 * canvas.width / 4, canvas.height / 5, 'WHITE');
}

function drawPaddle(paddle) {
    drawRectangle(paddle.x, paddle.y, paddle.width, paddle.height, paddle.color);
}

// Function Loop
function gameLoop() {
    update();
    render();
}


function isGameOver() {
    return localPlayer.score >= NUM_BALLS || computer.score >= NUM_BALLS;
}

// Function Update
function update() {
    // Velocidad de la bola
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Actualizamos posicion de la IA
    updateComputer();

    // Rebote de la bola
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) { // eje Y
        ball.velocityY = -ball.velocityY;
    }

    // Colisiones con las palas
    let whatPlayer = (ball.x < canvas.width / 2) ? playerA : playerB;

    if (collision(ball, whatPlayer)) {
        // Calculamos el punto de colision en la Y
        let collidePoint = ball.y - (whatPlayer.y + whatPlayer.height / 2);
        // Normalizamos el punto de colision
        collidePoint = collidePoint / whatPlayer.height / 2;
        // Calculamos el angulo en radianes
        const angleRad = collidePoint * Math.PI / 4;
        // Calculamos la velocidad de la pelota
        const direction = (ball.x < canvas.width / 2) ? 1 : -1;

        // Modificamos la velocidad de la pelota
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        // Incrementamos la velocidad de la bola
        ball.speed += BALL_DELTA_VELOCITY;
    }

    // Actualizamos el marcador
    if (ball.x - ball.radius < 0) {
        computer.score++;
        newBall();
    } else if (ball.x + ball.radius > canvas.width) {
        localPlayer.score++;
        newBall();
    }

}

function initPaddleMovement() {
    canvas.addEventListener('mousemove', updateLocalPlayerPos);
}

function updateLocalPlayerPos(event) {
    const rect = canvas.getBoundingClientRect();

    localPlayer.y = event.clientY - localPlayer.height / 2 - rect.top;
}

function pause(milliseconds) {
    stopGameLoop();
    setTimeout(() => {
        initGameLoop();
    }, milliseconds);
}

function newBall() {
    console.log('Gol');

    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;

    const direction = ball.velocityX > 0 ? -1 : 1;
    ball.velocityX = direction * BALL_VELOCITY;
    ball.velocityY = BALL_VELOCITY;
    ball.speed = BALL_VELOCITY;

    pause(500);
}

function collision(b, p) {
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    return b.right > p.left && b.bottom > p.top && b.top < p.bottom && b.left < p.right;
}

function updateComputer() {
    computer.y += (ball.y - (computer.y + computer.height / 2)) * COMPUTER_LEVEL;
}


// Function Render
function render() {
    drawBoard();

    // Si hemos terminado la partida ...
    if (isGameOver())
        endGame();
    else
        drawBall();
}

function endGame() {
    console.log('Game Over');

    // Mostramos el final del juego
    drawText('Game Over', canvas.width / 3, canvas.height / 2);

    // Detenemos el bucle del juego
    stopGameLoop();
}

function drawBoard() {
    clearCanvas();
    drawNet();
    drawScoreboard();

    drawPaddle(localPlayer);
    drawPaddle(computer);
}

let gameLoopID;

// Function gameLoop
function initGameLoop() {
    gameLoopID = setInterval(gameLoop, 1000 / FPS);
}

function stopGameLoop() {
    clearInterval(gameLoopID);
}

function play() {

    drawBoard();

    initPaddleMovement();
    initGameLoop();
}

play();