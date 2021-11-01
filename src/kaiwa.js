/**
 * Minimalist 2D game engine for KaiOS development
 * @author Victor Zegarra
 * @date 01/11/2021
 * @version 1.14
 */

var GAME_FPS = 25;

var DIR_NONE  = 0;
var DIR_LEFT  = 1;
var DIR_RIGHT = 2;
var DIR_UP    = 4;
var DIR_DOWN  = 8;

var requestAnimationFrame;

function random(max) {
    return Math.floor(Math.random() * max);
}

function loadAudio(filename, callback) {
    var audio = new Audio();
    audio.src = filename;
    audio.onload = callback;
    audio.load();
    return audio;
}

function loadImage(filename, callback) {
    var image = new Image();
    image.src = filename; 
    image.onload = callback;
    return image;
}

function createGame(canvas_id, game_wdt, game_hgt, smooth) {
    currstage = new KaiStage();   // Dummy Stage

    WINDOW_WDT = window.innerWidth;
    WINDOW_HGT = window.innerHeight;

//    alert("Stage size: " + WINDOW_WDT + "x" + WINDOW_HGT);
     
    GAME_WDT = WINDOW_WDT;
    GAME_HGT = WINDOW_HGT

    if(game_wdt) {
        GAME_WDT = game_wdt;
    }
    if(game_hgt) {
        GAME_HGT = game_hgt;
    }

    if(canvas_id) {
        canvas = document.getElementById(canvas_id);
    } else {
        canvas = document.createElement('canvas');
    }
    canvas.width  = WINDOW_WDT;
    canvas.height = WINDOW_HGT;
    canvas.style.background = "#000000";

    document.addEventListener("keydown", keyDownListener, false);
    document.addEventListener("keyup", keyUpListener, false);

    document.addEventListener("mousedown", mouseDownListener, false);
    // document.addEventListener("mousemove", mouseMoveListener, false);
    document.addEventListener("mouseup", mouseUpListener, false);
    document.addEventListener("touchstart", touchStartListener, {passive:false});
    // document.addEventListener("touchmove", touchMoveListener, false);
    document.addEventListener("touchend", touchEndListener, {passive:false});
    
    SCALE_WDT = canvas.width  / GAME_WDT;
    SCALE_HGT = canvas.height / GAME_HGT;
    
    ctx = canvas.getContext('2d');
    ctx.scale(SCALE_WDT,SCALE_HGT);

    if(smooth == false) {
        ctx.imageSmoothingEnabled    = false;
        ctx.msImageSmoothingEnabled  = false;    
    }
    
    if(!canvas_id) {
        div_canvas = document.createElement("div");
        div_canvas.style.position = "absolute";
        div_canvas.style.left = "0px";
        div_canvas.style.top  = "0px";
        document.body.appendChild(div_canvas);
        div_canvas.appendChild(canvas);
    }

    requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;

    fpsInterval = 1000 / GAME_FPS;
    lastTime = Date.now();

    return new KaiGame();
}

function main_loop() {
    let now = Date.now();
    let elapsed = now - lastTime;

    if (elapsed > fpsInterval) {
        lastTime = now - (elapsed % fpsInterval);

        currstage.update();
        currstage.render(ctx);
    }    
    window.requestAnimationFrame(main_loop);
}

function keyDownListener(event) {
    event.preventDefault();
    currstage.keyDown(event);
}

function keyUpListener(event) {
    event.preventDefault();
    currstage.keyUp(event);
}

function mouseDownListener(event) {
    var x = Math.floor(event.clientX / SCALE_WDT);
    var y = Math.floor(event.clientY / SCALE_HGT);
    currstage.touchDown(x,y);
}

function mouseUpListener(event) {
    var x = event.clientX / SCALE_WDT;
    var y = event.clientY / SCALE_HGT;
    currstage.touchUp(x,y);
}

function touchStartListener(event) {
    event.preventDefault();
    var touch = event.changedTouches[0];
    var x = Math.floor(touch.pageX / SCALE_WDT);
    var y = Math.floor(touch.pageY / SCALE_HGT);
    currstage.touchDown(x,y);
}

function touchEndListener(event) {
    event.preventDefault();
    var touch = event.changedTouches[0];
    var x = Math.floor(touch.pageX / SCALE_WDT);
    var y = Math.floor(touch.pageY / SCALE_HGT);
    currstage.touchUp(x,y);
}

