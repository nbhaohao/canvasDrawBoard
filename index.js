var CANVAS
var CANVAS_CONTEXT
var CURRENT_TOOL = "pen"
var DEVICE_TYPE = ""
var LAST_USER_POINT = {x:"", y:"",}
var isUserTouching = false
var DEVICE_EVENT = {
    pc: {normalTouch: "click", touchStart: "mousedown", touching: "mousemove", touchEnd: "mouseup",},
    mobile: {normalTouch: "touchend", touchStart: "touchstart", touching: "touchmove", touchEnd: "touchend",},
}
var DRAW_BOARD_SETTING = {
    painterSize: "6",
    painterColor: "black",
    eraserSize: "6",
}
//DEVICE_EVENT[DEVICE_TYPE].normalTouch

var penTouchStart = function(xValue, yValue) {
    LAST_USER_POINT = {
        x: xValue,
        y: yValue,
    }
}

var penTouching = function(xValue, yValue) {
    let newPoint = {
        x: xValue,
        y: yValue,
    }
    drawLine(LAST_USER_POINT.x, LAST_USER_POINT.y, newPoint.x, newPoint.y)
    LAST_USER_POINT = newPoint
}

var penTouchEnd = function() {
    isUserTouching = false
}

var eraserTouchStart = function(xValue, yValue) {
    let widthValue = DRAW_BOARD_SETTING.eraserSize
    CANVAS_CONTEXT.clearRect(xValue - (widthValue / 2), yValue - (widthValue / 2), widthValue, widthValue)
}

var eraserTouching = function(xValue, yValue) {
    let widthValue = DRAW_BOARD_SETTING.eraserSize
    CANVAS_CONTEXT.clearRect(xValue - (widthValue / 2), yValue - (widthValue / 2), widthValue, widthValue)
}

var eraserTouchEnd = function() {
    isUserTouching = false
}

var setOneElementHasSingleClass = function(element, className) {
    var allClassNameELements = document.querySelectorAll("." + className)
    for (let i = 0; i < allClassNameELements.length; i++) {
        let item = allClassNameELements[i]
        item.classList.remove(className)
    }
    element.classList.add(className)
}

var TOUCH_EVENT_FUNCS = {
    pen: {touchStart: penTouchStart, touching: penTouching, touchEnd: penTouchEnd,},
    eraser: {touchStart: eraserTouchStart, touching: eraserTouching, touchEnd: eraserTouchEnd,}
}

function drawLine(x1, y1, x2, y2) {
    CANVAS_CONTEXT.lineWidth = DRAW_BOARD_SETTING.painterSize //lineWidth
    CANVAS_CONTEXT.lineJoin = "round" //是 canvas 画板让笔更加连续
    CANVAS_CONTEXT.lineCap = "round"
    CANVAS_CONTEXT.stfillStyle = DRAW_BOARD_SETTING.painterColor
    CANVAS_CONTEXT.strokeStyle = DRAW_BOARD_SETTING.painterColor
    CANVAS_CONTEXT.beginPath();
    CANVAS_CONTEXT.moveTo(x1, y1) // 起点
    CANVAS_CONTEXT.lineTo(x2, y2) // 终点
    CANVAS_CONTEXT.stroke()
    CANVAS_CONTEXT.closePath()
}
  
var setCanvasSize = function() {
    let allHeight = document.documentElement.clientHeight
    let headerHeight = document.querySelector("#h2-i-title").clientHeight
    let toolbarHeight = document.querySelector(".toolbar").clientHeight
    let restHeight = allHeight - headerHeight - toolbarHeight
    CANVAS = document.querySelector("#canvas-i-myBoard")
    CANVAS.height = restHeight
    CANVAS.width = document.documentElement.clientWidth
    CANVAS_CONTEXT = CANVAS.getContext("2d")
}

var bindPenAndEraserBtnEvent = function() {
    let tools = document.querySelectorAll(".drawTools")
    for (var i = 0; i < tools.length; i++) {
        var item = tools[i]
        item.addEventListener(DEVICE_EVENT[DEVICE_TYPE].normalTouch, function(event) {
            let self = event.currentTarget
            CURRENT_TOOL = self.dataset.type
            let activeBtn = document.querySelector(".toolActive")
            activeBtn.classList.remove("toolActive")
            self.classList.add("toolActive")
        })
    }
}

var checkUserDevice = function() {
    var touchEvent = window.ontouchend
    if (touchEvent === undefined) {
        DEVICE_TYPE = "pc"
        return
    }
    DEVICE_TYPE = "mobile"
}

var listenWindowResize = function() {
    window.addEventListener("resize", function(event) {
        setTimeout(function() {
            setCanvasSize()
        }, 50)
    })
}

