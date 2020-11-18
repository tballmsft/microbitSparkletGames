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

// scene.setBackgroundColor(12)
create_snake_head()
create_snake_body()
create_random_apples()

input.onButtonPressed(Button.A, function () {
    direction = direction == 0 ? 3 : direction -1;
    //basic.showIcon(IconNames.Heart)
    //strip.showRainbow();
    //strip.show();
})

input.onButtonPressed(Button.B, function () {
    direction = direction == 3 ? 0 : direction +1;
    //basic.showIcon(IconNames.Duck)
    //strip.clear();
    //strip.show();
})

function create_display() {
    // 16x16 array of Neopixel
    // background fill
    strip.showColor(neopixel.colors(NeoPixelColors.Blue));
    all_sprites.forEach(s => {
        strip.setMatrixColor(s.x, s.y, s.color)
    })
    strip.show()
}

function check_collisions() {
    let del_a: Sprite = null;
    apples.forEach(a => {
        if (a.x == snake_head.x && a.y == snake_head.y) {
            del_a = a;
        }      
    })
    if (del_a) {
        apples.removeElement(del_a);
        all_sprites.removeElement(del_a);
        make_longer_snake();
        create_random_apples();
    }
    return false;
}

forever(function () {
    if (game_over) {

    }
    if (check_collisions()) {
        game_over = true;
        return;
    }
    if (direction == 0) {
        move_up()
    } else if (direction == 1) {
        move_right()
    } else if (direction == 2) {
        move_down()
    } else {
        move_left()
    }
    create_display();
    pause(300);
});

/*
sprites.onOverlap(SpriteKind.snake_head_sprite, SpriteKind.snake_body_sprite, function (sprite, otherSprite) {
    // game.over(false, effects.dissolve)
})
*/

function move_right () {
    move_body_where_head_was()
    snake_head.setPosition(head_x_prior + step, head_y_prior)
}

function move_down () {
    move_body_where_head_was()
    snake_head.setPosition(head_x_prior, head_y_prior + step)
}

function move_left () {
    move_body_where_head_was()
    snake_head.setPosition(head_x_prior - step, head_y_prior)
}

function move_up () {
    move_body_where_head_was()
    snake_head.setPosition(head_x_prior, head_y_prior - step)
}

function create_snake_head () {
    snake_head = new Sprite(6,6)
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
            let apple_sprite = new Sprite(randint(0,15), randint(0,15));
            apple_sprite.setColor(NeoPixelColors.Red);
            apples.push(apple_sprite);
        }
    }
}
