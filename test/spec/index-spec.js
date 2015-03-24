KISSY.add(function (S, Node,Demo) {
    var $ = Node.all;
    describe('autocomplete', function () {
        it('Instantiation of components',function(){
            var demo = new Demo();
            expect(S.isObject(demo)).toBe(true);
        })
    });

},{requires:['node','kg/autocomplete/3.0.0/']});