var app;
if (!baseurl) {
    if(window.location.href.indexOf('guide')){
        var baseurl = '../../../demos/subway/';
    }else{
        var baseurl = '';
    }
}
uiinit();
app = new t3d.App({
    el: "div3d",
    skyBox: 'SunCloud',
    url: "https://uinnova-model.oss-cn-beijing.aliyuncs.com/scenes/subway",
});

app.on('load', function () {

    // 初始化
    init();

    // 引导提示
    // startIntro(subwaySteps);
    app.stateManager.change('OutdoorsLevel');
});

// 进入 outdoors 后
app.on('enterOutdoorsLevel', function (ev) {
    console.log('进入 Outdoors...');

    app.skyBox = "SunCloud";

    // 隐藏建筑
    app.buildings[0].visible = false;

    // 摄影机飞到合适位置
    app.camera.flyTo(globals.camera_focus.start);

    // 为出口显示牌子
    globals.tempDom.innerHTML = '';
    add_panel_2obj(app.query('[outdoor=exit]'), 'mark_blue');
});

// 进入 building 后
app.on('enterBuildingLevel', function (ev) {
    console.log('进入 Building...');

    app.buildings[0].visible = true;
    app.background = 0x00000000;
    app.camera.flyTo(globals.camera_focus.building);
    globals.tempDom.innerHTML = '';
});

// 进入某 floor 后
app.on('enterFloorLevel', function (ev) {
    console.log('进入 Floor...');
    app.background = 0x00000000;

    app.buildings[0].visible = true;
    globals.tempDom.innerHTML = '';
    var floors = app.buildings[0].floors;
    var index = floors.length - ev.state.floor.indexOfBuilding;
    add_panel_2obj(app.query('[b' + index + '=exit]'), 'mark_yellow')
});

//-----------------------------------------------
// 初始化
var globals = {};
function init() {
    // 导航面板的对象
    globals.mainTree = {
        buildings: [{
            name: "地铁站",
            floors: [
                { name: "B3", },
                { name: "B2", },
                { name: "B1", }
            ]
        }]
    }

    // 创建导航面板
    create_mainpanel();

    globals.camera_focus = {
        start: {
            position: [-116, 138, -104],
            target: [-12, -29, -33],
            time: 1000
        },
        left: {
            position: [30.34, 79.36, -252.177],
            target: [41.33, 2.63, -37.31],
            time: 1000
        },
        right: {
            position: [112.54, 120.58, 144.88],
            target: [41.34, 2.63, -37.31],
            time: 1000
        },
        building: {
            position: [-100, 160, 175],
            target: [-29, -9, 15],
            time: 1000
        }
    }

    // 创建装面板的 div ,便于管理
    globals.tempDom = app.domElement.appendChild(document.createElement('div'));
}

//-----------------------------------------------
// 界面

// 创建导航面板
function create_mainpanel() {
    var main_panel = new dat.gui.GUI({
        type: 'nav-md1'
    });

    // 创建导航树面板
    main_panel.addAppTree('全景', globals.mainTree);
    main_panel.addTree('左视角');
    main_panel.addTree('右视角');

    main_panel.treeBind('click', function (o, target) {

        main_panel.highLight(target);

        if (o.hasOwnProperty('name')) {
            var name = o.name;
            if (name == '地铁站') {
                var building = app.buildings[0];
                app.stateManager.change('BuildingLevel', { building, needUnloadScene: false });
            } else {
                var index = name.substr(1, 1);
                var floors = app.buildings[0].floors;
                var floor = floors[floors.length - index];
                app.stateManager.change('FloorLevel', { floor, needUnloadScene: false });
            }
        } else {
            app.stateManager.change('OutdoorsLevel');
            if (o == '左视角') {
                app.camera.flyTo(globals.camera_focus.left);
            } else if (o == '右视角') {
                app.camera.flyTo(globals.camera_focus.right);
            } else if (o == "全景") {
                app.camera.flyTo(globals.camera_focus.start);
            }
        }
    });
}

// 为出口添加 panel
function add_panel_2obj(things, eleID) {
    var panelEle = document.getElementById(eleID);
    things.forEach(function (obj) {
        var ele = panelEle.cloneNode(true);
        var text = ele.children[0];

        if (obj.name.indexOf("Entrance") > -1) {
            text.innerHTML = "Entrance";
        } else {
            // 设置顶牌内容
            var name = obj.name;
            var index = name.indexOf('_');
            var name = name.substr(index + 1);
            text.innerHTML = name;
        }

        text.style.fontSize = 8 + 'px';
        globals.tempDom.appendChild(ele);
        ele.style.display = 'block';
        ele.style.zIndex = 10;

        panel = app.create({
            type: "UI",
            el: ele,
            parent: obj,
            offset: [0, 0, 0],
            pivot: [0.2, 1]
        });
    });
}

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
        height: 100%;\
      }\
      .signboard_subway {\
        background-image: url(\""+ baseurl + "images/sprite_blue.png\");\
        background-size: contain;\
        height: 150px;\
        width: 75px;\
        position: absolute;\
        top: 0;\
        left: 0;\
        display: none;\
      }\
      .image_blue {\
        background: url(\""+ baseurl + "images/sprite_blue.png\") no-repeat center;\
        background-size: contain;\
      }\
      .image_yellow {\
        background: url(\""+ baseurl + "images/sprite_yellow.png\") no-repeat center;\
        background-size: contain;\
      }\
      .panel{\
        position: absolute;\
        top: 3px;\
        left: 20px;\
      }"
    document.getElementById('div3d').innerHTML = "<div class=\"signboard_subway image_blue\" id=\"mark_blue\">\
    <span class=\"panel\" style=\"padding-left: 0px;width: 50px;height: 20px\"  >Exit 1</span>\
</div>\
<div class=\"signboard_subway image_yellow\" id=\"mark_yellow\">\
    <span class=\"panel\" style=\"padding-left: 0px;width: 50px;height: 20px\"  >Exit 1</span>\
</div>"
}

