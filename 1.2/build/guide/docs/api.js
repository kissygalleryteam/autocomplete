/*
combined files : 

gallery/autocomplete/1.2/guide/docs/api

*/
YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "AutoCompleteBase",
        "Autocomplete",
        "AutocompleteAll",
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
            "description": "AutocompleteRich主要基于AutocompleteBase，利用afterQueryChange和results两个事件创建包含更多交互的富应用"
        },
        {
            "displayName": "autocomplete/multiple",
            "name": "autocomplete_multiple"
        }
    ]
} };
});
