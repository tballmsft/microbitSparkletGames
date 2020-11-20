// abstract the 16x16 Sparklet screen, which underneath is a single neopixel strip

const SCREEN_WIDTH = 16;
const SCREEN_HEIGHT = 16;

class Screen {
    private strip: neopixel.Strip;
    constructor() {
        this.strip = neopixel.create(DigitalPin.P0, SCREEN_WIDTH*SCREEN_HEIGHT, NeoPixelMode.RGB)
        this.strip.setBrightness(50)                    // don't blind the user
        this.strip.setMatrixWidth(SCREEN_WIDTH)         // sparklet screen is 16x16
        pins.digitalWritePin(DigitalPin.P1, 1)          // turn on the sparklet display 
    }
    setPixel(x: number, y: number, c: number) {
        this.strip.setMatrixColor(x, y, c);
    }
    setRaw(i: number, c: number) {
        this.strip.setPixelColor(i, c);
    }
    show() { this.strip.show(); }
    setAll(c: number) {
        this.strip.showColor(c);
        this.strip.show();
    }
}

// there is one (global) screen 
let screen = new Screen();

class Sprite {
    public color: number;
    constructor(public x: number, public y: number) { }
    setPosition(a: number, b: number) { this.x = a; this.y = b; }
    setColor(c: number) { this.color = c;}
    draw() {
        screen.setPixel(this.x, this.y, this.color)
    }
}

// abstract interface for running a sparklet game
class SparkletGame {
    // game start
    // game over
    // game update
    // A, B, AB, Shake
}

// TODO: splash screen
let snakeGame = new SnakeGame();

// startFallingBlocks();