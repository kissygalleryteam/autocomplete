KISSY.add(function (S , RichBase , AcBase, AcRich , AcHot , AcAria) {
    /**
     * 通用的自动完成组件，包括盲人支持模块
     * @class AutocompleteAll
     * @constructor
     * @extends Base
     * @uses AutocompleteBase
     * @uses AutocompleteRich
     * @uses AutocompleteHot
     */
    return RichBase.extend([AcBase , AcRich, AcHot , AcAria] , {},{});
}, {requires:['rich-base' , './base' , './rich' , './hot' , './aria' ,'./autocomplete.css']});
