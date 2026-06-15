// En entities.js
let lives = 3;
let pellets = [];
let mouthTimer = 0; // <<-- Te faltaba esto
let isVulnerable = false;
let vulnerableTimer = 0;

function resetGame() {
    lives--;
    if (lives > 0) {
        pacman.x = 13; pacman.y = 8;
        pacman.dirX = 0; pacman.dirY = 0;
        
        spawnGhosts(); // <--- Aquí se reposicionan correctamente
        
        isPaused = true;
        setTimeout(() => { isPaused = false; }, 1000);
    } else {
        alert("Game Over - Te quedaste sin vidas");
        lives = 3; // Reiniciar contador para nueva partida
        initPellets(); // Reiniciar mapa
    }
}

// --- FUNCIONES DE APOYO (Aquí es donde va) ---
function activarModoVulnerable() {
    isVulnerable = true;
    vulnerableTimer = 600; 
    ghosts.forEach(g => {
        g.originalColor = g.color; 
        g.color = "blue";
    });
}



const pacman = {
    x: 13, y: 8, dirX: 0, dirY: 0, nextDirX: 0, nextDirY: 0, angle: 0
};

const ghosts = [
{
    x:13,
    y:5,
    color:"red",
    dirX:0,
    dirY:0,
    state:"HOUSE",
    houseTimer:120,
    type:"blinky"
    },

    {
    x:14,
    y:5,
    color:"pink",
    dirX:0,
    dirY:0,
    state:"HOUSE",
    houseTimer:240,
    type:"pinky"
}
];

function initPellets() {
    pellets = [];
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === 0) {
                pellets.push({ x: c, y: r, type: 'normal' });
            } else if (map[r][c] === 3) {
                pellets.push({ x: c, y: r, type: 'power' });
            }
        }
    }
}
initPellets();

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp")    { pacman.nextDirX = 0; pacman.nextDirY = -1; }
    if (e.key === "ArrowDown")  { pacman.nextDirX = 0; pacman.nextDirY = 1; }
    if (e.key === "ArrowLeft")  { pacman.nextDirX = -1; pacman.nextDirY = 0; }
    if (e.key === "ArrowRight") { pacman.nextDirX = 1; pacman.nextDirY = 0; }
});

function moveGhost(g) {
    // 1. ESTADO: EN CASA
if (g.state === 'HOUSE') {

    g.dirX = 0;
    g.dirY = 0;


    // movimiento flotando dentro de la casa
    g.y = Math.round(g.y) + Math.sin(Date.now()/500)*0.1;


    g.houseTimer--;


    if(g.houseTimer <= 0){

        g.state = "EXITING";

    }


    return;
}

    // 2. ESTADO: SALIENDO
    if (g.state === 'EXITING') {
        g.dirX = 0; 
        g.dirY = -0.1; // Sube hacia el pasillo
        g.x += g.dirX;
        g.y += g.dirY;
        
        if (g.y <= 4) { // Ajusta este valor a la fila donde está tu pasillo
            g.y = 4;
            g.state = 'CHASING';
        }
        return;
    }

    // 3. ESTADO: CHASING

const dist = Math.hypot(
    g.x - Math.round(g.x),
    g.y - Math.round(g.y)
);


if (dist < 0.2) {


    let gridX = Math.round(g.x);
    let gridY = Math.round(g.y);


    let dirs = [
        {x:0, y:-1},
        {x:0, y:1},
        {x:-1, y:0},
        {x:1, y:0}
    ];



    // caminos disponibles
    let validDirs = dirs.filter(d=>{

        let nX = gridX + d.x;
        let nY = gridY + d.y;


        return map[nY] && map[nY][nX] !== 1;

    });



    // evitar darse vuelta
    if(validDirs.length > 1){

        validDirs = validDirs.filter(d=>
            !(d.x === -g.dirX && d.y === -g.dirY)
        );

    }



    let bestDir = validDirs[0];
    let minDistance = Infinity;



    // objetivo según fantasma

    let targetX = pacman.x;
    let targetY = pacman.y;



    // 🔴 Blinky: persigue directo

    if(g.type === "blinky"){

        targetX = pacman.x;
        targetY = pacman.y;

    }



    // 🩷 Pinky: intenta adelantarse

    if(g.type === "pinky" && 
       (pacman.dirX !== 0 || pacman.dirY !== 0)){

        targetX = pacman.x + pacman.dirX * 4;
        targetY = pacman.y + pacman.dirY * 4;

    }




    // elegir dirección

    validDirs.forEach(d=>{


        let distancia = Math.hypot(
            (gridX+d.x)-targetX,
            (gridY+d.y)-targetY
        );


        if(distancia < minDistance){

            minDistance = distancia;
            bestDir = d;

        }

    });



    if(bestDir){

        g.dirX = bestDir.x;
        g.dirY = bestDir.y;

    }

}


// mover

g.x += g.dirX * SPEED * 0.85;
g.y += g.dirY * SPEED * 0.85;

}

function spawnGhosts() {
    let homePositions = [];
    // Escaneamos el mapa buscando el número 2
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === 2) homePositions.push({ x: c, y: r });
        }
    }

    // Asignamos los fantasmas a esas posiciones
    ghosts.forEach((g, index) => {
        if (homePositions[index]) {
            g.x = homePositions[index].x;
            g.y = homePositions[index].y;
            g.dirX = 0; // Empiezan quietos en casa
            g.dirY = 0;
        }
    });
}
