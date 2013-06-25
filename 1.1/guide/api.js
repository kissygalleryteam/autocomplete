YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "AutoCompleteBase",
        "Autocomplete",
        "AutocompleteHot",
        "AutocompleteRich"
    ],
    "modules": [
        "autocomplete",
        "autocomplete-hot",
        "autocomplete-rich"
    ],
    "allModules": [
        {
            "displayName": "autocomplete",
            "name": "autocomplete",
            "description": "自动完成组件"
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
        }
    ]
} };
});