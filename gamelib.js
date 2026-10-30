/**
 * 🎮 GAMELIB - 2D Game Library
 * A simple library for creating 2D games with JavaScript
 * Perfect for middle school students!
 */

class GameCanvas {
    constructor(width = 800, height = 600, backgroundSource = '#87CEEB') {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
        
        this.entities = [];
        this.keys = {};
        this.mouse = { x: 0, y: 0, pressed: false };
        this.paused = false;
        this.score = 0;
        this.draggingEntity = null; // Per drag and drop
        
        // Sfondo
        this.canvas.style.border = '2px solid #333';
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '20px auto';

        this.backgroundSource = backgroundSource;
        this.backgroundImage = null;
        this.backgroundColor = backgroundSource.startsWith('#') ? backgroundSource : '#87CEEB';
        if (!backgroundSource.startsWith('#')) {
            this.backgroundImage = new Image();
            this.backgroundImage.src = backgroundSource;
        }
        
        // Input handling
        this._setupInput();
        
        // Start game loop
        this._startLoop();
    }
    
    _setupInput() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Mouse Move (Gestione Hover)
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;

            // Logica Hover per i pulsanti
            this.entities.forEach(entity => {
                if (entity instanceof Button) {
                    entity.isHovered = this._mouseIsOver(entity);
                }
            });
        });

        // Mouse Down (Gestione Drag and Drop)
        this.canvas.addEventListener('mousedown', () => {
            this.mouse.pressed = true;
            // Cerca l'entità che può essere trascinata (dal primo piano all'ultimo)
            for (let i = this.entities.length - 1; i >= 0; i--) {
                const entity = this.entities[i];
                if (entity.draggable && this._mouseIsOver(entity)) {
                    this.draggingEntity = entity;
                    break;
                }
            }
        });
        
        // Mouse Up (Rilascio Drag and Drop e Click)
        this.canvas.addEventListener('mouseup', () => {
            this.mouse.pressed = false;

            // Gestione Click Button (dal primo piano all'ultimo)
            for (let i = this.entities.length - 1; i >= 0; i--) {
                const entity = this.entities[i];
                if (entity instanceof Button && this._mouseIsOver(entity)) {
                    entity.onClick();
                    this.draggingEntity = null; // Assicura che il drag si fermi se si clicca un pulsante
                    return; // Ferma il ciclo dopo aver cliccato un pulsante
                }
            }

            this.draggingEntity = null; // Rilascia l'entità trascinata
        });
    }

    _mouseIsOver(entity) {
        return this.mouse.x >= entity.x &&
               this.mouse.x <= entity.x + entity.width &&
               this.mouse.y >= entity.y &&
               this.mouse.y <= entity.y + entity.height;
    }

    _startLoop() {
        const loop = () => {
            this._draw();
            if (!this.paused) {
                this._update();
            }
            // Pulizia delle entità distrutte
            this.entities = this.entities.filter(e => e.active);

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    _update() {
        if (this.draggingEntity) {
            this.draggingEntity.x = this.mouse.x - this.draggingEntity.width / 2;
            this.draggingEntity.y = this.mouse.y - this.draggingEntity.height / 2;
        }
        
        this.entities.forEach(entity => entity.update());
    }

    _draw() {
        // Sfondo
        if (this.backgroundImage && this.backgroundImage.complete) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = this.backgroundColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Entità
        this.entities.forEach(entity => entity.draw(this.ctx));

        // Punteggio (se > 0)
        if (this.score || this.score === 0) {
            this.ctx.fillStyle = 'black';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        }
    }

    add(entity) {
        entity.game = this; // Assegna il riferimento al gioco
        this.entities.push(entity);
    }

    remove(entity) {
        entity.active = false;
    }

    keyPressed(key) {
        return this.keys[key];
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }
    getWidth(){
        return this.canvas.width;
    }
    getHeight(){
        return this.canvas.height;
    }
    H(){
        return this.canvas.height;
    }
    W(){
        return this.canvas.width;
    }
}

// ===================================
// ENTITY BASE CLASS
// ===================================

class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = 'gray';
        this.active = true;
        this.game = null;
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 0;
        this.draggable = false;
        
        // NUOVE PROPRIETÀ
        this.rotation = 0; // Angolo di rotazione in radianti
        this.scale = 1;    // Fattore di scala
    }

    update() {
        this.velocityY += this.gravity;
        this.x += this.velocityX;
        this.y += this.velocityY;
    }

    draw(ctx) {
        if (!this.active) return; 

        ctx.save();
        
        // Applica TRASFORMAZIONE
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        ctx.translate(centerX, centerY);

        if (this.rotation !== 0) {
            ctx.rotate(this.rotation);
        }
        
        if (this.scale !== 1) {
            ctx.scale(this.scale, this.scale);
        }

        ctx.translate(-centerX, -centerY);

        // DISEGNO
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.restore();
    }

    collidesWith(otherEntity) {
        if (!this.active || !otherEntity.active) return false;

        return this.x < otherEntity.x + otherEntity.width &&
               this.x + this.width > otherEntity.x &&
               this.y < otherEntity.y + otherEntity.height &&
               this.y + this.height > otherEntity.y;
    }

    moveTowards(x, y, speed) {
        const dx = x - (this.x + this.width / 2);
        const dy = y - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.velocityX = (dx / distance) * speed;
            this.velocityY = (dy / distance) * speed;
        } else {
            this.velocityX = 0;
            this.velocityY = 0;
        }
    }
    
    // Metodo helper per rotazione in gradi
    rotateTo(degrees) {
        this.rotation = Utils.radians(degrees); 
    }
    /**
     * Imposta la rotazione dell'entità per puntare in una specifica direzione in gradi.
     * @param {number} degrees - L'angolo in gradi (0 = Destra, 90 = Giù, ecc.)
     */
    setDirection(degrees) {
        this.rotation = Utils.radians(degrees); 
    }

    enableDragging() {
        this.draggable = true;
    }

    destroy() {
        this.active = false;
    }
}

