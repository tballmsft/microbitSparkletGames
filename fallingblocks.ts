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
    Processing
}   // GameMode

interface InfoSprite {
    sprite: Sprite
}   // interface InfoSprite

interface Pixel {
    x: number
    y: number
}   // interface Pixel

interface PolyominoSprite {
    img: Image
    index: number
    sprite: Sprite
}   // interface PolyominoSprite

const AUTODROP_INTERVAL: number = 25
const COLOR_BG: number = Color.Black
const DROP_INTERVAL_INITIAL: number = 1000
const LEVEL_TIMER_FACTOR: number = 0.85
const LINES_PER_LEVEL: number = 5
const GRID_SIZE_NEXT_POLY: number = 6
const SCORE_PER_LINE: number = 10
const SCORE_PER_POLY: number = 1
const STARTING_LEVELS: number[] = [1, 5, 10]

let autoDrop: boolean = false
let canvas: Image[] = null
let currCanvas: number = 0
let currPoly: ActivePolyomino = null
let dropInterval: number = 0
let fullRows: number[] = []
let gameMode: GameMode = GameMode.NotReady
let gridSprite: Sprite = null
let linesCleared: number = 0
let linesSprite: InfoSprite = null
let nextAnimate: number = 0
let nextLevel: number = 0
let nextPoly: PolyominoSprite = null
let nextPolyLabel: InfoSprite = null
let numFlips: number = 0

function startGame(): void {
    gameMode = GameMode.NotReady
    initGame()
    startNextPoly()
    updateScreen()
    gameMode = GameMode.Main
} 

function runtime() {
    return control.millis();
}

function init_handlers() {
    forever(function () {
        switch (gameMode) {
            case GameMode.Animating:
                if (runtime() >= nextAnimate) {
                    flipScreens()
                }   // if (runtime() >= nextAnimate)
                break

            case GameMode.Main:
                if (nextPoly && runtime() >= currPoly.nextDrop) {
                    currPoly.change.row = 1
                    updateScreen()
                }   // if (runtime() >= nextDrop)
                break
        }   // switch (gameMode)
    })


    // TODO: how to do this with A, B, AB, and accelerometer???
    // A - left
    // B - right
    // AB - Rotate (clockwise only)
    // shake - fall

    input.onButtonPressed(Button.AB, function () {
        switch (gameMode) {
            case GameMode.Main:
                let poly: Polyomino = gameShapes[currPoly.index]
                currPoly.orientation++
                if (currPoly.orientation >= poly.blocks.length) {
                    currPoly.orientation = 0
                }   // if (currPoly.orientation >= poly.blocks.length)
                updateScreen()
                break
        }   // switch (gameMode)
    })  // controller.up.onEvent()

    input.onGesture(Gesture.Shake, function () {
        switch (gameMode) {
            case GameMode.Main:
                autoDrop = true
                currPoly.change.row = 1
                updateScreen()
                break
        }   // switch (gameMode)
    })  // controller.A.onEvent()


    input.onButtonPressed(Button.B, function () {
        switch (gameMode) {
            case GameMode.Main:
                currPoly.change.column = -1
                updateScreen()
                break
        }   // switch (gameMode)
    })  // controller.left.onEvent()

    input.onButtonPressed(Button.A, function () {
        switch (gameMode) {
            case GameMode.Main:
                currPoly.change.column = 1
                updateScreen()
                break
        }   // switch (gameMode)
    })  // controller.right.onEvent()

}

function animateClearLines(): void {
    let newCanvas: number = 1 - currCanvas
    drawGameState(canvas[newCanvas])
    numFlips = 0
    nextAnimate = runtime() + dropInterval / 2
    gameMode = GameMode.Animating
}   // animateClearLines()

function clearLines(): void {
    fullRows = []
    for (let rowNum: number = ROWS - 1; rowNum >= 0; rowNum--) {
        let row: number[] = gameState[rowNum]
        let count: number = 0
        for (let cell of row) {
            if (cell > -1) {
                count++
            }   // if (cell)
        }   // for (cell)
        if (count >= COLUMNS) {
            fullRows.push(rowNum)
        }   // if (count >= COLUMNS)
    }   // for (rowNum)

    if (fullRows.length > 0) {
        // Clear the full rows for the animation
        for (let row of fullRows) {
            for (let col: number = 0; col < COLUMNS; col++) {
                setBlock(row, col, -1)
            }   // for (col)
        }   // for (row)
        animateClearLines()
    }   // if (fullRows)
}   // clearLines()

function flipScreens(): void {
    nextAnimate = runtime() + dropInterval / 2
    let newCanvas: number = 1 - currCanvas
    // gridSprite.setImage(canvas[newCanvas])
    currCanvas = newCanvas
    numFlips++
    if (numFlips === 5) {
        shiftLines()
        updateNextPolySprite()
        gameMode = GameMode.Main
    }   // if (numFlips)
}   // flipScreens()

function initGame(): void {
    initShapes()
    initVars()
    initGameState()
    initGameSprites()
}   // initGame()


function initGameSprites(): void {
    canvas = []
    canvas.push(createCanvas(ROWS, COLUMNS))
    canvas.push(createCanvas(ROWS, COLUMNS))
    currCanvas = 0
    gridSprite = null; //sprites.create(canvas[currCanvas], 0)
    gridSprite.x = 0; // screen.width / 2
    gridSprite.y = 0; // screen.height / 2
    // gridSprite.setFlag(SpriteFlag.Ghost, true)
    let img: Image = createCanvas(GRID_SIZE_NEXT_POLY, GRID_SIZE_NEXT_POLY)
    nextPoly = {
        img: img,
        index: 0,
        sprite: null
    }
    nextPoly.sprite = null; // sprites.create(nextPoly.img, 0)
    nextPoly.sprite.x = 0; //screen.width - nextPoly.img.width / 2 - 10
    nextPoly.sprite.y = 0; //screen.height - nextPoly.img.height / 2 - 10
    //nextPoly.sprite.setFlag(SpriteFlag.Ghost, true)
    nextPolyLabel = {
        sprite: null
    }
    nextPolyLabel.sprite = null; // sprites.create(nextPolyLabel.img, 0)
    nextPolyLabel.sprite.x = nextPoly.sprite.x
    nextPolyLabel.sprite.y = nextPoly.sprite.y - 32
    // nextPolyLabel.sprite.setFlag(SpriteFlag.Ghost, true)
}   // initGameSprites()