// function mouseDownListener(event) {
//     var x = (event.clientX - canvasX) / SCALE_WDT;
//     var y = (event.clientY - canvasY) / SCALE_HGT;
//     currstage.ontouch(this, PRESSED, x, y);
// }
// 
// function mouseMoveListener(event) {
//     var x = (event.clientX - canvasX) / SCALE_WDT;
//     var y = (event.clientY - canvasY) / SCALE_HGT;
//     currstage.ontouch(this, MOVED, x, y);
// }
// 
// function mouseUpListener(event) {
//     var x = (event.clientX - canvasX) / SCALE_WDT;
//     var y = (event.clientY - canvasY) / SCALE_HGT;
//     currstage.ontouch(this, RELEASED, x, y);
// }
// 
// function touchStartListener(event) {
//     event.preventDefault();
//     var touch = event.changedTouches[0];
//     currstage.ontouch(this, PRESSED, touch.pageX, touch.pageY);
// }
// 
// function touchMoveListener(event) {
//     event.preventDefault();
//     var touch = event.changedTouches[0];
//     currstage.ontouch(this, MOVED, touch.pageX, touch.pageY);
// }
// 
// function touchEndListener(event) {
//     event.preventDefault();
//     var touch = event.changedTouches[0];
//     currstage.ontouch(this, RELEASED, touch.pageX, touch.pageY);
// }


/*
    KaiGame
*/

function KaiGame() {
    this.stages    = [];
    this.stageTags = [];
    this.nPreload  = 0;
}

KaiGame.prototype.preload = function(stage, callback) {
    var loadedCounter = stage.preloadImages.length;
    if(loadedCounter > 0) {
        stage.preloadImages.forEach((item) => {
            item.image = loadImage(item.file, () => {
                loadedCounter--;
                if(loadedCounter == 0) {
                    callback();
                }
            });
        });
    } else callback();
}

KaiGame.prototype.addStage = function(tag,stage) {
    if(stage instanceof KaiStage) {
        this.stageTags.push(tag);
        this.nPreload++;
        stage.tag = tag;
        stage.x = 0;
        stage.y = 0;
        stage.preload();
        this.preload(stage, () => {
            this.nPreload--;
            this.stages[tag] = stage;
        });
    }
}

KaiGame.prototype.startStage = function(tag,param) {
    if(this.nPreload > 0) {
        this.createStage(tag,param);
    } else {
        let stage = this.stages[tag];
        if(stage instanceof KaiStage) {
            currstage = stage;
            currstage.start(param);
            window.requestAnimationFrame(main_loop);
        }
    }
}

KaiGame.prototype.createStage = function(tag,param) {
    let id = setInterval(() => {
        if(this.nPreload <= 0) {
            clearInterval(id);
            for(let tag of this.stageTags) {
                let stage = this.stages[tag];
                stage.create();
                stage.$update = KaiStage.prototype.update; // $update = super.update
                stage.$render = KaiStage.prototype.render; // $render = super.render
            }
            this.startStage(tag,param);
        }
    },100);
}


/*
	KaiRect
*/

function KaiRect() {
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;    
}
    
KaiRect.prototype.inBounds = function(px, py) {
    return ( (px >= this.x) && (px < (this.x + this.width)) && (py >= this.y) && (py < (this.y + this.height)));
}
   
KaiRect.prototype.collidesWith = function(rect) {
    if( (this.x + this.width) <= rect.x ) return false;
    if( this.x >= (rect.x + rect.width) ) return false;
    if( (this.y + this.height) <= rect.y ) return false;
    return this.y < (rect.y + rect.height);
}


/*
	KaiDrawable
*/

function KaiDrawable() {
    this.parent = undefined;

    // last position x,y
    this.lx = 0;
    this.ly = 0;
    
    // content rectangle: x,y,width,height
    this.cx = 0;
    this.cy = 0;
    this.cwidth = 0;
    this.cheight = 0;
    
    // anchor x,y
    this.ax = 0;
    this.ay = 0;
    
    // relative x,y from parent
    this.px = 0;
    this.py = 0;
    
    // if drawable must be centered (x,y)
    this.centerX = 0;
    this.centerY = 0;
}

// KaiDrawable extends NickRect
KaiDrawable.prototype = Object.create(KaiRect.prototype);

// if visible then draw it
KaiDrawable.prototype.isVisible = true;

