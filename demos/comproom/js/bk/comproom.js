/**
 * 机房demo
 * @author larrow 2018.05.01
 */
var app;

var lightConfig = {
    showHelper: false, // 灯光标示

    ambientLight: {
        intensity: 0.5,
        color: 0xffffff
    },

    mainLight: {
        shadow: false,
        shadowQuality: 'medium',
        intensity: 0.3,
        color: 0xffffff,
        alpha: 20,
        beta: 45
    },

    secondaryLight: {
        shadow: false,
        shadowQuality: 'medium',
        intensity: 0.2,
        color: 0xffffff,
        alpha: 20,
        beta: 135
    }
}

var postEffectConfig = {
    enable: true, 
    // 抗锯齿
    antialias: {
        enable: true,
        type: 'TAA', // TAA，FXAA
        TAA: {
            sampleLevel: 1, // 0 - 5, 数值越大收敛速度越快，每帧采样越多，性能越低
        }
    },

    screenSpaceAmbientOcclusion: {
        enable: true, 
        radius: 0.1, 
        bias: 0.1 / 50, 
        intensity: 0.7
    },

    colorAdjustment: {
        enable: true,
        // 亮度
        brightness: 0,
        // 对比度
        contrast: 1,
        // 曝光
        exposure: 0,
        // gamma
        gamma: 0.9,
        // 饱和度
        saturation: 1.1
    },

    bloom: {
        enable: true,
        strength: 0.14,
        radius: 0.4,
        threshold: 0.6
    }
}
        
window.onload = function() {
    app = new THING.App({ 
        container: "div3d",
        url: 'models/comproom/',    
        background: '#666666'
    });

    app.on('load', init);
}			

function init() {
    // 设置灯光
    app.setLighting(lightConfig);

    // 设置后期
    app.setPostEffect(postEffectConfig);

    app.camera.flyTo({
        time: 1000,
        position: [-15.8, 14.3, 17.9],
        target: [0.3, -2.0, 1.5]
    });
    
    // 初始化机柜
    init_cabinets();

    // 开场秀
    //openingShow.start();
    init_door();
    init_ui();
}

// ------------------------------------------------------------------------------
function init_ui() {

    var baseURL = "http://47.93.162.148:8081/liangyw/images/button/";

    var toolBar = THING.widget.ToolBar({ media: true, parent: document.getElementById("div3d")});
    toolBar.data = { openShow: false, barGraph: false };
    var img0 = toolBar.addImageBoolean(toolBar.data, 'openShow').name('开场动画').imgUrl(baseURL + 'warehouse_code.png');
    var img1 = toolBar.addImageBoolean(toolBar.data, 'barGraph').name('统计数据').imgUrl(baseURL + 'temperature.png');
    img0.onChange(function(boolValue) { 
        openingShow.start();
        toolBar['openShow'] = false;
    });
    img1.onChange(function(boolValue) { 
        switch_bargraph();
    });
    toolBar.setPosition({ "top": 10, "left": 10 });
}


// ------------------------------------------------------------------------------
function init_door() {

    var doors = app.query('.Door');

    // 双击左键开门
    doors.on('dblclick', function() {
        if (this.isOpen)
            this.open();
        else 
            this.close();
    });
}