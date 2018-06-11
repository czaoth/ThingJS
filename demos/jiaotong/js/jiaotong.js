//-----------------------------------------------------------------------------
// 应用入口
var app;

var carlist = [];
var istruck = true;
//信息牌可视flag
var ifnewElem = false;
//eastmaker
var eastmarker;
var northmarker;
var lkmarker;

var marker1;
var marker2;
var marker3;
var marker4;
var webView;


var groad;
var rroad;

//测试
var traintest;


// new App
app = new t3d.App({
    container: "div3d",
    url: 'https://speech.uinnova.com/static/haoguannan/models/jiaotong',
    ak: "app_test_key",
    skyBox: 'Night'
});

// 加载完成
app.on('load', function () {
    //初始化
    init();
    flyback();
    var car3 = app.query('Car3')["0"];
    car3.destroy();
    var car4 = app.query('Car4')["0"];
    car4.destroy();
    var car5 = app.query('Car5')["0"];
    car5.destroy();
    var car6 = app.query('Car6')["0"];
    car6.destroy();
    var car7 = app.query('Car7')["0"];
    car7.destroy();
    var car9 = app.query('Car9')["0"];
    car9.destroy();
    var car10 = app.query('Car10')["0"];
    car10.destroy();
});


function init() {
    // 界面组件
    var panel = new THING.widget.Panel({
        name: '菜单',
        isClose: false, // 是否有关闭按钮
        isDrag: true,
        isRetract: true,
        opacity: 0.9,
        hasTitle: true,
        width: "200px",
        titleImage: 'http://47.93.162.148:8081/liangyw/images/icon/icon.png'
    });

    // 创建任意对象
    var dataObj = {
        open1: false,
        open2: false,
        open3: false,
        open4: false,
        open5: false,
        open6: false,
    };

    // 动态绑定物体
    var open1 = panel.add(dataObj, 'open1').name('机动车信息');
    var open2 = panel.add(dataObj, 'open2').name('道路实时监控');
    var open3 = panel.add(dataObj, 'open3').name('可疑车辆报警');
    var open4 = panel.add(dataObj, 'open4').name('车祸现场');
    var open5 = panel.add(dataObj, 'open5').name('实时路况');
    var open6 = panel.add(dataObj, 'open6').name('交通管制');

    // 设置位置
    panel.setPosition({ left: 30, top: 30 });

    //open1 机动车信息 功能
    open1.onChange(function (event) {
        // if (dataObj.open1) {
        //     ifnewElem = true;
        // } else {
        //     ifnewElem = false;
        // }

        if (dataObj.open1) {
            carlist.forEach(function (tr) {
                tr.showUI();
            });
        } else {
            carlist.forEach(function (tr) {
                tr.hideUI();
            })
        }
    })
    //open2 道路实时监控功能
    open2.onChange(function (event) {
        if (dataObj.open2) {
            app.camera.flyTo({
                'time': 2000,
                'position': [59.441429944468666, 400.07624016735105, 482.6228115233731],
                'target': [132.911, 5.047, 12.932]
            });
            jk();
        } else {
            flyback();
            marker1.destroy();
            marker2.destroy();
            marker3.destroy();
            marker4.destroy();
            // webView.destroy();
        }

    })
    //open3 可疑车辆报警 功能
    open3.onChange(function (event) {
        var DangerCar = app.query('DangerCar')["0"];
        DangerCar.style.color = 0xE6E6FA;
        var color = DangerCar.style.color;
        if (dataObj.open3) {
            DangerCar.style.color = (color != 0xff0000) ? 0xff0000 : 0x00ff00;
            DangerCar.on('update', function () {
                DangerCar.style.opacity = 1 + 0.5 * Math.sin(2 * app.elapsedTime);
            });
            app.camera.flyTo({
                'time': 2000,
                'position': [33.30794746890674, 44.95908394217915, 341.9365754915797],
                'target': [132.911, 5.047, 12.932]
            });
        } else {
            DangerCar.style.color = color;
            DangerCar.on('update', function () {
                DangerCar.style.opacity = 1;
            });
            flyback();
        }
    })

    //open4 车祸现场 功能
    open4.onChange(function (event) {
        if (dataObj.open4) {
            fly();
        } else {
            flyback();
        }
    })

    //open5 实时路况 功能
    open5.onChange(function (event) {
        groad = app.query('groad')["0"];
        // rroad = app.query('rroad')["0"];
        // rroad.style.color= 0x00ff00;
        groad.style.color = 0x50616d;
        // rroad.style.color = 0x50616d;
        var color = groad.style.color;
        if (dataObj.open5) {
            if (dataObj.open6) {
                dataObj.open6 = false;
            }
            app.camera.flyTo({
                'time': 2000,
                'position': [198.66556139443085, 209.4915953602107, 113.47368591613991],
                'target': [132.911, 5.047, 12.932]
            });
            groad.style.color = (color != 0x00ff00) ? 0x00ff00 : 0x00ff00;
            // rroad.style.color = (color != 0xff0000) ? 0xff0000 : 0x00ff00;
        } else {
            groad.style.color = 0x50616d;
            flyback();
            // rroad.style.color = 0x50616d;
        }
    })
    //open6 交通管制 功能
    open6.onChange(function (event) {
        if (dataObj.open6) {
            if (dataObj.open5) {
                dataObj.open5 = false;
            }
            flyback();
            eastguanzhi();
        } else {
            eastmarker.destroy();
            northmarker.destroy();
        }
    })

    carmove();
}

