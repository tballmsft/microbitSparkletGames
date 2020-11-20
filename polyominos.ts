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

enum Color {
    Transparent, // 0
    White, // 1 = RGB(255, 255, 255)
    Red, // 2 = RGB(255, 33, 33)
    Pink, // 3 = RGB(255, 147, 196)
    Orange, // 4 = RGB(255, 129, 53)
    Yellow, // 5 = RGB(255, 246, 9)
    Aqua, // 6 = RGB(36, 156, 163)
    BrightGreen, // 7 = RGB(120, 220, 82)
    Blue, // 8 = RGB(0, 63, 173)
    LightBlue, // 9 = RGB(135, 242, 255)
    Purple, // 10 = RGB(142, 46, 196)
    RoseBouquet, // 11 = RGB(164, 131, 159)
    Wine, // 12 = RGB(92, 64, 108)
    Bone, // 13 = RGB(229, 205, 196)
    Brown, // 14 = RGB(145, 70, 61)
    Black // 15 = RGB(0, 0, 0)
}   // enum Color

function toRGB(c: Color) {
    switch(c) {
        case Color.Transparent: return 0;
        case Color.White: return neopixel.rgb(255, 255, 255);
        case Color.Red: return neopixel.rgb(255, 33, 33);
        case Color.Pink: return neopixel.rgb(255, 147, 196);
        case Color.Orange: return neopixel.rgb(255, 129, 53)
        case Color.Yellow: return neopixel.rgb(255, 246, 9)
        case Color.Aqua: return neopixel.rgb(36, 156, 163)
        case Color.BrightGreen: return neopixel.rgb(120, 220, 82)
        case Color.Blue: return neopixel.rgb(0, 63, 173)
        case Color.LightBlue: return neopixel.rgb(135, 242, 255)
        case Color.Purple: return neopixel.rgb(142, 46, 196)
        case Color.RoseBouquet: return neopixel.rgb(164, 131, 159)
        case Color.Wine: return neopixel.rgb(92, 64, 108)
        case Color.Bone: return neopixel.rgb(229, 205, 196)
        case Color.Brown: return neopixel.rgb(145, 70, 61)
        case Color.Black: return neopixel.rgb(0, 0, 0) 
    }
}

interface ActivePolyomino {
    change: Coordinate
    index: number
    location: Coordinate
    nextDrop: number
    orientation: number
}  

interface Coordinate {
    column: number
    row: number
}

interface Polyomino {
    blocks: string[][]
    fillColor: number
}

const BLOCK_SIZE: number = 1
const COLUMNS: number = 10
const ROWS: number = 16

const TETROMINOES: Polyomino[] = [
    // I
    {
        blocks: [
            [
                'XXXX'
            ], [
                'X',
                'X',
                'X',
                'X'
            ]
        ],
        fillColor: toRGB(Color.LightBlue)
    },
    // O
    {
        blocks: [
            [
                'XX',
                'XX'
            ]
        ],
        fillColor: toRGB(Color.Yellow)
    },
    // T
    {
        blocks: [
            [
                'XXX',
                '.X.'
            ], [
                '.X',
                'XX',
                '.X'
            ], [
                '.X.',
                'XXX'
            ], [
                'X.',
                'XX',
                'X.'
            ]
        ],
        fillColor: toRGB(Color.Purple)
    },
    // J
    {
        blocks: [
            [
                '.X',
                '.X',
                'XX'
            ], [
                'X..',
                'XXX'
            ], [
                'XX',
                'X.',
                'X.'
            ], [
                'XXX',
                '..X'
            ]
        ],
        fillColor: toRGB(Color.Aqua)
    },
    // L
    {
        blocks: [
            [
                'X.',
                'X.',
                'XX'
            ], [
                'XXX',
                'X..'
            ], [
                'XX',
                '.X',
                '.X'
            ], [
                '..X',
                'XXX'
            ]
        ],
        fillColor: toRGB(Color.Orange)
    },
    // S
    {
        blocks: [
            [
                '.XX',
                'XX.'
            ], [
                'X.',
                'XX',
                '.X'
            ]
        ],
        fillColor: toRGB(Color.BrightGreen)
    },
    // Z
    {
        blocks: [
            [
                'XX.',
                '.XX'
            ], [
                '.X',
                'XX',
                'X.'
            ]
        ],
        fillColor: toRGB(Color.Red)
    }
]

