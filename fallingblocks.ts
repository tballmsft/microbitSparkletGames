// this file was derived from 

/**
 * Minos
 * Built on
 * MakeCode Arcade JavaScript Template v. 2.2
 * Last update: 05 Jun 2019 ak
 * (C) 2019 Robo Technical Group LLC
MIT License

Copyright 2019 Robo Technical Group LLC.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH
THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Game modes
enum GameMode {
    Animating,
    Main,
    NotReady,
    Processing,
    Over
}

interface Pixel {
    x: number
    y: number
}

interface PolyominoSprite {
    index: number
    sprite: Sprite
}

const AUTODROP_INTERVAL: number = 25            // milliseconds
const DROP_INTERVAL_INITIAL: number = 1000      // milliseconds
const LEVEL_TIMER_FACTOR: number = 0.85
const LINES_PER_LEVEL: number = 5
const GRID_SIZE_NEXT_POLY: number = 6
const SCORE_PER_LINE: number = 10
const SCORE_PER_POLY: number = 1
const STARTING_LEVELS: number[] = [1, 5, 10]

let autoDrop: boolean = false
let currPoly: ActivePolyomino = null
let nextPoly: number = -1;
let fullRows: number[] = []                 // set of completed rows, to be eliminated
let dropInterval: number = 0
let gameMode: GameMode = GameMode.NotReady
let linesCleared: number = 0
let nextAnimate: number = 0
let nextLevel: number = 0

let numFlips: number = 0

// TODO: problems
// - blocks stop falling
// - glitch at bottom
// - next block not showing

function startFallingBlocks(): void {
    gameMode = GameMode.NotReady
    initGame()
    startNextPoly()
    updateScreen()
    gameMode = GameMode.Main;
    initHandlers();
    screen.show();
} 

function runtime() {
    return control.millis();
}

function initHandlers() {
    forever(function () {
        switch (gameMode) {
            case GameMode.Animating:
                if (runtime() >= nextAnimate) {
                    flipScreens()
                }
                break

            case GameMode.Main:
                if (nextPoly > -1 && runtime() >= currPoly.nextDrop) {
                    currPoly.change.row = 1
                    updateScreen()
                }
                break
        }

    })

    // AB = rotate
    input.onButtonPressed(Button.AB, function () {
        switch (gameMode) {
            case GameMode.Main:
                let poly: Polyomino = gameShapes[currPoly.index]
                currPoly.orientation++
                if (currPoly.orientation >= poly.blocks.length) {
                    currPoly.orientation = 0
                } 
                updateScreen()
                break
        }
    })

    // shake = fall quickly
    input.onGesture(Gesture.Shake, function () {
        switch (gameMode) {
            case GameMode.Main:
                autoDrop = true
                currPoly.change.row = 1
                updateScreen()
                break
        } 
    })

    // move left
    input.onButtonPressed(Button.B, function () {
        switch (gameMode) {
            case GameMode.Main:
                currPoly.change.column = -1
                updateScreen()
                break
        }
    })

    // move right
    input.onButtonPressed(Button.A, function () {
        switch (gameMode) {
            case GameMode.Main:
                currPoly.change.column = 1
                updateScreen()
                break
        }
    })
}

function animateClearLines(): void {
    drawGameState()
    numFlips = 0
    nextAnimate = runtime() + dropInterval / 2
    gameMode = GameMode.Animating
}

function clearLines(): void {
    fullRows = []
    for (let rowNum: number = ROWS - 1; rowNum >= 0; rowNum--) {
        let row: number[] = gameState[rowNum]
        let count: number = 0
        for (let cell of row) {
            if (cell > -1) {
                count++
            }
        }
        if (count >= COLUMNS) {
            fullRows.push(rowNum)
        }
    }

    if (fullRows.length > 0) {
        // Clear the full rows for the animation
        for (let row of fullRows) {
            for (let col: number = 0; col < COLUMNS; col++) {
                setBlock(row, col, -1)
            }
        }
        animateClearLines()
    }
}

function flipScreens(): void {
    nextAnimate = runtime() + dropInterval / 2
    numFlips++
    if (numFlips === 3) {
        shiftLines()
        updateNextPolySprite()
        gameMode = GameMode.Main
    } 
    screen.show();
} 

function initGame(): void {
    gameShapes = TETROMINOES;
    initVars()
    initGameState()
}

function initVars(): void {
    fullRows = []
    linesCleared = 0
    nextLevel = LINES_PER_LEVEL
    autoDrop = false
    // info.setScore(0)

    let startLevel: number = STARTING_LEVELS[0]
    dropInterval = Math.round(DROP_INTERVAL_INITIAL * LEVEL_TIMER_FACTOR ** (startLevel - 1))
    // info.setLife(startLevel)
} 


function levelUp(): void {
    nextLevel += LINES_PER_LEVEL
    dropInterval = Math.floor(dropInterval * LEVEL_TIMER_FACTOR)
    // info.changeLifeBy(1)
}

function shiftLines(): void {
    linesCleared += fullRows.length
    // info.changeScoreBy(SCORE_PER_LINE * 2 ** (fullRows.length - 1))
    let shiftAmount: number = 1
    for (let index: number = 0; index < fullRows.length; index++) {
        let startRow: number = fullRows[index] - 1
        let endRow: number =
            index === fullRows.length - 1
                ? 0
                : fullRows[index + 1] + 1
        for (let row: number = startRow; row >= endRow; row--) {
            copyLine(row, row + shiftAmount)
        }
        shiftAmount++
    }
    if (linesCleared >= nextLevel) {
        levelUp()
    }
} 

function startNextPoly(): void {
    autoDrop = false
    if (currPoly) {         // the current one is done moving
        setPoly(currPoly)   // place in state permanently
        clearLines()        // and clear any completed lines
    } else {
        // Start of game
        nextPoly = Math.randomRange(0, gameShapes.length - 1)
    } 
    let newPoly: Polyomino = gameShapes[nextPoly]
    currPoly = {
        change: { column: 0, row: 0 },
        index: nextPoly,
        location: {
            column: Math.floor((COLUMNS - newPoly.blocks[0][0].length) / 2),
            row: 0 - newPoly.blocks[0].length    // starts above screen
        },
        nextDrop: 0,
        orientation: 0
    }
    nextPoly = Math.randomRange(0, gameShapes.length - 1)
    // If we're clearing lines, update the Next Poly sprite later
    if (gameMode !== GameMode.Animating) {
        updateNextPolySprite()
    } 
}

function updateNextPolySprite(): void {
    let poly: Polyomino = gameShapes[nextPoly]
    for(let c=12;c<16;c++)
        for(let r=0;r<SCREEN_HEIGHT;r++)
            screen.setPixel(c, r, 0);
    drawPoly(poly, 4, 11 + 
                Math.floor((6 - poly.blocks[0][0].length) / 2));
}

function updateScreen(): void {
    gameMode = GameMode.Processing
    // Update the next drop time if we are moving the poly down
    if (currPoly.change.row > 0) {
        if (autoDrop) {
            currPoly.nextDrop = runtime() + AUTODROP_INTERVAL
        } else {
            currPoly.nextDrop = runtime() + dropInterval
        }
    }  
    // update the location of the current poly
    if (currPoly.change.row !== 0 || currPoly.change.column !== 0) {
        currPoly.location.column += currPoly.change.column
        currPoly.location.row += currPoly.change.row
    }
    // test to see if the poly can be moved as requested
    if (setPoly(currPoly, false, true)) {
        setPoly(currPoly);          // put the current polyomino into game state
        drawGameState();            // update the grid on the screen
        setPoly(currPoly, true);    // remove current polyomino from game state
    } else {
        // Cannot accommodate requested change
        // Undo change
        if (currPoly.change.row !== 0 || currPoly.change.column !== 0) {
            currPoly.location.column -= currPoly.change.column
            currPoly.location.row -= currPoly.change.row
        } else {
            // Orientation change requested; reset
            let poly: Polyomino = gameShapes[currPoly.index]
            currPoly.orientation--
            if (currPoly.orientation < 0) {
                currPoly.orientation = poly.blocks.length - 1
            }
        }
        if (currPoly.change.row > 0 && currPoly.change.column === 0) {
            // Attempted to drop poly but could not
            if (currPoly.location.row < 0) {
                gameMode = GameMode.Over;
                screen.setAll(toRGB(Color.Red));
            } else {
                // Set it and then create a new poly
                // info.changeScoreBy(SCORE_PER_POLY)
                startNextPoly()
            }
        }
    }
    currPoly.change.column = 0;
    currPoly.change.row = 0;
    // If we're clearing lines, then do not switch back to main game mode
    if (gameMode === GameMode.Processing) {
        gameMode = GameMode.Main
    }
    screen.show(); 
}