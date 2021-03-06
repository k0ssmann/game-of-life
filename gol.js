function GameOfLife(canvas, res) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.grid = undefined;
    this.res = res; /* Resolution */
    this.generation = 0;
    this.cfg = {
        columns: Math.floor(this.canvas.width/this.res),
        rows: Math.floor(this.canvas.height/this.res),
        gridFill: "#FFFFFF",
        gridColor: "#000000",
        lCellFill: "#276678",
        dCellFill: "#1687A7",
        eCellFill: "#F6F5F5",
        trailFill: "#00DB50",
        lineWidth: 1
    };

    this.init();
}

GameOfLife.prototype = {

    state: {
        empty: null,
        dead: "dead",
        alive: "alive",
        trail: "trail"
    },

    init: function() {
        this.grid = new Array(this.cfg.columns).fill(this.state.empty)
        .map(() => new Array(this.cfg.rows).fill(this.state.empty));
        this.drawRect();
        this.drawAllCells();
        document.getElementById("generation").innerHTML = this.generation;
    },
    drawRect: function() {
        this.ctx.fillStyle = this.cfg.gridFill;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
    // drawGrid: function() {
    //     this.ctx.lineWidth = this.cfg.lineWidth;
    //     this.ctx.strokeStyle = this.cfg.gridColor;

    //     /* draw vertical lines */
    //     for(var x = 0; x <= this.cfg.columns; x++) {
    //         this.ctx.moveTo(0.5 + x * this.res, 0);
    //         this.ctx.lineTo(0.5 + x * this.res, this.canvas.height);
    //     }
    //     /* draw horizontal lines */
    //     for(var y = 0; y <= this.cfg.rows; y++) {
    //         this.ctx.moveTo(0, 0.5 + y * this.res);
    //         this.ctx.lineTo(this.canvas.width, 0.5 + y * this.res);
    //     }
    //     this.ctx.stroke();
    // },
    drawCell: function(x, y) {
        /* Get color */
        if(this.grid[x][y] === this.state.empty) {
            this.ctx.fillStyle = this.cfg.eCellFill;
        } else if(this.grid[x][y] === this.state.alive) {
            this.ctx.fillStyle = this.cfg.lCellFill;
        } else if(this.grid[x][y] === this.state.dead) {
            this.ctx.fillStyle = this.cfg.dCellFill;
        } else {
            this.ctx.fillStyle = this.cfg.trailFill;
        }
        this.ctx.fillRect( x * this.res ,  y * this.res, this.res, this.res);
    },
    drawAllCells: function() {
        for(let x = 0; x < this.cfg.columns; x++) {
            for(let y = 0; y < this.cfg.rows; y++) {
                this.drawCell(x,y);
            }
        }
    },
    clear: function() {
        for(let x = 0; x < this.cfg.columns; x++) {
            for(let y = 0; y < this.cfg.rows; y++) {
                this.grid[x][y] = this.state.empty;
            }
        }
        this.generation = 0;
        this.drawAllCells();
        document.getElementById("generation").innerHTML = this.generation;
    },
    insertCell: function(x, y, state) {
        this.grid[x][y] = state;
        this.drawCell(x,y);
    },
    update: function() {

        /*  
        *  1. A dead cell with exactly three living neighbors is reborn in the next generation.  
        *  2. Living cells with fewer than two living neighbors die of solitude in the next generation.
        *  3. A living cell with two or three living neighbors remains alive in the next generation.
        *  4. Living cells with more than three living neighbors die of overpopulation in the next generation.
        */

       var gridCopy = new Array(this.cfg.columns).fill(this.state.empty)
       .map(() => new Array(this.cfg.rows).fill(this.state.empty));
       var nNeighbors = 0;

       for(var x = 0; x < this.cfg.columns; x++) {
           for(var y = 0; y < this.cfg.rows; y++) {
               nNeighbors = this.countNeighbours(x,y);
               if(this.grid[x][y] === this.state.alive) {
                   if(nNeighbors === 2 || nNeighbors === 3) {
                       gridCopy[x][y] = this.state.alive;
                   }
                   if(nNeighbors < 2 || nNeighbors > 3) {
                       gridCopy[x][y] = this.state.dead;
                   }
               } else if (nNeighbors === 3) {
                gridCopy[x][y] = this.state.alive;
               } else if((this.grid[x][y] === this.state.dead && nNeighbors < 3) || this.grid[x][y] === this.state.trail) {
                   gridCopy[x][y] = this.state.trail;
               } 
           }
       }

       this.grid = gridCopy;
       this.generation++;
       document.getElementById("generation").innerHTML = this.generation;
       this.drawAllCells();
    },
    countNeighbours: function(x,y) {

        /*
        * Returns number of living neighbors of the cell 
        * at the given index
        * 
        */

        var nNeighbors = 0;

        /* Case: x = y = 0 */
        if (x === 0 && y === 0) {
            if (this.grid[x + 1][y] === this.state.alive) {
                nNeighbors++;
            }
            if (this.grid[x][y + 1] === this.state.alive) {
                nNeighbors++;
            }
            if (this.grid[x + 1][y + 1] === this.state.alive) {
                nNeighbors++;
            }
        }
        /* Case: x = 0, y = this.cfg.rows - 1 */
        if (x === 0 && y === this.cfg.rows - 1) {
            if (this.grid[x + 1][y] === this.state.alive) {
                nNeighbors++;
            }
            if (this.grid[x][y - 1] === this.state.alive) {
                nNeighbors++;
            }
            if (this.grid[x + 1][y - 1] === this.state.alive) {
                nNeighbors++;
            }
        }
        /* Case: x = this.cfg.columns - 1, y = 0 */
        if (x === this.cfg.columns - 1 && y === 0) {
            if (this.grid[x - 1][y] === this.state.alive) {
                nNeighbors++;
            }
            if (this.grid[x][y + 1] === this.state.alive) {
                nNeighbors++;
            }
            if (this.grid[x - 1][y + 1] === this.state.alive) {
                nNeighbors++;
            }
        }

        /* Case: x = this.cfg.colums - 1, y = this.cfg.rows - 1 */
        if (x === this.cfg.columns - 1 && y === this.cfg.rows - 1) {
            if (this.grid[x - 1][y] === this.state.alive) {
                nNeighbors++;
            }
            if (this.grid[x][y - 1] === this.state.alive) {
                nNeighbors++;
            }
            if (this.grid[x - 1][y - 1] === this.state.alive) {
                nNeighbors++;
            }
        }

        /* Case x = 0,  0 < y < this.cfg.rows - 1 */

        if (x === 0 && y < this.cfg.rows - 1 && y > 0) {
            if (this.grid[x][y - 1] === this.state.alive) {
                nNeighbors++;
            }
            if (this.grid[x][y + 1] === this.state.alive) {
                nNeighbors++;
            }
            if (this.grid[x + 1][y - 1] === this.state.alive) {
                nNeighbors++;
            }
            if (this.grid[x + 1][y] === this.state.alive) {
                nNeighbors++;
            }
            if (this.grid[x + 1][y + 1] === this.state.alive) {
                nNeighbors++;
            }
        }
        
        /* Case 0 < x < this.cfg.columns - 1, y = 0 */

        if (y === 0 && x < this.cfg.columns - 1 && x > 0) {
            if(this.grid[x-1][y] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x+1][y] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x][y+1] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x-1][y+1] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x+1][y+1] === this.state.alive) {
                nNeighbors++;
            }
        }

        /* Case x = this.cfg.columns, 0 < y < this.cfg.rows - 1 */

        if (x === this.cfg.columns - 1 && y < this.cfg.rows - 1 && y > 0) {
            if(this.grid[x-1][y] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x][y-1] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x-1][y-1] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x][y+1] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x-1][y+1] === this.state.alive) {
                nNeighbors++;
            }
        }

        /* Case 0 < x < this.cfg.columns - 1, y = this.cfg.rows */


        if (x > 0 && x < this.cfg.columns - 1 && y === this.cfg.rows - 1) {
            if(this.grid[x-1][y] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x+1][y] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x][y-1] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x-1][y-1] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x+1][y-1] === this.state.alive) {
                nNeighbors++;
            }
        }

        /* Case 0 < x < this.cfg.columns - 1, 0 < y < this.cfg.rows - 1 */

        if(x > 0 && x < this.cfg.columns - 1 && y > 0 && y < this.cfg.rows - 1) {
            if(this.grid[x][y-1] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x][y+1] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x+1][y] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x-1][y] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x-1][y-1] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x+1][y-1] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x-1][y+1] === this.state.alive) {
                nNeighbors++;
            }
            if(this.grid[x+1][y+1] === this.state.alive) {
                nNeighbors++;
            }
        }

    return  nNeighbors;

    },

    random: function() {
        var keys = Object.keys(this.state);
        var min = 0;
        var max = 2;
        for(var x = 0; x < this.cfg.columns; x++) {
            for(var y = 0; y < this.cfg.rows; y++) {
                this.grid[x][y] = this.state[keys[Math.floor(Math.random() * (max - min +1)) + min]];
            }
        }
        this.drawAllCells();
    }
}