var getXandY = function(event) {
    let obj = {
        xValue: 0,
        yValue: 0,
    }
    if (DEVICE_TYPE === "pc") {
        obj.xValue = event.clientX
        obj.yValue = event.clientY 
    } else {
        obj.xValue = event.touches[0].clientX
        obj.yValue = event.touches[0].clientY
    }
    obj.yValue = obj.yValue - document.querySelector("#h2-i-title").clientHeight
    return obj
}

var listenCanvasTouchEvent = function() {
    CANVAS.addEventListener(DEVICE_EVENT[DEVICE_TYPE].touchStart, function(event) {
        isUserTouching = true
        let coordinate = getXandY(event)
        console.log("coordinate", coordinate)
        TOUCH_EVENT_FUNCS[CURRENT_TOOL]["touchStart"](coordinate.xValue, coordinate.yValue)
    })
    CANVAS.addEventListener(DEVICE_EVENT[DEVICE_TYPE].touching, function(event) {
        if (!isUserTouching) {return}
        let coordinate = getXandY(event)
        TOUCH_EVENT_FUNCS[CURRENT_TOOL]["touching"](coordinate.xValue, coordinate.yValue)
    })
    CANVAS.addEventListener(DEVICE_EVENT[DEVICE_TYPE].touchEnd, function(event) {
        isUserTouching = false
    })
}

var bindResetBtnEvent = function() {
    let btn = document.querySelector("#svg-i-resetBtn")
    btn.addEventListener(DEVICE_EVENT[DEVICE_TYPE].normalTouch, function(event) {
        CANVAS_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height)
    })
}

var bindSaveBtnEVent = function() {
    let btn = document.querySelector("#svg-i-saveBtn")
    let saveA = document.querySelector("#a-i-saveMyPicture")
    btn.addEventListener(DEVICE_EVENT[DEVICE_TYPE].normalTouch, function(event) {
        let url = CANVAS.toDataURL("image/png")
        saveA.href = url
        saveA.click()
    })
}

var bindPainterSizeEvent = function() {
    let allPainterSizes = document.querySelectorAll(".painterSize")
    for (let i = 0; i < allPainterSizes.length; i++) {
        let item = allPainterSizes[i]
        item.addEventListener(DEVICE_EVENT[DEVICE_TYPE].normalTouch, function(event) {
            setOneElementHasSingleClass(item, "span-c-chooseBtnActive")
            DRAW_BOARD_SETTING.painterSize = event.target.dataset.value
        })
    }
}

var bindPainterColorEvent = function() {
    let allPainterColors = document.querySelectorAll(".span-c-colorBtn")
    for (let j = 0; j < allPainterColors.length; j++) {
        let item = allPainterColors[j]
        item.addEventListener(DEVICE_EVENT[DEVICE_TYPE].normalTouch, function(event) {
            setOneElementHasSingleClass(item, "colorBtn-border")
            DRAW_BOARD_SETTING.painterColor = event.target.dataset.value
        })
    }
}

var bindEraserSizeEvent = function() {
    let sizes = document.querySelectorAll(".span-c-eraserSize")
    for (let n = 0; n < sizes.length; n++) {
        let item = sizes[n]
        item.addEventListener(DEVICE_EVENT[DEVICE_TYPE].normalTouch, function(event) {
            setOneElementHasSingleClass(item, "span-c-eraserActive")
            DRAW_BOARD_SETTING.eraserSize = event.target.dataset.value
        })
    }
}

var bindEditContentEvent = function() {
    //painterSize
    bindPainterSizeEvent()
    bindPainterColorEvent()
    bindEraserSizeEvent()
}

var bindMaskDivEvent = function() {
    let div = document.querySelector("#div-i-maskContent")
    div.addEventListener(DEVICE_EVENT[DEVICE_TYPE].normalTouch, function(event) {
        let self = event.target
        let currentSelf = event.currentTarget
        if (self.classList.contains("content")) {
            let maskDiv = document.querySelector(".maskDiv")
            maskDiv.classList.remove("maskDivShow")
        }
    })
}

var bindSettingBtnEvent = function() {
    let btn = document.querySelector("#svg-i-settingBtn")
    btn.addEventListener(DEVICE_EVENT[DEVICE_TYPE].normalTouch, function(event) {
        let maskDiv = document.querySelector(".maskDiv")
        maskDiv.classList.add("maskDivShow")
    })
}

var __main = function() {
    checkUserDevice()
    setCanvasSize()
    listenWindowResize()
    bindPenAndEraserBtnEvent()
    listenCanvasTouchEvent()
    bindResetBtnEvent()
    bindSettingBtnEvent()
    bindSaveBtnEVent()
    bindEditContentEvent()
    bindMaskDivEvent()
}

__main()