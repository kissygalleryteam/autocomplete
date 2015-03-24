/*
combined files : 

kg/autocomplete/3.0.0/base
kg/autocomplete/3.0.0/rich
kg/autocomplete/3.0.0/hot
kg/autocomplete/3.0.0/index
kg/autocomplete/3.0.0/multiple

*/
KISSY.add('kg/autocomplete/3.0.0/base',function (S){
    /**
    自动完成组件
    @module autocomplete
    @main autocomplete
    **/

    /**
    AutocompleteBase
     自动完成组件的基类，主要提供底层数据逻辑的处理，分发两个事件<b>results afterQueryChange<b>
    @class AutoCompleteBase
    @uses Overlay
    @constructor
    **/
    var INPUT_NODE = 'inputNode';

    var QUERY = 'query';
    var RESULTS = 'results';
    var EVT_RESULTS = 'results';
    /**
     * query发生变化
     * @event afterQueryChange
     * @param {String} newVal
     * @param {String} prevVal
     */
    var EVT_QUERY = 'afterQueryChange' ;
    var VALUE_CHANGE = 'valuechange';
    var REQUEST_TEMPLATE = 'requestTemplate';
    var RESULT_LIST_LOCATOR = 'resultListLocator';

    function AutoCompleteBase(){
        this.initBase.apply(this, arguments);
    }
    AutoCompleteBase.ATTRS = {
        /**
         * 使用缓存，当source是后端提供的数据接口时，将同样的请求做缓存
         * @attribute enableCache
         * @default true
         * @type boolean
         */
        enableCache : {
            value : true
        },
        /**
         * @attribute inputNode
         * @default null
         * @type String|NodeList
         */
        inputNode : {
            value : null,
            setter : function (el){
                if (el instanceof S.NodeList) {
                    return el;
                }
                return S.one(el);
            }
        },
        /**
         * 允许返回的最大值，设置为0表示不限制
         * @attribute maxResults
         * @default null
         * @type String|NodeList
         */
        maxResults:{
            value : 1000
        },
        /**
         * 最小查询字符串长度，输入框的值为空时，不进行查询
         * @attribute minQuerylengt
         * @type number
         * @default 1
         **/
        minQueryLength : {
            value : 1
        },
        /**
         * kissy jsonp 的配置项，用于接口的callback的key不是'callback'时
         * @attribute jsonpCallback
         * @type String
         * @default callback
         **/
        jsonpCallback : {
            value : 'callback'
        },
        query : {
            value : {
                query : '',
                inputValue : ''
            }
        },
        /**
         * 延时查询,避免用户连续输入时密集发送查询请求
         * @attribute queryDelay
         * @type number
         * @default 100
         **/
        queryDelay : {
            value : 100
        },
        /**
         * 查询字符分隔符,如果配置了这个值，将以此作为分隔符将输入框的值分割为数组，取数组的最后一个值作为查询参数.
         * 用于输入框支持多项输入
         * @attribute queryDelimiter
         * @type String
         * @default null
         **/
        queryDelimiter : {
            value : null
        },
        /**
         * 数据源的请求模板.
         * @type String
         */
        requestTemplate : {
            value : null,
            setter : '_setRequestTemplate'
        },
        /**
         * 数据结果过滤
         * @type Array
         */
        /**
         * 数据过滤器，要对本地数据或者远程返回数据进行处理时
         * @attribute resultFilter
         * @type Function
         * @default null
         **/
        resultFilter : {
            value : null
        },
        /**
         * 数据结果初始化
         * @type : Function
         */
        /**
         * 处理数据项展示的函数
         * @attribute resultFormatter
         * @type Function
         * @default null
         **/
        resultFormatter : {
            value : function (query, results) {
                return S.map(results, function (_item) {
                    return S.substitute('<div class="ks-ac-item-inner"><span class="ks-ac-name">{cityname}</span><span class="ks-ac-intro">{py}</span></div>', {
                        cityname: _item.text,
                        py      : _item.raw.py
                    });
                });
            }
        },
        /**
         * 数据结果返回时的第一个处理函数，指定数组位置,同时可以对数据源进行二次加工
         * @attribute resultListLocator
         * @type String | Function
         * @default null
         **/
        resultListLocator : {
            value : null ,
            setter : '_setLocator'
        },
        /**
         * 存储当前的查询结果
         */

        results : {
            value : []
        },
        /**
         * 指定每一个数据项被选中后填入到输入框的内容,可以指定一个字段或者用函数返回一个拼接的字段
         * @attribute resultTextLocator
         * @type String | Function
         * @default null
         **/
        resultTextLocator:{
            value : null,
            setter : '_setLocator'
        },
        /**
         * 数据源
         */
        source : {
            value : null,
            setter : '_setSource'
        },
        /**
         * 如果是服务端返回数据，指定数据源的charset
         * @attribute sourceCharset
         * @type string
         * @default gbk
         **/
        sourceCharset : {
            value : undefined
        },
        /**
         * 设置输入框的值,可以用于区分是用户通过UI输入造成的valueChange还是代码通过 setValue()改变的输入框的值
         */
        value : {
            value : '',
            setter : '_onSetVal'
        },
        /**
         * 开启浏览器默认的自动填充行为
         * @attribute allowBrowserAutocomplete
         * @type Boolean
         * @default false
         **/
        allowBrowserAutocomplete : {
            value : false
        }
    };
    AutoCompleteBase.prototype = {
        initBase : function (){
            if (this.get('enableCache') === true) {
                this._cache = {};
            }
            this.inputNode = this.get('inputNode');
            if (!this.inputNode) {
                S.log('error: 没有对应的输入框节点.');
                return false;
            }
            this._renderUIAcBase();
            this._bindUIAcBase();
            return this;
        },
        destructor : function (){
            var input_node = this.get('inputNode');
            input_node.detach();
        },
        /**
         * 渲染组件
         * @private
         */
        _renderUIAcBase : function (){
            this._syncBrowserAutocomplete();
        },
        /**
         * 事件处理中心
         * @private
         */
        _bindUIAcBase : function (){
            var input_node = this.get(INPUT_NODE);
            input_node.on(VALUE_CHANGE , this._onInputValueChange , this);
            this.on('afterValueChange' , this._afterValueChange , this);

            this.on(EVT_QUERY,function (e){
                var query = S.trim(e.newVal.query);
                if (query.length < this.get('minQueryLength')) {//小宇最短字符时不做处理
                    return ;
                }
                this.sendRequest(query);
            },this);

            this.on('afterAllowBrowserAutocompleteChange' , this._syncBrowserAutocomplete , this);
        },
        /**
         * query 事件后默认出发函数
         * @param query
         * @param requestTemplate
         */
        sendRequest : function (query , requestTemplate){
            var request ;
            var source = this.get('source');
            if (source) {
                if (!requestTemplate) {
                    requestTemplate = this.get(REQUEST_TEMPLATE);
                }
                request = requestTemplate ? requestTemplate.call(this,query) : query;
                source.sendRequest({
                    query : query ,
                    request : request,
                    callback : {
                        success : S.bind(this._onResponse , this , query)
                    }
                });
            }
        },
        _onSetVal : function (val){
            //this.get('inputNode').val(val);
        },
        _onInputValueChange : function (e){
            this.set('value' , e.newVal);
        },
        /**
         * 实力的 value 属性被set后触发
         * @private
         */
        _afterValueChange : function (e){
            var that = this;
            var val = e.newVal;
            var delimiter = this.get('queryDelimiter');
            var query= val;
            var arr;



            if (delimiter !== null) {
                var curPos = this._getCursortPosition(this.get('inputNode')[0]);
                var beforeCursorStr = val.slice(0,curPos);
                var beforeCursorArr = beforeCursorStr.split(delimiter);
                arr = val.split(delimiter);
                var pos = beforeCursorArr.length > 0 ? beforeCursorArr.length -1 : 0;
                query = arr[pos];
                //query = arr[arr.length - 1];
            }

            var _setQuery = function (){
                that.set(QUERY,{
                    query : query,
                    inputValue : val
                });
            };
            var delay = this.get('queryDelay');
            if (delay) {
                clearTimeout(this._delay);
                this._delay = setTimeout(function (){
                    _setQuery();
                },delay);
            }else{
                _setQuery();
            }
        },
        /**
         * 获取光标在输入框的位置
         * @param ctrl
         * @returns {number}
         * @private
         */
        _getCursortPosition: function(ctrl) {//获取光标位置函数
            var CaretPos = 0;	// IE Support
            if (document.selection) {
                ctrl.focus();
                var Sel = document.selection.createRange();
                Sel.moveStart('character', -ctrl.value.length);
                CaretPos = Sel.text.length;
            }
            // Firefox support
            else if (ctrl.selectionStart || ctrl.selectionStart == '0')
                CaretPos = ctrl.selectionStart;
            return (CaretPos);
        },
        /**
         * 设置光标位置
         * @param ctrl
         * @param pos
         * @private
         */
        _setCaretPosition: function(ctrl, pos) {//设置光标位置函数
            if (ctrl.setSelectionRange) {
                ctrl.focus();
                ctrl.setSelectionRange(pos, pos);
            }
            else if (ctrl.createTextRange) {
                var range = ctrl.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }
        },
        _updateValue : function (newVal){
            var delim = this.get('queryDelimiter'),
                inputNode = this.get('inputNode'),
                insertDelim,
                len,
                prevVal;
            newVal = S.trim(newVal);
            if (delim) {
                insertDelim = S.trim(delim); // so we don't double up on spaces
                prevVal = this.get('value');
                var curPos = this._getCursortPosition(inputNode[0]);
                var beforeCursorStr = prevVal.slice(0,curPos);
                var beforeCursorArr = beforeCursorStr.split(delim);
                prevVal = prevVal.split(delim);
                var pos = beforeCursorArr.length > 0 ? beforeCursorArr.length-1 : 0;
                prevVal     = S.map(S.trim(this.get('value')).split(delim), function (item){
                    return S.trim(item);
                });
                prevVal[pos] = newVal;
                newVal = prevVal.join(insertDelim);

/*
                if (len > 1) {
                    prevVal[len - 1] = newVal;
                }*/

                //newVal = newVal + insertDelim;
            }

            this.set('value' , newVal,{
                silent : true//不通过afterValueChange去触发query事件
            });
            inputNode.val(newVal);
            if (delim) {
                this._setCaretPosition(inputNode[0] ,prevVal.slice(0,pos+1).join(insertDelim).length);
            }
        },
        /**
         * 数据查询返回结果后，对数据进行过滤排序，文本替换,高亮等操作
         * @private
         */
        _onResponse : function (query , e){
            if (query === (this.get('query').query || '')) {
                this._parseResponse(query || '', e.response, e.data);
            }
        },
        _parseResponse: function (query , response , data) {
            var facade = {
                    data   : data,
                    query  : query,
                    results: []
                },

                listLocator = this.get(RESULT_LIST_LOCATOR),
                results = [],
                unfiltered = response && response.results,
                formatted,
                formatter,
                filter,
                i,
                len,
                maxResults,
                result,
                text,
                textLocator;
            if (unfiltered && listLocator) {//指定返回结果的数组路径
                unfiltered = listLocator.call(this, unfiltered);
            }

            if (unfiltered && unfiltered.length) {
                textLocator = this.get('resultTextLocator');
                filter = this.get('resultFilter');
                // Create a lightweight result object for each result to make them
                // easier to work with. The various properties on the object
                // represent different formats of the result, and will be populated
                // as we go.
                for (i = 0, len = unfiltered.length; i < len; ++i) {
                    result = unfiltered[i];
                    text = textLocator ?
                        textLocator.call(this, result) :
                        result.toString();

                    results.push({
                        display: text,
                        raw    : result,
                        text   : text
                    });

                }
                if (filter) {
                    results = filter.call(this, query , results.concat());
                }
                if (results.length) {
                    formatter = this.get('resultFormatter');
                    maxResults = this.get('maxResults');

                    //最大数据条数的限制
                    if (maxResults && maxResults > 0 &&
                        results.length > maxResults) {
                        results.length = maxResults;
                    }
                    if (formatter) {
                        formatted = formatter.call(this, query, results.concat());
                        if (!formatted) {
                            S.log("Formatter didn't return anything.", 'warn', 'autocomplete-base');
                        }else{
                            for (i = 0, len = formatted.length; i < len; ++i) {
                                results[i].display = formatted[i];
                            }
                        }
                    }
                }
            }

            facade.results = results;
            this.set(RESULTS , results);

            /**
             匹配到的数据返回且发生变化
             @event results
             @param {Array} 推荐的数据结果
             @param {String} 查询的关键字
             */
            this.fire(EVT_RESULTS, facade);
        },
        /**
         * 数据返回成功后的回调处理方法
         * @param data
         * @param request
         * @private
         */
        _sourceSuccess : function (data , request){
            request.callback.success({
                data : data ,
                response : {
                    results : data
                },
                request : request
            });
        },
        /**
         * setter 启用缓存
         * @private
         */
        _setEnableCache : function (value){
            if (value === true) {
                this._cache = {};
            }
        },
        _setRequestTemplate : function (template){
            if (S.isFunction(template)) {
                return template.call(this, query);
            }
            return function (query){
                return S.substitute(template , {
                    query : encodeURIComponent(query)
                });
            }
        },
        _setResultFilter : function (query , results){
            return results;
        },
        _setResultHighlighter : function (highlighter){
            if (S.isFunction(highlighter)) {
                return highlighter;
            }
            return false;
        },
        _setLocator : function (locator){
            if (S.isFunction(locator)) {
                return locator;
            }
            locator = locator.toString().split('.');
            var getObjVal = function (obj,path){
                if (!obj) {
                    return null;
                }
                for(var i=0 , len = path.length ;i < len ; i++){
                    if (path[i] in obj) {
                        obj = obj[path[i]];
                    }
                }
                return obj;
            };
            return function (result){
                return result && getObjVal(result , locator);
            };
        },
        _setSource : function (source){
            switch (true){
                case S.isString(source) :
                    return this._createJsonpSource(source);
                    break;
                case S.isFunction(source) :
                    return this._createFunctionSource(source);
                    break;
                case S.isArray(source) :
                    return this._createArraySource(source);
                    break;
                case S.isObject(source) :
                    return this._createObjectSource(source);
                    break;
                default :
                    break;
            }
            return source;
        },
        /**
         * jsonp格式的数据源
         * @param {String} source
         */
        _createJsonpSource : function (source){
            var jsonp_source = {
                type : 'jsonp'
            };
            var that = this ;
            var last_request ;
            var requestTemplate = this.get(REQUEST_TEMPLATE);
            if (requestTemplate) {
                source += requestTemplate.call(this,query);
            }
            jsonp_source.sendRequest = function (request){
                last_request = request ;
                var cacheKey = request.request;
                if (that._cache && cacheKey in that._cache) {//从缓存获取数据
                    that._sourceSuccess(that._cache[cacheKey],request);
                    return ;
                }
                var url;
                url = S.substitute(source , {
                    query : request.query,
                    maxResults: that.get('maxResults')
                });
                S.IO({
                    url : url,
                    dataType : 'jsonp',
                    crossDomain : true,
                    scriptCharset : that.get('sourceCharset'),
                    jsonp : that.get('jsonpCallback'),
                    success : function (data){
                        if (last_request === request) {//仅处理最后一次请求
                            that._cache && (that._cache[request.request] = data);
                            that._sourceSuccess(data , request);
                        }
                    }
                });
            };
            return jsonp_source;
        },
        _createArraySource : function (source){
            var that = this;
            return  {
                type : 'Array',
                sendRequest : function (request){
                    that._sourceSuccess(source , request);
                }
            };
        },
        _createFunctionSource : function (source){
            var that = this;
            return {
                type : 'function',
                sendRequest : function (request){
                    var val ;
                    if (val = source(request.query)) {
                        that._sourceSuccess(val , request);
                    }
                }
            }
        },
        _createObjectSource : function (source){
            var that = this;
            return  {
                type : 'Object',
                sendRequest : function (request){
                    that._sourceSuccess(source , request);
                }
            };
        },
        /**
         * 设置autocomplete属性，关闭浏览器默认的自动完成功能
         * @private
         */
        _syncBrowserAutocomplete : function (){
            var input_node = this.get('inputNode');
            if (input_node.prop('nodeName').toLowerCase() === 'input') {
                input_node.attr('autocomplete' , this.get('_syncBrowserAutocomplete') ? 'on' : 'off');
            }
        }
    };
    return AutoCompleteBase;
},{requires : ['node','base']});
/**
 * RICH 包含UI所有交互逻辑
 */
