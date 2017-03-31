var stage, w, h, loader, startX, startY, wiggleDelta;
var background, chris, ground, pipe, pipes, rotationDelta, score, scoreOutline;
var started = false;
var startJump = false; 
var jumpAmount = 110; 
var jumpTime = 263;
var dead = false; 
var KEYCODE_SPACE = 32; 
var gap = 335;
var masterPipeDelay = 75; 
var pipeDelay = masterPipeDelay; 
var scoreShow = false;
var showTitle = false;
var themeSong = document.getElementById("themeSong");
var flap = document.getElementById("flap");
var ding = document.getElementById("ding");
var chrisDead = document.getElementById("chrisDead"); 
document.onkeydown = doKeyDown;

function init() {
    stage = new createjs.Stage("flappyChris");
    createjs.Touch.enable(stage);
    w = stage.canvas.width;
    h = stage.canvas.height;
    manifest = [
		 { src: "img/chris-sprite.png", id: "chris" }, 
		 { src: "img/background.png", id: "background"},
		 { src: "img/ground.png", id: "ground" },
		 { src: "img/pipe.png", id: "pipe" },
		 { src: "img/restart.png", id: "start" },
		 { src: "img/share.png", id: "share" },
		 { src: "fonts/flappy-chris.eot" },
		 { src: "fonts/flappy-chris.svg" },
		 { src: "fonts/flappy-chris.ttf" },
		 { src: "fonts/flappy-chris.woff" },
		 { src: "snd/intro.wav", id:"introsound" },
     { src: "snd/theme.mp3", id:"themesong" },
     { src: "snd/flap.wav", id:"flap" },
     { src: "snd/ding.wav", id:"ding" },
     { src: "snd/die.wav", id:"die" }
		 ];
    loader = new createjs.LoadQueue(false);
		loader.installPlugin(createjs.Sound);
    loader.addEventListener("complete", doFinished);
    loader.loadManifest(manifest);
}
function doFinished() {
    createjs.Sound.play("introsound");
    background = new createjs.Shape();
    background.graphics.beginBitmapFill(loader.getResult("background")).drawRect(0, 0, w, h);
    var groundImg = loader.getResult("ground");
    ground = new createjs.Shape();
    ground.graphics.beginBitmapFill(groundImg).drawRect(0, 0, w + groundImg.width, groundImg.height);
    ground.tileW = groundImg.width;
    ground.y = h - groundImg.height;
    var data = new createjs.SpriteSheet({
        "images": [loader.getResult("chris")],
        "frames": {
            "width": 185,
            "height": 105,
            "regX": 92.5,
            "regY": 52.5,
            "count": 3
        },
        "animations": {
            "fly": [0, 2, "fly", 0.31],
            "dive": [1, 1, "dive", 1]
        }
    });
    chris = new createjs.Sprite(data, "fly");
    startX = (w / 2) - (92.5 / 2)
    startY = 512
    wiggleDelta = 18
    chris.setTransform(startX, startY, 1, 1);
    chris.framerate = 30;
    createjs.Tween.get(chris, {
        loop: true
    }).to({
        y: startY + wiggleDelta
    }, 380, createjs.Ease.sineInOut).to({
        y: startY
    }, 380, createjs.Ease.sineInOut);
    stage.addChild(background);
    pipes = new createjs.Container();
    stage.addChild(pipes)
    stage.addChild(chris, ground);
    stage.addEventListener("stagemousedown", jumpStart);
    titleTxt = new createjs.Text('Click to start!', "86px 'Flappy Chris'", "#ffffff");
    titleTxtOutline = new createjs.Text('Click to start!', "86px 'Flappy Chris'", "#000000");
    titleTxtOutline.outline = 5
    titleTxtOutline.textAlign = 'center'
    titleTxt.textAlign = 'center'
    titleTxtOutline.x = w / 2
    titleTxtOutline.y = 150
    titleTxt.x = w / 2
    titleTxt.y = 150
    titleTxt.alpha = 1
    titleTxtOutline.alpha = 1
    stage.addChild(titleTxt, titleTxtOutline)
    score = new createjs.Text(0, "86px 'Flappy Chris'", "#ffffff");
    scoreOutline = new createjs.Text(0, "86px 'Flappy Chris'", "#000000");
    scoreOutline.outline = 5
    scoreOutline.textAlign = 'center'
    score.textAlign = 'center'
    scoreOutline.x = w / 2
    scoreOutline.y = 150
    score.x = w / 2
    score.y = 150
    score.alpha = 0
    scoreOutline.alpha = 0
    stage.addChild(score, scoreOutline)
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", tick);
}