function initShapes(): void {
    gameShapes = TETROMINOES;
}   // initShapes()


function initVars(): void {
    fullRows = []
    linesCleared = 0
    nextLevel = LINES_PER_LEVEL
    autoDrop = false
    // info.setScore(0)

    let startLevel: number = STARTING_LEVELS[0]
    dropInterval = Math.round(DROP_INTERVAL_INITIAL * LEVEL_TIMER_FACTOR ** (startLevel - 1))
    // info.setLife(startLevel)
}   // initVars()


function levelUp(): void {
    nextLevel += LINES_PER_LEVEL
    dropInterval = Math.floor(dropInterval * LEVEL_TIMER_FACTOR)
    // info.changeLifeBy(1)
}   // levelUp()

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
        }   // for (row)
        shiftAmount++
    }   // for (index)
    if (linesCleared >= nextLevel) {
        levelUp()
    }   // if (linesCleared > nextLevel)
}   // shiftLines()

function startNextPoly(): void {
    autoDrop = false
    if (currPoly) {
        setPoly(currPoly)
        clearLines()
    } else {
        // Start of game
        // Prime nextPoly
        nextPoly.index = Math.randomRange(0, gameShapes.length - 1)
    }   // if (currPoly)
    let newPoly: Polyomino = gameShapes[nextPoly.index]
    currPoly = {
        change: {
            column: 0,
            row: 0
        },
        index: nextPoly.index,
        location: {
            column: Math.floor((COLUMNS - newPoly.blocks[0][0].length) / 2),
            row: 0 - newPoly.blocks[0].length
        },
        nextDrop: 0,
        orientation: 0
    }
    nextPoly.index = Math.randomRange(0, gameShapes.length - 1)
    // If we're clearing lines, update the Next Poly sprite later
    if (gameMode !== GameMode.Animating) {
        updateNextPolySprite()
    }   // if (gameMode !== GameMode.Animating)
}   // startNextPoly()

function updateGridSprite(): void {
    let newCanvas: number = 1 - currCanvas
    drawGameState(canvas[newCanvas])
    // gridSprite.setImage(canvas[newCanvas])
    currCanvas = newCanvas
}   // updateGridSprite()


function updateNextPolySprite(): void {
    // nextPoly.img.fill(COLOR_BG)
    // Draw grid when debugging.
    // drawGrid(nextPolyImage, GRID_SIZE_NEXT_POLY, GRID_SIZE_NEXT_POLY, Color.Wine)
    let poly: Polyomino = gameShapes[nextPoly.index]
    drawPoly(nextPoly.img, poly,
        Math.floor((GRID_SIZE_NEXT_POLY - poly.blocks[0].length) / 2),
        Math.floor((GRID_SIZE_NEXT_POLY - poly.blocks[0][0].length) / 2))
}   // updateNextPolySprite()

function updateScreen(): void {
    gameMode = GameMode.Processing
    // Update the next drop time if we are moving the poly down
    if (currPoly.change.row > 0) {
        if (autoDrop) {
            currPoly.nextDrop = runtime() + AUTODROP_INTERVAL
        } else {
            currPoly.nextDrop = runtime() + dropInterval
        }   // if (autoDrop)
    }   // if (currPoly.change.row)
    if (currPoly.change.row !== 0 || currPoly.change.column !== 0) {
        currPoly.location.column += currPoly.change.column
        currPoly.location.row += currPoly.change.row
    }   // if (currPoly.change)
    if (setPoly(currPoly, false, true)) {
        // Set the current polyomino,
        // update the grid on the screen,
        // and then unset the current polyomino
        setPoly(currPoly)
        updateGridSprite()
        setPoly(currPoly, true)
    } else {
        // Cannot accommodate requested change
        // Undo change
        // music.playTone(Note.C, BeatFraction.Half)
        if (currPoly.change.row !== 0 || currPoly.change.column !== 0) {
            currPoly.location.column -= currPoly.change.column
            currPoly.location.row -= currPoly.change.row
        } else {
            // Orientation change requested; reset
            let poly: Polyomino = gameShapes[currPoly.index]
            currPoly.orientation--
            if (currPoly.orientation < 0) {
                currPoly.orientation = poly.blocks.length - 1
            }   // if (currPoly.orientation < 0)
        }   // if (currPoly.change)
        if (currPoly.change.row > 0 && currPoly.change.column === 0) {
            // Attempted to drop poly but could not
            if (currPoly.location.row < 0) {
                // game.over(false, effects.dissolve)
            } else {
                // Set it and then create a new poly
                // info.changeScoreBy(SCORE_PER_POLY)
                startNextPoly()
            }   // if (currPoly.location.row < 0)
        }   // if (currPoly.change.row > 0)
    }   // if (setPolyomino...)
    currPoly.change = {
        column: 0,
        row: 0
    }

    // If we're clearing lines, then do not switch back to main game mode
    if (gameMode === GameMode.Processing) {
        gameMode = GameMode.Main
    }   // if (gameMode === GameMode.Processing)
}   // updateScreen()
