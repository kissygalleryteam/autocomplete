/**
 * @fileoverview 自动完成组件
 * @author 舒克<shuke.cl@taobao.com>
 * @module autocomplete
 **/
KISSY.add(function (S , RichBase , AcBase, AcRich , AcHot) {
    /**
     * 通用的自动完成组件
     * @class Autocomplete
     * @constructor
     * @extends Base
     * @uses AutocompleteBase
     * @uses AutocompleteRich
     * @uses AutocompleteHot
     */
    var _extend = function (name , base , extensions , px , sx){
        var Autocomplete = function (){
            Autocomplete.superclass.constructor.apply(this,arguments);
            this.initializer();
        };
        //将构造函数和析构函数存入数组，然后依次调用，避免覆盖
        var initializers = [];
        var destructors = [];

        var addition = function (){};
        addition.prototype  = px;
        S.mix(addition , sx ,undefined, undefined , true);//mix statics
        extensions.push(addition);
        S.extend(Autocomplete, base);//继承 base
        S.each(extensions , function (extClass){ //mix 原型和静态属性方法
            var ext_pro = extClass.prototype ;
            //构造函数的处理
            if (ext_pro && ext_pro.initializer) {
                initializers.push(ext_pro.initializer);
            }
            //析构函数的处理
            if (ext_pro && ext_pro.destructor) {
                destructors.push(ext_pro.destructor)
            }
            S.augment(Autocomplete, extClass);
            S.mix(Autocomplete, extClass , undefined , undefined ,true);
        });
        Autocomplete.prototype.initializer = function (){
            S.each(initializers , function (initializer){
                initializer.call(this);
            },this);
        };
        Autocomplete.prototype.destructor = function (){
            S.each(destructors , function (destructor){
                destructor.call(this);
            },this);
        };
        Autocomplete.NAME = name ;
        return Autocomplete;
    };
    return RichBase.extend([AcBase , AcRich, AcHot] , {},{});
}, {requires:['rich-base' , './base' , './rich' , './hot' ,'./autocomplete.css']});



