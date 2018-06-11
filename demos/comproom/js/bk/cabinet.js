// 设备模型
const RackModels = [
    'models/room1/racks/20150426930174',
    'models/room1/racks/20150426959977',
    'models/room1/racks/20150722067844',
    'models/room1/racks/20160715163534359958732'
];

const CABINET_DEFAULT_UNITCOUNT = 42; // 默认机柜u数
const RACK_UNIT_HEIGHT = 0.0445; // 1u为4.3厘米

const BarGraphColors = ['#0000ff', '#00ffff', '#00ff00', '#ff0000', '#ff00ff', '#ffff00'];

/**
 * Rack
 * @author larrow 2017.05.02
 */
class Rack extends THING.Thing {
    constructor(app) {
        super(app);
        this.isRack = true;
        this.info = gen_rack_info();
    }

    setup(param) {
        super.setup(param);

        // 记录下初始位置

        var rack = this;
        this.on('mouseon', function () {
            this.style.outlineColor = '#ff0000';
        });
        this.on('mouseoff', function () {
            this.style.outlineColor = null;
        });

        this.on('click', function() {
            if (Rack.current == this)
                return;

            if (Rack.current) {
                Rack.current.showUI(false);
                Rack.current = null;
            }
            Rack.current = this;
            this.showUI(true);
        })
    }

    createUI() {
        var ui = THING.widget.Panel({
            name: this.name,
            isClose: true,
            isDrag: true,
            isRetract: true,
            hasTitle: true,
            width: "300px",
            media: true
        });
        ui.setZIndex(999999);//设置ui排序
        ui.addTab(this.info);
        ui.setPosition({ right: 80, bottom: 50 });
        this.ui = ui;
        return ui;
    }

    showUI(boolValue) {
        if (!this.ui)
            this.createUI();
        this.ui.show(boolValue);
    }
}
THING.factory.registerClass('Rack', Rack);
Rack.current = null;

function gen_rack_info() {
    var type2 = ["PC服务器", "路由器"];
    var type3 = ["IBM", "HP", "DELL"];
    var people = ["王WW", "李LL", "张ZZ"];
    var info = {
        "基本信息": {
            "一级分类": "微机",
            "二级分类": type2[Math.randomInt(0,1)],
            "设备类型": type3[Math.randomInt(0,2)],
            "编号": "00" + Math.randomInt(0, 9),
            "使用人": people[Math.randomInt(0,2)],
            "上架时间": ""+Math.randomInt(10,23)+":"+Math.randomInt(10,23),
        },
        "扩展信息": {
            "XX信息": Math.ceil(Math.random() * 27 + 25) + "",
            "XX信息": Math.ceil(Math.random() * 25 + 20) + "",
        }
    };
    return info;
}

/**
 * Cabinet
 * @author larrow 2018.05.01
 */
class Cabinet extends THING.Thing {
    constructor(app) {
        super(app);
        this.racks = [];
        this.isCabinet = true;
        this.barGraph = null;
        this.ui = null;
        this.number = Math.randomInt(100, 300);
    }

    setup(param) {
        super.setup(param);
    }

    createRack(url, u) {
        var y = u * RACK_UNIT_HEIGHT;
        var cabinet = this;
        var rack = this.app.create({
            type: 'Rack',
            name: 'rack',
            url: url,
            complete: function() {
                cabinet.add({
                    object: this,
                    basePoint: 'BasePoint',
                    offset: [0, y, 0],
                    angles: [0, 0, 0]
                });

            }
        });
        return rack;
    }

    createRacks() {

        var curUPos = 0;
        while(true) {
            var uHeight = Math.randomInt(1, 2);
            curUPos += uHeight;
            var url = RackModels[Math.randomInt(0, RackModels.length - 1)];

            var rack = this.createRack(url, curUPos);
            this.racks.push(rack);

            if (curUPos >= CABINET_DEFAULT_UNITCOUNT - 4)
                break;
        }
        
        return rack;
    }

    destroyRacks() {
        for (var i = 0; i < this.racks.length; i ++) {
            var rack = this.racks[i];
            rack.destroy();
        }
        this.racks = [];
    }

