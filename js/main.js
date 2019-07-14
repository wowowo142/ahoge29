/**
 * あほげー 29回用
 * 何も考えずこれにすべてを書く
 */

import '@babel/polyfill';

let w = 800
let h = 600
let spScale = 0.375
let isSP = window.innerWidth <= 800

if ( isSP ) {
    w *= spScale
    h *= spScale
}

// グローバル
let textures// = new Map()
let donuts //= new Array()
let currentDonut// = null
const goal = 3000000
let score //= 0
let time //= 0
let cost //= 20000
let oxy //= 1.0
let consumption //= 0
let currentDragPoint

let counter //= 0
let timer;
const createTableFromHole = [
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,2,2,2,
    2,2,2,2,2,2,2,3,3,3

]

const createTableByBreed = [
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    1,1,1,2,2,2,2,2,3,3
]

const setOrderTable = [
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,1,1,1,1,
    2,2,2,2,2,2,2,2,2,2,
    2,2,2,2,2,2,2,2,2,2,
    3,3,3,3,3,3,3,3,3,3,
]


/**
 * 指定したurlの画像からテクスチャを生成してグローバルなMapにセット
 * @param {String} name 
 * @param {String} url
 */
function loadTexture(name, url) {
    let tex = PIXI.Texture.from(url)
    textures.set(name, tex)
    return tex
}

init()