KaiDrawable.prototype.position = function(x, y) {
    this.lx = this.ax;
    this.x = this.ax = x;
    if(this.centerX) {
        this.x -=(this.width >> 1);
    }
    this.ly = this.ay;
    this.y = this.ay = y;
    if(this.centerY) {
        this.y -= (this.height >> 1);
    }
    this.cx = this.x;
    this.cy = this.y;

    if(this.parent) {
        this.px = this.ax - this.parent.x;
        this.py = this.ay - this.parent.y;
    }
}
    
KaiDrawable.prototype.move = function(x, y) {
    this.position(this.ax + x, this.ay + y);
}

KaiDrawable.prototype.render = function(context) {}

KaiDrawable.prototype.update = function() {}


/*
    KaiImage
*/

function KaiImage(image) {
    if(image instanceof Image) {
        this.setImage(image);
    }
}

KaiImage.prototype = Object.create(KaiDrawable.prototype);

KaiImage.prototype.setImage = function(image) {
    this.image = image;
    this.x  = 0;
    this.y  = 0;
    this.ax = 0;
    this.ay = 0;
    this.width   = this.image.width;
    this.height  = this.image.height;
    this.cwidth  = this.width;
    this.cheight = this.height;
}

KaiImage.prototype.render = function(context) {
    context.drawImage(this.image, this.x, this.y);        
}


/*
    KaiSprite
*/

KaiSprite = function(image, frameWidth, frameHeight) {
    this.x = 0;
    this.y = 0;
    // direction, horizontal speed, vertical speed
    this.dir = DIR_NONE;
    this.vx = 0;
    this.vy = 0;
    this.id = 0;

    this.image = image;
    this.bAnimated = false;

    this.frameCount;
    this.frameIndex;
    
    this.frameAnim = [];
    this.frameAnimIndex = 0;
    this.frameAnimCount = 0;
    this.frameAnimDelay = 0;
    this.frameAnimLoop  = false;

    this.width  = this.image.width;
    this.height = this.image.height;

    this.frameWidth  = frameWidth  || this.width;
    this.frameHeight = frameHeight || this.height;

    this.cols = Math.floor(this.width  / this.frameWidth);
    this.rows = Math.floor(this.height / this.frameHeight);

    this.frameCount = this.cols*this.rows;
    this.frames = new Array(this.frameCount);
    for(let idx=0; idx<this.frameCount; idx++) {
        this.frames[idx] = new Array(12);
    }
    let ndx = 0;
    for(var row=0, ofsy=0; row < this.rows; row++, ofsy+=this.frameHeight) {
        for(var col=0, ofsx=0; col < this.cols; col++, ofsx+=this.frameWidth) {
            this.frames[ndx][0] = ofsx;
            this.frames[ndx][1] = ofsy;
            this.frames[ndx][2] = this.frameWidth;
            this.frames[ndx][3] = this.frameHeight;
            this.frames[ndx][4] = 0;
            this.frames[ndx][5] = 0;
            this.frames[ndx][6] = this.frameWidth;
            this.frames[ndx][7] = this.frameHeight;
            // this.frames[idx][8] = 0;
            // this.frames[idx][9] = 0;
            // this.frames[idx][10] = this.frameWidth;
            // this.frames[idx][11] = this.frameHeight;
            ndx++;
        }
    }
        
    this.width   = frameWidth;
    this.height  = frameHeight;
    this.cwidth  = this.width;
    this.cheight = this.height;
    this.frameIndex = 0;
}

KaiSprite.prototype = Object.create(KaiDrawable.prototype);

KaiSprite.prototype.getFrameWidth = function(){
    return this.frames[this.frameIndex][2];
}

KaiSprite.prototype.getFrameHeight = function(){
    return this.frames[this.frameIndex][3];
}

KaiSprite.prototype.setAnimation = function(animation, delay, loop, tag) {
    this.frameAnimLoop  = loop;
    this.frameAnimTag   = tag;
    this.frameAnimIndex = 0;
    if(animation == null) {
        this.frameAnim = new Array(this.frameCount);
        for(var idx=0; idx < this.frameCount; idx++) {
            this.frameAnim[idx] = idx;
        }
    } else {
        this.frameAnim = animation;
    }
    this.frameIndex = this.frameAnim[this.frameAnimIndex];
    this.updateCollider();
    this.bAnimated = this.frameAnim.length > 1;
    this.frameAnimDelay = delay;
}
    
