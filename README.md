# minilib
Simple javascript  for 2D game 
# 🎮 GameLib

**A simple 2D game library for JavaScript, designed for beginners and middle school students.**

🇮🇹 [Leggi in italiano](README.it.md)

GameLib wraps the HTML5 `<canvas>` in a few easy-to-use classes: you create a game canvas, add shapes, sprites, emojis, text and buttons, and the library takes care of the game loop, keyboard and mouse input, movement, collisions and drag and drop. No build tools and no dependencies required.

## Features

- Game loop, pause/resume and automatic cleanup of destroyed entities
- Coloured or image backgrounds
- Rectangles, circles, image sprites, emoji sprites, text and buttons
- Velocity, gravity, rotation and scaling on every entity
- Keyboard and mouse input, with built-in drag and drop
- Rectangle collision detection and entity groups
- Sound effects and music
- Handy utilities (random numbers, distance, angles)

## Installation

### Via CDN (jsDelivr)

Once the repository is published on GitHub and a release/tag has been created:

```html
<script src="https://cdn.jsdelivr.net/gh/MarcGam/minilib/gamelib.js"></script>
```

### Local file

Download `gamelib.js` and include it in your page:

```html
<script src="gamelib.js"></script>
```

## Quick start

```html
<!DOCTYPE html>
<html>
<body>
<script src="https://cdn.jsdelivr.net/gh/MarcGam/minilib/gamelib.js"></script>
<script>
  const game = new GameCanvas(800, 600, '#87CEEB');

  const player = new Circle(100, 100, 25);
  player.color = 'tomato';
  game.add(player);

  const label = new Text(400, 40, 'Use the arrow keys!', 28);
  game.add(label);

  // Custom behaviour: a function called every frame
  const originalUpdate = player.update.bind(player);
  player.update = function () {
    this.velocityX = 0;
    this.velocityY = 0;
    if (game.keyPressed('ArrowRight')) this.velocityX = 4;
    if (game.keyPressed('ArrowLeft'))  this.velocityX = -4;
    if (game.keyPressed('ArrowUp'))    this.velocityY = -4;
    if (game.keyPressed('ArrowDown'))  this.velocityY = 4;
    originalUpdate();
  };
</script>
</body>
</html>
```

### Custom entities with `_update()`

The classes `_Entity`, `_Sprite` and `_eSprite` call an optional `_update()` method on every frame, after movement has been applied. This makes it easy to write your own characters:

```js
class Player extends _eSprite {
  constructor(x, y) {
    super(x, y, '🚀', 40);
  }

  _update() {
    if (this.game.keyPressed('ArrowLeft'))  this.x -= 5;
    if (this.game.keyPressed('ArrowRight')) this.x += 5;
  }
}

const game = new GameCanvas(800, 600);
game.add(new Player(380, 500));
```

## API reference

### `GameCanvas(width = 800, height = 600, background = '#87CEEB')`

Creates a canvas, appends it to `document.body` and starts the game loop. `background` can be a colour starting with `#` or the URL of an image.

| Member | Description |
| --- | --- |
| `add(entity)` | Adds an entity to the game |
| `remove(entity)` | Removes an entity (marks it as inactive) |
| `keyPressed(key)` | `true` if the key is currently held down (e.g. `'ArrowUp'`, `' '`, `'a'`) |
| `pause()` / `resume()` | Pauses or resumes updates (drawing continues) |
| `getWidth()` / `W()` | Canvas width |
| `getHeight()` / `H()` | Canvas height |
| `score` | Score shown in the top-left corner |
| `mouse` | `{ x, y, pressed }` — mouse position and button state |

### `Entity(x, y, width, height)`

Base class of everything that lives in the game.

| Member | Description |
| --- | --- |
| `x`, `y`, `width`, `height` | Position and size |
| `color` | Fill colour |
| `velocityX`, `velocityY` | Speed, applied every frame |
| `gravity` | Added to `velocityY` every frame |
| `rotation` | Rotation in radians |
| `scale` | Scale factor (1 = normal size) |
| `collidesWith(other)` | `true` if the bounding boxes overlap |
| `moveTowards(x, y, speed)` | Sets velocity to move towards a point |
| `rotateTo(degrees)` / `setDirection(degrees)` | Sets the rotation in degrees |
| `enableDragging()` | Lets the player drag the entity with the mouse |
| `destroy()` | Removes the entity from the game |

### Other classes

| Class | Constructor | Notes |
| --- | --- | --- |
| `Sprite` | `(x, y, width, height, imageUrl)` | Draws an image |
| `Circle` | `(x, y, radius)` | `x`, `y` is the top-left corner of its bounding box |
| `Text` | `(x, y, text, size = 20)` | `x`, `y` is the anchor point; properties `text`, `size`, `color`, `textAlign` |
| `eSprite` | `(x, y, emoji, size = 32)` | An emoji used as a sprite |
| `Button` | `(x, y, width, height, text)` | Set `onClick`; use `setColors(base, hover)` and `setText(text, color, size)` |
| `Group` | `()` | `add`, `remove`, `forEach`, `checkCollisions(entity)`, `checkGroupCollisions(group)`, `clear()` |
| `Sound` | `(src, loop = false)` | `play()` and `stop()` |

> **Note:** an entity must be added to the game (`game.add(...)`) *before* it can be added to a `Group`.

### `Utils`

| Function | Description |
| --- | --- |
| `Utils.randomNumber(min, max)` | Random integer between `min` and `max` (inclusive) |
| `Utils.randomChoice(array)` | Random element of an array |
| `Utils.distance(x1, y1, x2, y2)` | Distance between two points |
| `Utils.angle(x1, y1, x2, y2)` | Angle in radians between two points |
| `Utils.degrees(radians)` / `Utils.radians(degrees)` | Angle conversion |

## Example: buttons, collisions and groups

```js
const game = new GameCanvas(800, 600);

const coins = new Group();
for (let i = 0; i < 5; i++) {
  const coin = new eSprite(Utils.randomNumber(50, 750), Utils.randomNumber(50, 550), '🪙', 32);
  game.add(coin);
  coins.add(coin);
}

const hero = new Circle(400, 300, 20);
hero.color = 'purple';
hero.enableDragging();
game.add(hero);

const reset = new Button(10, 550, 120, 40, 'Reset');
reset.onClick = () => { game.score = 0; };
game.add(reset);

hero.update = function () {
  const hit = coins.checkCollisions(this);
  if (hit) {
    hit.destroy();
    game.score += 10;
  }
};
```

## Browser support

Works in all modern browsers that support the HTML5 canvas (Chrome, Firefox, Safari, Edge).

## License

Released under the [MIT License](LICENSE).
