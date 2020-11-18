// TODO:
//
// - splash screen to select among 2-3 games
// - persist high scores
// - text ???

// snake game based on https://forum.makecode.com/t/snake-and-apples/3027

class Sprite {
    public color: number;
    constructor(public x: number, public y: number) { all_sprites.push(this); }
    setPosition(a: number, b: number) { this.x = a; this.y = b; }
    setColor(c: number) { this.color = c;}
    draw(strip: neopixel.Strip) {
        strip.setMatrixColor(this.x, this.y, this.color)
    }
}

let strip = neopixel.create(DigitalPin.P0, 256, NeoPixelMode.RGB)
strip.setBrightness(50)
strip.setMatrixWidth(16)
pins.digitalWritePin(DigitalPin.P1, 1)

let all_sprites: Sprite[] = [];
let apples: Sprite[] = []
let snake_head: Sprite = null
let head_prior: Sprite = null
let snake_body: Sprite[] = []
let direction = 0
let game_over = false;
let dir_change = false;
let delay = 300;

create_snake_head()
create_snake_body()
create_random_apples()

input.onButtonPressed(Button.B, function () {
    if (!dir_change)
         direction = direction == 0 ? 3 : direction -1;
    dir_change = true;
})

input.onButtonPressed(Button.A, function () {
    if (!dir_change)
       direction = direction == 3 ? 0 : direction +1;
    dir_change = true;
})

let red = neopixel.colors(NeoPixelColors.Orange)
let blue = neopixel.colors(NeoPixelColors.Blue)
function create_display() {
    for(let p=0; p<256; p++) { strip.setPixelColor(p, blue+p ); }
    for(let c=0;c<16;c++) {
        strip.setMatrixColor(0, c, red);
        strip.setMatrixColor(c, 0, red);
        strip.setMatrixColor(15, c, red);
        strip.setMatrixColor(c, 15, red);
    }
    all_sprites.forEach(s => { s.draw(strip) });
    strip.show()
}

function check_collisions() {
    // collide with wall
    if (snake_head.x == 0 || snake_head.x == 15 || snake_head.y == 0 || snake_head.y == 15) {
        return true;
    }
    let collideSelf = snake_body.filter(b => { return b.x == snake_head.x && b.y == snake_head.y })
    if (collideSelf && collideSelf.length > 0)
        return true;
    // collide with apple?
    let collideApples = apples.filter(a => { return a.x == snake_head.x && a.y == snake_head.y });
    if (collideApples && collideApples.length > 0) {
        let del_a = collideApples[0]
        apples.removeElement(del_a);
        all_sprites.removeElement(del_a);
        make_longer_snake();
        if (delay > 50) {
            delay -= 10;
        }
        create_random_apples();
    }
    return false;
}

forever(function () {
    if (game_over) {
        strip.showColor(neopixel.colors(NeoPixelColors.Red));
        strip.show();
        return;
    }
    if (check_collisions()) {
        game_over = true;
        return;
    }
    move(direction);
    create_display();
    dir_change = false;
    pause(delay);
});

function move(d: number) {
    move_body_where_head_was()
    if (direction == 0) {
        snake_head.setPosition(head_prior.x, head_prior.y - 1)
    } else if (direction == 1) {
        snake_head.setPosition(head_prior.x + 1, head_prior.y)
    } else if (direction == 2) {
        snake_head.setPosition(head_prior.x, head_prior.y + 1)
    } else {
        snake_head.setPosition(head_prior.x - 1, head_prior.y)
    }    
}

function create_snake_head () {
    snake_head = new Sprite(8,8)
    snake_head.setColor(neopixel.colors(NeoPixelColors.Green))
}

function make_body_sprite (x: number, y: number) {
    let body_sprite = new Sprite(x, y);
    body_sprite.setColor(neopixel.colors(NeoPixelColors.Yellow));
    snake_body.push(body_sprite)
}

function create_snake_body () {
    snake_body = [];
    for (let index = 0; index <= 1; index++) {
        make_body_sprite(snake_head.x, snake_head.y + (index + 1))
    }
}

function make_longer_snake () {
    let last = snake_body[snake_body.length - 1]
    let next2last = snake_body[snake_body.length - 2]
    let dx = next2last.x - last.x
    let dy = next2last.y - last.y
    make_body_sprite(last.x + dx, last.y + dy)
}

function move_body_where_head_was () {
    head_prior = snake_head
    snake_body.insertAt(0, snake_body.pop())
    snake_body[0].setPosition(snake_head.x, snake_head.y)
}

function create_random_apples () {
    for (let index = 0; index < randint(1, 2); index++) {
        if (apples.length < 3) {
            let apple_sprite = new Sprite(randint(1,14), randint(1,14));
            apple_sprite.setColor(NeoPixelColors.Red);
            apples.push(apple_sprite);
        }
    }
}
