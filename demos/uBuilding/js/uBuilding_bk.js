var app, uBuilding = [];
if (!baseurl) {
    if (window.location.href.indexOf('guide')) {
        var baseurl = '../../../demos/uBuilding/';
    } else {
        var baseurl = '';
    }
}

// 创建App
cssinit("https://speech.uinnova.com/static/liangyw/intro/introjs.css");
uiinit();
app = new THING.App({
    el: 'div3d',
    url: "https://uinnova-model.oss-cn-beijing.aliyuncs.com/scenes/uinnova",
    skyBox: 'BlueSky',
    // url: "./models/uinnova",
    // url:"https://speech.uinnova.com/static/models/uinnova"
});

// 加载场景后执行
app.on('load', function () {
    init(); // 初始化场景
    show_all(); // 显示所有楼层
});

function cssinit(url) {
    var link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", url);
    var heads = document.getElementsByTagName("head");
    if (heads.length)
        heads[0].appendChild(link);
    else
        document.documentElement.appendChild(link);
}
function uiinit() {
    var style = document.createElement('style');
    document.body.appendChild(style);
    style.innerHTML = "body {\
        margin: 0;\
        overflow: hidden;\
      }\
      canvas {\
        width: 100%;\
        height: 100%\
      }\
      .signboard_uBuilding {\
        width: 120px;\
        position: absolute;\
        top: 0;\
        left: 0;\
        display: none;\
      }\
      #alertMsg {\
        display: none;\
        width: 400px;\
        border: 1px solid #ddd;\
        border-radius: 5px;\
        box-shadow: 1px 1px 10px black;\
        padding: 10px;\
        font-size: 12px;\
        position: absolute;\
        text-align: center;\
        background: #fff;\
        z-index: 100000;\
      }\
      #alertMsg_info {\
        padding: 2px 15px;\
        line-height: 1.6em;\
        text-align: left;\
      }\
      #alertMsg_btn1, #alertMsg_btn2 {\
        display: inline-block;\
        background:  no-repeat left top;\
        padding-left: 3px;\
        color: #000000;\
        font-size: 12px;\
        text-decoration: none;\
        margin-right: 10px;\
        cursor: pointer;\
      }\
      #alertMsg_btn1 cite, #alertMsg_btn2 cite {\
        line-height: 24px;\
        display: inline-block;\
        padding: 0 13px 0 10px;\
        background:  no-repeat right top;\
        font-style: normal;\
      }"
    document.getElementById('div3d').innerHTML = "<div class=\"signboard_uBuilding\" id=\"imageTest\">\
    <img src=\""+ baseurl + "images/quan.png\" width=\"50\" height=\"50\" alt=\"\">\
    </div>"
}

function init() {

    uBuilding.div3d = document.getElementById('div3d');

    // 界面的类
    var uiInterface = new MainPanel(app);
    // uiInterface.createUIOnObjs();   // 创建物体挂的面板

    uBuilding.main_panel = uiInterface.main_panel;
    uBuilding.gui_panels = uiInterface.gui_panels;

    uBuilding.toggle_2d = uiInterface.toggle_2d;

    uBuilding.showpanels_XFS = true;
    uBuilding.showpanels_XFSX = true;
    uBuilding.showpanels_PYFJ = true;

    uBuilding.curNum = 0;            // 当前聚焦的楼层,为了高光导航面板

    uBuilding.canWarnning = true;
    uBuilding.timer = null;

    set_main_panel();
}

