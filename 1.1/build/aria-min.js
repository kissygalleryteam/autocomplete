/*! autocomplete - v1.1 - 2013-06-25 8:30:37 PM
* Copyright (c) 2013 舒克; Licensed  */
KISSY.add(function(a){var b="J_AcItem",c=".J_TabItem",d="."+b,e=function(){this.initAria.apply(this,arguments)};return e.ATTRS={},e.prototype={nodeArr:null,isFirstShow:!0,initAria:function(){this.bindAria(),this.nodeArr=null},bindAria:function(){this.on("afterHotActiveTabChange",function(a){var b=this.hotNavNodes.item(a.newVal),c=this.hotPannelNodes.item(a.newVal),e=this.hotItemNodes=c.all(d);this.nodeArr=this.buildArr2(e),this.isFirstShow?this.isFirstShow=!1:b.one("a")&&b.one("a")[0].focus()},this),this.on("afterHotSourceChange",function(){this.isFirstShow=!0},this),this.hotNode.delegate("keydown",d,function(c){var d=a.one(c.currentTarget),e=d.data("src");if(d.hasClass(b)&&d.hasData("src"))switch(c.keyCode){case 37:c.preventDefault(),this._selectHotLeft(e);break;case 38:c.preventDefault(),this._selectHotTop(e);break;case 39:c.preventDefault(),this._selectHotRight(e);break;case 40:c.preventDefault(),this._selectHotBottom(e)}},this),this.hotNode.delegate("keydown",c,function(a){var b=this.get("hotActiveTab");switch(a.keyCode){case 37:b--,0>b&&(b=this.hotNavNodes.length-1),this.set("hotActiveTab",b);break;case 39:b++,b>=this.hotNavNodes.length&&(b=0),this.set("hotActiveTab",b);break;case 38:this.hotItemNodes.item(0)[0].focus();break;case 40:this.hotItemNodes.item(0)[0].focus();break;case 9:a.preventDefault(),this.hotItemNodes.item(0)[0].focus()}},this)},buildArr2:function(b){var c=[],d={};return b.each(function(b){var c=b.offset();a.isArray(d[c.top])||(d[c.top]=[]),d[c.top].push({node:b,offset:c,x:d[c.top].length})}),a.each(d,function(a,b){c.push(b)}),c.sort(function(a,b){return a-b}),a.each(c,function(b,e){a.each(d[b],function(a){a.y=e,a.node.data("src",a)}),c[e]=d[b]}),c},_selectHotTop:function(a){var b=a.x,c=a.y;c--,0>c&&(c=this.nodeArr.length-1),this._selectHot(b,c,"up")},_selectHotBottom:function(a){var b=a.x,c=a.y;c++,c>=this.nodeArr.length&&(c=0),this._selectHot(b,c,"down")},_selectHotLeft:function(a){var b=a.x,c=a.y;b--,0>b&&(c--,0>c&&(c=this.nodeArr.length-1),b=this.nodeArr[c].length-1),this._selectHot(b,c)},_selectHotRight:function(a){var b=a.x,c=a.y;b++,b>=this.nodeArr[a.y].length&&(b=0,c++,c>=this.nodeArr.length&&(c=0)),this._selectHot(b,c)},_selectHot:function(a,b,c){if(this.nodeArr[b])if(this.nodeArr[b][a])this.nodeArr[b][a].node[0].focus();else{if("up"===c)return b--,this._selectHot(a,b,c),!1;if("down"===c)return b++,this._selectHot(a,b,c),!1}}},e},{requires:["node","event"]});