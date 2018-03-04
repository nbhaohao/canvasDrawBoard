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
    CANVAS_CONTEXT.clearRect(xValue - 5, yValue - 5, 10, 10)
}

var eraserTouching = function(xValue, yValue) {
    CANVAS_CONTEXT.clearRect(xValue - 5, yValue - 5, 10, 10)
}

var eraserTouchEnd = function() {
    isUserTouching = false
}

var TOUCH_EVENT_FUNCS = {
    pen: {touchStart: penTouchStart, touching: penTouching, touchEnd: penTouchEnd,},
    eraser: {touchStart: eraserTouchStart, touching: eraserTouching, touchEnd: eraserTouchEnd,}
}

function drawLine(x1, y1, x2, y2) {
    CANVAS_CONTEXT.lineWidth = 8 //lineWidth
    CANVAS_CONTEXT.lineJoin = "round" //是 canvas 画板让笔更加连续
    CANVAS_CONTEXT.lineCap = "round"
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

var __main = function() {
    checkUserDevice()
    setCanvasSize()
    listenWindowResize()
    bindPenAndEraserBtnEvent()
    listenCanvasTouchEvent()
    bindResetBtnEvent()
    bindSaveBtnEVent()
}

__main()