//封装汽车类
function Carin(obj) {
    this.obj = obj;
}

Carin.prototype.createUI = function (width) {
    // 创建widget (动态绑定数据用)
    var panel = t3d.widget.Panel({
        cornerType: 's2c3',
        width: "140px",
        isClose: false,
        opacity: 0.8,
        media: true
    });
    for (var key in this.info)
        panel.add(this.info, key);
    this.panel = panel;

    // 创建obj ui (跟随物体用)
    var ui = app.create({
        type: 'UI',
        parent: this.obj,
        el: panel.domElement,
        offset: [0, this.height, 0],
        pivot: [0, 1.45]
    });
    this.ui = ui;
    return panel;
}

Carin.prototype.showUI = function () {
    this.createUI();
}

Carin.prototype.hideUI = function (width) {
    this.panel.destroy();
    this.panel = null;
    this.ui.destroy();
    this.ui = null;
}

//监控
function jk() {
    var URLs = [
        'http://www.3dmomoda.com/',
        'http://www.bongiovi.tw/experiments/webgl/blossom/',
        'https://www.baidu.com/',
        'http://www.3dmomoda.com/'
    ];
    for (var i = 0; i < URLs.length; i++) {
        webView = app.create({
            type: 'WebView',
            url: URLs[i],
            position: [60 * i - 20, 300.6763006579103, 100.56044891670818],
            width: 50,
            height: 50
        });
    }
    marker1 = app.create({
        type: "Marker",
        position: [60 * 0 - 20, 270.6763006579103, 100.56044891670818],
        size: 10,
        canvas: createTextCanvas('N'),
    });
    marker2 = app.create({
        type: "Marker",
        position: [60 * 1 - 20, 270.6763006579103, 100.56044891670818],
        size: 10,
        canvas: createTextCanvas('S'),
    });
    marker3 = app.create({
        type: "Marker",
        position: [60 * 2 - 20, 270.6763006579103, 100.56044891670818],
        size: 10,
        canvas: createTextCanvas('E'),
    });
    marker4 = app.create({
        type: "Marker",
        position: [60 * 3 - 20, 270.6763006579103, 100.56044891670818],
        size: 10,
        canvas: createTextCanvas('W'),
    });
    function createTextCanvas(text) {
        let canvas = document.createElement("canvas");
        canvas.width = 90;
        canvas.height = 90;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgb(32, 32, 256)";
        ctx.beginPath();
        ctx.arc(32, 32, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgb(255, 255, 255)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(32, 32, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.font = "32px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 32, 32);
        return canvas;
    }
}

function eastguanzhi() {
    eastmarker = app.create({
        type: "Marker",
        position: [0, 20, 0],
        size: 20,
        url: "https://speech.uinnova.com/static/images/warning1.png",
        parent: app.query('西绿')["0"]
    });
    northmarker = app.create({
        type: "Marker",
        position: [0, 20, 0],
        size: 20,
        url: "https://speech.uinnova.com/static/images/warning1.png",
        parent: app.query('东黄')["0"]
    });
}
function carmove() {
    //qiao car
    var car1 = app.query('Car1')["0"];
    var car2 = app.query('Car')["0"];
    car1.attr('type', 'car');
    car2.attr('type', 'car');
    var cp = 'CarPath_';
    var path1 = [];
    for (i = 45; i > 37; i--) {
        app.query(cp + i)["0"].boxCenter[1] = app.query(cp + i)["0"].boxCenter[1] + 1;
        var carpath = app.query(cp + i)["0"].boxCenter;
        path1.push(carpath);
    }
    for (i = 37; i > 22; i--) {
        app.query(cp + i)["0"].boxCenter[1] = app.query(cp + i)["0"].boxCenter[1] - 0.6;
        var carpath = app.query(cp + i)["0"].boxCenter;
        path1.push(carpath);
    }
    for (i = 22; i >= 0; i--) {
        app.query(cp + i)["0"].boxCenter[1] = app.query(cp + i)["0"].boxCenter[1];
        var carpath = app.query(cp + i)["0"].boxCenter;
        path1.push(carpath);
    }
    car1.movePath({
        'position': path1[0],        // 运动起点
        'orientToPath': true,      // 物体移动时沿向路径方向
        'orientToPathDegree': 170,   // 沿向路径方向偏移一定角度
        'path': path1,               // 路径点数组
        'time': 40000,              // 路径总时间
        'delayTime': 5000,           // 延迟500毫秒后进行
        'loop': true                // 是否循环
    });
    car2.movePath({
        'position': path1[20],        // 运动起点
        'orientToPath': true,      // 物体移动时沿向路径方向
        'orientToPathDegree': 175,   // 沿向路径方向偏移一定角度
        'path': path1,               // 路径点数组
        'time': 40000,              // 路径总时间
        'delayTime': 100,           // 延迟500毫秒后进行
        'loop': true               // 是否循环
    });

    //train
    var train = app.query('Mytrain')["0"];
    train.attr('type', 'car');
    var pathEnd = app.query('pathEnd')["0"];
    var pathStart = app.query('Path2')["0"];
    trainm();
    pathEnd.boxCenter[0] = pathEnd.boxCenter[0] + 1.5;
    pathStart.boxCenter[0] = pathStart.boxCenter[0] - 1.5;
    function trainm() {
        train.moveTo({
            "position": pathEnd.boxCenter,
            "time": 50000,
            "complete": function () {
                train.position = pathStart.boxCenter;
                trainm();
            }
        });
    }

    //danger car
    var cardan = app.query('DangerCar')["0"];
    cardan.attr('type', 'car');
    var cpd = 'DCF_';
    var path2 = [];
    for (i = 25; i >= 0; i--) {
        var carpath = app.query(cpd + i)["0"].boxCenter;
        path2.push(carpath);
    }
    cardan.movePath({
        'position': path2[0],        // 运动起点
        'orientToPath': true,      // 物体移动时沿向路径方向 
        'orientToPathDegree': 0,   // 沿向路径方向偏移一定角度
        'path': path2,               // 路径点数组
        'time': 40000,              // 路径总时间
        'delayTime': 100,           // 延迟500毫秒后进行
        'loop': true             // 是否循环
    });

    app.query("[type=car]").forEach(function (obj) {
        carlist.push(new Carin(obj));
    });
    carlist["0"].info = { "车型": "地铁", "车牌": "京A1001" };
    carlist["2"].info = { "车型": "小型轿车", "车牌": "京A12345" };
    carlist["1"].info = { "车型": "小型轿车", "车牌": "京B15498" };
    carlist["3"].info = { "车型": "小型轿车", "车牌": "京Q873C4" };
}

//飞到车祸现场
function fly() {
    app.camera.flyTo({
        'time': 2000,
        'position': [150.0083162521505, 9.340043316633857, 27.9274751083344],
        'target': [132.911, 5.047, 12.932]
    });
}

//飞回初始位置
function flyback() {
    app.camera.flyTo({
        'time': 2000,
        'position': [283.8292705538403, 53.920841703049945, -18.104377283044684],
        'target': [132.911, 5.047, 12.932]
    });
}

