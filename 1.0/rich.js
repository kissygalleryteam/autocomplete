/**
 * RICH 包含UI所有交互逻辑
 */
KISSY.add(function (S ,Node , Event , O){
    /**
     * @module autocomplete
     * @submodule autocomplete-rich
     */

    /**
     * AutocompleteRich主要基于AutocompleteBase，利用afterQueryChange和results两个事件创建包含更多交互的富应用
     * @class  AutocompleteRich
     * @extend S.Base
     */
    var QUERY = 'query';
    var RESULT = 'result';

    var EVT_QUERY = 'afterQueryChange';
    var EVT_RESULTS = 'results';
    var EVT_SELECT = 'select';

    var ACTIVE_ITEM = 'activeItem';
    var HOVER_ITEM = 'hoverItem';

    var CLS_ACTIVE = 'ks-ac-active';
    var CLS_HOVER = 'ks-ac-hover';
    var CLS_ITEM = 'J_AcItem';
    var CLS_AC_CONTAINER = 'ks-autocomplete';
    var CLS_AC_INPUT = 'ks-autocomplete-input';

    var SELECTOR_ITEM = '.' + CLS_ITEM;

    var isArray = S.isArray;
    var doc = document;
    var body = doc.body;
    var DOM = S.DOM;
    var win = window;


    var AutoCompleteRich = function (){
    };
    AutoCompleteRich.ATTRS = {
        /**
         * 显示提示框的宽度设定。传入一个节点时，会以此节点的宽度作为组件宽度，默认null时，会自动设定为输入框的宽度
         * @attribute width
         * @type Number|NodeList|null
         * @default null
         **/
        width:{
            value : null,
            getter : '_getWidth'
        },
        /**
         * 在输入框失去焦点时有推联想搜索结果，启用自动回填当前被激活的数据项
         * @attribute enableAutoFill
         * @type Boolean
         * @default true
         **/
        enableAutoFill : {
            value : true
        },
        /**
         * 有推荐结果时，默认选中第一项
         * @attribute activeFirstItem
         * @type Boolean
         * @default true
         **/
        activeFirstItem: {
            value: true
        },
        /**
         * 当前的激活项
         */
        activeItem : {
            value : null
        },
        /**
         * 当前的HOVER项
         */
        hoveredItem: {
            readOnly: true,
            value: null
        },
        /**
         提示层可见状态发送变化时的事件
         @event afterVisibleChange
         @param {Boolean} e.newVal e.prevVal
         **/
        visible : {
            value : false
        },
        /**
         推荐的结果的LIST可见状态发生变化时触发
         @event afterResultsListVisibleChange
         @param {Boolean} e.newVal e.prevVal
         **/
        resultsListVisible : {
            value : false
        },
        /**
         * message的可见状态
         */
        messageVisible : {
            value : false
        },
        /**
         * 对齐配置
         */
        /**
         * 提示层的位置的配置，
         * @attribute align
         * @type Object
         * @default {
                         node : null,
                         points : ['bl', 'tl'],
                         offset : [0,-1],
                         overflow:{
                             adjustX: 0, // 当对象不能处于可显示区域时，自动调整横坐标
                             adjustY: 0// 当对象不能处于可显示区域时，自动调整纵坐标
                         }
                     }
         **/
        align : {
            value : {
                node    : null,
                points  : ['bl', 'tl'],
                offset  : [0, -1],
                overflow: {
                    adjustX: 0, // 当对象不能处于可显示区域时，自动调整横坐标
                    adjustY: 0// 当对象不能处于可显示区域时，自动调整纵坐标
                }
            },
            setter : '_setAlign'
        },
        /**
         * 最外层容器HTML片段
         */
        /**
         * 层的基础HTML模板结构
         * @attribute boundingBoxTemplate
         * @type String
         * @default '<div class="ks-ac-header"></div>' +
         '<div class="ks-ac-body">' +
         '   <div class="ks-ac-message J_AcMessage"></div>' +
         '   <div class="ks-ac-content J_AcContent">' +
         '       <div class="J_HotList"></div>' +
         '       <div class="J_ResultsList"></div>' +
         '   </div>' +
         '</div>' +
         '<div class="ks-ac-footer"><span></span></div>'
         **/
        boundingBoxTemplate : {
            value: '<div class="ks-ac-header"></div>' +
                '<div class="ks-ac-body">' +
                '   <div class="ks-ac-message J_AcMessage"></div>' +
                '   <div class="ks-ac-content J_AcContent">' +
                '       <div class="J_HotList"></div>' +
                '       <div class="J_ResultsList"></div>' +
                '   </div>' +
                '</div>' +
                '<div class="ks-ac-footer"><span></span></div>'
        },
        /**
         * 推荐结果的外层容器HTML模板
         * @attribute listNodeTemplate
         * @type String
         * @default <div class="ks-ac-list"></div>
         **/
        listNodeTemplate : {
            value : '<div class="ks-ac-list"></div>'
        },
        /**
         * 推荐结果单个数据项的外层容器HTML模板
         * @attribute itemNodeTemplate
         * @type String
         * @default <div class="ks-ac-item"></div>
         **/
        itemNodeTemplate : {
            value : '<div class="ks-ac-item"></div>'
        },
        /**
         * 没有查询结果时的提示模板
         * @attribute noResultsMessage
         * @type String
         * @default 没有"<span class="ks-ac-message-hightlight">{query}</span>"相关的推荐
         **/
        noResultsMessage : {
            value : '没有"<span class="ks-ac-message-hightlight">{query}</span>"相关的推荐'
        },
        /**
         * clickoutside时需要排除在外的节点
         * @attribute trigger
         * @type Array
         * @default []
         **/
        trigger : {
            value : []
        }
    };
    AutoCompleteRich.prototype = {
        overlay        : null,//overlay实例
        overlayNode    : null,//提示层根节点
        contentNode    : null,//内容节点
        resultsListNode: null,//推荐结果的节点
        messageNode    : null,//错误信息节点
        hotNode        : null,//热门推荐节点
        headerNode     : null,//头部节点
        footerNode     : null,//尾部节点
        initializer : function (){
            this._renderRich();
            this._bindRich();
        },
        destructor : function (){
            this.resultsListNode.detach();
            this.detach();
            this.overlay = null;
        },
        _renderRich : function (){
            var input_node = this.get('inputNode');
            input_node.addClass(CLS_AC_INPUT);
            var _align = this.get('align');
            _align.node = _align.node ? _align.node : input_node;
            //基于overlay组件
            var overlay = this.overlay = new O({
                align: _align,
                content : this.get('boundingBoxTemplate')
            });
            overlay.render();
            var el = overlay.get('el');
            this.overlayId = 'J_Ks'+ S.guid();
            el.prop('id' , this.overlayId).addClass(CLS_AC_CONTAINER).attr('tabindex','-1');
            this.overlayNode = el;
            this.headerNode = el.one('.J_AcHeader');
            this.bodyNode = el.one('.J_AcBody');
            this.footerNode = el.one('.J_AcFooter');
            this.messageNode = el.one('.J_AcMessage').hide();
            this.contentNode = el.one('.J_AcContent');
            this.hotNode = el.one('.J_HotList').hide();
            this.resultsListNode = el.one('.J_ResultsList').hide();
            S.one(win).on('resize',  S.buffer(this._syncPosition , 100 , this), this);
        },
        /**
         * 生成搜索结果列表
         * @param items 列表所依赖的数据
         * @returns {NodeList} 返回documentFragment;
         */
        _buildList : function (items){
            var listNode = S.one(S.DOM.create(this.get('listNodeTemplate')));
            S.each(items,function (_item){
                listNode.append(this._createItemNode(_item).data(RESULT,_item));
            },this);
            return listNode;
        },
        /**
         * 创建搜索结果的子项
         * @param item
         * @returns {*}
         * @private
         */
        _createItemNode : function (item){
            var node = S.one(DOM.create(this.get('itemNodeTemplate')));
            node.addClass(CLS_ITEM).append(item.display);
            return node;
        },
        /**
         * 绑定事件
         * @private
         */
        _bindRich : function (){
            var input_node = this.get('inputNode');

            //同步状态
            this.on('afterVisibleChange',this._afterVisibleChange, this);
            this.on('afterResultsListVisibleChange',this._afterResultsListVisibleChange, this);
            this.on('afterMessageVisibleChange' , this._afterMessageVisibleChange, this);

            input_node.on('keydown', S.bind(this._afterKeyDown ,this));
            input_node.on('focus' , this._onFocus, this);

            this.on(EVT_RESULTS , S.bind(this._onResults , this));
            this.on(EVT_QUERY, this._onQuery,this);
            this.on('afterActiveItemChange' , S.bind(this._afterActiveChange , this));
            this.on('afterHoverItemChange', S.bind(this._afterHoverChange,this));


            //event of select
            this.on(EVT_SELECT , this._onSelect, this);

            //clickoutside
            var doc_node = S.one(doc);
            var clickoutside_handler = S.bind(this._afterDocClick,this);
            this.overlay.on('afterVisibleChange',function (e){
                if(e.newVal){//展示时 绑定outclick事件
                    doc_node.on('click', clickoutside_handler);
                    return ;
                }
                //隐藏时 取消监听
                doc_node.detach('click', clickoutside_handler);
            }, this);
            this.bindList();
        },
        /**
         * 搜索结果列表事件绑定
         */
        bindList : function (){
            this.resultsListNode.delegate('mouseenter' ,SELECTOR_ITEM , function (e){
                var item = S.one(e.currentTarget);
                this.hoverItem(item);
            },this);
            this.resultsListNode.delegate('click' , SELECTOR_ITEM , function (e){
                e.preventDefault();
                var item = S.one(e.currentTarget);
                this.selectItem(item);
            },this);
            this.resultsListNode.on('mouseleave' , function (){
                this.set(HOVER_ITEM,null);
            },this);
        },
        /**
         * 搜索结果返回时响应
         * @param e
         * @private
         */
        _onResults : function (e){
            var resluts = e.results ;
            var query = e.query ;
            var list_node =  this.resultsListNode;

            if (this._isSelectVal) {
                return ;
            }
            if (isArray(resluts) && resluts.length > 0) {
                this._clear();
                list_node.empty();
                list_node.append(this._buildList(resluts));
                this.set('messageVisible', false);
                this.get('activeFirstItem') && this.set(ACTIVE_ITEM, this._getFirstItem());
                doc.activeElement  == this.inputNode[0]  && this.set('resultsListVisible' , true);//焦点还在输入框时才进行现实
            }else{
                query = S.escapeHTML(query);
                doc.activeElement  == this.inputNode[0]  && this.showMessage(S.substitute(this.get('noResultsMessage'),{//焦点还在输入框时才进行显示
                    query : query
                }))
            }

        },
        /**
         * 显示信息
         * @method showMessage
         * @param {String} msg 错误提示信息
         * @chainable
         **/
        showMessage : function (msg){
            this.messageNode.html(msg);
            var that = this;
            setTimeout(function (){
                that.set('messageVisible', true);
            },1);
            return this
        },
        /**
         * 重新定位容器对齐
         * @private
         */
        _syncPosition : function (){
            var _align = this.get('align');
            this.overlay.align(_align.node , _align.points , _align.offset , _align.overflow);
        },
        /**
         * 重置results list的状态
         * @private
         */
        _clear : function (){
            this.set(ACTIVE_ITEM , null);
            this.set(HOVER_ITEM , null);
        },
        selectItem : function (item_node){
            if (!item_node) {
                item_node = this.get(ACTIVE_ITEM);
            }
            var result = item_node.data(RESULT);

            /**
             * 用户选定某一项后触发
             * @event select
             * @param {Object} results {node : 触发事件的节点,result:{text:文本,display:显示的HTML代码,raw:对应的数据源}}
             **/
            this.fire(EVT_SELECT,{
                node : item_node,
                result : result
            });
            return this;
        },
        /**
         * 同步状态
         * @param e
         * @private
         */
        _afterVisibleChange : function (e){
            var isShowIt = e.newVal;
            this._syncPosition();
            if (isShowIt) {
                this.overlay.show();
            }else{
                this.overlay.hide();
            }
        },
        _afterResultsListVisibleChange : function (e) {
            var isShowIt = e.newVal;
            if (isShowIt) {
                this.overlay.set('width', this.get('width'));
                this.resultsListNode.show();
                this.set('visible', true);
            } else {
                this.resultsListNode.hide();
            }

            //自动回填:输入框失去焦点时如果有推荐结果被选中则自动回填
            if (this.get(QUERY).query !== '' && e.newVal === false && this.get('enableAutoFill')  && this.get(ACTIVE_ITEM)) {
                this.selectItem();
            }
        },
        _afterMessageVisibleChange : function (e){
            var isShowIt = e.newVal;
            if (isShowIt) {
                this.overlay.set('width', this.get('width'));
                this.messageNode.show();
                this.set('visible', true);
            } else {
                this.messageNode.hide();
                this.set('visilbe', false)
            }
        },
        _onFocus : function (e){
            var that = this;
            that.set('messageVisible', false);
            setTimeout(function () {//hack for chrome
                if (that._isSelectVal) {
                    return;
                }
                e.currentTarget.select();
            }, 100)
        },
        /**
         * 判断是否在区域外的点击
         * @param target_node
         * @param region_nodes
         * @returns {boolean}
         * @private
         */
        _isOutSide: function (target_node, region_nodes) {
            for (var i = 0 , len = region_nodes.length; i < len; i++) {
                var _region = region_nodes[i][0];
                if (target_node === _region || S.one(target_node).parent(function (el) {//触发click事件的srcElement不是region_nodes成员或者它的父级元素也没有region_nodes的成员时
                    //filter
                    if (el === _region) {
                        return true;
                    }
                })) {
                    return false;
                }

            }
            return true;
        },
        _afterDocClick : function (e) {
            var target = e.target;
            if (this._isOutSide(target, [this.overlayNode , this.inputNode].concat(this.get('trigger')))) {
                this.set('resultsListVisible', false);
                this.set('visible', false);
            }
        },
        _onSelect : function (e){
            var that = this,
                input_node = this.get('inputNode');
            this._updateValue(e.result.text);
            this._isSelectVal = true;//增加一个私有属性, 记录当前状态的改变是由select事件触发，并在200MS后释放状态
            setTimeout(function () {
                that._isSelectVal = false;
            }, 200);
            input_node[0].focus();
            this.set(ACTIVE_ITEM, null);
            this.set('resultsListVisible', false);
            this.set('visible', false);
        },
        _onQuery : function (e) {
            if (e.newVal.query.length === 0) {
                this.set('resultsListVisible', false);
                this.set('messageVisible', false);
            }
        },
        /**
         * 上下按钮选择时触发回调
         * @param e
         * @private
         */
        _afterActiveChange : function (e){
            var prev_item = e.prevVal;
            var new_item = e.newVal;
            prev_item && prev_item.removeClass(CLS_ACTIVE);
            new_item && new_item.addClass(CLS_ACTIVE);
        },
        /**
         * 鼠标移动到ITEM上时的回调
         * @param e
         * @private
         */
        _afterHoverChange : function (e){
            var prev_item = e.prevVal;
            var new_item = e.newVal;
            prev_item && prev_item.removeClass(CLS_HOVER);
            new_item && new_item.addClass(CLS_HOVER);
        },
        /**
         * 键盘事件回调
         * @param e
         * @private
         */
        _afterKeyDown : function (e){
            switch(e.keyCode){
                case 38 :
                    e.preventDefault();
                    this.activePrevItem();
                    break;
                case 40 :
                    e.preventDefault();
                    this.activeNextItem();
                    break;
                case 13 :
                    e.preventDefault();
                    this.get('resultsListVisible') && this.get(ACTIVE_ITEM) && this.selectItem();
                    break;
                case 9 :// tab
                    if (this.get('resultsListVisible') && this.get(ACTIVE_ITEM)) {
                        e.preventDefault();
                        this.selectItem();
                    }
                    this.set('resultsListVisible', false);
                    this.set('visible' , false);
                    break;
                case 27 :// esc
                    this.set('resultsListVisible', false);
                    this.set('visible' , false);
                    break;
                default :
                    break;
            }
        },
        /**
         * 鼠标移入时选中指定项
         * @param item
         */
        hoverItem : function (item){
            if (!item) {
                return ;
            }
            this.set(HOVER_ITEM , item);
        },
        /**
         * 通过键盘激活的下一项
         */
        activeNextItem : function (){
            var active_item = this.get(ACTIVE_ITEM);
            var next_item ;
            if(active_item){
                next_item = active_item.next(SELECTOR_ITEM);
                if (!next_item) {
                    next_item = this._getFirstItem();
                }
            }
            else{
                next_item = this._getFirstItem();
            }
            this.set(ACTIVE_ITEM , next_item);
        },
        /**
         * 通过键盘激活的上一项
         */
        activePrevItem : function (){
            var item = this.get(ACTIVE_ITEM);
            var prev_item =  item ? item.prev(SELECTOR_ITEM) || this._getLastItem() : this._getLastItem();
            this.set(ACTIVE_ITEM , prev_item);
        },
        /**
         * 返回节点的第一个子节点
         * @returns {*}
         * @private
         */
        _getFirstItem : function (){
            return this.resultsListNode.one(SELECTOR_ITEM);
        },
        /**
         * 返回节点的最后一个子节点
         * @returns {*}
         * @private
         */
        _getLastItem : function (){
            return this.resultsListNode.one(SELECTOR_ITEM+':last-child');
        },
        /**
         * 设定宽度值
         * @param val
         * @returns {*}
         * @private
         */
        _getWidth: function (val) {
            if (S.isNumber(val)) {
                return val;
            }
            if (val instanceof S.NodeList) {
                return val.outerWidth();
            }
            if (val === null) {
                return this.get('inputNode').outerWidth();
            }
        },
        /**
         * 对齐的配置进行默认值的处理
         * @param cfg
         * @returns {{node: null, points: Array, offset: Array, overflow: {adjustX: number, adjustY: number}}}
         * @private
         */
        _setAlign : function (cfg){
            var _cfg = {
                node    : null,
                points  : ['bl', 'tl'],
                offset  : [0, -1],
                overflow: {
                    adjustX: 0, // 当对象不能处于可显示区域时，自动调整横坐标
                    adjustY: 0// 当对象不能处于可显示区域时，自动调整纵坐标
                }
            };
            S.mix(_cfg , cfg , undefined , undefined , true);
            _cfg.node = S.isString(_cfg.node) ? S.one(_cfg.node) : _cfg.node;
            if (_cfg.node) {
                return _cfg;
            }else{
                _cfg.node = this.get('inputNode');
                return _cfg;
            }
        }
    };
    return AutoCompleteRich;
},{requires : ['node','event','overlay','sizzle']});