function init() {
    textures = new Map()
    donuts = new Array()
    currentDonut = null
    score = 0
    time = 0
    cost = 20000
    oxy = 1.0
    consumption = 0
    currentDragPoint

    counter = 0
    timer;
    loadTexture('background','./res/img/back.jpg')
    loadTexture('type0','./res/img/donu_plain.png')
    loadTexture('type1','./res/img/donu_green.png')
    loadTexture('type2','./res/img/donu_toxic.png')
    loadTexture('type3','./res/img/donu_predator.png')
    loadTexture('hole','./res/img/hole.png')
    loadTexture('dog_close','./res/img/dog_close.png')
    loadTexture('dog_open','./res/img/dog_open.png')
    loadTexture('box','./res/img/box.png')
    loadTexture('label_box','./res/img/label_box.png')
    loadTexture('label_o2','./res/img/label_o2.png')
    loadTexture('startbutton','./res/img/startbutton.png')
    loadTexture('restartbutton','./res/img/restartbutton.png')
    loadTexture('tweetbutton','./res/img/tweetbutton.png')

    // PIXIアプリケーション生成
    let app = new PIXI.Application({
            width: w, height: h,
            backgroundColor: 0xffffff,
            // resolution: window.devicePixelRatio || 1,
    })
    app.stage.sortableChildren = true;

    if (isSP) {
        app.stage.scale.x = app.stage.scale.y = spScale
    }

    // HTMLに追加
    let gameEl = document.getElementById('game')
    gameEl.innerHTML = ''
    gameEl.appendChild(app.view)


    PIXI.TextMetrics.BASELINE_SYMBOL += "あ｜";


    /**
     * 全体背景
     */
    // let back = loadTexture('background','/res/img/back.jpg')
    let back = new PIXI.Sprite(textures.get('background'))
    back.alpha = 0.5
    // back.x = app.screen.width / 2
    // back.y = app.screen.height / 2
    app.stage.addChild(back)


    /**
     * フィールド
     */
    let field = new PIXI.Container()
    field.sortableChildren = true;
    field.zIndex = 100
    field.x = 80
    field.y = 70
    app.stage.addChild(field)

    let fieldBack = new PIXI.Graphics()
    .beginFill(0xeeffff)
    .drawRect(0, 0, 500, 450)
    .endFill()
    fieldBack.alpha = 0.8
    field.addChild(fieldBack)

    // 穴
    let hole = new PIXI.Sprite(textures.get('hole'))
    hole.anchor.y = 0.5
    hole.zIndex = 10000
    hole.pixHeight = hole.texture._frame.height
    hole.y = 50
    hole.scale.y = 0
    field.addChild(hole)


    // 宇宙犬
    let dogContainer = new PIXI.Container();
    dogContainer.y = 445
    dogContainer.zIndex = 1000
    app.stage.addChild(dogContainer);
    let dog = new PIXI.Sprite(textures.get('dog_close'))
    dog.open = false;
    dogContainer.addChild(dog);
    // お値段
    let costLabel =  new PIXI.Text('₫'+ separateByComma(cost),
            {fontFamily : '游ゴシック,Osaka', fontWeight: 'bold', fontSize: 15});
    costLabel.x = 15;
    costLabel.y = 18;
    dogContainer.addChild(costLabel);


    /**
     * UI
     */
    let scoreContainer = new PIXI.Container()
    app.stage.addChild(scoreContainer)

    // 日数
    let timeLabel =  new PIXI.Text(time + '日経過',
            {fontFamily : '游ゴシック,Osaka', fontWeight: 'bold', fontSize: 30});
    timeLabel.x = 20;
    timeLabel.y = 10;
    scoreContainer.addChild(timeLabel);

    let scoreLabel =  new PIXI.Text('目標金額まで : ₫' + separateByComma(goal - score),
            {fontFamily : '游ゴシック,Osaka', fontWeight: 'bold', fontSize: 20});
    scoreLabel.anchor.x = 1.0
    scoreLabel.x = 780
    scoreLabel. y = 15
    scoreContainer.addChild(scoreLabel)




    // 酸素残量
    let oxyContainer = new PIXI.Container()
    oxyContainer.x = 750
    oxyContainer.y = 170
    app.stage.addChild(oxyContainer)

    let o2Label = new PIXI.Sprite(textures.get('label_o2'))
    // o2Label.scale.x  = o2Label.scale.y = 0.8
    o2Label.y -= 80
    oxyContainer.addChild(o2Label)

    let oxyBar = new PIXI.Graphics()
    .beginFill(0xaaaaaa)
    .drawRect(0, 0, 30, 410)
    .endFill()
    oxyBar.pivot.x = 0.5

    let oxyLeft = new PIXI.Graphics()
    .beginFill(0x44ff44)
    .drawRect(0, 0, 20, 400)
    .endFill()
    oxyLeft.pivot.x = 0.5
    oxyLeft.x = 5
    oxyLeft.y = 5
    let oxyConsumed = new PIXI.Graphics()
    .beginFill(0x444444)
    .drawRect(0, 0, 20, 400)
    .endFill()
    oxyConsumed.pivot.x = 0.5
    oxyConsumed.x = 5
    oxyConsumed.y = 5
    oxyConsumed.scale.y = 0

    let oxyLabel =  new PIXI.Text('酸素消費量 : ' + consumption*100 + '%/日',
            {fontFamily : '游ゴシック,Osaka', fontWeight: 'bold', fontSize: 15});
    oxyLabel.anchor.x = 1.0
    oxyLabel.x = 0
    oxyLabel. y = 400

    oxyContainer.addChild(oxyBar)
    oxyContainer.addChild(oxyLeft)
    oxyContainer.addChild(oxyConsumed)
    oxyContainer.addChild(oxyLabel)


    // 受注ボックス
    let orderContainer = new PIXI.Container()
    orderContainer.x = 600
    orderContainer.y = 100
    app.stage.addChild(orderContainer)

    let boxLabel = new PIXI.Sprite(textures.get('label_box'))
    boxLabel.scale.x  = boxLabel.scale.y = 0.8
    orderContainer.addChild(boxLabel)

    let boxContainerList = new Array()

    for (let i=0; i < 3; i++) {
        let boxContainer = new PIXI.Container();
        boxContainer.y = 80 + i*120
        boxContainer.box = new PIXI.Sprite(textures.get('box'))
        boxContainer.addChild(boxContainer.box)
        boxContainerList.push(boxContainer)
        boxContainer.box.limit = 15
        boxContainer.level = i+1;
        boxContainer.orderList = new Array();
        boxContainer.box.limitLabel =  new PIXI.Text('あと' + boxContainer.box.limit + '日',
                {fontFamily : '游ゴシック,Osaka', fontWeight: 'bold', fontSize: 15});
        scoreLabel.anchor.x = 1.0
        boxContainer.box.limitLabel.x = 35
        boxContainer.box.limitLabel.y = 75
        boxContainer.addChild(boxContainer.box.limitLabel)
        orderContainer.addChild(boxContainer)
    }



    let gameOverLabel =  new PIXI.Text('',
            {fontFamily : '游ゴシック,Osaka', fontWeight: 'bold', fontSize: 60});
    let resultLabel =  new PIXI.Text('',
        {fontFamily : '游ゴシック,Osaka', fontWeight: 'bold', fontSize: 60});


    Array.prototype.forEach.call(boxContainerList, (c) =>  {
    setNewOrder(c, true)  
    })

    createDonutByBreed(1);
    createDonutByBreed();
    createDonutByBreed();
    createDonutByBreed();
    createDonutByBreed();
    createDonutByBreed();
    createDonutByBreed();
    createDonutByBreed(1);




    let startScreen = new PIXI.Graphics()
    .beginFill(0x000000)
    .drawRect(0, 0, 800, 600)
    .endFill()
    startScreen.alpha = 0.95
    startScreen.interactive = true;
    startScreen.zIndex = 100000
    app.stage.addChild(startScreen)
    let startButton = new PIXI.Sprite(textures.get('startbutton'));
    startButton.anchor.set(0.5)
    startButton.zIndex = 100001
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.x = 400
    startButton.y = 300
    app.stage.addChild(startButton)

    startScreen.on('pointertap', start);
    startButton.on('pointertap', start);



    function start() {
        let ticker = PIXI.Ticker.shared;
        ticker.add(() => {
            // app.renderer.render(app.stage);
        })
        startScreen.destroy();
        startButton.destroy();
        timer = setInterval(() => {
            update();
        }, 1000)
    }


    function update () {
        counter++;
        if (counter % 2 == 0) {
            createDonutFromHole(createTableFromHole[Math.floor(Math.random() * (createTableFromHole.length-1))]) ;
        }

        if (counter % 8 == 0) {
            breed();
        }

        updateOrder()
        updateScore()
        updateTime()
        updateOxy()
        prey()
    }

    /**
     * ドーナツリストにドーナツを追加
     * @param {PIXI.Sprite} donut 
     */
    function addDonut(donut) {
        donuts.push(donut)
        donut.interactive = true;
        donut.buttonMode = true;
        donut.tween = TweenMax.to(donut, 0.5,
            {  pixi:
                { scaleX: 1.02, scaleY: 1.05 }, ease: Power1.easeInOut, repeat: -1, yoyo: true,
                onComplete: () => { 
                    donut.rotation = 0;
                    TweenMax.to(donut, 0.5,
                        {  pixi:
                            { y: donut.y + 20 },
                            ease: Power1.easeInOut,
                            onComplete: () => { addDonut(donut) }
                        }
                    )
                } 
            }
        )
        donut.on('pointertap', onDonutTap)
        donut.on('pointerdown', onDonutDragStart)
    }


    function onDonutTap(e) {
        // removeDonut(e.target)
    }

    /**
     * ドラッグ開始
     */
    function onDonutDragStart(e) {
        let d = e.target;
        currentDonut = d;
        d.prev = {x: d.x, y: d.y}
        d.on('pointermove', onDonutDragging)
        window.bindedFunc = onDonutDragEnd
        window.addEventListener('pointerup', window.bindedFunc);
    }

    /**
     * ドラッグ中
     */
    function onDonutDragging(e) {
        let d = currentDonut;
        let pMouse = e.data.getLocalPosition(field);
        d.x = pMouse.x
        d.y = pMouse.y
        currentDragPoint = e.data.getLocalPosition(app.stage);

        let gp = currentDragPoint;
        if (80 < gp.x && gp.x < 140 && 540 < gp.y && gp.y < 580) {
            if (!dog.open) {
                dog.open = true;
                dog.texture = textures.get('dog_open');
            }
        }
        else if (dog.open) {
            dog.open = false;
            dog.texture = textures.get('dog_close');
        }
    }


    /**
     * ドラッグ終了
     */
    function onDonutDragEnd(e) {
        let d = currentDonut;
        d.removeAllListeners('pointermove');
        if (window.bindedFunc != null) { 
            window.removeEventListener('pointerup', window.bindedFunc);
            window.bindedFunc = null;
        }
        currentDonut = null;

        let gp = currentDragPoint;
        if (80 < gp.x && gp.x < 140 && 540 < gp.y && gp.y < 580) {
            feedDog(d);
        }
        console.log(gp)
        Array.prototype.forEach.call(boxContainerList,(b) => {
            let bx = b.worldTransform.tx
            let by = b.worldTransform.ty
            if (isSP) {
                bx *= (1 / spScale)
                by *= (1 / spScale)
            }
            console.log(b.worldTransform)
            if (bx < gp.x && gp.x < bx+120 && by < gp.y && gp.y < by+70) {
                checkOrder(b,d)
            }
        })
    }

    /**
     * ドーナツを削除
     * @param {PIXI.Sprite} donut 
     */
    function removeDonut(donut) {
        for(let i = 0; i < donuts.length; i++) {
            if ( Object.is(donuts[i], donut) ) {
                donuts.splice(i,1);
            }
        }
        donut.destroy();
        
    }


    /**
     * ドーナツ生成
     */
    function createDonut(type=0) {
        let donut = new PIXI.Sprite(textures.get('type' + type))
        field.addChild(donut)
        donut.anchor.x = 0.5
        donut.anchor.y = 0.5
        donut.type = type;
        return donut;
    }


    /**
     * 穴からドーナツ
     * @param {String} type ドーナツの種類
     */
    function createDonutFromHole(type=0) {
        // ドーナツ
        let donut = createDonut(type)

        hole.scale.y = 0
        hole.x = Math.floor(Math.random() * 440 + 20)
        hole.y = Math.floor(Math.random() * 390 + 20)
        hole.tween = TweenMax.to(hole, 0.3, 
            {  pixi:
                { scaleY: 1.0 }, ease: Power1.easeInOut, repeat: 1, yoyo: true,
                onComplete: () => { 
                    hole.tween = null
                } 
            }
        )
        donut.x = hole.x + 20
        donut.y = hole.y
        donut.rotation = - Math.PI / 2
        donut.scale.x = donut.scale.y = 0

        TweenMax.to(donut, 0.5,
            {  pixi:
                { scaleX: 1.0, scaleY: 1.0, x: donut.x + 10 },ease: Power1.easeInOut,
                onComplete: () => { 
                    donut.rotation = 0;
                    TweenMax.to(donut, 0.5,
                        {  pixi:
                            { y: donut.y + 20 },
                            ease: Power1.easeInOut,
                            onComplete: () => { addDonut(donut) }
                        }
                    )
                } 
            }
        )
    }

    function createDonutByBreed(type=0) {
        let donut = createDonut(type)
        donut.x = Math.floor(Math.random() * 455 + 20)
        donut.y = Math.floor(Math.random() * 415 + 20)
        donut.scale.x = donut.scale.y = 0
        TweenMax.to(donut, 0.5,
            {  pixi:
                { scaleX: 1.0, scaleY: 1.0, },ease: Power1.easeInOut,
                onComplete: () => { 
                    addDonut(donut)
                } 
            }
        )
    }





    /**
     * 犬にくわせる
     */
    function feedDog(donut) {
        removeDonut(donut)
        score -= cost;
        cost *= 2
        costLabel.text = '₫'+ separateByComma(cost)
        dog.open = false;
        dog.texture = textures.get('dog_close')
        updateScore()
    }


    function setNewOrder(boxContainer, noMotionDiscard = false) {
        discardOrder(boxContainer, noMotionDiscard)
        let box = boxContainer.box
        let orderNum = (boxContainer.level-1)*2 + 1
        for(let i=0; i <  orderNum; i++) {
            let type
            switch(boxContainer.level) {
                case 1:
                    type = Math.floor((Math.random()-0.00001)*2)
                    break;
                default:
                    type = setOrderTable[Math.floor((Math.random()-0.00001)*setOrderTable.length)]
            }
            let d = new PIXI.Sprite(textures.get('type'+type));
            d.type = type;
            d.anchor.set(0.5)
            d.scale.x = d.scale.y = 0.8
            d.x = 35 + i * 15;
            d.y = 35;
            d.alpha = 0.5
            d.rotation = - Math.PI / 2
            d.filled = false
            boxContainer.addChild(d);
            boxContainer.orderList.push(d)
            boxContainer.orderCount = orderNum
        }
        box.limit = 5 + (boxContainer.level-1) * 10 
        box.limitLabel.text = 'あと' + box.limit + '日'
    }


    function checkOrder(boxContainer,donut) {
        let r = Array.prototype.find.call(boxContainer.orderList, (o) => {
            return (o.type == donut.type && !o.filled)
        })
        if (r != undefined) {
            removeDonut(donut)
            r.alpha = 1;
            r.filled = true;
            boxContainer.orderCount -= 1
        }

        if (boxContainer.orderCount == 0) {
            shipDonuts(boxContainer);
        }
    }


    function shipDonuts(boxContainer) {
        let payment = 0;
        let bonus = 1.0;
        let counter = 0;
        Array.prototype.forEach.call(boxContainer.orderList, (o) => {
            counter += 1
            switch(o.type) {
                case 0:
                    payment += 10000
                    bonus *= 1.5
                    break
                case 1:
                    payment += 20000
                    bonus *= 3.0
                    break
                case 2:
                    payment += 100000
                    bonus *= 0.9
                    break
                case 3:
                    payment += 300000
                    bonus *= 1.5
                    break
                default: 
                    break
            }
        })
        let subScore = payment
        if (counter > 1) {
            subScore = Math.floor(subScore * bonus)
        }
        score += subScore

        let paymentLabel = new PIXI.Text('+₫' + separateByComma(subScore),
                        {fontFamily : '游ゴシック,Osaka', fontWeight: 'bold', fill : 0xff0000 , fontSize: 25});
        paymentLabel.anchor.x = 1.0
        paymentLabel.x = 740
        paymentLabel.y = 60
        paymentLabel.alpha = 0
        app.stage.addChild(paymentLabel)
        TweenMax.to(paymentLabel, 0.5, {
            pixi: {y: paymentLabel.y - 20, alpha: 1.0}, ease: Power1.easeInOut,
            onComplete: () => {
                updateScore();
                TweenMax.to(paymentLabel, 0.3, {
                    pixi: {alpha: 0}, ease: Power1.easeInOut,
                    onComplete: () => {
                        paymentLabel.destroy();
                    }
                })
            }
        })

        let bx = boxContainer.x
        let by = boxContainer.y
        TweenMax.to(boxContainer, 0.5, {
            pixi: {y: -1000},
            onComplete: () => {
                setNewOrder(boxContainer, true)
                TweenMax.to(boxContainer, 0.5, {
                    pixi: {y: by}
                })
            }
        })
    }

    function discardOrder(boxContainer, noMotion = false) {
        Array.prototype.forEach.call(boxContainer.orderList, (o) => {
            o.destroy();
        })
        boxContainer.orderList = new Array();
        let bx = boxContainer.x
        let by = boxContainer.y
        if(!noMotion) {
            TweenMax.to(boxContainer, 0.5, {
                pixi: {x: 1000},
                onComplete: () => {
                    setNewOrder(boxContainer)
                    TweenMax.to(boxContainer, 0.5, {
                        pixi: {x: bx}
                    })
                }
            })
        }
    }

    function updateOrder() {
        Array.prototype.forEach.call(boxContainerList, (c) =>  {
            let box = c.box
            box.limit -= 1;
            if (box.limit == 0) {
                setNewOrder(c,false)
            }
            box.limitLabel.text = 'あと' + box.limit + '日'
        })
    }

    function updateScore() {
        let left
        if (goal - score < 0) {
            left = 0
        } else {
            left = goal - score 
        }

        scoreLabel.text = '目標金額まで : ₫' + separateByComma(left)
        if (left <= 0) {
            gameOver(true)
        }
    }

    function updateTime() {
        time++
        timeLabel.text = time + '日経過'
    }


    function updateOxy() {
        consumption = 0;
        for(let i = 0; i < donuts.length; i++) {
            switch(donuts[i].type) {
                case 0:
                    oxy -= 0.0006
                    consumption += 0.0006
                    break;
                case 1:
                    oxy += 0.005
                    consumption -= 0.005
                    break
                case 2:
                    oxy -= 0.02
                    consumption += 0.02
                    break
                case 3:
                    oxy += 0
                    break
                default:
                    break;
            }
        }
        if (oxy > 1.0) {
            oxy = 1.0
        }
        else if( oxy  < 0) {
            oxy = 0
        }
        oxyConsumed.scale.y = 1.0 - oxy
        oxyLabel.text =  '酸素消費量 : ' + Math.round(consumption*10000) / 100 + '%/日'

        if (oxy == 0) {
            gameOver(false);
        }
    }

    function prey() {
        let predators = Array.prototype.filter.call(donuts, (p) => {
            return p.type == 3
        })

        let preys = Array.prototype.filter.call(donuts, (p) => {
            return p.type != 3
        })

        for (let i=0; i < predators.length*2 && i < preys.length - predators.length*12; i++) {
            removeDonut(preys[i]);
        }
    }

    function breed() {
        // シャッフル
        for(var i = donuts.length - 1; i > 0; i--){
            var r = Math.floor(Math.random() * (i + 1));
            var tmp = donuts[i];
            donuts[i] = donuts[r];
            donuts[r] = tmp;
        }

        // 繁殖使用済みフラグ
        for (let i=0; i < donuts.length; i++) {
            if ( i >= donuts.length/2) {
                donuts[i].used = false;
            } else {
                donuts[i].used = true;
            }
        }

        // 繁殖実行
        for (let i=0; i < donuts.length / 2; i++) {
            donuts[i].used = true
            let r
            switch(donuts[i].type) {
                case 0:
                    createDonutByBreed(createTableByBreed[Math.floor(Math.random)*createTableByBreed.length])
                    break
                case 1: 
                    r = Array.prototype.find.call(donuts, (d) => {
                        return (d.type == 1 && d.used == false)
                    })
                    if ( r != undefined) {
                        r.used = true;
                        createDonutByBreed(1)
                    }
                    else {
                        createDonutByBreed(2)
                    }
                    break
                case 2:
                    createDonutByBreed(Math.floor(Math.random() + 3))
                    break
                default:
                    break
            }
        }
    }


    function gameOver(clear = false) {
        let resTime = time+1
        clearInterval(timer);
        gameOverLabel.anchor.set(0.5)
        gameOverLabel.x = 400;
        gameOverLabel.y = 100;
        gameOverLabel.zIndex = 1000000
        app.stage.addChild(gameOverLabel);   
        if (clear) {
            resultLabel =  new PIXI.Text('',
                 {fontFamily : '游ゴシック,Osaka', fontWeight: 'bold', fontSize: 30});
        } else {
            resultLabel =  new PIXI.Text('',
                {fontFamily : '游ゴシック,Osaka', fontWeight: 'bold', fill:0xffffff, fontSize: 30});
        }
        resultLabel.anchor.set(0.5)
        resultLabel.x = 400;
        resultLabel.y = 250;
        resultLabel.zIndex = 1000000
        app.stage.addChild(resultLabel); 
        if (clear) {
            gameOverLabel.text = 'ゲームクリア！'
            resultLabel.text = '左遷から ' + (time+1) + ' 日後に地球へ帰還した。\r\nこれからもお仕事頑張ろう！'
            let gameclearScreen = new PIXI.Graphics()
            .beginFill(0xffffff)
            .drawRect(0, 0, 800, 600)
            .endFill()
            gameclearScreen.alpha = 0.6
            gameclearScreen.interactive = true;
            gameclearScreen.zIndex = 50000
            app.stage.addChild(gameclearScreen)
        }
        else {
            gameOverLabel.text = 'ゲームオーバー...'
            resultLabel.text = '左遷から ' + resTime + ' 日目に酸欠で倒れた。\r\n退職してうきうきニート生活！'
            let gameclearScreen = new PIXI.Graphics()
            .beginFill(0x000000)
            .drawRect(0, 0, 800, 600)
            .endFill()
            gameclearScreen.alpha = 0.6
            gameclearScreen.interactive = true;
            gameclearScreen.zIndex = 100000
            app.stage.addChild(gameclearScreen)
        }
        let restartButton = new PIXI.Sprite(textures.get('restartbutton'));
        restartButton.anchor.set(0.5)
        restartButton.zIndex = 100001
        restartButton.interactive = true;
        restartButton.buttonMode = true;
        restartButton.x = 300
        restartButton.y = 400
        app.stage.addChild(restartButton)
        restartButton.on('pointertap',init)

        let tweetButton = new PIXI.Sprite(textures.get('tweetbutton'));
        tweetButton.anchor.set(0.5)
        tweetButton.zIndex = 100001
        tweetButton.interactive = true;
        tweetButton.buttonMode = true;
        tweetButton.x = 500
        tweetButton.y = 400
        app.stage.addChild(tweetButton)

        tweetButton.on('pointertap',tweet)
    }

    function separateByComma(num){
        return String(num).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    }

    function tweet() {
        window.open().location.href = ("https://twitter.com/share?url=https://wowowo142.github.io/ahoge29/" + "&text=" + encodeURIComponent(resultLabel.text.replace("\r\n",'') + ' #ahoge') + "&count=none&lang=ja");
    }
}