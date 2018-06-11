/**
 * 开场秀
 * @author larrow 2018.05.01
 */
openingShow = {
    curShowIdx: 0,  // 当前进行的是哪一场show
    objCount: 0,      // 计算有多少物体已经完成了表演
    showing: false,
    showInfo: null,
    inited: false,

    init: function() {
        var that = this;

        // 每次show的对象 查询字符串、时间、摄影机位置
        this.showInfo = [
            [ "[Group=Inside01]", 500, [-7.1, 8.8, 9.2], [-3.1, 3, 0.2] ],
            [ "[Group=Inside02]", 500, [-9.5, 8.6, 11.7], [-3.5, 3, 5.3] ],
            [ "[Group=Inside03]", 500, [13.9, 9.3, 15.1], [8.9, 3, 5.8] ],
            [ "[Group=Inside04]", 500, [19.9, 10.3, 7.9], [16.5, 3, 3.9] ],
            [ "[Group=Inside05]", 500, [27.3, 11.5, 11.8], [23.3, 3, 4.4] ],
        
            [ "[Group=Outside01] | [Group=Outside03]", 300, [10.3, 45.7, 28], [9.7, 3.1, 4.5] ],
            [ "[Group=Outside02] | [Group=Outside04]", 300, [-10.3, 21.2, 32.7], [6.6, 3, 0.7] ],
        ];

        // 注册取消事件
        app.on('keydown', function(event) {
            if (event.key == "Escape") {
                that.stop();
            }
        })

        this.inited = true;
    },

    // 开始show
    start: function() {
        if (this.showing)
            return;

        if (!this.inited)
            this.init();

        this.showing = true;

        // 所有具有属性Group值包含Inside的都抬高
        app.query("[Group=Inside*]").forEach(function(obj) {
            obj.visible = false;
            obj.initPos = obj.position; // 保存一下初始位置
            obj.moveY(10);
        });

        // 所有具有属性Group值包含Outside的都偏移z
        app.query("[Group=Outside*]").forEach(function(obj) {
            obj.visible = false;
            obj.initPos = obj.position; // 保存一下初始位置
            obj.moveZ(10);
        });

        this.step();
    },

    // 每一个show的过程
    step: function() {
        var info = this.showInfo[this.curShowIdx];
        var queryString = info[0];
        var costTime = info[1];
        var camPos = info[2];
        var camTarget = info[3];
        var nextNow = info[4];

        // 摄影机飞行
        var that = this;
        app.camera.flyTo({
            time: 800,
            position: camPos,
            target: camTarget, 
            complete: function() {

                // 机柜等设备飞入效果
                var dealyTime = 0;
                var objIdx = 0;
                app.query(queryString).forEach(function(obj) {
                    that.objCount ++;
                    obj.visible = true;
                    obj.moveTo({
                        position: obj.initPos,
                        time: costTime,
                        delayTime: dealyTime,
                        lerp: true,
						lerpType: THING.LerpType.Cubic.In,
                        complete: function() {
                            that.next();
                        }
                    });

                    // 逐步提高速度
                    dealyTime = (objIdx > 16)  ?  (dealyTime + 30) : (dealyTime + 100); // 延时加速
                    objIdx ++;
                });
            }
        });
    }, 

    // 下一次show的判断
    next: function() {      
        if (!this.showing)      
            return;

        // 本场show演员还没全部完成
        this.objCount --;
        if (this.objCount > 0) 
            return;

        // 全部结束
        this.curShowIdx ++;
        if (this.curShowIdx >= this.showInfo.length) {
            this.showing = false;
            this.curShowIdx = 0;
            console.log('all show finish!');
            return;
        }

        // 下一show
        this.step();
    },

    stop: function() {
        app.query("[Group]").forEach(function(obj) {
            obj.stopMoving();
            obj.visible = true;
            obj.position = obj.initPos
        });

        app.camera.stopFlying();
           
        this.objCount = 0;
        this.curShowIdx = 0;
        this.showing = false;
    }
}
