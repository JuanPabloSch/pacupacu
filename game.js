const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;


function activarModoVulnerable() {
    isVulnerable = true;
    vulnerableTimer = 600; // 600 frames (aprox 10 segundos a 60fps)
    ghosts.forEach(g => {
        g.originalColor = g.color; // Guardamos color para restaurarlo luego
        g.color = "blue";
    });
}

function update() {
     // mover fantasmas
    ghosts.forEach(g => {
        moveGhost(g);
    });


    // 1. Mover Pac-Man
    pacman.x += pacman.dirX * SPEED;
    pacman.y += pacman.dirY * SPEED;

    // 2. Lógica UNIFICADA de pellets (se come, activa poder y detecta victoria)
    pellets = pellets.filter(p => {

    let pacCenterX = pacman.x + 0.5;
    let pacCenterY = pacman.y + 0.5;

    let powerCenterX = p.x + 0.5;
    let powerCenterY = p.y + 0.5;


    let distancia = Math.hypot(
        pacCenterX - powerCenterX,
        pacCenterY - powerCenterY
    );


    if(distancia < 0.75){

        if(p.type === "power"){
            activarModoVulnerable();
        }

        return false;
    }


    return true;

});

    // 3. Chequeo de fin de nivel
    if (pellets.length === 0) { 
        alert("¡Nivel completado!"); 
        initPellets(); 
        pacman.x = 13; pacman.y = 8; // Reset de posición
    }

    // 4. Lógica de movimiento (grilla y paredes)
    const dist = Math.hypot(pacman.x - Math.round(pacman.x), pacman.y - Math.round(pacman.y));
    if (dist < 0.2) {
        let gridX = Math.round(pacman.x), gridY = Math.round(pacman.y);
        
        // Cambio de dirección
if (
    map[gridY + pacman.nextDirY] &&
    map[gridY + pacman.nextDirY][gridX + pacman.nextDirX] !== 1
) {

    pacman.dirX = pacman.nextDirX;
    pacman.dirY = pacman.nextDirY;
    pacman.angle = Math.atan2(
        pacman.dirY,
        pacman.dirX
    );
}
        
        // Choque con pared (1)
        if (map[gridY + pacman.dirY] && map[gridY + pacman.dirY][gridX + pacman.dirX] === 1) {
            pacman.dirX = 0; 
            pacman.dirY = 0;
        }
    }
    
    // 5. Gestión del tiempo de vulnerabilidad de fantasmas
    if (isVulnerable) {
        vulnerableTimer--;
        if (vulnerableTimer <= 0) {
            isVulnerable = false;
            ghosts.forEach(g => g.color = g.originalColor || "red");
        }
    }
}

function draw() {
    // 1. Fondo
    ctx.fillStyle = "black"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 2. Dibujar Mapa
    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            // Dentro de tu bucle for anidado de "Dibujar Mapa" en draw()
if(map[r][c] === 1) { 
    ctx.fillStyle = "blue"; 
    ctx.fillRect(c*TILE, r*TILE, TILE, TILE); 
} else if (map[r][c] === 2) { // <--- ESTO FALTA
    ctx.fillStyle = "purple"; 
    ctx.fillRect(c*TILE, r*TILE, TILE, TILE); 
}
        }
    }

    // 3. Dibujar Pellets (tus normales)
ctx.fillStyle = "white";
pellets.filter(p => p.type === 'normal').forEach(p => { 
    ctx.beginPath(); ctx.arc((p.x+0.5)*TILE, (p.y+0.5)*TILE, 3, 0, Math.PI*2); ctx.fill(); 
});

// 4. Dibujar Power-ups (los especiales)
ctx.fillStyle = "white"; // O el color que quieras (amarillo brillante)
pellets.filter(p => p.type === 'power').forEach(p => {
    // Los hacemos más grandes, p.ej. radio 8
    ctx.beginPath(); 
    ctx.arc((p.x+0.5)*TILE, (p.y+0.5)*TILE, 8, 0, Math.PI*2); 
    ctx.fill(); 
});

    // 4. Dibujar Pac-Man
    mouthTimer += 0.2;
    let boca = Math.abs(Math.sin(mouthTimer)) * 0.3;
    ctx.save();
    ctx.translate((pacman.x+0.5)*TILE, (pacman.y+0.5)*TILE);
    ctx.rotate(pacman.angle);
    ctx.fillStyle = "yellow";
    ctx.beginPath(); ctx.arc(0, 0, TILE/2-4, boca*Math.PI, (2-boca)*Math.PI); ctx.lineTo(0,0); ctx.fill();
    ctx.restore();

    // 5. Dibujar Fantasmas
    ghosts.forEach(g => {
                
        const centerX = (g.x + 0.5) * TILE;
        const centerY = (g.y + 0.5 + (g.visualY || 0)) * TILE;
        const radius = TILE / 3;

        ctx.fillStyle = g.color;
        // ... (Tu código de dibujo del fantasma que ya tenías) ...
        ctx.beginPath();
        ctx.arc(centerX, centerY - 2, radius, Math.PI, 0);
        ctx.lineTo(centerX + radius, centerY + radius);
        ctx.lineTo(centerX + radius/3, centerY + radius - 4);
        ctx.lineTo(centerX, centerY + radius);
        ctx.lineTo(centerX - radius/3, centerY + radius - 4);
        ctx.lineTo(centerX - radius, centerY + radius);
        ctx.fill();

        // Ojos
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(centerX - 4, centerY - 4, 4, 0, Math.PI * 2);
        ctx.arc(centerX + 4, centerY - 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(centerX - 4 + g.dirX * 1.5, centerY - 4 + g.dirY * 1.5, 2, 0, Math.PI * 2);
        ctx.arc(centerX + 4 + g.dirX * 1.5, centerY - 4 + g.dirY * 1.5, 2, 0, Math.PI * 2);
        ctx.fill();

        // COLISIÓN (Va dentro del forEach de fantasmas, pero fuera del dibujo del fantasma)
        // Dentro del forEach de fantasmas en draw()
        if (Math.hypot(pacman.x - g.x, pacman.y - g.y) < 0.6) {
        if (isVulnerable && g.color === "blue") {
        // ¡PAC-MAN GANA! El fantasma se va a casa
        g.x = 13; 
        g.y = 5;
        g.color = g.originalColor || "red"; // Restauramos su color original
        } else {
        // El fantasma es peligroso, Pac-Man muere
        resetGame();
    }
}
    });

    // 6. Dibujar VIDAS (Va FUERA del forEach de fantasmas, al final de todo)
    for (let i = 0; i < lives; i++) {
        let xPos = 30 + (i * 35);
        let yPos = 20;
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(xPos, yPos, 12, 0.2 * Math.PI, 1.8 * Math.PI);
        ctx.lineTo(xPos, yPos);
        ctx.fill();
    }
}


function loop() { update(); draw(); requestAnimationFrame(loop); }
loop();