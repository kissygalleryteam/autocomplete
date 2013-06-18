KISSY.add(function (S , RichBase , AcBase, AcRich , AcHot , AcAria) {
    /**
     * 通用的自动完成组件
     * @class Autocomplete
     * @constructor
     * @extends Base
     * @uses AutocompleteBase
     * @uses AutocompleteRich
     * @uses AutocompleteHot
     */
    return RichBase.extend([AcBase , AcRich, AcHot , AcAria] , {},{});
}, {requires:['rich-base' , './base' , './rich' , './hot' , './aria' ,'./autocomplete.css']});
