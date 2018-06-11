// 创建App
initCSS("https://speech.uinnova.com/static/liangyw/intro/introjs.css");

var app = new THING.App({
    el: 'div3d',
    url: "https://uinnova-model.oss-cn-beijing.aliyuncs.com/scenes/uinnova",
    skyBox: 'BlueSky'
});

// 加载场景后执行
var building = null,mainPanel;
app.on('load', function () {
    building = app.buildings[0];
    mainPanle = new MainPanel(app);// 界面的类
    setupNavpanel();
    app.stateManager.change('OutdoorsLevel');
});

// 注册 进入室外 事件
app.on('enterOutdoorsLevel', function (ev) {
    building.facades[0].visible = true;  // 显示外立面

    var pos = building.position;
    app.camera.flyTo({
        position: [pos[0] + 3, pos[1] + 43.21, pos[2] + 80],
        target: pos,
        time: 1200
    });
});

// 注册 进入建筑 事件
app.on('enterBuildingLevel', function (ev) {
    building.facades[0].visible = false; // 隐藏外立面
});

// 注册 进入楼层 事件
app.on('enterFloorLevel', function (ev) {
    building.facades[0].visible = false; // 隐藏外立面
    var num = ev.state.floor.indexOfBuilding;
    var pos = building.position;
    app.camera.flyTo({
        position: [pos[0] - 3, pos[1] + 20.28 + (num - 1) * 2.5, pos[2] + 56],
        target: [pos[0], pos[1] + (num - 1) * 6, pos[2] + 15.76],
        time: 1200
    });
});

