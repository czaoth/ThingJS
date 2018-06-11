var app;
app = new t3d.App({
    el: "div3d",
    url: "https://uinnova-model.oss-cn-beijing.aliyuncs.com/scenes/huawei", // 模型场景的url
});

app.on('load', function () {
    init();
});

// ------------------------------------------------------------------------
// 初始化
var globals = {};
function init() {
    document.body.oncontextmenu = function (evt) { // 屏蔽鼠标右键系统菜单
        evt = evt || event;
        evt.returnValue = false;
        return false;
    };

    globals.floor = app.buildings[0].floors[0];

    globals.floor.showRoof(false); // 隐藏屋顶
    globals.floor.showMisc(false); // 隐藏房顶杂物

    globals.cabinets = globals.floor.query(/Cabinet_/);
    globals.racks = globals.floor.query(/device/);

    globals.currentCabinet = null;  // 当前开门的机柜
    globals.cabinetPanel = null;  // 机柜的panel
    globals.rackPanel = null;   // 设备的panel

    // 移动摄像机到指定机柜
    globals.cabinets.on('singleclick', function () {
        var cabinet = this;

        // 先关闭当前开着的机柜,再飞向本次点击机柜
        if (globals.currentCabinet) {
            globals.currentCabinet.playAnimation({
                'name': ['close1', 'close2']
            });
        }

        // 重新设置当前操作的机柜
        globals.currentCabinet = cabinet;

        // 删除UI
        clear_panels();

        // 设置摄像机飞行的位置,以及panel的位置
        var pos, temp;
        switch (cabinet.attr('排')) {
            case '1': pos = [-5.8, 7.06, -7.73]; temp = -2; break;
            case '2': pos = [-7, 10, 4.8]; temp = 4; break;
        }
        app.camera.flyTo({
            position: pos,
            target: cabinet.position,
            time: 1000
        });

        create_cabinet_panel(cabinet, temp);
        globals.currentCabinet.playAnimation({
            'name': ['open1', 'open2']
        });   // 开启动画
    });

    // 给设备添加点击事件
    globals.racks.on('singleclick', function () {
        var device = this;
        clear_panels();
        var num = device.name.substr(7);
        create_rack_panel(device, num);
    });
}

// ------------------------------------------------------------------------
// 界面
function create_cabinet_panel(racks, temp) {

    var obj = { "架式设备信息": {} }

    var data1 = { info: "", powerMaxsize: 1500, bearingMaxsize: 60, uHeightMaxsize: 9 }
    var data2 = { info: "", listName: "", c0: "", c1: "", c2: "" }

    var panel = new THING.widget.Panel({
        name: '6F-19',
        isClose: true,
        width: '320px',
        opacity: 0.7,
        hasTitle: true,
        zIndex: -1
    });

    panel.addTab(obj);
    panel.add(data1, 'info').name("容量情况").link('架式设备信息');
    panel.add(data1, 'powerMaxsize').name('功耗(W)').step(1).min(0).max(7000).link('架式设备信息');
    panel.add(data1, 'bearingMaxsize').name('承重(KG)').step(1).min(0).max(1000).link('架式设备信息');
    panel.add(data1, 'uHeightMaxsize').name('U高(U)').step(1).min(0).max(42).link('架式设备信息');
    panel.add(data2, 'info').name("设备信息").link('架式设备信息');
    panel.setPosition(-200, 0, null, null);

    globals.cabinetPanel = app.create({
        type: "UI",
        parent: racks,
        el: panel.domElement,
        offset: [temp, 0, 2],
        pivot: [0.2, 1]
    });

    // 给关闭按钮添加点击事件
    panel.__closeButton.onclick = function () {
        globals.cabinetPanel.destroy();
        globals.cabinetPanel = null;
    }
}

function create_rack_panel(device, num) {
    var obj = { "Info1": {}, "Info2": {} };

    var data1 = { num: 'YC' + num.toString(), name: 'globals', belong: '6F-19', type: "RH2288_V3", upos: 38 };

    var panel = new THING.widget.Panel({
        name: 'globals',
        isClose: true,
        width: '200px',
        hasTitle: true
    });
    panel.setPosition(-200, 0, null, null);  // 防止初始创建闪一下
    panel.addTab(obj);
    panel.add(data1, 'num').name("编号").link('Info1');
    panel.add(data1, 'name').name("名称").link('Info1');
    panel.add(data1, 'belong').name("所属").link('Info1');
    panel.add(data1, 'type').name("设备型号").link('Info1');
    panel.add(data1, 'upos').name("U位").link('Info1');

    globals.rackPanel = app.create({
        type: "UI",
        parent: device,
        el: panel.domElement,
        offset: [0, 0.5, 0],
        pivot: [0.2, 1]
    })

    panel.__closeButton.onclick = function () {
        globals.rackPanel.destroy();
        globals.rackPanel = null;
    }
}

function clear_panels() {
    if (globals.rackPanel != null) {
        globals.rackPanel.destroy();
        globals.rackPanel = null;
    }
    if (globals.cabinetPanel != null) {
        globals.cabinetPanel.destroy();
        globals.cabinetPanel = null;
    }
}