// ===================================
// VARIANTE CON UPDATE POTENZIATO
// ===================================

class _Entity extends Entity {
    update() {
        super.update(); 
        if (typeof this._update === 'function') {
            this._update();
        }
    }
}


// ===================================
// SPRITE CLASS
// ===================================

class Sprite extends Entity {
    constructor(x, y, width, height, imageUrl) {
        super(x, y, width, height);
        this.image = new Image();
        this.image.src = imageUrl;
    }

    draw(ctx) {
        if (!this.active || !this.image.complete) return;
        
        ctx.save(); 
        
        // Applica TRASFORMAZIONE (Rotazione e Scala)
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        ctx.translate(centerX, centerY);

        if (this.rotation !== 0) {
            ctx.rotate(this.rotation);
        }
        
        if (this.scale !== 1) {
            ctx.scale(this.scale, this.scale);
        }

        // Sposta indietro e disegna l'immagine
        ctx.translate(-centerX, -centerY);
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        
        ctx.restore();
    }
}

// ===================================
// VARIANTE SPRITE CON UPDATE POTENZIATO
// ===================================

class _Sprite extends Sprite {
    update() {
        super.update(); 
        if (typeof this._update === 'function') {
            this._update();
        }
    }
}

// ===================================
// CIRCLE CLASS
// ===================================

class Circle extends Entity {
    constructor(x, y, radius) {
        super(x, y, radius * 2, radius * 2);
        this.radius = radius;
    }

    // Nota: I cerchi usano la logica draw() standard di Entity, ma potremmo migliorarla per un disegno più pulito.
    draw(ctx) {
        if (!this.active) return;
        
        ctx.save(); 
        
        // Applica TRASFORMAZIONE
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        ctx.translate(centerX, centerY);

        if (this.rotation !== 0) {
            ctx.rotate(this.rotation);
        }
        
        if (this.scale !== 1) {
            ctx.scale(this.scale, this.scale);
        }

        // DISEGNO del cerchio (al centro dell'entità)
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.restore();
    }

    collidesWith(otherEntity) {
        // La logica di collisione per il cerchio è più complessa e non usa solo AABB, ma per semplicità usiamo AABB qui, 
        // anche se idealmente dovrebbe essere cerchio-cerchio o cerchio-rettangolo.
        return super.collidesWith(otherEntity);
    }
}


// ===================================
// TEXT CLASS
// ===================================

class Text extends Entity {
    constructor(x, y, text, size = 20) {
        super(x, y, 0, 0); // La dimensione è dinamica
        this.text = text;
        this.size = size;
        this.color = 'black';
        this.textAlign = 'center';
    }

    draw(ctx) {
        if (!this.active) return;
        
        // La trasformazione non è solitamente necessaria per il testo, 
        // ma è buona pratica includerla se si vuole scalare o ruotare.
        ctx.save(); 

        const centerX = this.x; // Usiamo x come punto centrale/anchor
        const centerY = this.y; 
        
        ctx.translate(centerX, centerY);

        if (this.rotation !== 0) {
            ctx.rotate(this.rotation);
        }
        
        if (this.scale !== 1) {
            ctx.scale(this.scale, this.scale);
        }
        
        ctx.translate(-centerX, -centerY);
        
        // DISEGNO
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = this.textAlign;
        ctx.fillText(this.text, this.x, this.y);

        ctx.restore();
    }
}


