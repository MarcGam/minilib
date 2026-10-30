# 🎮 GameLib

**Una semplice libreria JavaScript per giochi 2D, pensata per principianti e studenti delle scuole medie.**

🇬🇧 [Read in English](README.md)

GameLib racchiude l'elemento HTML5 `<canvas>` in poche classi facili da usare: crei una tela di gioco, aggiungi forme, sprite, emoji, testi e pulsanti, e la libreria si occupa del ciclo di gioco, dell'input da tastiera e mouse, del movimento, delle collisioni e del drag and drop. Non servono strumenti di build né dipendenze.

## Caratteristiche

- Ciclo di gioco, pausa/ripresa e pulizia automatica delle entità distrutte
- Sfondi colorati o con immagine
- Rettangoli, cerchi, sprite con immagine, sprite emoji, testi e pulsanti
- Velocità, gravità, rotazione e scala per ogni entità
- Input da tastiera e mouse, con drag and drop integrato
- Rilevamento delle collisioni rettangolari e gruppi di entità
- Effetti sonori e musica
- Utilità pratiche (numeri casuali, distanze, angoli)

## Installazione

### Tramite CDN (jsDelivr)

Inserisci questo tag nella tua pagina html:

```html
<script src="https://cdn.jsdelivr.net/gh/TUO-UTENTE/TUO-REPO@1.0.0/gamelib.js"></script>
```

### File locale

Scarica `gamelib.js` e includilo nella tua pagina:

```html
<script src="gamelib.js"></script>
```

## Avvio rapido

```html
<!DOCTYPE html>
<html>
<body>
<script src="https://cdn.jsdelivr.net/gh/TUO-UTENTE/TUO-REPO@1.0.0/gamelib.js"></script>
<script>
  const game = new GameCanvas(800, 600, '#87CEEB');

  const player = new Circle(100, 100, 25);
  player.color = 'tomato';
  game.add(player);

  const label = new Text(400, 40, 'Usa le frecce direzionali!', 28);
  game.add(label);

  // Comportamento personalizzato: una funzione chiamata a ogni frame
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

### Entità personalizzate con `_update()`

Le classi `_Entity`, `_Sprite` e `_eSprite` chiamano a ogni frame un metodo opzionale `_update()`, dopo l'applicazione del movimento. Questo rende semplice scrivere i propri personaggi:

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

## Riferimento API

### `GameCanvas(width = 800, height = 600, background = '#87CEEB')`

Crea un canvas, lo aggiunge a `document.body` e avvia il ciclo di gioco. `background` può essere un colore che inizia con `#` oppure l'URL di un'immagine.

| Membro | Descrizione |
| --- | --- |
| `add(entity)` | Aggiunge un'entità al gioco |
| `remove(entity)` | Rimuove un'entità (la segna come inattiva) |
| `keyPressed(key)` | `true` se il tasto è premuto in questo momento (es. `'ArrowUp'`, `' '`, `'a'`) |
| `pause()` / `resume()` | Mette in pausa o riprende gli aggiornamenti (il disegno continua) |
| `getWidth()` / `W()` | Larghezza del canvas |
| `getHeight()` / `H()` | Altezza del canvas |
| `score` | Punteggio mostrato in alto a sinistra |
| `mouse` | `{ x, y, pressed }` — posizione del mouse e stato del pulsante |

### `Entity(x, y, width, height)`

Classe base di tutto ciò che vive nel gioco.

| Membro | Descrizione |
| --- | --- |
| `x`, `y`, `width`, `height` | Posizione e dimensioni |
| `color` | Colore di riempimento |
| `velocityX`, `velocityY` | Velocità, applicata a ogni frame |
| `gravity` | Viene sommata a `velocityY` a ogni frame |
| `rotation` | Rotazione in radianti |
| `scale` | Fattore di scala (1 = dimensione normale) |
| `collidesWith(other)` | `true` se i rettangoli di ingombro si sovrappongono |
| `moveTowards(x, y, speed)` | Imposta la velocità per muoversi verso un punto |
| `rotateTo(degrees)` / `setDirection(degrees)` | Imposta la rotazione in gradi |
| `enableDragging()` | Permette di trascinare l'entità con il mouse |
| `destroy()` | Rimuove l'entità dal gioco |

### Altre classi

| Classe | Costruttore | Note |
| --- | --- | --- |
| `Sprite` | `(x, y, width, height, imageUrl)` | Disegna un'immagine |
| `Circle` | `(x, y, radius)` | `x`, `y` è l'angolo in alto a sinistra del suo rettangolo di ingombro |
| `Text` | `(x, y, text, size = 20)` | `x`, `y` è il punto di ancoraggio; proprietà `text`, `size`, `color`, `textAlign` |
| `eSprite` | `(x, y, emoji, size = 32)` | Un'emoji usata come sprite |
| `Button` | `(x, y, width, height, text)` | Imposta `onClick`; usa `setColors(base, hover)` e `setText(text, color, size)` |
| `Group` | `()` | `add`, `remove`, `forEach`, `checkCollisions(entity)`, `checkGroupCollisions(group)`, `clear()` |
| `Sound` | `(src, loop = false)` | `play()` e `stop()` |

> **Nota:** un'entità deve essere aggiunta al gioco (`game.add(...)`) *prima* di poter essere aggiunta a un `Group`.

### `Utils`

| Funzione | Descrizione |
| --- | --- |
| `Utils.randomNumber(min, max)` | Numero intero casuale tra `min` e `max` (inclusi) |
| `Utils.randomChoice(array)` | Elemento casuale di un array |
| `Utils.distance(x1, y1, x2, y2)` | Distanza tra due punti |
| `Utils.angle(x1, y1, x2, y2)` | Angolo in radianti tra due punti |
| `Utils.degrees(radians)` / `Utils.radians(degrees)` | Conversione degli angoli |

## Esempio: pulsanti, collisioni e gruppi

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

## Compatibilità

Funziona in tutti i browser moderni che supportano il canvas HTML5 (Chrome, Firefox, Safari, Edge).

## Licenza

Rilasciata sotto [Licenza MIT](LICENSE).