function doKeyDown(e) {
    if(!e) { var e = window.event; }
    switch(e.keyCode) {
    case KEYCODE_SPACE:
        jumpStart();
    }
}

function jumpStart() {
    if(!dead) {
        showTitle = false
        score.alpha = 1
        scoreOutline.alpha = 1
        createjs.Tween.removeTweens(chris)
        chris.gotoAndPlay("jump");
        startJump = true
        createjs.Sound.play("flap");
        if(!started) {
            started = true
            scoreShow = true
            var themeLoop = createjs.Sound.createInstance("themesong");
             themeLoop.play({loop:-1});    // options as object properties
        }
    }
}

function isDiving() {
    chris.gotoAndPlay("dive");
}

function startOver() {
    //hide anything on stage and show the score
    pipes.removeAllChildren();
    createjs.Tween.get(start).to({
        y: start.y + 10
    }, 50).call(removeStartBtn)
    score.text = 0
    scoreOutline.text = 0
    scoreOutline.alpha = 0
    score.alpha = 0
    scoreShow = false
    showTitle = true
    pipeDelay = masterPipeDelay
    dead = false
    started = false
    startJump = false
    createjs.Tween.removeTweens(chris)
    chris.x = startX
    chris.y = startY
    chris.rotation = 0
    createjs.Tween.get(chris, {
        loop: true
    }).to({
        y: startY + wiggleDelta
    }, 380, createjs.Ease.sineInOut).to({
        y: startY
    }, 380, createjs.Ease.sineInOut);
    titleTxtOutline.alpha = 1
    titleTxt.alpha = 1
}

function oheDead() {
    createjs.Sound.stop("themesong");
    createjs.Sound.play("die");
    dead = true
    chris.gotoAndPlay("dive");
    createjs.Tween.removeTweens(chris)
    createjs.Tween.get(chris).wait(0).to({
        y: chris.y + 200,
        rotation: 90
    }, (380) / 1.5, createjs.Ease.linear) //rotate back
    .call(isDiving) // change chris to diving position
    .to({
        y: ground.y - 30
    }, (h - (chris.y + 200)) / 1.5, createjs.Ease.linear); //drop to the bedrock
    createjs.Tween.get(stage).to({
        alpha: 0
    }, 100).to({
        alpha: 1
    }, 100)
    start = new createjs.Bitmap(loader.getResult("start"));
    start.alpha = 0
    start.x = w / 2 - start.image.width / 2
    start.y = h / 2 - start.image.height / 2 - 150
    share = new createjs.Bitmap(loader.getResult("share"));
    share.alpha = 0
    share.x = w / 2 - share.image.width / 2
    share.y = h / 2 - share.image.height / 2 - 50
    stage.addChild(start)
    stage.addChild(share)
    createjs.Tween.get(start).to({
        alpha: 1,
        y: start.y + 50
    }, 400, createjs.Ease.sineIn).call(addStartBtn)
    createjs.Tween.get(share).to({
        alpha: 1,
        y: share.y + 50
    }, 400, createjs.Ease.sineIn).call(addStartBtn)    
}


function addStartBtn() {
    start.addEventListener("click", startOver);
    share.addEventListener("click", sharingIsCaring);
}
function removeStartBtn() {
    stage.removeChild(start)
    stage.removeChild(share)
}

function sharingIsCaring() {
    var scoreText
    if(score.text == 1) {
        scoreText = "1 point"
    } else {
        scoreText = score.text + " points"
    }
    window.open("https://twitter.com/share?text=I scored " + scoreText + " on Flappy Chris! Think you can do better?");
}

