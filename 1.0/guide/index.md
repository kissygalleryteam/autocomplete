## 综述
Autocomplete组件

组件分为两部分：

* 输入过程中的辅助提示
* 聚焦到输入框时，展示热门推荐的提示

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