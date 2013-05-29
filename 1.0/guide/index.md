## 综述
Autocomplete组件

组件分为3个部分：

* Base: 底层数据逻辑处理 ,提供 **afterQueryChange** 和 **afterResultsChange** 两个事件，可基于此做二次开发
* Rich: 输入过程中的辅助提示 ，提供各种配置参数 
* Hot: 聚焦到输入框时，展示热门推荐的提示。和Base Rich完全隔离

## 组件快速使用


```javascript

		var autocomplete = new Autocomplete({
            inputNode : '#J_Test',//绑定的节点
            source : 'http://s.jipiao.trip.taobao.com/city_search.do?lines={maxResults}&q={query}',//数据源，支持jsonp 或者本地的Object && Array
            resultListLocator : 'result',//指定list依赖的数组在数据源的位置
            resultTextLocator : 'cityName',//指定一个数据项的字段为文本内容
            hotSource : 'http://www.taobao.com/go/rgn/trip/chinahotcity_jsonp.php',//热门推荐的数据，如果不指定，则不展示热门推荐
            resultFormatter : function (query, results){//对展示进行格式化
                return S.map(results,function (_item){
                    return S.substitute('<div class="ks-ac-item-inner"><span class="ks-ac-name">{cityname}</span><span class="ks-ac-intro">{py}</span></div>',{
                        cityname : _item.text.replace(new RegExp(query,'gi') , '<span class="ks-ac-message-hightlight">'+ query +'</span>'),
                        py : _item.raw.py.replace(new RegExp(query,'gi') , '<span class="ks-ac-message-hightlight">'+ query +'</span>')
                    });
                });
            }
        });

```

##基础配置

|Attribute:属性名称|Default:默认值|Description:说明|
|:--------|:------|:----------|
|inputNode|null|**Required** {String|NodeList} 绑定的输入框节点|
|source|null|**Required** {String|Object|Array}支持JSONP,本地数据支持Object&Array,传入字符串时认为是一个jsonp请求的url|
|resultListLocator|null|**Required** {String|Function} 指定推荐的数据结果在数据源中的位置|
|resultTextLocator|null|**Required** {String|Function} 指定每一个数据项对应的填充到输入框的数据|
|maxResults|1000|展示的搜索结果最大数值|