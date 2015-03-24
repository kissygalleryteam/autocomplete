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
    return RichBase.extend([AcBase , AcRich, AcHot] , {},{});
}, {requires:['rich-base' , './base' , './rich' , './hot' ,'./autocomplete.css']});



