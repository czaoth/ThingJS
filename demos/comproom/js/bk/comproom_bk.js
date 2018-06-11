/**
 * @author larrow 2017.9
 * const values define
 */
const CABINET_DEFAULT_UNITCOUNT = 42; // 默认机柜u数
const RACK_UNIT_HEIGHT = 0.0445; // 1u为4.3厘米
const RACK_UNIT_HEIGHT_DEVIATION = 0.1; //机柜u高偏差阀值
const RACK_UNIT_WIDTH = 0.4826; // 19英寸机柜宽度,即面板宽度

/**
 * Cabinet
 */
class Cabinet extends THING.Thing {
    constructor(app) {
        super(app);
        this.racks = [];
        this.isCabinet = true;
        this.curUPos = 0;
    }

    setup(param) {
        super.setup(param);
    }

    createRack(param) {
        var cabinet = this;

        var upos = this.curUPos ++ || param['upos'];
        var offset = upos * RACK_UNIT_HEIGHT;
        var url = param['url'];

        var rack = this.app.create({
            type: 'Rack',
            name: 'rack',
            url: url,
            complete: function() {
                cabinet.add({
                    object: this,
                    basePoint: 'BasePoint',
                    offset: [0, offset, 0],
                    angles: [0, 0, 0]
                });
            }
        });
        rack.upos = upos;
        return rack;
    }

    openDoor() {
        this.playAnimation('open1');
    }

    closeDoor() {
        this.playAnimation('close1');
    }
}
THING.factory.registerClass(Cabinet, 'Cabinet');
Cabinet.current = null;
Cabinet.open = false;


/**
 * @author larrow 2017.9
 * Cabinet
 */
class Rack extends THING.Thing {
    constructor(app) {
        super(app);
        this.isRack = true;
    }

    setup(param) {
        super.setup(param);

        this.on('mouseon', function () {
            this.style.outlineColor = 0xff0000;
        });
        this.on('mouseoff', function () {
            this.style.outlineColor = null;
        });

        this.on('click', function() {
            if (Rack.current) {
                Rack.current = null;
            }
            Rack.current = this;
            gen_rack_info();
            summeryPanel.show(true);
        })
    }
}
THING.factory.registerClass(Rack, 'Rack');
Rack.current = null;
Rack.info = null;

// ----------------------------------------------------------------------------------
// App
var app;
window.onload = function() {
    app = new THING.App({ 
        container: "div3d",
        url: 'https://speech.uinnova.com/static/models/room1/models/comproom/'
    });

    app.on('load', init);
}			

function init() {
    var cabinets = app.query('.Cabinet');

    // 双击左键开门
    cabinets.on('dblclick', function() {
        if (Cabinet.current) {
            Cabinet.current.closeDoor();
            Cabinet.current = null;
        }
    
        this.openDoor();
        Cabinet.current = this;
        app.camera.flyTo({
            'time': 1500, 
            'target': this
        });
        Cabinet.current = this;
    })

    // 右键关门
    app.on('click', function(event) {
        if (event.button == 2) {
            if (Cabinet.current) {
                Cabinet.current.closeDoor();
                Cabinet.current = null;
            }
        }
    });

    // 摄影机飞行 
    app.camera.position = [-3, 2.4, 5.0];
    app.camera.target = [0, 0.8, 0];

    gen_rack_info();
    summeryPanel = THING.widget.Panel({
        name: 'Summery',
        isClose: true,
        isDrag: true,
        isRetract: true,
        hasTitle: true,
        width: "260px"
    });
    summeryPanel.setZIndex(999999);//设置ui排序
    summeryPanel.addTab(Rack.info);
    summeryPanel.setPosition({ left: 10, top: 10 });
    summeryPanel.show(false);
}


function gen_rack_info() {
    var upos = 0;
    if (Rack.current)
        upos = Rack.current.upos;
    var type2 = ["PC服务器", "路由器"];
    Rack.info = {
        "基本信息": {
            "一级分类": "微机",
            "二级分类": Math.randomInt(0,1),
            "设备类型": "XX",
            "编号": "00" + Math.randomInt(0, 9),
            "UPOS": upos
        },
        "扩展信息": {
            "XX信息": Math.ceil(Math.random() * 27 + 25) + "",
            "XX信息": Math.ceil(Math.random() * 25 + 20) + "",
        }
    };
}

var rackModels = [
    'https://speech.uinnova.com/static/models/room1/racks/20150426930174',
    'https://speech.uinnova.com/static/models/room1/racks/20150426959977',
    // 2U 'models/racks/20150507659518',
    'https://speech.uinnova.com/static/models/room1/racks/20150722067844',
    'https://speech.uinnova.com/static/models/room1/racks/20160715163534359958732'
];

var max = 0;
function add_rack() {
    if (!Cabinet.current) {
        alert('请先打开一个机柜');
        return;
    }

    if (max < 30) {
        Cabinet.current.createRack({
            //url: rackModels[Math.randomInt(0, rackModels.length - 1)]
            url: rackModels[Math.randomInt(0, 2)]
        });
        max = max + 1;
    } else {
        alert('最多添加30个设备');
    }

}