KaiSprite.prototype.setFrame = function(index, fromSeq) {
    // if(fromSeq && this.frameAnim != null) {
    if(this.frameAnim) {
        this.frameAnimIndex = index;
        this.frameIndex = this.frameAnim[this.frameAnimIndex];
    } else {
        this.frameIndex = index;
    }
    this.updateCollider();
}

KaiSprite.prototype.getFrame = function(fromAnim) {
    if(fromAnim && this.frameAnim != null) {
        return this.frameAnim[this.frameAnimIndex];
    } else return this.frameIndex;
}

KaiSprite.prototype.animate = function() {
    if(this.bAnimated) {
        if(this.frameAnimCount > this.frameAnimDelay) {
            this.frameAnimCount = 0;
            if(this.frameAnimIndex < (this.frameAnim.length - 1)) {
                this.frameAnimIndex++;
            } else if(this.frameAnimLoop) {
                this.frameAnimIndex = 0;
            } else {
                this.onEndAnimation(this.frameAnimTag);
            }
            this.frameIndex = this.frameAnim[this.frameAnimIndex];
            this.updateCollider();
        } else {
            this.frameAnimCount++;
        }
    }
}
    
KaiSprite.prototype.onEndAnimation = function(tag) {}

KaiSprite.prototype.render = function(context) {
    if(this.isVisible && this.frameIndex >= 0) {
        context.drawImage(this.image,this.frames[this.frameIndex][0],this.frames[this.frameIndex][1],
            this.frames[this.frameIndex][2],this.frames[this.frameIndex][3],this.x,this.y,
                this.frames[this.frameIndex][2],this.frames[this.frameIndex][3]);

        // /* for debugging */
        // context.strokeStyle="#00FF00";
        // context.strokeRect(this.cx,this.cy,this.cwidth,this.cheight);
        
        // if(typeof this.coll !== 'undefined') {
        //     context.strokeStyle="#00FFFF";
        //     context.strokeRect(this.coll.x,this.coll.y,this.coll.width,this.coll.height);
        // }
    }
}

KaiSprite.prototype.update = function() {}

KaiSprite.prototype.position = function(x,y) {
    let frameIndex = this.frameIndex < 0 ? 0 : this.frameIndex;
    this.lx = this.ax;
    this.x = this.ax = x;
    if(this.centerX) {
        this.x -= (this.frames[frameIndex][2] >> 1);
    }
    this.ly = this.ay;
    this.y = this.ay = y;
    if(this.centerY) {
        this.y -= (this.frames[frameIndex][3] >> 1);
    }
    this.updateCollider();

    if(this.parent) {
        this.px = this.ax - this.parent.x;
        this.py = this.ay - this.parent.y;
    }
}

KaiSprite.prototype.setCollider = function(x, y, width, height) {
    for(var idx=0; idx < this.frameCount; idx++) {
        this.frames[idx][4] = x;
        this.frames[idx][5] = y;
        this.frames[idx][6] = width;
        this.frames[idx][7] = height;
    }
    this.updateCollider();
}

// KaiSprite.prototype.setCollRect = function(x, y, width, height) {
//     for(var idx=0; idx < this.frameCount; idx++) {
//         this.frames[idx][8]  = x;
//         this.frames[idx][9]  = y;
//         this.frames[idx][10] = width;
//         this.frames[idx][11] = height;
//     }
//     if(typeof this.coll === 'undefined') {
//         this.coll = new KaiRect();
//     }
//     this.updateCollider();
// }

KaiSprite.prototype.setColliderIndex = function(idx, x, y, width, height) {
    this.frames[idx][4] = x;
    this.frames[idx][5] = y;
    this.frames[idx][6] = width;
    this.frames[idx][7] = height;
    this.updateCollider();
}

// KaiSprite.prototype.setCollRectIndex = function(idx, x, y, width, height) {
//     this.frames[idx][8]  = x;
//     this.frames[idx][9]  = y;
//     this.frames[idx][10] = width;
//     this.frames[idx][11] = height;
//     if(typeof this.coll === 'undefined') {
//         this.coll = new KaiRect();
//     }
//     this.updateCollider();
// }

KaiSprite.prototype.updateCollider = function() {
    let frameIndex = this.frameIndex < 0 ? 0 : this.frameIndex;
    this.cx = this.x + this.frames[frameIndex][4];
    this.cy = this.y + this.frames[frameIndex][5];
    this.cwidth  = this.frames[frameIndex][6];
    this.cheight = this.frames[frameIndex][7];
    // if(typeof this.coll !== 'undefined') {
    //     this.coll.x = this.x + this.frames[index][8];
    //     this.coll.y = this.y + this.frames[index][9];
    //     this.coll.width  = this.frames[index][10];
    //     this.coll.height = this.frames[index][11];
    // }
}