// 给导航面板添加点击事件
function set_main_panel() {
    // 绑定 导航树 事件
    uBuilding.main_panel.treeBind('click', function (obj) {
        if (obj == '消防水箱') {
            // 显示/隐藏 panel 名字为 obj 的面板
            uBuilding.showpanels_XFSX = !uBuilding.showpanels_XFSX;
            for (var i = 0; i < uBuilding.gui_panels.length; i++) {
                if (uBuilding.gui_panels[i].name === '消防水箱')
                    uBuilding.gui_panels[i].show(uBuilding.showpanels_XFSX);
            }
        } else if (obj == '排烟风机') {
            uBuilding.showpanels_PYFJ = !uBuilding.showpanels_PYFJ;
            for (var i = 0; i < uBuilding.gui_panels.length; i++) {
                if (uBuilding.gui_panels[i].name === '排烟风机')
                    uBuilding.gui_panels[i].show(uBuilding.showpanels_PYFJ);
            }
        } else if (obj == '消防栓') {
            uBuilding.showpanels_XFS = !uBuilding.showpanels_XFS;
            for (var i = 0; i < uBuilding.gui_panels.length; i++) {
                if (uBuilding.gui_panels[i].name === '消防栓')
                    uBuilding.gui_panels[i].show(uBuilding.showpanels_XFS);
            }
        } else if (obj == '警报') {
            // 弹出框
            if (uBuilding.canWarnning) {
                uBuilding.canWarnning = false;
                setTimeout("alertWindow()", 0);
            }
        } else if (obj == '2D') {
            // 删除 2D 标签
            uBuilding.main_panel.removeFolder(uBuilding.toggle_2d);
            uBuilding.toggle_3d = uBuilding.main_panel.addTree('3D');
            app.camera.toggle3D = false;
        } else if (obj == '3D') {
            // 删除 3D 标签
            uBuilding.main_panel.removeFolder(uBuilding.toggle_3d);
            uBuilding.toggle_2d = uBuilding.main_panel.addTree('2D');
            app.camera.toggle3D = true;
        } else if (obj.hasOwnProperty('name')) {
            if (obj.name.indexOf('F') > -1) {
                app.camera.orbit.enableRotate = true;
                var num = obj.name.substring(0, 1);
                show_floor(num);
            } else {
                show_all();
                app.camera.orbit.enableRotate = true;
                if (uBuilding.toggle_3d != null) {
                    if (uBuilding.toggle_3d.domElement != null) {
                        uBuilding.main_panel.removeFolder(uBuilding.toggle_3d);
                        uBuilding.toggle_2d = uBuilding.main_panel.addTree('2D');
                    }
                }
            }
        } else {
            uBuilding.curNum = 0;
            show_all();
            app.camera.orbit.enableRotate = true;
            if (uBuilding.toggle_3d != null) {
                if (uBuilding.toggle_3d.domElement != null) {
                    uBuilding.main_panel.removeFolder(uBuilding.toggle_3d);
                    uBuilding.toggle_2d = uBuilding.main_panel.addTree('2D');
                }
            }
        }
        if (uBuilding.curNum > 0)
            uBuilding.main_panel.pathHighLight('全景.Buildings.' + uBuilding.curNum + 'F');
        uBuilding.div3d.insertBefore(uBuilding.main_panel.domElement, uBuilding.div3d.lastChild);
    })
}

function alertWindow() {
    uBuilding.canClick = true;
    alertMsg("检测到异常，是否查看", 1, "Warning");
}

// 聚焦某层
function show_floor(num) {

    // 隐藏外立面
    app.buildings[0].facades[0].visible = false;

    // 避免 2d/3d 切换楼
    if (uBuilding.toggle_3d != null) {
        if (uBuilding.toggle_3d.domElement != null) {
            uBuilding.main_panel.removeFolder(uBuilding.toggle_3d);
            uBuilding.toggle_2d = uBuilding.main_panel.addTree('2D');
        }
    }
    uBuilding.curNum = num;

    uBuilding.main_panel.pathHighLight('全景.Buildings.' + uBuilding.curNum + 'F');

    var floors = app.buildings[0].floors;
    for (var i = 0; i < floors.length; i++) {
        floors[i].visible = false;
    }
    floors[num].visible = true;
    floors[num].showRoof(false);

    var pos = app.buildings[0].position;
    app.camera.flyTo({
        position: [pos[0] - 3, pos[1] + 20.28 + (num - 1) * 2.5, pos[2] + 56],
        target: [pos[0], pos[1] + (num - 1) * 6, pos[2] + 15.76],
        time: 1200
    });
}

// 显示全景
function show_all() {

    app.buildings[0].facades[0].visible = true;

    var floors = app.buildings[0].floors;

    for (var i = 0; i < floors.length; i++) {
        floors[i].visible = true;
    }

    var pos = app.buildings[0].position;
    app.camera.flyTo({
        position: [pos[0] + 3, pos[1] + 43.21, pos[2] + 80],
        target: pos,
        time: 1200
    });
}

// 警报
function alert_window() {
    uBuilding.canWarnning = true;
    alertMsg("检测到异常，是否查看", 1, "Warning");
}