    openDoor() {
        this.playAnimation('open1');
        this.createRacks();
    }

    closeDoor() {
        this.playAnimation({
            name: 'close1',
            complete: function() {
                this.destroyRacks();
                if (Rack.current)
                    Rack.current.showUI(false);
            }
        });
    }

    createBarGraph() {
        if (this.barGraph)
            return;

        var box = app.create({ 
            type: 'Box', 
            width: this.size[0] * 0.9,
            height: this.size[1],
            depth: this.size[2] * 0.9,
            position: this.position,
            center: 'Bottom'    
        });

        this.barGraph = box;
    }

    showBarGraph(bool) {

        if (bool) {
            // 确认创建了盒子
            this.createBarGraph();
            // 隐藏机柜，显示盒子
            this.visible = false;
            this.barGraph.visible = true;
            this.barGraph.style.color = Math.randomFromArray(BarGraphColors);
            //this.barGraph.style.opacity = 0.9;
            // 缩放盒子
            this.barGraph.scale = [1, 0.1, 1];
            this.barGraph.scaleTo({
                scale: [1, Math.randomFloat(0.2, 1.0), 1],
                time: 400,
                lerpType: THING.LerpType.Linear.Quadratic
            });
        } else {
            // 隐藏盒子，显示机柜
            this.visible = true;
            this.barGraph.visible = false;
        }
    }

    createUI() {
        if (this.ui)
            return;

        var cabinet = this;

        // 创建widget (动态绑定数据用)
        var panel = THING.widget.Panel({
            width: "110px",
            height: "30px",
            isClose: false,
            opacity: 0.8,
            media: true
        });
        this.panel = panel;
        panel.add(this, 'name').name('机柜'+this.number);

        // 创建obj ui (跟随物体用)
        var ui = app.create({
            type: 'UI',
            parent: this,
            el: panel.domElement,
            offset: [0, cabinet.size[1], 0]
        });
        this.ui = ui;   
    }

    showUI(boolValue) {
        if (!this.ui)
            this.createUI();

        this.panel.visible = boolValue;
    }
}
THING.factory.registerClass('Cabinet', Cabinet);
Cabinet.current = null;
Cabinet.open = false;

// ----------------------------------------------------------------------------
// init_cabinets
function init_cabinets() {
    
    var cabinets = app.query('.Cabinet');

    // 双击左键开门
    cabinets.on('dblclick', function() {

        // 摄影机飞行
        var pos = this.localToWorld([0, 2.0, 2.1]);
        //var pos = this.localToWorld([-0.6, 1.1, 2.3]);
        var targ = this.position;
        targ[1] += 0.95;
        app.camera.flyTo({
            time: 1000,
            position: pos,
            target: targ, 
        });

        // 机柜开门动画
        if (Cabinet.current) {
            Cabinet.current.closeDoor();
            Cabinet.current = null;
        }
        this.openDoor();

        // 设置为当前
        Cabinet.current = this;        
        this.style.outlineColor = null; // 当前机柜不沟边
    })

    // 右键关门
    app.on('click', function(event) {
        if (event.button == 2) {
            if (Cabinet.current) {
                Cabinet.current.closeDoor();
                Cabinet.current = null;
            } else {
                // 如果没有当前机柜则飞到一个最佳位置
                app.camera.flyTo({
                    time: 1500,
                    position: [-10.4, 13.6, 12.3],
                    target: [3.6, -4, -1.7], 
                });
            }
        }
    });

    // 机柜 滑过沟边
    cabinets.on('mouseon', function () {
        if (this != Cabinet.current) {
            this.style.outlineColor = '#00ff00';
            this.showUI(true);
        }
    });
    cabinets.on('mouseoff', function () {
        this.style.outlineColor = null;
        this.showUI(false);
    });
}



// ----------------------------------------------------------------------------
// show_barchart
var isBarGraph = false
function switch_bargraph() {
    isBarGraph = !isBarGraph;
    app.query('.Cabinet').forEach(function(obj) {
        obj.showBarGraph(isBarGraph);
    });
}