KaiSprite.prototype.inBounds = function(x,y) {
    return ( (x >= this.cx) && (x < (this.cx+this.cwidth)) && (y >= this.cy) && (y < (this.cy+this.cheight)));
}

KaiSprite.prototype.collidesWith = function(drawable) {
    if( (this.cx + this.cwidth) <= drawable.cx ) return false;
    if( this.cx >= (drawable.cx + drawable.cwidth) ) return false;
    if( (this.cy + this.cheight) <= drawable.cy ) return false;
    return this.cy < (drawable.cy + drawable.cheight);
}

KaiSprite.prototype.collidesRect = function(rect) {
    if( (this.cx + this.cwidth) <= rect.x ) return false;
    if( this.cx >= (rect.x + rect.width) ) return false;
    if( (this.cy + this.cheight) <= rect.y ) return false;
    return this.cy < (rect.y + rect.height);
}


/*
    KaiNumber
*/

KaiNumber = function(image, frameWidth, frameHeight) {
    this.value = '0';
    this.spacing = 0;

    this.x = 0;
    this.y = 0;

    this.image  = image;
    this.width  = this.image.width;
    this.height = this.image.height;

    this.cols = Math.floor(this.width  / frameWidth);
    this.rows = Math.floor(this.height / frameHeight);

    this.frameCount = this.cols*this.rows;
    this.frames = new Array(this.frameCount);
    for(let idx=0; idx<this.frameCount; idx++) {
        this.frames[idx] = new Array(8);
    }
    idx = 0;
    for(var row=0, ofsy=0; row < this.rows; row++, ofsy+=frameHeight) {
        for(var col=0, ofsx=0; col < this.cols; col++, ofsx+=frameWidth) {
            this.frames[idx][0] = ofsx;
            this.frames[idx][1] = ofsy;
            this.frames[idx][2] = frameWidth;
            this.frames[idx][3] = frameHeight;
            idx++;
        }
    }
        
    this.width  = frameWidth;
    this.height = frameHeight;
}

KaiNumber.prototype = Object.create(KaiDrawable.prototype);

KaiNumber.prototype.setValue = function(value) {
    let number = 0;
    if(Number.isInteger(value)) {
        number = Math.abs(value);
    }
    this.value = number.toString();
    let count  = this.value.length;
    this.width = 0;
    for(let idx=0; idx<count; idx++) {
        let frame = this.value.charCodeAt(idx) - 48;
        this.width += this.frames[frame][2] + this.spacing;  
    }
    this.position(this.ax,this.ay);
}

KaiNumber.prototype.position = function(x,y) {
    this.x = this.ax = x;
    if(this.centerX) {
        this.x -= (this.width >> 1);
    }
    this.y = this.ay = y;
    if(this.centerY) {
        this.y -= (this.height >> 1);
    }
    // if(this.parent) {
    //     this.px = this.ax - this.parent.x;
    //     this.py = this.ay - this.parent.y;
    // }
}


KaiNumber.prototype.render = function(context) {
    // if(this.isVisible) {
        let count = this.value.length;
        let ofsX  = this.x;
        for(let idx=0; idx<count; idx++) {
            let frame = this.value.charCodeAt(idx) - 48;
            context.drawImage(this.image,this.frames[frame][0],this.frames[frame][1],
                this.frames[frame][2],this.frames[frame][3],ofsX,this.y,
                this.frames[frame][2],this.frames[frame][3]);
            ofsX += this.frames[frame][2] + this.spacing;        
        }
    // }
}


/*
    KaiPath
*/

function KaiPath(sprite, path, id) {
    this.sprite = sprite;
    this.path = path;
    this.id = id || 0;
    this.rewind();
}
    
KaiPath.prototype.rewind = function() {
    this.idx = 0;
    this.delay = this.path[0][0];
    this.vx = this.path[0][1];
    this.vy = this.path[0][2];
}

KaiPath.prototype.nextStep = function() {
    if(--this.delay < 0) {
        if(++this.idx >= this.path.length) {
            if(this.onEndPath(this.id)) {
                this.rewind();
            }
        } else {
            this.delay = this.path[this.idx][0];
            this.vx = this.path[this.idx][1];
            this.vy = this.path[this.idx][2];
        }
    } else {
        this.sprite.move(this.vx, this.vy);
    }
}