function initCSS(url) {
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

// 给导航面板添加点击事件
function setupNavpanel() {
    var navPanel = mainPanle.createNavPanel();
    navPanel.treeBind('click', function (obj) { // 绑定 导航树 事件
        if (obj == '全景') {
            app.stateManager.change('OutdoorsLevel');
        } else {
            if (obj.name.indexOf('层') > -1) {
                var num = obj.name.substring(0, 1);
                var floor = building.floors[num];
                navPanel.pathHighLight('全景.建筑.' + num + '层');
                app.stateManager.change('FloorLevel', { floor, needUnloadScene: false });
            } else {
                navPanel.pathHighLight('全景.' + obj.name);
                app.stateManager.change('OutdoorsLevel');
            }
        }
    })
}

class MainPanel {
    constructor(app) {
        this.app = app;
        this.nav_tree = {   // 导航树对象
            buildings: [{ name: "建筑", floors: [{ name: "1层", }, { name: "2层", }, { name: "3层", }, { name: "4层", }, { name: "5层", }] }],
            outdoor: { name: '室外' }
        }
        this.panels_xfs = [];
        this.panels_xfsx = [];
        this.panels_pyfj = [];

        this.toolBar = null;
        this.toolImgs = {};
        this.isExpandBuilding = false;

        this.createUIOnObjs();        // 创建 gui 面板
        this.createToolsPanel();

        this.building = this.app.buildings[0];
    }

    // 创建导航面板
    createNavPanel() {
        var main_panel = new THING.widget.NavPanel();
        main_panel.setPosition(0, null, null, 0);  // 设置面板 位置 (left/bottom/right/top)
        main_panel.addAppTree('全景', this.nav_tree); // 创建导航树
        return main_panel;
    }

    // 创建工具面板
    createToolsPanel() {
        var that = this;
        var baseURL = "http://47.93.162.148:8081/liangyw/images/button/";
        this.toolBar = THING.widget.ToolBar({ media: true });
        this.toolBar.data = { xfsx: false, pyfj: false, xfs: false, enterBuilding: false, expandBuilding: false };
        this.toolBar.setPosition({ right: 0, top: 60 });
        this.toolImgs.img0 = this.toolBar.addImageBoolean(this.toolBar.data, 'xfsx').name('消防水箱').imgUrl(baseURL + 'warehouse_code.png');
        this.toolImgs.img1 = this.toolBar.addImageBoolean(this.toolBar.data, 'pyfj').name('排烟风机').imgUrl(baseURL + 'temperature.png');
        this.toolImgs.img2 = this.toolBar.addImageBoolean(this.toolBar.data, 'xfs').name('消防栓').imgUrl(baseURL + 'humidity.png');
        this.toolImgs.img3 = this.toolBar.addImageBoolean(this.toolBar.data, 'enterBuilding').name('进入建筑').imgUrl(baseURL + 'statistics.png');
        this.toolImgs.img4 = this.toolBar.addImageBoolean(this.toolBar.data, 'expandBuilding').name('楼层展开').imgUrl(baseURL + 'cereals_reserves.png');

        this.toolImgs.img0.onChange(function (boolValue) { that.onChangeImageButton('xfsx', boolValue); });
        this.toolImgs.img1.onChange(function (boolValue) { that.onChangeImageButton('pyfj', boolValue); });
        this.toolImgs.img2.onChange(function (boolValue) { that.onChangeImageButton('xfs', boolValue); });
        this.toolImgs.img3.onChange(function (boolValue) { that.onChangeImageButton('enterBuilding', boolValue); });
        this.toolImgs.img4.onChange(function (boolValue) { that.onChangeImageButton('expandBuilding', boolValue); });
    }

    // 处理工具条按钮
    onChangeImageButton(key, boolValue) {
        var that = this;
        if (key == "enterBuilding") { // 进入建筑/室外
            this.resetExpand();
            var name = boolValue ? '进入室外' : '进入建筑';
            this.toolImgs.img3.name(name);
            if (boolValue)
                this.app.stateManager.change('BuildingLevel');
            else
                this.app.stateManager.change('OutdoorsLevel');

        } else if (key == "expandBuilding") { // 楼层横向展开
            this.app.stateManager.change('BuildingLevel'); // 进入建筑
            if (boolValue) {
                this.building.expandFloors({
                    'time': 1000,
                    'length': 10,
                    'horzMode': false,
                    'hideRoof': true,
                    'complete': function () { that.isExpandBuilding = true; }
                })
            } else {
                this.building.unexpandFloors({
                    'time': 500,
                    'complete': function () { that.isExpandBuilding = false; }
                })
            }
            
        } else {
            this.resetExpand();
            this.app.stateManager.change('OutdoorsLevel'); // 进入室外
            if (key == "xfsx") { // 消防水箱
                this.panels_xfsx.forEach(function (panel) { panel.show(boolValue); });
            } else if (key == "pyfj") { // 排烟风机
                this.panels_pyfj.forEach(function (panel) { panel.show(boolValue); });
            } else if (key == "xfs") { // 消防栓
                this.panels_xfs.forEach(function (panel) { panel.show(boolValue); });
            }
        }
    }

    // 展开的楼层收回去
    resetExpand() {
        var that = this;
        if (this.isExpandBuilding) {
            this.toolBar.data.expandBuilding = false;
            this.building.unexpandFloors({
                'time': 500,
                'complete': function () { that.isExpandBuilding = false; }
            })
        }
    }

    // 根据不同类型创建样式
    createPanels(type) {
        var obj = {};
        var that = this;
        var gui = new t3d.widget.Panel({ template: '0', width: '120px', name: type, opacity: 0.8, });
        gui.remember(obj);
        gui.show(false);
        switch (type) {
            case "消防栓":
                obj = { hydraulicPressure: '0.14MPa' };
                gui.add(obj, 'hydraulicPressure').name('水压');
                that.panels_xfs.push(gui);
                break;
            case "消防水箱":
                obj = { waterlevel: '2.5米' };
                gui.add(obj, 'waterlevel').name('水位');
                that.panels_xfsx.push(gui);
                break;
            case "排烟风机":
                obj = { state: '开' };
                gui.add(obj, 'state').name('状态');
                that.panels_pyfj.push(gui);
                break;
        }
        return gui;
    }

    // 为3d物体添加面板
    createUIOnObj(objs) {
        var that = this;
        objs.forEach(function (obj) {
            that.app.create({
                type: 'UI',
                parent: obj,
                el: that.createPanels(obj.custom['物体类型']).domElement,
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