// 警报后(这里应该可以优化下)
function warning() {
    app.camera.orbit.enableRotate = true;
    if (uBuilding.toggle_3d != null) {
        if (uBuilding.toggle_3d.domElement != null) {
            guiMd.removeFolder(uBuilding.toggle_3d);
            uBuilding.toggle_2d = guiMd.addTree('2D');
        }
    }
    var objName = ["消防栓", "消防水箱", "排烟风机"];
    var objs = app.query('[物体类型=' + objName[rnd(0, objName.length - 1)] + ']')
    var obj = objs[0];
    img = document.getElementById('imageTest');
    img.style.zIndex = 1;
    var tt = app.create({
        type: 'Box',
        width: 0.1,
        height: 0.1,
        depth: 0.1,
        position: obj.position,
    });
    app.create({
        type: 'UI',
        parent: tt,
        el: img,
        offset: [0, tt.size[1], 0],
        pivot: [0.5, 1]
    })
    var i = 0;
    clearInterval(uBuilding.timer);
    uBuilding.timer = setInterval(function () {
        img.style.display = i++ % 2 ? "none" : "block";
        i > 1000 && clearInterval(uBuilding.timer);
        if (i > 1000) {
            img.style.display = "none";
        }
    }, 500);
}

function rnd(n, m) {
    var random = Math.floor(Math.random() * (m - n + 1) + n);
    return random;
}
function alertMsg(msg, mode, fn) { //mode为空，即只有一个确认按钮，mode为1时有确认和取消两个按钮
    msg = msg || '';
    mode = mode || 0;
    var top = document.body.scrollTop || document.documentElement.scrollTop;
    var isIe = (document.all) ? true : false;
    var isIE6 = isIe && !window.XMLHttpRequest;
    var sTop = document.documentElement.scrollTop || document.body.scrollTop;
    var sLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    var winSize = function () {
        var xScroll, yScroll, windowWidth, windowHeight, pageWidth, pageHeight;
        // innerHeight获取的是可视窗口的高度，IE不支持此属性
        if (window.innerHeight && window.scrollMaxY) {
            xScroll = document.body.scrollWidth;
            yScroll = window.innerHeight + window.scrollMaxY;
        } else if (document.body.scrollHeight > document.body.offsetHeight) { // all but Explorer Mac
            xScroll = document.body.scrollWidth;
            yScroll = document.body.scrollHeight;
        } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
            xScroll = document.body.offsetWidth;
            yScroll = document.body.offsetHeight;
        }

        if (self.innerHeight) {    // all except Explorer
            windowWidth = self.innerWidth;
            windowHeight = self.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
            windowWidth = document.documentElement.clientWidth;
            windowHeight = document.documentElement.clientHeight;
        } else if (document.body) { // other Explorers
            windowWidth = document.body.clientWidth;
            windowHeight = document.body.clientHeight;
        }

        // for small pages with total height less then height of the viewport
        if (yScroll < windowHeight) {
            pageHeight = windowHeight;
        } else {
            pageHeight = yScroll;
        }

        // for small pages with total width less then width of the viewport
        if (xScroll < windowWidth) {
            pageWidth = windowWidth;
        } else {
            pageWidth = xScroll;
        }

        return {
            'pageWidth': pageWidth,
            'pageHeight': pageHeight,
            'windowWidth': windowWidth,
            'windowHeight': windowHeight
        }
    }();

    //alert(winSize.pageWidth);
    //遮罩层
    var styleStr = 'top:0;left:0;position:absolute;z-index:10000;background:#666;width:' + winSize.pageWidth + 'px;height:' + (winSize.pageHeight + 30) + 'px;';
    styleStr += (isIe) ? "filter:alpha(opacity=80);" : "opacity:0.8;"; //遮罩层DIV
    var shadowDiv = document.createElement('div'); //添加阴影DIV
    shadowDiv.style.cssText = styleStr; //添加样式
    shadowDiv.id = "shadowDiv";

    //如果是IE6则创建IFRAME遮罩SELECT
    if (isIE6) {
        var maskIframe = document.createElement('iframe');
        maskIframe.style.cssText = 'width:' + winSize.pageWidth + 'px;height:' + (winSize.pageHeight + 30) + 'px;position:absolute;visibility:inherit;z-index:-1;filter:alpha(opacity=0);';
        maskIframe.frameborder = 0;
        maskIframe.src = "about:blank";
        shadowDiv.appendChild(maskIframe);
    }
    document.body.insertBefore(shadowDiv, document.body.firstChild); //遮罩层加入文档
    //弹出框
    var styleStr1 = 'display:block;position:fixed;_position:absolute;left:' + (winSize.windowWidth / 2 - 200) + 'px;top:' + (winSize.windowHeight / 2 - 150) + 'px;_top:' + (winSize.windowHeight / 2 + top - 150) + 'px;'; //弹出框的位置
    var alertBox = document.createElement('div');
    alertBox.id = 'alertMsg';
    alertBox.style.cssText = styleStr1;
    //创建弹出框里面的内容P标签
    var alertMsg_info = document.createElement('P');
    alertMsg_info.id = 'alertMsg_info';
    alertMsg_info.innerHTML = msg;
    alertBox.appendChild(alertMsg_info);
    //创建按钮
    var btn1 = document.createElement('a');
    btn1.id = 'alertMsg_btn1';
    btn1.href = 'javas' + 'cript:void(0)';
    btn1.innerHTML = '<cite>确认</cite>';
    btn1.onclick = function () {
        document.body.removeChild(alertBox);
        document.body.removeChild(shadowDiv);
        // window[fn].call(this);
        warning();
        return true;
    };

    alertBox.appendChild(btn1);
    if (mode === 1) {
        var btn2 = document.createElement('a');
        btn2.id = 'alertMsg_btn2';
        btn2.href = 'javas' + 'cript:void(0)';
        btn2.innerHTML = '<cite>取消</cite>';
        btn2.onclick = function () {
            document.body.removeChild(alertBox);
            document.body.removeChild(shadowDiv);
            return false;
        };
        alertBox.appendChild(btn2);
    }
    document.body.appendChild(alertBox);
}


