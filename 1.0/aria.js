KISSY.add(function (S ,Node , Event , O){
    /**
     * @module autocomplete
     * @submodule autocomplete-aria
     */

    /**
     * AutocompleteAria主要基于AutocompleteHot，盲人用户的支持，增加组件的可用性
     * @class  AutocompleteAria
     * @extend AutocompleteBase
     */
    var CLS_ITEM = 'J_AcItem';
    var SELECTOR_TAB = '.J_TabItem';
    var SELECTOR_ITEM = '.' + CLS_ITEM;

    var AutoCompleteAria = function (){
        this.initAria.apply(this , arguments);
    };
    AutoCompleteAria.ATTRS = {};
    AutoCompleteAria.prototype = {
        nodeArr : null,
        isFirstShow : true ,
        initAria : function (){
            this.bindAria();
            this.nodeArr = null;
        },
        bindAria : function (){
            this.on('afterHotActiveTabChange' , function (e){
                var _prevNav = this.hotNavNodes.item(e.prevVal);
                var _prevPannel = this.hotPannelNodes.item(e.prevVal);
                var _nextNav = this.hotNavNodes.item(e.newVal);
                var _nextPannel = this.hotPannelNodes.item(e.newVal);
                var _clickNodes = this.hotItemNodes = _nextPannel.all(SELECTOR_ITEM);
                this.nodeArr = this.buildArr2(_clickNodes);
                if (!this.isFirstShow) {
                    _nextNav.one('a')[0].focus();
                }else{
                    this.isFirstShow = false;
                }
            },this);
            this.hotNode.delegate('keydown' , SELECTOR_ITEM , function (e){
                var target = S.one(e.currentTarget);
                var item_data = target.data('src');
                if (target.hasClass(CLS_ITEM) && target.hasData('src')) {
                    switch(e.keyCode){
                        case 37 :
                            e.preventDefault();
                            this._selectHotLeft(item_data);
                            break;
                        case 38 :
                            e.preventDefault();
                            this._selectHotTop(item_data);
                            break;
                        case 39 :
                            e.preventDefault();
                            this._selectHotRight(item_data);
                            break;
                        case  40 :
                            e.preventDefault();
                            this._selectHotBottom(item_data);
                            break;
                        default :
                            break;
                    }
                };
            }, this);

            //在tab上的键盘操作
            this.hotNode.delegate('keydown' , SELECTOR_TAB , function (e){
                var curHotTab = this.get('hotActiveTab');
                switch(e.keyCode){
                    case 37 : //click left
                        curHotTab -- ;
                        if (curHotTab < 0) {
                            curHotTab = this.hotNavNodes.length -1;
                        }
                        this.set('hotActiveTab' , curHotTab);
                        break;
                    case 39 ://click right
                        curHotTab ++ ;
                        if (curHotTab >= this.hotNavNodes.length) {
                            curHotTab = 0 ;
                        }
                        this.set('hotActiveTab' , curHotTab);
                        break;
                    case 38 : //up
                        this.hotItemNodes.item(0)[0].focus();
                        break;
                    case  40 : //down
                        this.hotItemNodes.item(0)[0].focus();
                        break;
                    case 9 ://click tab 点击tab时切换到当前tab对应的内容模块
                        e.preventDefault();
                        this.hotItemNodes.item(0)[0].focus();
                        break;
                    default :
                        break;
                }
            },this);
        },
        /**
         * 生成一个二维数组，数组每一项代表一个节点,完成上下左右键盘键操作功能，同时完成节点数据绑定
         * [[1, 2, 3, 4, 5, 6, 7, 8],
         *  [9,10,11,12,13,14,15,16],
         *  [......................]]
         * @param nodes
         * @returns {Array}
         */
        buildArr2 : function (nodes){
            var map = [];
            var obj = {};
            nodes.each(function (_item){
                var xy = _item.offset();
                if (!S.isArray(obj[xy.top])) {
                    obj[xy.top] = [];
                }
                obj[xy.top].push({
                    node : _item,
                    offset : xy,
                    x : obj[xy.top].length
                });
            });
            S.each(obj , function (v , k){
                map.push(k);
            });
            map.sort(function (a,b){
                return a - b;
            });
            S.each(map , function (key , index){
                S.each(obj[key] , function (_item){
                    _item.y = index;
                    _item.node.data('src' , _item);//数据绑定
                });
                map[index] = obj[key];
            });
            return map;
        },
        /**
         * 选择位于上方的节点
         * @param item
         * @private
         */
        _selectHotTop : function (item){
            var x = item.x;
            var y = item.y;
            y--;
            if (y < 0) {
                y = this.nodeArr.length - 1;
            }
            this._selectHot(x , y , 'up');
        },
        /**
         * 选择位于下方节点
         * @param item
         * @private
         */
        _selectHotBottom : function (item){
            var x = item.x;
            var y = item.y;
            y++;
            if (y >= this.nodeArr.length) {
                y = 0;
            }
            this._selectHot(x , y , 'down');
        },
        /**
         * 选择左侧节点
         * @param item
         * @private
         */
        _selectHotLeft : function (item){
            var x = item.x ;
            var y = item.y ;
            x--;
            if (x < 0) {
                y--;
                if (y<0) {
                    y = this.nodeArr.length - 1;
                }
                x = this.nodeArr[y].length - 1;
            }
            this._selectHot(x , y);
        },
        /**
         * 选择右侧节点
         * @param item
         * @private
         */
        _selectHotRight : function (item){
            var x = item.x;
            var y = item.y;
            x++;
            if (x >= this.nodeArr[item.y].length) {
                x = 0 ;
                y++;
                if (y >= this.nodeArr.length) {
                    y = 0;
                }
            }
            this._selectHot(x , y);
        },
        /**
         * 选择指定坐标的节点,当一步没有找到时，根据direction进行下一步的查找
         * @param x 二维数组横坐标
         * @param y 二位数组纵坐标
         * @param direction 来源的键盘键
         * @private
         */
        _selectHot : function (x,y,direction){
            if (direction == 'up') {
            }
            if (this.nodeArr[y]) {
                if (this.nodeArr[y][x]) {
                    this.nodeArr[y][x].node[0].focus();
                }else{//点击上下键，在所在列进行移动，如果当前行对应的列不存在，则跳过去下一行
                    if (direction === 'up') {
                        y -- ;
                        this._selectHot(x, y ,direction);
                        return;
                    }else if(direction === 'down'){
                        y ++ ;
                        this._selectHot(x, y ,direction);
                        return;
                    }
                }

            }
        }
    };
    return AutoCompleteAria;
},{requires : ['node','event']});