KaiPath.prototype.onEndPath = function(id) {
    return true;
}


/*
    KaiText
*/

function KaiText(font) {
    this.font = font;
    this.text = '';
    this.x = 0;
    this.y = 0;
    this.style = 'black';
    this.align = 'left';
    this.baseline = 'top';
}

KaiText.prototype = Object.create(KaiDrawable.prototype);

KaiText.prototype.render = function(context) {
    context.font = this.font;
    context.fillStyle = this.style;
    context.textAlign = this.align;
    context.textBaseline = this.baseline;
    context.fillText(this.text, this.x,this.y);
}


/*
	KaiRunnable
*/

function KaiRunnable() {}

KaiRunnable.prototype.run = function(sender) {}


/*
    KaiLayer
*/

function KaiLayer() {
    this.x = 0;
    this.y = 0;
    this.width  = 0;//parent.width;
    this.height = 0;//parent.height;
}

KaiLayer.prototype = Object.create(KaiDrawable.prototype);

KaiLayer.prototype.nDrawables   = 0;
KaiLayer.prototype.nUpdateables = 0;

KaiLayer.prototype.drawables   = [];
KaiLayer.prototype.updateables = [];
    
KaiLayer.prototype.create = function() {}

KaiLayer.prototype.add = function(child) {
    if(child instanceof KaiDrawable) {
        child.parent = this;
        this.drawables.push(child);
        this.nDrawables++;

        if(typeof child.update === 'function') {
            this.updateables.push(child);
            this.nUpdateables++;
        }
    }
}
    
KaiLayer.prototype.remove = function(child) {
    if(child instanceof KaiDrawable) {
        this.drawables.forEach((item,index) => {
            if(item === child) {
                this.drawables.splice(index,1);
                this.nDrawables--;

                if(typeof(child.update) === 'function') {
                    this.updateables.forEach((item,index) => {
                        if(item === child) {
                            this.updateables.splice(index,1);
                            this.nUpdateables--;
                        }
                    });
                }
            }
        });
    }
}

KaiLayer.prototype.render = function(context) {
    for(var idx=0; idx < this.nDrawables; idx++) {
        let drawable = this.drawables[idx];
        if(drawable.isVisible) {
            drawable.render(context);
        }
    }
}

KaiLayer.prototype.update = function() {
    for(var idx=0; idx < this.nUpdateables; idx++) {
        let updateable = this.updateables[idx];
        if(updateable.isVisible) {
            updateable.update();
        }
    }
}

KaiLayer.prototype.position = function(x,y) {
    let lastX = this.x;
    let lastY = this.y;

    this.lx = this.ax;
    this.x = this.ax = x;
    if(this.centerX) {
        this.x -=(this.width >> 1);
    }
    this.ly = this.ay;
    this.y = this.ay = y;
    if(this.centerY) {
        this.y -= (this.height >> 1);
    }
    this.cx = this.x;
    this.cy = this.y;

    if(this.parent) {
        this.px = this.ax - this.parent.x;
        this.py = this.ay - this.parent.y;
    }

    let ofsX = this.x - lastX;
    let ofsY = this.y - lastY;

    for(var idx=0; idx < this.nDrawables; idx++) {
        let drawable = this.drawables[idx];
        drawable.move(ofsX, ofsY);
        drawable.px = drawable.ax - this.x;
        drawable.py = drawable.ay - this.y;
    }    
}


/*
    KaiStage
*/

function KaiStage() {
    this.state = 0;
    this.drawables     = [];
    this.updateables   = [];
    this.preloadImages = [];
}

KaiStage.prototype = Object.create(KaiLayer.prototype);

KaiStage.prototype.addImage = function(tagname, filename) {
    this.preloadImages.push( {tag:tagname, file:filename, image:null} );
}

KaiStage.prototype.getImage = function(tagname) {
    return (this.preloadImages.find(imagen => imagen.tag === tagname)).image;
}

KaiStage.prototype.preload = function() {}

KaiStage.prototype.start = function() {}

KaiStage.prototype.create = function() {}

KaiStage.prototype.keyDown = function(event) {}

KaiStage.prototype.keyUp = function(event) {}

KaiStage.prototype.touchDown = function(x,y) {}

KaiStage.prototype.touchUp = function(x,y) {}

KaiStage.prototype.onBack = function() {}