let gameShapes: Polyomino[] = null
let gameState: number[][] = null

// Copies a line in the game state.
// @param {number} source - Row to copy.
// @param {number} destination - Row to place the copied line.
//
function copyLine(source: number, destination: number): void {
    for (let index: number = 0; index < COLUMNS; index++) {
        setBlock(destination, index, gameState[source][index])
    } 
}


function drawGameState(): void {
    for (let row: number = 0; row < ROWS; row++) {
        for (let column: number = 0; column < COLUMNS; column++) {
            let state: number = gameState[row][column]
            screen.setPixel(column, row, state > -1 ? gameShapes[state].fillColor : 0)
        }   
    } 
} 

//
// @param {Polyomino} poly - Polyomino to draw.
// @param {number} row - Row of location to draw polyomino.
// @param {number} column - Column of location to draw polyomino.
//
function drawPoly(poly: Polyomino, row: number, column: number): void {
    let blocks: string[] = poly.blocks[0]
    let r: number = row
    let c: number
    for (let s of blocks) {
        c = column
        for (let char of s) {
            if (char !== '.') {
                screen.setPixel(c, r, poly.fillColor)
            }
            c++
        }
        r++
    }
}

//
// Initializes the global game state variable.
//
function initGameState(): void {
    gameState = []
    for (let row: number = 0; row < ROWS; row++) {
        let gameStateRow: number[] = []
        for (let column: number = 0; column < COLUMNS; column++) {
            gameStateRow.push(-1)
        }
        gameState.push(gameStateRow)
    }
}

//
// Place a block into the game state.
// @param {number} row - Row of cell to update.
// @param {number} column - Column of cell to update.
// @param {number} state - Index of polyomino related to this cell; -1 to clear the state.
//
function setBlock(row: number, column: number, state: number): void {
    if (row >= 0 && row < ROWS && column >= 0 && column < COLUMNS) {
        gameState[row][column] = state
    } 
}

//
// Place a polyomino into the game state.
// @param {ActivePolyomino} polyState - Polyomino to place into the game state.
// @param {boolean} erase - True to remove the polyomino; false to place to polyomino.
// @param {boolean} testOnly - True to test if polyomino can be placed; false to place polyomino.
// @return {boolean} - True if polyomino can be placed; false if not
//
function setPoly(polyState: ActivePolyomino, erase: boolean = false, testOnly: boolean = false): boolean {
    let poly: Polyomino = gameShapes[polyState.index]
    let blocks: string[] = poly.blocks[polyState.orientation]
    let r: number = polyState.location.row
    let c: number
    let toReturn = true
    for (let s of blocks) {
        c = polyState.location.column
        for (let char of s) {
            if (char !== '.') {
                if (!testBlock(r, c)) {
                    toReturn = false
                }
                if (!testOnly) {
                    setBlock(r, c, erase ? -1 : polyState.index)
                }
            } 
            c++
        }
        r++
    }
    return toReturn
}

//
// Determines if a block can be placed in the game state.
// @param {number} row - Row of cell to test.
// @param {number} column - Column of cell to test.
// @return {boolean} Cell is empty and within the bounds of the game state
//
function testBlock(row: number, column: number): boolean {
    if (row < 0) {
        // Only verify that column is in-bounds if row is negative.
        if (column >= 0 && column <= COLUMNS) {
            return true
        } else {
            return false
        }
    } else {
        if (row >= 0 && row < ROWS && column >= 0 && column < COLUMNS) {
            return gameState[row][column] === -1
        } else {
            return false
        }
    }
}
