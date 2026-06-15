const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE = 32;

// Mapa dinámico: Puedes hacerlo tan grande como quieras
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Cálculo automático de dimensiones basado en el mapa
const ROWS = map.length;
const COLS = map[0].length;

canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;

const pacman = {
    x: 1, y: 1,
    dirX: 0, dirY: 0,
    nextDirX: 0, nextDirY: 0,
    angle: 0
};

const SPEED = 0.1;
let mouthTimer = 0;
let pellets = [];
const ghosts = [
    { x: 18, y: 10, color: "red", dirX: 0, dirY: 0 },
    { x: 1, y: 10, color: "pink", dirX: 0, dirY: 0 }
];

function initPellets() {
    pellets = [];
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === 0) {
                pellets.push({ x: c, y: r });
            }
        }
    }
}
// Llama a la función aquí mismo para que los puntos existan desde el inicio
initPellets();
// Escuchamos teclas
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp")    { pacman.nextDirX = 0; pacman.nextDirY = -1; }
    if (e.key === "ArrowDown")  { pacman.nextDirX = 0; pacman.nextDirY = 1; }
    if (e.key === "ArrowLeft")  { pacman.nextDirX = -1; pacman.nextDirY = 0; }
    if (e.key === "ArrowRight") { pacman.nextDirX = 1; pacman.nextDirY = 0; }
});
function update() {
    // 1. Mover siempre
    pacman.x += pacman.dirX * SPEED;
    pacman.y += pacman.dirY * SPEED;

    // 2. Lógica para comer puntos
    pellets = pellets.filter(p => {
        let dist = Math.hypot(pacman.x - p.x, pacman.y - p.y);
        return dist > 0.3; 
    });

    // 3. Detectar si estamos cerca del centro del tile para girar
    const dist = Math.hypot(pacman.x - Math.round(pacman.x), pacman.y - Math.round(pacman.y));
    
    if (dist < 0.2) {
        let gridX = Math.round(pacman.x);
        let gridY = Math.round(pacman.y);
        
        let targetX = gridX + pacman.nextDirX;
        let targetY = gridY + pacman.nextDirY;

        if (map[targetY] && map[targetY][targetX] === 0) {
            pacman.dirX = pacman.nextDirX;
            pacman.dirY = pacman.nextDirY;
            pacman.angle = Math.atan2(pacman.dirY, pacman.dirX);
        }

        let forwardX = gridX + pacman.dirX;
        let forwardY = gridY + pacman.dirY;
        
        if (map[forwardY] && map[forwardY][forwardX] === 1) {
            pacman.dirX = 0;
            pacman.dirY = 0;
        }
    }
    // Dentro de update(), justo después de filtrar los pellets:
if (pellets.length === 0) {
    alert("¡Nivel completado!");
    initPellets(); // Reinicia los puntos
    pacman.x = 1;  // Resetea la posición de Pac-Man
    pacman.y = 1;
    pacman.dirX = 0;
    pacman.dirY = 0;
}
}
function moveGhost(g) {
    const dist = Math.hypot(g.x - Math.round(g.x), g.y - Math.round(g.y));
    
    if (dist < 0.2) {
        let gridX = Math.round(g.x);
        let gridY = Math.round(g.y);
        
        let dirs = [{x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0}];
        
        // 1. Filtramos paredes
        let validDirs = dirs.filter(d => {
            let nextX = gridX + d.x;
            let nextY = gridY + d.y;
            return map[nextY] && map[nextY][nextX] === 0;
        });

        // 2. FILTRO ANTI-RETROCESO: 
        // Eliminamos la dirección opuesta a la actual (ej: si venía a la derecha, no volver a la izquierda)
        // Solo aplicamos esto si hay más de una opción, para no dejarlos atrapados en un callejón.
        if (validDirs.length > 1) {
            validDirs = validDirs.filter(d => !(d.x === -g.dirX && d.y === -g.dirY));
        }

        // 3. Elegimos la dirección que minimice la distancia
        let bestDir = validDirs[0];
        let minDistance = Infinity;

        validDirs.forEach(d => {
            let testX = gridX + d.x;
            let testY = gridY + d.y;
            let dToPacman = Math.hypot(testX - pacman.x, testY - pacman.y);
            
            if (dToPacman < minDistance) {
                minDistance = dToPacman;
                bestDir = d;
            }
        });

        g.dirX = bestDir.x;
        g.dirY = bestDir.y;
    }
    
    g.x += g.dirX * SPEED * 0.85; 
    g.y += g.dirY * SPEED * 0.85;
}
function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar el mapa usando las constantes dinámicas
    for(let r=0; r < ROWS; r++) {
        for(let c=0; c < COLS; c++) {
            if(map[r][c] === 1) {
                ctx.fillStyle = "blue";
                ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
            }
        }
    }
    ctx.fillStyle = "white";
    pellets.forEach(p => {
        ctx.beginPath();
        ctx.arc((p.x + 0.5) * TILE, (p.y + 0.5) * TILE, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Dibujar Pac-Man
    mouthTimer += 0.2;
    let boca = Math.abs(Math.sin(mouthTimer)) * 0.3;

    ctx.save();
    ctx.translate((pacman.x + 0.5) * TILE, (pacman.y + 0.5) * TILE);
    ctx.rotate(pacman.angle);
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(0, 0, TILE/2 - 4, boca * Math.PI, (2 - boca) * Math.PI);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();

    ghosts.forEach(g => {
    moveGhost(g); // Actualizamos su posición aquí
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.arc((g.x + 0.5) * TILE, (g.y + 0.5) * TILE, TILE/3, 0, Math.PI * 2);
    ctx.fill();
    
    // Detección de colisión con Pac-Man
    if (Math.hypot(pacman.x - g.x, pacman.y - g.y) < 0.5) {
        alert("¡Game Over!");
        pacman.x = 1; pacman.y = 1; // Reiniciar
    }
});
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();