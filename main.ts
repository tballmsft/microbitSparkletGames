let all_sprites: Sprite[] = [];
let strip = neopixel.create(DigitalPin.P0, 256, NeoPixelMode.RGB)
strip.setBrightness(50)
strip.setMatrixWidth(16)
pins.digitalWritePin(DigitalPin.P1, 1)

class Sprite {
    public color: number;
    constructor(public x: number, public y: number) { all_sprites.push(this); }
    setPosition(a: number, b: number) { this.x = a; this.y = b; }
    setColor(c: number) { this.color = c;}
}

let apples: Sprite[] = []
let body_next_to_last_sprite: Sprite = null
let body_last_sprite: Sprite = null
let snake_body_list: Sprite[] = []
let snake_head: Sprite = null
let direction = 0
let head_y_prior = 0
let head_x_prior = 0
let step = 1
let game_over = false;
let dir_change = false;
let delay = 300;

// TODO: speed up the game over time

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
    for(let p=0; p<256; p++) { strip.setPixelColor(p, blue ); }
    for(let c=0;c<16;c++) {
        strip.setMatrixColor(0, c, red);
        strip.setMatrixColor(c, 0, red);
        strip.setMatrixColor(15, c, red);
        strip.setMatrixColor(c, 15, red);
    }
    all_sprites.forEach(s => {
        strip.setMatrixColor(s.x, s.y, s.color)
    })
    strip.show()
}

function check_collisions() {
    // collide with wall
    if (snake_head.x == 0 || snake_head.x == 15 || snake_head.y == 0 || snake_head.y == 15) {
        return true;
    }
    let collideSelf = snake_body_list.filter(b => { return b.x == snake_head.x && b.y == snake_head.y })
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
        snake_head.setPosition(head_x_prior, head_y_prior - step)
    } else if (direction == 1) {
        snake_head.setPosition(head_x_prior + step, head_y_prior)
    } else if (direction == 2) {
        snake_head.setPosition(head_x_prior, head_y_prior + step)
    } else {
        snake_head.setPosition(head_x_prior - step, head_y_prior)
    }    
}

function create_snake_head () {
    snake_head = new Sprite(8,8)
    snake_head.setColor(neopixel.colors(NeoPixelColors.Green))
}

function make_body_sprite (x: number, y: number) {
    let body_sprite = new Sprite(x, y);
    body_sprite.setColor(neopixel.colors(NeoPixelColors.Yellow));
    snake_body_list.push(body_sprite)
}

function create_snake_body () {
    snake_body_list = [];
    for (let index = 0; index <= 1; index++) {
        make_body_sprite(snake_head.x, snake_head.y + (index + step))
    }
}

function make_longer_snake () {
    body_last_sprite = snake_body_list[snake_body_list.length - 1]
    body_next_to_last_sprite = snake_body_list[snake_body_list.length - 2]
    let dx = body_next_to_last_sprite.x - body_last_sprite.x
    let dy = body_next_to_last_sprite.y - body_last_sprite.y
    let x = body_last_sprite.x + dx
    let y = body_last_sprite.y + dy
    make_body_sprite(x, y)
}

function move_body_where_head_was () {
    head_x_prior = snake_head.x
    head_y_prior = snake_head.y
    snake_body_list.insertAt(0, snake_body_list.pop())
    snake_body_list[0].setPosition(snake_head.x, snake_head.y)
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
