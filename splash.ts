// Add your code here

let snake = `
    f f f f c c c c c c f f f f f f
    f f f c 6 7 7 7 7 6 c f f f f f
    f f c 7 7 7 7 7 7 7 7 c f f f f
    f c 6 7 7 7 7 7 7 7 7 6 c f f f
    f c 7 c 6 6 6 6 c 7 7 7 c f f f
    f f 7 6 f 6 6 f 6 7 7 7 f f f f
    f f 7 7 7 7 7 7 7 7 7 7 f f f f
    f f f 7 7 7 7 6 c 7 7 6 f c f f
    f f f f c c c c 7 7 6 f 7 7 c f
    f f c 7 2 7 7 7 6 c f 7 7 7 7 c
    f c 7 7 2 7 7 c f c 6 7 7 6 c c
    c 1 1 1 1 7 6 f c c 6 6 6 c f f
    f 1 1 1 1 1 6 6 c 6 6 6 6 f f f
    f 6 1 1 1 1 1 6 6 6 6 6 c f f f
    f f 6 1 1 1 1 1 1 6 6 6 f f f f
    f f c c c c c c c c c f f f f f
`
const blocks = `
    f f f f f f f f f f f f f f f f
    f f f f f 5 5 f f f f f f f f f
    f f f f f 5 5 f f f f f f f f f
    f 9 9 f f 5 5 5 5 5 5 f f f f f
    f 9 9 f f 5 5 5 5 5 5 f f f f f
    f 9 9 f f f f f f f f f f f f f
    f 9 9 f f f f f f f f f f f f f
    f 9 9 f f c c f f 7 7 7 7 f f f
    f 9 9 f f c c f f 7 7 7 7 f f f
    f 9 9 f f f f f f f f 7 7 7 7 f
    f 9 9 f f f f f f f f 7 7 7 7 f
    f f f f f 3 3 f f f f f f f f f
    f f f f f 3 3 f f f f f f f f f
    f f f 3 3 3 3 3 3 f f f f f f f
    f f f 3 3 3 3 3 3 f f f f f f f
    f f f f f f f f f f f f f f f f
`

function drawImage(img: string) {
    let c = 0, r= 0;
    for(let i=0; i<img.length; i++) {
        let dot = img[i] == "."
        let hex = "01234567890abcdef".includes(img[i])
        if (dot || hex) {
            if (hex) {
                let colIndex = img.charCodeAt(i) - "0".charCodeAt(0);
                screen.setPixel(c, r, toRGB(colIndex));
            }
            c++; if (c==16) { c = 0; r++}
        }
    }
    screen.show();
}