class MainPanel {
    constructor(app) {
        this.app = app;

        // 导航面板的对象
        this.main_tree = {
            buildings: [{
                name: "建筑",
                floors: [
                    { name: "1F", },
                    { name: "2F", },
                    { name: "3F", },
                    { name: "4F", },
                    { name: "5F", }
                ]
            }],
            outdoor: { name: '室外' }
        }
        this.main_panel = null;

        this.toggle_2d = null;

        this.gui_panels = [];

        this.showpanels_XFS = true;
        this.showpanels_XFSX = true;
        this.showpanels_PYFJ = true;

        this.init();
    }

    // 创建导航面板
    init() {

        // this.createPanels();       // 创建出 gui 的面板
        this.createUIOnObjs();        // 创建出 gui 的面板

        var main_panel = new dat.gui.GUI({
            type: 'nav-md1'
        });

        // 设置面板 位置 (left/bottom/right/top)
        main_panel.setPosition(0, null, null, 0);

        // 创建导航树
        main_panel.addAppTree('全景', this.main_tree);
        main_panel.addTree('消防水箱');
        main_panel.addTree('排烟风机');
        main_panel.addTree('消防栓');
        main_panel.addTree('警报');
        this.toggle_2d = main_panel.addTree('2D');
        main_panel.setZIndex(10);
        this.main_panel = main_panel;
    }

    // 根据不同类型创建样式
    createPanels(type) {
        var obj = {};
        var div3d = document.getElementById('div3d');
        var gui = new t3d.widget.Panel({
            template: '0',
            width: '120px',
            name: type,
            isClose: true,//close属性配置是否有关闭按钮，默认没有，是为true，否为false
            opacity: 0.8,
        });
        div3d.insertBefore(gui.domElement, div3d.lastChild);
        gui.setZIndex(10);
        gui.show(true);
        gui.setOpacity(0.9);
        gui.remember(obj);
        switch (type) {
            case "消防栓":
                obj = {
                    hydraulicPressure: '0.14MPa'
                };
                gui.add(obj, 'hydraulicPressure').name('水压');
                gui.__closeButton.onclick = function () {
                    this.showpanels_XFS = false;
                }
                break;
            case "消防水箱":
                obj = {
                    waterlevel: '2.5米'
                };
                gui.add(obj, 'waterlevel').name('水位');
                gui.__closeButton.onclick = function () {
                    this.showpanels_XFSX = false;
                }
                break;
            case "排烟风机":
                obj = {
                    radio: 'on'
                };
                gui.addRadio(obj, 'radio', ['on', 'off']);
                gui.__closeButton.onclick = function () {
                    this.showpanels_PYFJ = false;
                }
                break;
        }
        this.gui_panels.push(gui);
        return gui;
    }

    // 为3d物体添加面板
    createUIOnObj(objs) {
        var that = this;
        objs.forEach(function (obj) {
            that.app.create({
                type: 'UI',
                parent: obj,
                el: that.createPanels(obj.custom.物体类型).domElement,
                offset: [0, 1, 0],
                pivot: [0.5, 1]
            })
        })
    }

    // 收集需要加面板的 obj 并为其添加面板
    createUIOnObjs() {
        this.createUIOnObj(app.query('[物体类型=消防栓]'));
        this.createUIOnObj(app.query('[物体类型=消防水箱]'));
        this.createUIOnObj(app.query('[物体类型=排烟风机]'));
    }
}
