## Autocomplete

* 版本：1.1
* API：[//gallery.kissyui.com/autocomplete/1.1/guide/docs/index.html](//gallery.kissyui.com/autocomplete/1.0/guide/docs/main.html)
* demo：[//gallery.kissyui.com/autocomplete/1.1/demo/index.html](//gallery.kissyui.com/autocomplete/1.0/demo/index.html)

##功能
* 支持本地或远程，并对匹配结果进行二次开发
* 支持热门推荐，及没有任何输入时暂时默认推荐内容
* 支持多个项的输入，自行指定分隔符
* 盲人用户的支持，热门推荐模块支持键盘上下左右操作
* 更多演示请看DEMO和查阅API

##快速使用

```javascript
S.use('gallery/autocomplete/1.1/index', function (S, Autocomplete) {
var autocomplete = new Autocomplete({
    inputNode        : '#J_NeCity',
    source           : '//s.jipiao.trip.taobao.com/city_search.do?lines={maxResults}&q={query}',
    resultListLocator: 'result',//指定返回数据里的数组位置
    resultTextLocator: 'cityName',//指定回填的文本内容
  hotSource : '//www.taobao.com/go/rgn/trip/chinahotcity_jsonp.php'//不指定及没有热门推荐，必须按照此数据模板提供，其他数据格式需要自行重新配置hotResultsFormatter和hotResultsLocator
});
})
```

