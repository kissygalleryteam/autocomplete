/**
 * @fileoverview 自动完成组件继承-多输入
 * @author 弘树<tiehang.lth@taobao.com>
 * @module autocomplete/multiple
 **/
KISSY.add(function (S, AutoComplete) {

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
    }

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
            var selectEnterFlag = false;
            var limit = !self.get('inputLimit');
            self.container.on('keydown', function(e){
                if(!selectEnterFlag){
                    //只对不是从列表中enter选择的
                    if(!limit && e.keyCode == 13){
                        //回车键，添加item
                        //只有无输入限制（必须从下拉列表中点选）时才响应回车添加
                        self.addItem(S.trim(this.value));
                        this.value = '';
                    }
                    selectEnterFlag = !selectEnterFlag;
                }
            });
            self.container.siblings('div.ks-multiple-list').delegate('click', 'span.ks-ac-mul-delete', function(e){
                var target = $(e.currentTarget);
                var id = target.attr('data-id');
                self.deleteItem(id);
            });

            self.on('select', function(e){
                self.addItem(e.result);
                selectEnterFlag = true;
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