function tick(event) {
    var deltaS = event.delta / 1000;
    var l = pipes.getNumChildren();
    if(chris.y > (ground.y - 105)) {
        if(!dead) {
            oheDead()
        }
        if(chris.y > (ground.y - 95)) {
            createjs.Tween.removeTweens(chris)
        }
    }
    if(!dead) {
        ground.x = (ground.x - deltaS * 300) % ground.tileW;
    }
    if(started && !dead) {
        if(pipeDelay == 0) {
            pipe = new createjs.Bitmap(loader.getResult("pipe"));
            pipe.x = w + 600
            pipe.y = (ground.y - gap * 2) * Math.random() + gap * 1.5
            pipes.addChild(pipe);
            pipe2 = new createjs.Bitmap(loader.getResult("pipe"));
            pipe2.scaleX = -1
            pipe2.rotation = 180
            pipe2.x = pipe.x 
            pipe2.y = pipe.y - gap
            pipes.addChild(pipe2);
            pipeDelay = masterPipeDelay
        } else {
            pipeDelay = pipeDelay - 1
        }
        for(var i = 0; i < l; i++) {
            pipe = pipes.getChildAt(i);
            if(pipe) {
                if(true) { 
                    var collision = ndgmr.checkRectCollision(pipe, chris, 1, true)
                    if(collision) {
                        if(collision.width > 8 && collision.height > 8) {
                            oheDead()
                        }
                    }
                }
                pipe.x = (pipe.x - deltaS * 300);
                if(pipe.x <= 338 && pipe.rotation == 0 && pipe.name != "counted") {
                    pipe.name = "counted" //using the pipe name to count pipes
                    score.text = score.text + 1
                    scoreOutline.text = scoreOutline.text + 1
                    createjs.Sound.play("ding");
                }
                if(pipe.x + pipe.image.width <= -pipe.w) {
                    pipes.removeChild(pipe)
                }
            }
        }
        if(scoreShow) {
            score.alpha = 1
            scoreOutline.alpha = 1
            scoreShow = false
        }
        if(showTitle) {
            titleTxtOutline.alpha = 1
            titleTxt.alpha = 1
            showTitle = false
        } else {
            titleTxtOutline.alpha = 0
            titleTxt.alpha = 0
            showTitle = false
        }

    }
    if(startJump == true) {
        startJump = false
        chris.framerate = 60;
        chris.gotoAndPlay("fly");
        if(chris.roation < 0) {
            rotationDelta = 0
        } else {
            rotationDelta = 0
        }
        if(chris.y < -200) {
            chris.y = -200
        }
        createjs
            .Tween
            .get(chris)
            .to({
                y: chris.y - rotationDelta,
                rotation: 0
            }, rotationDelta, createjs.Ease.linear) //rotate to jump position and jump chris
        .to({
            y: chris.y - jumpAmount,
            rotation: 0
        }, jumpTime - rotationDelta, createjs.Ease.quadOut) //rotate to jump position and jump chris
        .to({
            y: chris.y
        }, jumpTime, createjs.Ease.quadIn) //reverse jump for smooth arch
        .to({
            y: chris.y + 200,
            rotation: 90
        }, (380) / 1.5, createjs.Ease.linear) //rotate back
        .call(isDiving) // change chris to diving position
        .to({
            y: ground.y - 30
        }, (h - (chris.y + 200)) / 1.5, createjs.Ease.linear); //drop to the bedrock
    }
    stage.update(event);
}

Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
    for(var i = 0, len = this.length; i < len; i++) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}
var isEl = function (el) {
    while(el) {
        if(el == document) {
            return true;
        }
        el = el.parentNode;
    }
    return false;
}
var a = document.getElementById("splash"),
    b = document.getElementById("flappyChris");
a.style.width = b.offsetWidth + 2;
a.style.height = b.offsetHeight;
a.style.left = b.offsetLeft;
setTimeout(function(){
createjs.Sound.play("intro");
}, 100)
setTimeout(function () {
    a.remove();
}, 6000);
if(isEl) {
    window.onresize = function () {
        a.style.width = b.offsetWidth + 2;
        a.style.height = b.offsetHeight;
        a.style.left = b.offsetLeft;
        setTimeout(function () {
            a.remove();
        }, 6000);
    }
}
