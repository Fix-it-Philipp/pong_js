// Variablen deklaration
let canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    scoreboard = document.getElementById('scoreboard'),
    scorectx = scoreboard.getContext('2d'),
    player1 = 80,
    player2 = 80,
    ball = {
        x: 360,
        y: 240,
        speedX: 3,
        speedY: -1
    },
    ballHit = false,
    key = {},
    gameStarted = false,
    gamePaused = false,
    aiSpeed = 3,
    speed = 5,
    speedModifikator = 1.05,
    maxSpeed = 10,
    score1 = 0, 
    score2 = 0,
    startText = "Press Space to start game!",
    pauseText = "Game paused, press space to continue",
    player1Text = "Player 1 => w + s",
    player2Text = "Player 2 => up + down",
    gameText = "Space to pause game",
    audio = { 
        hitP1: new Audio('18784.mp3'),
        hitP2: new Audio('18784.mp3'),
        hitY: new Audio('18785.mp3'),
        score: new Audio('ping-82822.mp3'),
        start: new Audio('18787.mp3'),
    },
    rdBtn = document.querySelectorAll("input[name='speed']"), 
    chkBx = document.getElementById("playWithAI"),
    volume = 1,
    volBtn = document.getElementById("volume");

// Schriftgrößen
ctx.font = "bold 30px Verdana";
scorectx.font = "bold 50px Verdana";

// Eventlistener
document.addEventListener('keydown', e => key[e.keyCode] = true);
document.addEventListener('keyup', e => key[e.keyCode] = false);

// Eventlistener um Tastatureingaben bei den Checkboxen und Radiobuttuns zu verhindern
chkBx.addEventListener('keydown', function(event) { 
    if (event.code === 'Space') event.preventDefault(); } );

rdBtn.forEach(function (radioButton) {
    radioButton.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown')event.preventDefault();
    }); });      
    
volBtn.addEventListener('keydown', function (event) {
        if (event.code === 'ArrowUp' || event.key === 'ArrowDown')event.preventDefault(); } );  

// Programm
draw();
setInterval(loop, 1000/60);

// Funktionen
function draw() {
    // Spielfeld
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.fillRect(10, player1, 10, 80);      // Spieler 1
    ctx.fillRect(700, player2, 10, 80);     // Spieler 2
    ctx.fillRect(ball.x, ball.y, 10, 10);   // Ball

    // Spielanleitung bzw Pausenbildschirm
    if (!gameStarted) {
        ctx.fillText(startText, canvas.width/2-parseInt(ctx.measureText(startText).width)/2, canvas.height/2-70);
        ctx.fillText(player1Text, canvas.width/2-parseInt(ctx.measureText(startText).width)/2, canvas.height/2+120);
        ctx.fillText(player2Text, canvas.width/2-parseInt(ctx.measureText(startText).width)/2, canvas.height/2+160);
        ctx.fillText(gameText, canvas.width/2-parseInt(ctx.measureText(startText).width)/2, canvas.height/2+200);
    } else 
        for (i = 0; i < 20; i++) ctx.fillRect((canvas.width / 2) -2, i*25, 4, 4); 
    if (gamePaused) ctx.fillText(pauseText, canvas.width/2-parseInt(ctx.measureText(pauseText).width)/2, canvas.height/2+7);
    
    // Scoreboard
    scorectx.fillStyle = 'black';
    scorectx.fillRect(0, 0, scoreboard.width, scoreboard.height);

    scorectx.fillStyle = 'white';
    scorectx.fillRect((scoreboard.width / 2) -4, 40, 8, 8); 
    scorectx.fillRect((scoreboard.width / 2) -4, 60, 8, 8); 

    scorectx.fillText(score1, (scoreboard.width / 2)-100, (scoreboard.height / 2) + 20);
    scorectx.fillText(score2, (scoreboard.width / 2)+100-40, (scoreboard.height / 2) + 20);
    
    // Bild neu zeichnen
    requestAnimationFrame(draw);
}

