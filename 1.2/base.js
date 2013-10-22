KISSY.add(function (S){
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