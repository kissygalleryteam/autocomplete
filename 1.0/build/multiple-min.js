/*! autocomplete - v1.0 - 2013-06-13 2:13:04 PM
* Copyright (c) 2013 舒克; Licensed  */
KISSY.add(function(a,b){function c(b,d){var e=this;if(!(e instanceof c))return new c(b,d);if(e.container=b=a.one(b),b){var f=a.mix(d,{inputNode:e.container});c.superclass.constructor.call(e,f),e.init()}}var d=a.all,e=(a.Node,a.DOM,a.Event,a.each);return c.ATTRS={inputLimit:{value:!1},dataList:{value:[]},resultIdLocator:{value:""},insertFormatter:{value:void 0}},a.extend(c,b),a.augment(c,{init:function(){var b=this,c=new a.Node('<div class="ks-multiple-wrap"><div class="ks-multiple-list"></div></div>');b.container.after(c),c.append(b.container),b.bindEvent()},bindEvent:function(){var b=this,c=b.get("inputLimit");b.container.on("keydown",function(d){!c&&13==d.keyCode&&this.value&&(b.addItem(a.trim(this.value)),this.value="")}),b.container.siblings("div.ks-multiple-list").delegate("click","span.ks-ac-mul-delete",function(a){var c=d(a.currentTarget),e=c.attr("data-id");b.deleteItem(e)}),b.on("select",function(a){b.addItem(a.result),b.container.val("")}),b.on("afterDataListChange",function(){b.renderList()})},addItem:function(b){var c=this;if(a.isString(b)){var d=b;b={raw:{}},b.raw[c.get("resultIdLocator")]=d}var e=a.clone(this.get("dataList"));this._indexOf(e,b)<0&&e.push(b),this.set("dataList",e)},deleteItem:function(b){var c=b;b={raw:{}},b.raw[this.get("resultIdLocator")]=c;var d=a.clone(this.get("dataList")),e=this._indexOf(d,b);d.splice(e,1),this.set("dataList",d)},_indexOf:function(a,b){var c=-1,d=this.get("resultIdLocator"),f=0;return e(a,function(a){return a.raw[d]==b.raw[d]?(c=f,!1):(f++,void 0)}),c},renderList:function(){var a=this.container,b=this.get("insertFormatter");if(b){var c=b.call(this,this.get("dataList")),d="";e(c,function(a){d+=a}),a.siblings("div.ks-multiple-list").html(d)}}}),c},{requires:["./index","./multiple.css"]});