function loop() {
    // Ermitteln der Lautstärke
    volume = document.getElementById("volume").value / 100;

    // Warten auf Spielstart/Pause
    if (key[32]) {
        if (!gameStarted) {
            audio.start.volume = volume;
            audio.start.play();
            setTimeout(function() {
                gameStarted = true;
                clearTimeout(this);
            }, 1000);
            key[32] = false;
        } else {
            if (gamePaused) {
                audio.start.volume = volume;
                audio.start.play();
                setTimeout(function() {
                    gamePaused = false;
                    clearTimeout(this);
                }, 1000);
            } else gamePaused = !gamePaused;
            key[32] = false;
        }
    }

    // Wenn Spiel gestartet
    if (gameStarted && !gamePaused) {
        // Derzeitigen Gamespeed ermitteln
        for(var i=0; i < rdBtn.length; i++){     
            if(rdBtn[i].checked == true){
                speedModifikator = parseFloat(rdBtn[i].value) / 20 + 1;
            }
        } 

        // Bewegung Spieler 2
        if (key[38]) {
            player2 = Math.max(player2 - speed * speedModifikator, 0);
        }
        if (key[40]) {
            player2 = Math.min(player2 + speed * speedModifikator, canvas.height - 80);
        }

        // Simple AI for player 1 (computer)
        if (document.getElementById('playWithAI').checked) {
            if (ball.speedX < 0) {
                if (ball.y < player1 + 40) {
                    player1 = Math.max(player1 - aiSpeed * speedModifikator, 0);
                } else if (ball.y > player1 + 40) {
                    player1 = Math.min(player1 + aiSpeed * speedModifikator, canvas.height - 80);
                }
            } 
        }
        else {  // Wenn AI aus ist Bewegung für Spieler 1
            if (key[87]) {
                player1 = Math.max(player1 - speed * speedModifikator, 0);
            }
            if (key[83]) {
                player1 = Math.min(player1 + speed * speedModifikator, canvas.height - 80);
            }
        }
    
        // Ball bewegen
        ball.x = ball.x + ball.speedX;
        ball.y = ball.y + ball.speedY;

        // Ball trifft auf Spieler
        if (!ballHit)
            if (ball.x < 20 || ball.x > (canvas.width - 30)) {
                if (ball.y > player1 && ball.y < player1 + 80 && ball.speedX < 0) {
                    ball.speedX = (-ball.speedX * speedModifikator) < maxSpeed ? (-ball.speedX * speedModifikator) : maxSpeed;
                    ball.speedY = (ball.y - player1 - 40) * 0.1 * speedModifikator;
                    ballHit = true;
                    audio.hitP1.volume = volume;
                    audio.hitP1.play();
                }

                else if (ball.y > player2 && ball.y < player2 + 80 && ball.speedX > 0) {
                    ball.speedX = (-ball.speedX * speedModifikator) < maxSpeed ? (-ball.speedX * speedModifikator) : maxSpeed;
                    ball.speedY = (ball.y - player2 - 40) * 0.1 * speedModifikator;
                    ballHit = true;
                    audio.hitP2.volume = volume;
                    audio.hitP2.play();
                }
            }

        // Ball trifft oben oder unten an den Spielfeldrand
        if (ball.y < 0 || ball.y > canvas.height - 10) {
            ball.speedY = -ball.speedY;
            audio.hitY.volume = volume;
            audio.hitY.play();
        }

        // Ball verlässt bei Spieler 1 das Spielfeld
        if (ball.x < 0) {
            if (!ballHit) {
                ball.speedX = 0;
                ball.x = canvas.width;
                audio.score.volume = volume;
                audio.score.play();
                score2++;
                setTimeout(function() {
                    ball = {
                        x: 360,
                        y: 240,
                        speedX: -3,
                        speedY: -1
                    };
                    clearTimeout(this);
                }, 1000);
            }
        }

        // Ball verlässt bei Spieler 2 das Spielfeld
        if (ball.x > canvas.width) {
            if (!ballHit) {
                ball.speedX = 0;
                ball.x = canvas.width;
                score1++;
                audio.score.volume = volume;
                audio.score.play();
                setTimeout(function() {
                    ball = {
                        x: 360,
                        y: 240,
                        speedX: 3,
                        speedY: -1
                    };
                    clearTimeout(this);
                }, 1000);
            }
        }

        // Variablen zurücksetzen (wird benötigt, da bei zu großer Geschwindigkeit die Kollisionsabfrage nicht richtig funktioniert)
        if (ball.x > (canvas.width / 2) -100 && ball.x < (canvas.width / 2) +100) ballHit = false;
    }
}
