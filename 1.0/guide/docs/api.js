YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "AutoCompleteBase",
        "Autocomplete",
        "AutocompleteAria",
        "AutocompleteHot",
        "AutocompleteRich"
    ],
    "modules": [
        "autocomplete",
        "autocomplete-aria",
        "autocomplete-hot",
        "autocomplete-rich",
        "autocomplete_multiple"
    ],
    "allModules": [
        {
            "displayName": "autocomplete",
            "name": "autocomplete",
            "description": "自动完成组件"
        },
        {
            "displayName": "autocomplete-aria",
            "name": "autocomplete-aria",
            "description": "AutocompleteAria主要基于AutocompleteHot，盲人用户的支持，增加组件的可用性"
        },
        {
            "displayName": "autocomplete-hot",
            "name": "autocomplete-hot",
            "description": "自动完成组件"
        },
        {
            "displayName": "autocomplete-rich",
            "name": "autocomplete-rich",
            "description": "AutocompleteBase\n 自动完成组件的基类，主要提供底层数据逻辑的处理，分发两个事件<b>results afterQueryChange<b>"
        },
        {
            "displayName": "autocomplete/multiple",
            "name": "autocomplete_multiple"
        }
    ]
} };
});