// ===================================
// EMOJI SPRITE CLASS
// ===================================

class eSprite extends Entity {
    constructor(x, y, emoji, size = 32) {
        super(x, y, size, size); // La dimensione dell'emoji definisce la Bounding Box
        this.emoji = emoji;
        this.size = size;
    }

    draw(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Applica TRASFORMAZIONE
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        ctx.translate(centerX, centerY);

        if (this.rotation !== 0) {
            ctx.rotate(this.rotation);
        }
        
        if (this.scale !== 1) {
            ctx.scale(this.scale, this.scale);
        }

        // DISEGNO
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Disegna l'emoji al centro (0, 0 nel contesto ruotato)
        ctx.fillText(this.emoji, 0, 0);

        ctx.restore();
    }
}

// ===================================
// VARIANTE ESPRITE CON UPDATE POTENZIATO
// ===================================

class _eSprite extends eSprite {
    update() {
        super.update(); 
        if (typeof this._update === 'function') {
            this._update();
        }
    }
}

// ===================================
// BUTTON CLASS
// ===================================

class Button extends Entity {
    constructor(x, y, width, height, text = 'Button') {
        super(x, y, width, height);
        this.text = text;
        this.color = '#3f51b5'; 
        this.hoverColor = '#5c6bc0';
        this.textColor = 'white';
        this.textSize = 16;
        this.isHovered = false;
        this.onClick = () => {}; 
    }
    
    /**
     * Imposta i colori di base e di hover del pulsante.
     */
    setColors(baseColor, hoverColor) {
        this.color = baseColor;
        this.hoverColor = hoverColor;
    }

    /**
     * Imposta il testo visualizzato sul pulsante.
     */
    setText(text, textColor, textSize = 16) {
        this.text = text;
        this.textColor = textColor;
        this.textSize = textSize;
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        
        // Applica TRASFORMAZIONE
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        ctx.translate(centerX, centerY);

        if (this.rotation !== 0) {
            ctx.rotate(this.rotation);
        }
        
        if (this.scale !== 1) {
            ctx.scale(this.scale, this.scale);
        }

        ctx.translate(-centerX, -centerY);

        // 1. Disegna il corpo del pulsante
        const currentColor = this.isHovered ? this.hoverColor : this.color;
        ctx.fillStyle = currentColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 2. Disegna il testo
        ctx.fillStyle = this.textColor;
        ctx.font = `bold ${this.textSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Posiziona il testo al centro del pulsante
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);

        ctx.restore();
    }
}


// ===================================
// GROUP CLASS
// ===================================

class Group {
    constructor() {
        this.members = [];
    }

    add(entity) {
        if (entity.game) {
            this.members.push(entity);
        } else {
            console.error("Entity must be added to GameCanvas before adding to a Group.");
        }
    }

    remove(entity) {
        this.members = this.members.filter(m => m !== entity);
    }
    
    forEach(callback) {
        this.members.forEach(callback);
    }
    
    checkCollisions(otherEntity) {
        for (let member of this.members) {
            if (member.active && member.collidesWith(otherEntity)) {
                return member;
            }
        }
        return null;
    }
    
    checkGroupCollisions(otherGroup) {
        const collisions = [];
        for (let member1 of this.members) {
            for (let member2 of otherGroup.members) {
                if (member1.active && member2.active && member1.collidesWith(member2)) {
                    collisions.push({ entity1: member1, entity2: member2 });
                }
            }
        }
        return collisions;
    }
    
    clear() {
        this.members.forEach(m => m.destroy());
        this.members = [];
    }
}


// ===================================
// SOUND CLASS (Assumiamo l'esistenza)
// ===================================

class Sound {
    constructor(src, loop = false) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        this.sound.loop = loop;
        document.body.appendChild(this.sound);
    }

    play() {
        this.sound.currentTime = 0;
        this.sound.play();
    }

    stop() {
        this.sound.pause();
        this.sound.currentTime = 0;
    }
}


// ===================================
// UTILITIES
// ===================================

const Utils = {
    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    angle(x1, y1, x2, y2) {
        // Calcola l'angolo in radianti
        return Math.atan2(y2 - y1, x2 - x1);
    },
    
    degrees(radians) {
        return radians * (180 / Math.PI);
    },
    
    radians(degrees) {
        return degrees * (Math.PI / 180);
    }
};