function onClick(e) {
    /*
    *   Add cells by clicking on grid
    */

    var x = Math.floor(e.offsetX/game.res);
    var y = Math.floor(e.offsetY/game.res);

    if(game.grid[x][y] === game.state.empty) {
        game.insertCell(x,y, game.state.alive);
    } else if (game.grid[x][y] === game.state.alive) {
        game.insertCell(x,y,game.state.dead);
    } else {
        game.insertCell(x,y, game.state.empty);
    }
}

let timer = null;
let fps = 0;
let lastCalledTime = null;

function loop() {

    document.getElementById("fps").innerHTML = fps;

    if(!lastCalledTime) {
        lastCalledTime = performance.now();
        game.update();
        timer = requestAnimationFrame(() => loop());
    } 
    var delta = (performance.now() - lastCalledTime)/1000;
    lastCalledTime = performance.now();
    fps = Math.floor(1/delta,2);
    game.update();
    cancelAnimationFrame(timer);
    timer = requestAnimationFrame(() => loop());
}

var game = new GameOfLife(document.getElementById("canvas"), 5);

game.canvas.addEventListener('click', onClick); /* Add cells by clicking on grid */
document.getElementById("bStart").addEventListener('click', () => loop()); /* Start game, set update rate */
document.getElementById("bStep").addEventListener('click', () => game.update()) /* Update game for one step */
document.getElementById("bStop").addEventListener('click', () => cancelAnimationFrame(timer)); /* Stop game */
document.getElementById("bClear").addEventListener('click', () => {
    game.clear();
    cancelAnimationFrame(timer)}); /* Clear grid */
document.getElementById("bRandom").addEventListener('click', () => {game.clear(), window.clearInterval(timer), game.random()}); /* Fill grid randomly */
document.getElementById("fps").innerHTML = fps;




