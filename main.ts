// - splash screen to select among 2-3 games
// - persist high scores
// - text ???

class Screen {
    strip: neopixel.Strip;
    constructor() {
        this.strip = neopixel.create(DigitalPin.P0, 256, NeoPixelMode.RGB)
        this.strip.setBrightness(50)                    // don't blind the user
        this.strip.setMatrixWidth(16)                   // sparklet screen is 16x16
        pins.digitalWritePin(DigitalPin.P1, 1)          // turn on the sparklet display 
    }
    setPixel(x: number, y: number, c: number) {
        this.strip.setMatrixColor(x, y, c);
    }
    setAll(c: number) {
        this.strip.showColor(c);
        this.strip.show();
    }
    setRaw(i: number, c: number) {
        this.strip.setPixelColor(i, c);
    }
    show() { this.strip.show(); }
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

// ----------------------------------------------------------------------
// snake game based on https://forum.makecode.com/t/snake-and-apples/3027
// ----------------------------------------------------------------------

class SnakeGame {
    apples: Sprite[] = []
    head: Sprite = null
    head_prior: Sprite = null
    body: Sprite[] = []
    direction: number = 0
    game_over: boolean = false;
    dir_change: boolean = false;
    delay: number = 300;

    constructor() {
        this.create_head()
        this.create_body()
        this.create_random_apples()

        input.onButtonPressed(Button.B, function () {
            if (!this.dir_change)
                this.direction = this.direction == 0 ? 3 : this.direction -1;
            this.dir_change = true;
        })

        input.onButtonPressed(Button.A, function () {
            if (!this.dir_change)
                this.direction = this.direction == 3 ? 0 : this.direction +1;
            this.dir_change = true;
        })

        forever(function () {
            if (this.game_over) {
                screen.setAll(neopixel.colors(NeoPixelColors.Red));
                return;
            }
            if (this.check_collisions()) {
                this.game_over = true;
                return;
            }
            this.move(this.direction);
            this.create_display();
            this.dir_change = false;
            pause(this.delay);
        });
    }

    create_display() {
        let red = neopixel.colors(NeoPixelColors.Orange)
        let blue = neopixel.colors(NeoPixelColors.Blue)
        for(let p=0; p<256; p++) { screen.setRaw(p, blue+p*4 ); }
        for(let c=0;c<16;c++) {
            screen.setPixel(0, c, red);
            screen.setPixel(c, 0, red);
            screen.setPixel(15, c, red);
            screen.setPixel(c, 15, red);
        }
        this.apples.forEach(s => { s.draw() });
        this.body.forEach(s => { s.draw() });
        this.head.draw();
        screen.show()
    }

    check_collisions() {
        // collide with wall
        if (this.head.x == 0 || this.head.x == 15 || this.head.y == 0 || this.head.y == 15) {
            return true;
        }
        let collideSelf = this.body.filter(b => { return b.x == this.head.x && b.y == this.head.y })
        if (collideSelf && collideSelf.length > 0)
            return true;
        // collide with apple?
        let collideApples = this.apples.filter(a => { return a.x == this.head.x && a.y == this.head.y });
        if (collideApples && collideApples.length > 0) {
            let del_a = collideApples[0]
            this.apples.removeElement(del_a);
            this.make_longer_snake();
            if (this.delay > 80) {
                this.delay -= 10;
            }
            this.create_random_apples();
        }
        return false;
    }

    move(d: number) {
        this.move_body_where_head_was()
        let x_delta = this.direction == 1 ? 1 : this.direction == 3 ? -1 : 0;
        let y_delta = this.direction == 0 ? -1 : this.direction == 2 ?  1 : 0;
        this.head.setPosition(this.head_prior.x + x_delta, this.head_prior.y + y_delta)
    }

    create_head () {
        this.head = new Sprite(8,8)
        this.head.setColor(neopixel.colors(NeoPixelColors.Green))
    }

    make_body_sprite (x: number, y: number) {
        let body_sprite = new Sprite(x, y);
        body_sprite.setColor(neopixel.colors(NeoPixelColors.Yellow));
        this.body.push(body_sprite)
    }

    create_body () {
        this.body = [];
        for (let index = 0; index <= 1; index++) {
            this.make_body_sprite(this.head.x, this.head.y + (index + 1))
        }
    }

    make_longer_snake () {
        let last = this.body[this.body.length - 1]
        let next2last = this.body[this.body.length - 2]
        let dx = next2last.x - last.x
        let dy = next2last.y - last.y
        this.make_body_sprite(last.x + dx, last.y + dy)
    }

    move_body_where_head_was () {
        this.head_prior = this.head
        this.body.insertAt(0, this.body.pop())
        this.body[0].setPosition(this.head.x, this.head.y)
    }

    create_random_apples () {
        for (let index = 0; index < randint(1, 2); index++) {
            if (this.apples.length < 3) {
                let apple_sprite = new Sprite(randint(1,14), randint(1,14));
                apple_sprite.setColor(NeoPixelColors.Red);
                this.apples.push(apple_sprite);
            }
        }
    }
}

let snakeGame = new SnakeGame();