KISSY.add('kg/autocomplete/3.0.0/rich',function (S ,Node , Event , O){
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
        this.initRich.apply(this , arguments);
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
         * 启用当无推荐结果时展示提示信息功能
         * @attribute enableNoResultsMessage
         * @type boolean
         * @default true
         **/
        enableNoResultsMessage : {
            value : true
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
         * overlay组件的zIndex配置
         * @attribute zIndex
         * @type number
         * @default 10000
         **/
        zIndex : {
            value : 10000
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
         * 添加一个层的自定义className，用于个性化定制样式
         * @attribute wapperClass
         * @type String
         **/
        wrapperClass : {
            value : ''
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
        initRich : function (){
            this.overlay        =null;//overlay实例
            this.overlayNode    =null;//提示层根节点
            this.contentNode    =null;//内容节点
            this.resultsListNode=null;//推荐结果的节点
            this.messageNode    =null;//错误信息节点
            this.hotNode        =null;//热门推荐节点
            this.headerNode     =null;//头部节点
            this.footerNode     =null;//尾部节点
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
                align  : _align,
                content: this.get('boundingBoxTemplate'),
                zIndex : this.get('zIndex')
            });
            overlay.render();
            var el = overlay.get('el');
            this.overlayId = 'J_Ks' + S.guid();
            el.prop('id', this.overlayId).addClass(CLS_AC_CONTAINER).attr('tabindex', '-1');
            this.get('wrapperClass') !== '' && el.addClass(this.get('wrapperClass'));
            this.overlayNode = el;
            this.headerNode = el.one('.J_AcHeader');
            this.bodyNode = el.one('.J_AcBody');
            this.footerNode = el.one('.J_AcFooter');
            this.messageNode = el.one('.J_AcMessage').hide();
            this.contentNode = el.one('.J_AcContent');
            this.hotNode = el.one('.J_HotList').hide();
            this.resultsListNode = el.one('.J_ResultsList').hide();
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
            S.Event.on(win , 'resize',  S.buffer(this._syncPosition , 100 , this), this);
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
                this._syncPosition();
            }else{
                query = S.escapeHTML(query);
                if(doc.activeElement  == this.inputNode[0]){
                    if (this.get('enableNoResultsMessage')) {
                        this.showMessage(S.substitute(this.get('noResultsMessage'),{//焦点还在输入框时才进行显示
                            query : query
                        }));
                    }else{
                        list_node.empty();
                        this.set(ACTIVE_ITEM, null);
                    }
                }
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
            return this;
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
                this._syncPosition();
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
                //this.overlay.set('width', this.get('width'));
                this.messageNode.show();
                this.set('visible', true);
                this._syncPosition();
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
                case 38 ://up
                    e.preventDefault();
                    this.activePrevItem();
                    break;
                case 40 ://down
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
KISSY.add('kg/autocomplete/3.0.0/hot',function (S, Node , Event , Io , Tpl){
    /**
     自动完成组件
     @module autocomplete
     @submodule autocomplete-hot
     **/
    /**
     自动完成组件热门推荐
     @class AutocompleteHot
     @extends AutocompleteBase
     @uses Overlay
     @constructor
     @param {Object} 配置项
     **/
    var EVT_SELECT = 'select';
    var EVT_QUERY = 'afterQueryChange';

    var CLS_ITEM = 'J_AcItem';
    var CLS_ACTIVE = 'ks-ac-hot-selected';

    var SELECTOR_ITEM = '.' + CLS_ITEM;
    var SELECTOR_TAB = '.J_TabItem';

    var AutoCompleteHot = function (){
        this.initHot.apply(this , arguments);
    };
    AutoCompleteHot.ATTRS = {
        /**
         * 热门推荐的模板，数据源来自hotSource参数，内容渲染到this.hotNode节点内
         * @attribute hotTemplate
         * @type String
         * @default '<div class="ks-ac-hot-city"><div class="ks-ac-acinput-hot-tit">热门城市/国家(支持汉字/拼音/英文字母)</div>' +
                         '<ul class="tab-nav">{{#results}}<li class="J_TabItem">{{tabname}}</li>{{/results}}</ul>' +
                         '<div class="tab-content J_TabContent">{{#results}}' +
                         '<div class="tab-pannel J_Pannel">{{#tabdata}}<dl><dt>{{dt}}</dt><dd>{{#dd}}<span><a data-sid="{{sid}}" class="J_AcItem" tabindex="-1" href="javascript:void(0);" target="_self">{{cityName}}</a></span>{{/dd}}</dd></dl>{{/tabdata}}</div>{{/results}}</div></div>'
         **/
        hotTemplate : {
            value : '<div class="ks-ac-hot-city"><div class="ks-ac-acinput-hot-tit">热门城市/国家(支持汉字/拼音/英文字母)</div>' +
                '<ul class="tab-nav">{{#results}}<li class="J_TabItem" tabindex="2"><a href="javascript:void(0)" target="_self">{{tabname}}</a></li>{{/results}}</ul>' +
                '<div class="tab-content J_TabContent">{{#results}}' +
                '<div class="tab-pannel J_Pannel">{{#tabdata}}<dl><dt>{{dt}}</dt><dd>{{#dd}}<span><a data-sid="{{sid}}" class="J_AcItem" tabindex="3" href="javascript:void(0);" target="_self">{{cityName}}</a></span>{{/dd}}</dd></dl>{{/tabdata}}</div>{{/results}}</div></div>'
        },
        /**
         * 热门推荐的宽度
         * @attribute hotWidth
         * @type number|NodeList|null
         * @default null
         **/
        hotWidth : {
            value : 320
        },
        /**
         * 热门推荐的数据源，支持JSONP和本地数据，传参类型为字符串时将被判断为JSONP数据源
         * @attribute hotSource
         * @type String|Object
         * @default null
         **/
        hotSource : {
            value : null,
            setter : '_onHotSourceChange'
        },
        /**
         * 远程热门推荐的charset,默认和页面保持一致
         * @attribute hotSourceCharset
         * @type string
         * @default undefined
         **/
        hotSourceCharset : {
            value : undefined
        },
        /**
         * 热门推荐数据源指定为JSONP时，callback的参数名
         * @attribute
         * @type String
         * @default
         **/
        hotJsonpCallback : {
            value :'callback'
        },
        /**
         * 当前热门推荐被选中tab
         * @attribute hotActiveTab
         * @type number
         * @default null
         **/
        hotActiveTab : {
            value : null
        },
        /**
         * 热门数据格式化同时要求数据实现绑定
         * @attribute hotResultsFormatter
         * @type function
         * @default  function (data){
                         var results = {};
                         S.each(data.results,function (_iObj){
                             S.each(_iObj.tabdata , function (_jObj){
                                 S.each(_jObj.dd , function (_kObj){
                                     var id = 'hot_source_id_'+ S.guid();//必需
                                     _kObj.raw = S.mix({}, _kObj);
                                     _kObj.sid = id;//必需
                                     _kObj.text = _kObj.cityName;
                                     results[id] = _kObj;
                                 })
                             });
                         });
                         return results;
                     }
         **/
        hotResultsFormatter : {
            value : function (data){
                var results = {};
                S.each(data.results,function (_iObj){
                    S.each(_iObj.tabdata , function (_jObj){
                        S.each(_jObj.dd , function (_kObj){
                            var id = 'hot_source_id_'+ S.guid();//必需
                            _kObj.raw = S.mix({}, _kObj);
                            _kObj.sid = id;//必需
                            _kObj.text = _kObj.cityName;
                            results[id] = _kObj;
                        })
                    });
                });
                return results;
            }
        },
        /**
         * 提供一个数据的预处理的机制，要求返回数据对象.
         * @attribute hotResultsLocator
         * @type function
         * @default null
         **/
        hotResultsLocator : {
            value : null
        },
        /**
         * 热门推荐层的可见状态
         * @attribute hotVisible
         * @type boolean
         * @default false
         **/
        hotVisible : {
            value : false
        }
    };
    AutoCompleteHot.prototype = {
        initHot : function (){
            if (this.get('hotSource') === null) {
                return ;
            }
            this._renderHot();
            this._bindHot();
            this._hasBuildHot  = false;//是否初始化过热门数据
            this._hotResults = {};
        },
        destructor : function (){
            this.hotNode.detach();
        },
        _renderHot : function (){

        },
        _bindHot : function (){
            var input_node = this.get('inputNode');

            this.on('afterHotVisibleChange' , function (e){
                var isShowIt = e.newVal;
                if (isShowIt) {
                    if (!this._hasBuildHot) {
                        this._buildHot();
                    }
                    this.hotNode.show();
                    this.overlay.set('width',this.get('hotWidth'));
                    this.set('resultsListVisible' , false);
                    this.set('visible' , true);
                    this._syncPosition();
                }else{
                    this.hotNode.hide();
                }
            },this);
            this.on('afterVisibleChange', function (e){
                if (e.newVal === false) {
                    this.set('hotVisible' , false);
                }
            }, this);
            //展示推荐结果时不展示热门推荐
            this.on('afterResultsListVisibleChange' , function (e){
                if (e.newVal) {
                    this.set('hotVisible' , false);
                }
            }, this);
            input_node.on('focus', function (){
                if (this._isSelectVal) {
                    return;
                }
                this.set('hotVisible' , true);
            },this);
            input_node.on('keydown', function (e){
                if (this.get('hotVisible') && (e.keyCode === 38 || e.keyCode === 40)) {
                    this.overlayNode[0].focus();
                }
            } , this);
            this.on(EVT_QUERY , function (e){
                if (S.trim(e.newVal.query) === '') {//输入框为空时展示热门推荐
                    this.set('messageVisible' , false);
                    this.set('hotVisible' , true);
                }else{
                    this.set('hotVisible' , false);
                }
            } , this);

            //点击选择项
            this.hotNode.delegate('click' , SELECTOR_ITEM , function (e){
                var el = S.one(e.currentTarget);
                this.fire(EVT_SELECT , {
                    node : el,
                    result : this._hotResults[el.attr('data-sid')]
                })
            },this);

            //tab 切换
            this.hotNode.delegate('click' , SELECTOR_TAB , function (e){
                var index = S.indexOf(e.currentTarget , this.hotNavNodes);
                this.set('hotActiveTab' , index);
            },this);

            this.on('afterHotActiveTabChange' , function (e){
                var _prevNav = this.hotNavNodes.item(e.prevVal);
                var _prevPannel = this.hotPannelNodes.item(e.prevVal);
                var _nextNav = this.hotNavNodes.item(e.newVal);
                var _nextPannel = this.hotPannelNodes.item(e.newVal);
                _prevNav && _prevNav.removeClass(CLS_ACTIVE);
                _prevPannel && _prevPannel.hide();
                _nextNav && _nextNav.addClass(CLS_ACTIVE);
                _nextPannel && _nextPannel.show();
                this._syncPosition();
            },this);

            //在热门推荐按下esc时触发隐藏
            this.hotNode.on('keydown', function (e){
                if (e.keyCode === 27) {
                    this.set('hotVisible' , false);
                    this.set('visible',false);
                }
            },this);
        },
        /**
         * 初始化热门推荐
         * @private
         */
        _buildHot : function (){
            var that = this;
            var source = this.get('hotSource');
            /**
             * HOT的渲染
             * @param data 依赖的数据源
             * @private
             */
            var _build = function (data){
                var locator = that.get('hotResultsLocator');
                var formatter = that.get('hotResultsFormatter');
                locator && (data = locator.call(that , data));
                that._hotResults = formatter.call(that, data);//数据扁平化实现DOM的id和数据的绑定
                var html = new Tpl(that.get('hotTemplate')).render(data);
                var hot_node = that.hotNode;
                hot_node.html(html);
                that.hotNavNodes = hot_node.all('.J_TabItem');
                that.hotPannelNodes = hot_node.all('.J_Pannel');
                that.hotPannelNodes.hide();
                that.set('hotActiveTab',0);
                that._hasBuildHot = true;
            };
            if (S.isString(source)) {
                S.IO({
                    url : source,
                    dataType : 'jsonp',
                    jsonp : this.get('hotJsonpCallback'),
                    scriptCharset : that.get('hotSourceCharset'),
                    success : function (data){
                        _build(data);
                    }
                });
            }else if(S.isObject(source) || S.isArray(source)){
                _build(source);
            }
        },
        /**
         * 修改hotSource时重置HOT的状态
         * @private
         */
        _onHotSourceChange : function (){
            this._hasBuildHot = false ;
            this._hotResults = {};
            this.set('hotActiveTab' , -1);
        }
    };
    return AutoCompleteHot ;
}, {requires : ['node','event','ajax' , 'xtemplate']});
/**
 * @fileoverview 自动完成组件
 * @author 舒克<shuke.cl@taobao.com>
 * @module autocomplete
 **/
KISSY.add('kg/autocomplete/3.0.0/index',function (S , RichBase , AcBase, AcRich , AcHot) {
    /**
     * 通用的自动完成组件
     * @class Autocomplete
     * @constructor
     * @extends Base
     * @uses AutocompleteBase
     * @uses AutocompleteRich
     * @uses AutocompleteHot
     */
    return RichBase.extend([AcBase , AcRich, AcHot] , {},{});
}, {requires:['rich-base' , './base' , './rich' , './hot' ,'./autocomplete.css']});




/**
 * @fileoverview 自动完成组件继承-多输入
 * @author 弘树<tiehang.lth@taobao.com>
 * @module autocomplete/multiple
 **/
KISSY.add('kg/autocomplete/3.0.0/multiple',function (S, AutoComplete) {

    var $ = S.all, Node = S.Node, DOM = S.DOM, Event = S.Event, each = S.each;

    function Multiple(container, config){

        var self = this;

        if (!(self instanceof Multiple)) {
            return new Multiple(container, config);
        }
        /**
         * 容器元素
         * @type {Element}
         */
        self.container = container = S.one(container);
        if (!container) return;

        var obj = S.mix(config,{
            inputNode        : self.container
        });
        Multiple.superclass.constructor.call(self, obj);

        self.init();

    }

    Multiple.ATTRS = {

        inputLimit:{    //约束是否只允许输入下拉提示中的选项
            value: false
        },
        dataList: {     //保存结果
            value: []
        },
        resultIdLocator:{
            value: ''
        },
        insertFormatter: {
            value: undefined
        }
    };

    S.extend(Multiple, AutoComplete);

    S.augment(Multiple, {
        /**
         * 初始化Multiple输入框dom结构调整，绑定keydown事件
         */
        init: function(){
            var self = this;
            //Dom modify
            var wrapNode = new S.Node('<div class="ks-multiple-wrap"><div class="ks-multiple-list"></div></div>');
            self.container.after(wrapNode);
            wrapNode.append(self.container);

            self.bindEvent();

        },
        /**
         * 事件绑定
         */
        bindEvent: function(){
            var self = this;
            //keydown事件绑定
            var limit = self.get('inputLimit');
            self.container.on('keydown', function(e){
                if(!limit && e.keyCode == 13 && this.value){
                    //回车键，添加item
                    //只有无输入限制（必须从下拉列表中点选）时才响应回车添加
                    self.addItem(S.trim(this.value));
                    this.value = '';
                }
            });
            self.container.siblings('div.ks-multiple-list').delegate('click', 'span.ks-ac-mul-delete', function(e){
                var target = $(e.currentTarget);
                var id = target.attr('data-id');
                self.deleteItem(id);
            });

            self.on('select', function(e){
                self.addItem(e.result);
                self.container.val('');
            })

            self.on('afterDataListChange', function(){
                self.renderList();
            });
        },
        /**
         * 添加item
         * @param item
         */
        addItem: function(item){
            var self = this;
            if(S.isString(item)){
                var val = item;
                item = {raw: {}};
                item.raw[self.get('resultIdLocator')] = val;
            }
            var list = S.clone(this.get('dataList'));
            if(this._indexOf(list, item) < 0){
                list.push(item);
            }
            this.set('dataList', list);
        },
        /**
         * 删除item
         * @param item
         */
        deleteItem: function(item){
            var val = item;
            item = {raw: {}};
            item.raw[this.get('resultIdLocator')] = val;
            var list = S.clone(this.get('dataList'));
            var index = this._indexOf(list, item);
            list.splice(index, 1);
            this.set('dataList', list);
        },
        /**
         * 查找item在array中的序号
         * @param array
         * @param item
         * @returns {number}
         * @private
         */
        _indexOf: function(array, item){
            var index = -1;
            var idProp = this.get('resultIdLocator');
            var i = 0;
            each(array, function(_item){
                if(_item.raw[idProp] == item.raw[idProp]){
                    index = i;
                    return false;
                }
                i++;
            });
            return index;
        },
        /**
         * 展示已输入列表
         */
        renderList: function(){
            var inputNode = this.container;
            var insertFormatter = this.get('insertFormatter');
            if(insertFormatter){
                var results = insertFormatter.call(this, this.get('dataList'));
                var html = '';
                each(results, function(_html){
                    html += _html;
                });
                inputNode.siblings('div.ks-multiple-list').html(html);
            }
        }
    });
    return Multiple;

}, {requires:['./index', './multiple.css']});
