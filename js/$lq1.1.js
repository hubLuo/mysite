/*
* 1.1版本修改以下内容
* 1--修改了读取search方法，使得，组装一个模拟arguments的参数集合数组，返回给方法，统一调用。
* 2--添加eq，eqs方法，获取部分元素的$$对象,把getDom，getDoms方法，修给为el,和els方法。
* 3--给String类对象，添加新方法getName，before,after;
* 4--设置元素位置，去除centerEl方法，添加getPos,和setPos方法，获取和设置，相对于指定定位元素的位置
* 5--元素样式操作中，在getStyle和setStyle中添加了，CSS3部分属性判断，添加了CSS3属性是否支持方法，添加CSS3前缀方法
* 6--字符串操作中，添加了，-转为驼峰写法的方法；
* 7--事件模块中，修改了，用户自定义事件，bind方法使得用户自定义事件，记录在对应的元素的listeners属性中，DOM事件，记录在对应元素events属性中,属性events用于低版本ie中this的重新指定。
* 8--添加兼容requestAnimationFrame方法，添加JS帧动画方法animationFrame
* 9--添加IE低版本的多条件查询元素方法multipleFind
* 10--去除addEls方法改为record方法，来进行内存管理;
* 11-添加事件方法 ons,removes, delegates;
* 12--添加tie,bundle方法记录元素属性值，区别在于：bundle记录集合，tie记录用户自定义属性，且记录方式为单个值。
* 13--由于transform属性不可以读取性，使用tieTransform方法为元素添加tranform属性配置记录，cssTransform方法来读取和设置元素上transform属性值。
* 14--cssMatrix来处理角度直接转换 成矩阵数值
* 15--添加run方法，为每个元素提供外部函数处理接口。
* 16--getRelatedTarget方法，elContains方法,unCapture方法解决mouseover,mouseout捕获问题
* 17--为更好的效率和规范，采用use strict模式，该模式下，无法使用arguments.callee,caller，因为现今JS已经支持具名函数表达式，从效率和安全性来说，使用具名函数表达式更优
* 最明显更改之处是addDomLoaded函数中，使用具名函数替代了arguments.callee
* 18--添加获取节点兄弟的方法sibling
* 19--获取元素所占的全部空间outHeight,outWidth , 元素的完全位置：outLeft ,outTop;
* 20--由于像transitionend 和canplaythrough，ended，事件都会触发多次，所以添加只运行一次的事件添加方法one；
* 21--hasPrototypeProperty判断是不是原型中的属性。
* 22--supportStyle改名为hasOwnStyle，并添加事件属性判断方法hasOwnEvent
* 23--完善事件添加on ,删除 off ，触发trigger
* 24--function方法扩展getName中 name属性名在严格模式下，是只读属性，为对这个属性操作方便改为fnName
*
*
* * */
"use strict";
(function(){
    /*
     * 原始类 功能扩展,兼容
     * */
    //function
    Function.prototype.getName = function(){
        //name在严格模式下，是只读属性，为对这个属性操作方便改为fnName
        return this.fnName || (this.toString().match(/function\s*([^(]*)\(/)[1] ||"anonymity")
    }
    Function.prototype.before = function( func ) {
        var __self = this;
        return function() {
            if ( func.apply( this, arguments ) === false ) {
                return false;
            }
            return __self.apply( this, arguments );
        }
    }
    Function.prototype.after = function( func ) {
        var __self = this;
        return function() {
            var ret = __self.apply( this, arguments );
            if( ret === false) {
                return false;
            }
            func.apply( this, arguments );
            return ret;
        }
    }

    //requestAnimationFrame
    window.requestAnimationFrame = window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame;
    window.cancelAnimationFrame = window.cancelAnimationFrame|| window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame||window.cancelRequestAnimationFrame||window.webkitCancelRequestAnimationFrame||window.mozCancelRequestAnimationFrame;
    if(!window.requestAnimationFrame){
        var lastTime=Date.now();
        window.requestAnimationFrame=function(callback){
            var nowTime=Date.now();
            var intervalTime=Math.max(16.7-( nowTime-lastTime),0);
            var id=setTimeout(callback,intervalTime);
            lastTime=nowTime+intervalTime;
            return id;
        }
    }
    if(!window.cancelAnimationFrame){
        window.cancelAnimationFrame=function(index){
            clearTimeout(index);
        }
    }
})();
/*//简单模仿版本----------基础框架开始*/

//主框架
/*双对象法则*/
/*主框架：只做一件事情：就是获取元素集合*/
(function(w){
    //第一个对象
    function $$(id,context){
        return this.init(id,context)
    }
    $$.prototype.init=function(id,context){
        var that=this;
        that.length=0;
        var nodeList=[];
        if( !id ){
            return  that;
        }

        if ($lq.isString(id)) {
            nodeList=$lq.selects(id,(context || document));
            that.id=id;
            that.length=nodeList.length;//查询不到元素即0；
            for(var i=(that.length-1);i>=0;i--){
                that[i]=nodeList[i];
            }
            //this.elements=$lq.commonGet(id,context);
        }else if($lq.isArray(id) || $lq.isHTMLCollection(id) || $lq.isArguments(id)){
            nodeList=id;
            that.length=nodeList.length;
            that.id="array";
            for(var i=(that.length-1);i>=0;i--){
                that[i]=nodeList[i];
            }
        } else if ($lq.isElement(id)) {
            that.length=1;
            that.id=id.id || id.className ||id.tagName || id.nodeName || "el";
            that[0]=id;
            nodeList[0]=id;
        /*    if (id != undefined) {    //_this是一个对象，undefined也是一个对象，区别与typeof返回的带单引号的'undefined'
                //this.elements[0] = id;
                that.length=1;
                that[0]=id;
                nodeList[0]=id;
            }*/
        } else if ($lq.isFunction(id)) {
            //onready代码
            //this.ready(args);
            $lq.addDomLoaded(id);
        };
        return that;
    }
    //双对象法则 - 第二个对象
/* 第一个对象是$lq函数对象，第二个对象是$lq函数执行后的$$实例对象*/
    /*第一个$lq函数对象，存储了一系列常用的方法，$$实例对象存储了对元素的相应操作，以及链式写法*/
    var $lq=function(id,context){
        if($lq.is$$(id)){
            return id;
        }else{
            return new $$(id,context);
        }
    };
    $lq.hasStrictMode = (function(){
        "use strict";
        return this == undefined;
    }());
    $lq.extend = function() {
        /* 这段代码的意思：
         双对象法则
         如果只传递一个参数，表示给$$对象添加功能 -- 需要参与链式访问的
         如果传递两个参数，表示给指定的对象添加功能

         configurable:false,//不可删除
         writable:false,//不可读写
         enumerable:false,//不可枚举，也就无法复制
         //Object.getOwnPropertyDescriptor(test,"b");Object.getOwnPropertyDescriptors(test)查询属性配置情况；
         defineProperties--defineProperty配置对象属性
         */
        //最后一个参数设置false，就是进行属性配置；
        var key,arg = arguments,i = 1,len = arg.length,target = null,isCopy=true;
        if(Object.prototype.toString.call(arg[len-1])=="[object Boolean]"){
           isCopy=$lq.hasStrictMode?arg[len-1]:true;
            len=len-1;
        }
        if(len === 0){
            return;
        }else if(len === 1){
            target = $$.prototype;
            i--;
        }else{
            target = arg[0];
        }
        for(; i < len; i++){
            if(!isCopy){
                Object.defineProperties(target,arg[i]);
                //示例：定义事件函数方法中的name属性：$lq.extend(fn,{"name":{writable:true,enumerable:true,configurable:true,value:handler.getName()}},false);
                return;
            }
            for(key in arg[i]){
                target[key] = arg[i][key];
            }
        }
        return target;
    };
    $lq.is$$ =function(obj){
        return obj instanceof $$;
    };
    w.lq= w.$lq= $lq;
})(window);
/*
* 元素集合方法接口
* */
(function($lq){
    //接口
    $lq.extend({
        //绑定方法到每一个元素上
        each:function(fn){
            $lq.loop(this,fn);
            //return this;
        },
        search:function(fn,json){
            /*
            * 模拟arguments组装一个数组来返回参数集合：
            * 参数返回形式为：[],[{},{}],["",""]；或者是混搭的形式[{},[],""]；
            * 值在数组中的位置，是对应方法参数的位置。整个数组是一个参数集合，而不表示为一个参数值。
            * */
            for(var i in json){
                //统一返回参数为一个数组，参数位置就是数组中位置。
                $lq.isArray(json[i])? fn.call(this[i],json[i],i):fn.call(this[i],[].push(json[i]),i);
            }
        },
        inquire:function(fn,args){
            var res=null;
            switch(this.isSearch(args)){
                case true:
                    this.search(function(con,index){
                        //返回的参数是一个Array数组
                        fn(this,con,index);
                    },args[0]);
                    break;
                default:
                    this.each(function(index){
                        //返回的是一个arguments参数集合，注意arugments不是数组。
                        args.length==0?fn(this,index):fn(this,args,index);
                    });
                    break;
            };
         /*   switch(this.isSearch(args)){
                case true:
                    this.search(function(con){
                        fn(this,con);
                    },args[0]);
                    break;
                case false:
                    var len=args.length;
                    this.each(function(){
                        switch(len) {
                            case 0:
                                fn(this);
                                break;
                            case 1:
                                fn(this,args[0]);
                                break;
                            default:
                                fn(this,args);
                                break;

                        }
                    });
                    break;
            }*/
        },
        isSearch:function(args){
            var argsLen=args.length;
            var value=args[0];
            if(argsLen==1 && !$lq.isString(value) && !$lq.isFunction(value) && !$lq.isArray(value) && $lq.isObject(value)){
                //规定对象属性名用数字键表示元素，字符键表示有具体属性。
                for(var i in value){
                    if(!$lq.isNumber(parseInt(i))){
                        return false;
                    }
                }
                return true;
            }else{
                return false;
            }
        }
    });
    //工具
    $lq.extend({
        forEeach:function(arr,fn){
            this.inquire(function(el,cons){
                $lq.forEeach(cons[0],cons[1],el);
            },arguments);
            return this;
        }
    });
    //元素方法
    $lq.extend({
    /*    getDom:function(n){//待关闭
            var len=this.length;
            var arr=[];
            function elArray(){
                arr=[];
                for(var i=len-1; i>=0;i--){
                    arr[i]=this[i];
                }
                return arr;
            };
            return len==0?this:(len==1?this[0]:( n !=undefined  ?this[n]:elArray.call(this)));// 如果不写参数n 那么， n等于undefined    typeof n 等于"undefined"
        },*/
        el:function(index){
            var number= index || 0;
            return this[number];
        },
        els:function(star,end){
            var s=star || 0;
            var e=end || this.length;
            e=e>=this.length?this.length-1:e;
            var a=[];
            for(var i=s;i<=e;i++){
                a.push(this[i]);
            }
            return a;
        },
        find:function(){

        },
        eqs:function(start,end){
            var start=this.inScope(start)?parseInt(start):0;
            var end=this.inScope(end)?parseInt(end):this.length-1;
            var min=Math.min(start,end);
            var max=min==start?end:start;
            var els=[];
            for(var i=min;i<=max;i++){
                els.push(this[i]);
            }
            return $lq(els);
        },
        eq:function(){
            var args=arguments;
            var indexs=[];
            var els=[];
            for(var i=0;i<args.length;i++){
                this.inScope(i)&&(indexs.push(i));
            };
            $lq.sort(indexs,true);//升序排列
            for(var i=0;i<indexs.length;i++){
                els.push(this[indexs[i]]);
            }
            return $lq(els);
        },
        inScope:function(index){
            var index=parseInt(index);
            var res=(index>=0 && index<this.length)?true:false;
            return res;
        },
        //根据元素返回所在序号
        index:function(dom){
            for(var i=0;i<this.length;i+=1){
                if(this[i]==dom){
                    return i;
                }
            }
        },
        run:function(fn){
            this.inquire(function(el,cons,index){
                cons[0](el,index);
            },arguments);
            return this;
        },
        update:function(context){
          var id=this.id;
          if(id==undefined || id=="array" || id=="json"){console.log("ID不存在无法更新");return;}
          var els=$lq.selects(id,context||document);
          console.log("update");
          for(var i= 0,len=els.length;i<len;i++){
              this[i]=els[i];
          }
          this.length=els.length;
          return this;
      }
    });
    //元素内容
    $lq.extend({
        html:function(str){
            var value=null;
            this.inquire(function(el,cons){
                value=$lq.html(el,cons[0]);
            },arguments);
            return value!=null?value:this;
        },
        htmlText:function(str){
            var value=null;
            this.inquire(function(el,cons){
                value=$lq.htmlText(el,cons[0]);
            },arguments);
            return value!=null?value:this;
        }
    });
    //事件接口
    $lq.extend({
        //事件
        on:function (type,handler,capture){
            this.inquire(function(el,cons){
                $lq.on(el,cons[0],cons[1],cons[2]);
            },arguments);
            return this;
        },
        one:function (type,handler,capture){
            this.inquire(function(el,cons){
                $lq.one(el,cons[0],cons[1],cons[2]);
            },arguments);
            return this;
        },
        ons:function(json){
            this.inquire(function(el,cons){
                $lq.ons(el,cons[0]);
            },arguments);
            return this;
        },
        off:function(type,hanler,capture){
            this.inquire(function(el,cons){
                $lq.off(el,cons[0],cons[1],cons[2]);
            },arguments);
            return this;
        },
        offs:function(json){
            this.inquire(function(el,cons){
                $lq.offs(el,cons[0]);
            },arguments);
            return this;
        },
        removeEvent:function(type, fn,capture){
            this.inquire(function(el,cons){
                $lq.removeEvent(el,cons[0],cons[1],cons[2]);
            },arguments);
            return this;
        },
        trigger:function(type,config){
            this.inquire(function(el,cons){
                $lq.trigger(el,cons[0],cons[1]);
            },arguments);
            return this;
        },
        //事件类型
        delegate:function(eventType,fn,selector){
            this.inquire(function(el,cons){
                $lq.delegate(el,cons[0],cons[1],cons[2]);
            },arguments);
            return this;
        },
        delegates:function(json,selector){
            this.inquire(function(el,cons){
                $lq.delegates(el,cons[0],cons[1]);
            },arguments);
            return this;
        }
    });
    //动画接口
    $lq.extend({
        //动画({0:{},1:{}}) 或(json,callback,config)
        transition:function(con,setting){
            this.inquire(function(el,cons){
                $lq.transition(el,cons[0],cons[1]);
            },arguments);
            return this;
        },
        animate:function(con,setting){
            this.inquire(function(el,cons){
                $lq.animate(el,cons[1],cons[2]);
            },arguments);
            return this;
        }
    });
    //样式接口
    $lq.extend({
        //获取元素属性值({0:attr,1:attr} 或 (attr)
        getStyle:function(attr){
            var valArr=[];
            this.inquire(function(el,cons){
                valArr.push($lq.getStyle(el,cons[0]));
            },arguments);
            return valArr;
        },
        //({0:[[attr,attr2]],1:[[attr,attr3]]})或者([atr,attr2])
        getStyles:function(arrAttr){
            var valArr=[];
            var resArr=[];
            this.inquire(function(el,cons){
                valArr=$lq.getStyles(el,cons[0]);
                resArr.push(valArr);
            },arguments);
            return resArr;
        },
        //{0:[attr,value}],1:[attr,value]}或(attr,value)
        setStyle:function(attr ,value){
            this.inquire(function(el,cons){
                $lq.setStyle(el,cons[0],cons[1]);
                //$lq.setStyleHandler(el,cons);
            },arguments);
            return this;
        },
        //{0:[{attr:value}],1:[{attr:value}]}或({attr:value})
        setStyles:function(jsonAttr){
            this.inquire(function(el,cons){
                $lq.setStyles(el,cons[0]);
                //$lq.setStyleHandler(el,cons);
            },arguments);
            return this;
        },
    /*    transform:function(attr,val,isParsed){
            this.inquire(function(el,cons) {
                $lq.transform(el,cons[0], cons[1], cons[2])
            },arguments);
            return this;
        },*/
        outHeight:function(){
            var valArr=[];
            this.inquire(function(el,cons){
                valArr.push($lq.outHeight(el,cons[0]));
            },arguments);
            return valArr;
        },
        outWidth:function(){
            var valArr=[];
            this.inquire(function(el,cons){
                valArr.push($lq.outWidth(el,cons[0]));
            },arguments);
            return valArr;
        },
        addClass:function(classname){
            this.inquire(function(el,cons){
                $lq.addClass(el,cons[0]);
            },arguments);
            return this;
        },
        removeClass:function(classname){
            this.inquire(function(el,cons){
                $lq.removeClass(el,cons[0]);
            },arguments);
            return this;
        },
        tieTransform:function(attr,value){

        }
    });
    //节点接口
    $lq.extend({
        //(attr,value)或者{attr:value} 或者{0:[attr,value]}或者{0:{attr:value}}等于{0:[{attr:value}]}--设置属性值
        //(attr),{0:[attr]},{0:attr}--获取属性值
        attr:function(attr,value){
            var resArr=[]
            this.inquire(function(el,cons){
                var res=cons.length==2?$lq.attr(el,cons[0],cons[1]):$lq.attr(el,cons[0]);
                res !=undefined &&(resArr.push(res));
            },arguments);
            return resArr.length==0?this:resArr;
        },
        dataSet:function(attr,value){
            var res;
            this.inquire(function(el,cons){
                res=cons.length==2?$lq.dataSet(el,cons[0],cons[1]):$lq.dataSet(el,cons[0]);
            },arguments);
            return res!=undefined?this:res;
        }
    });
})($lq);
/*
 *方法函数
 * */
(function($lq){
//检查数据类型
    $lq.extend($lq,{
        //数据类型检测
        isNumber:function (val){
            return typeof val === 'number' && isFinite(val);
        },
        isBoolean:function (val) {
            //return typeof val ==="boolean";
            return Object.prototype.toString.call(val)=="[object Boolean]";
        },
        isString:function (val) {
            return typeof val === "string";
        },
        isUndefined:function (val) {
            return typeof val === "undefined";
        },
        isObject:function (str){
            if(str === null || typeof str === 'undefined'){
                return false;
            }
            //return typeof str === 'object';
            return Object.prototype.toString.call(str)=="[object Object]"
        },
        isNull:function (val){
            return  val === null;
        },
        isArray:function (arr) {
            if(arr === null || typeof arr === 'undefined'){
                return false;
            }
            //return arr.constructor === Array;
            return Object.prototype.toString.call(arr)=="[object Array]";
        },
        isArguments:function (arr) {
            if(arr === null || typeof arr === 'undefined'){
                return false;
            }
            return  Object.prototype.toString.call(arr)=="[object Arguments]";

        },
        isHTMLCollection:function(arr){
            //注意IE9,8,7,6,对于children集合判断为[object Object]
            return  Object.prototype.toString.call(arr)=="[object HTMLCollection]" || (!$lq.isFunction(arr) && arr.length !=undefined && arr.length>0 && $lq.isElement(arr[0]));
        },
        isFunction:function (fn) {
            return typeof (eval(fn)) ==="function" || Object.prototype.toString.call(fn)=="[object Function]";
            //return (!!fn && !fn.nodename && fn.constructor != String && fn.constructor != RegExp && fn.constructor != Array && /function/i.test(fn + ""));
            /*偶然使用typeof来判断正则表达式时，发现在firefox2中返回的是"object"，firefox3中返回"function"，特介绍一种稳定的判断方案：首先判断对象存在，检测是不是DOM元素，constructor指向创建当前对象的构造函数，那么这些fn.constructor!=String&&fn.constructor!=RegExp&&fn.constructor!=Array大家就能明白了吧，最后一个表达式/function/i.test(fn+""),先将fn转换成字符串，类似于"function name(){...}"，然后查找字符串中有没有“function”，/i表示查找模式中忽略大小写*/
        },
        //是否为元素
        isElement :( typeof HTMLElement === 'object' ) ?
            function(obj){
                return obj instanceof HTMLElement;
            } :
            function(obj){
                return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
        },
        isEmptyObject:function(obj){
            var res=false;
            if (JSON){
                res=$lq.stringify(obj)=="{}";
            }else if(Object.keys){
                res=Object.keys(obj).length==0;
            }else if(Object.getOwnPropertyNames){
                res= Object.getOwnPropertyNames(obj).length==0;
            }else{
                for(var  i in obj){
                    res=true;
                }
            }
            return res;
        },
        hasAttr:function(obj,attr){
            //注意判断有没有该属性，要考虑到该属性值为0，为空，为 false 的情况
            return !obj[attr] && obj[attr] !=0 && obj[attr]!="" && obj[attr]!=false;
        },
        hasNode:function(str,fn){
            var res=false;
            var fn= fn || function(){};
            var timer=setInterval(function(){
                if($lq.selects(str).length>0){
                    console.log("加载节点完成");
                    clearInterval(timer);
                    fn();
                    res=true;
                }else{
                    console.log("加载节点未完成");
                    res=false;
                }
            },1);
            return res;
        },
        //属性
        hasPrototypeProperty:function(obj,name){
            return !obj.hasOwnProperty(name) && (name in obj);
        },
        //样式
        hasOwnStyle:function (str,el) {
            if(el && !$lq.isElement(el)){return false;}
            var prefix = ["",'webkit', 'moz', 'ms', 'o'],res=false,
                element= el || document.documentElement?document.documentElement:document.body,
                htmlStyle = element.style;
            var str=$lq.toHump(str);
            if(str in htmlStyle){
                htmlStyle=null,res=str;
                return  res;
            }
            //防止用户修改属性造成的影响，才采用el元素类型进行新建 ，没有el则为div标签
            var div=el || document.createElement("div");
            for(var i=0;i<prefix.length;i++){
                var prefixAttr=prefix[i]+str.replace(str.charAt(0),str.charAt(0).toUpperCase());//首字母大写
                if (prefixAttr in div.style) {
                    res=prefixAttr;
                    break;
                }
            }
            div=null;
            return res;
        },
        hasOwnStyles:function(arr,el){
            var arr=$lq.isArray(arr) ?arr:[];
            var res={result:true};
            for(var i in arr){
                var attr=arr[i];
                res[attr]=$lq.hasOwnStyle(attr,el);
                if(res[attr]==false){
                    res.result=false;
                }
            }
            return res;
        },
        //事件
        hasOwnDomEvent:function (name,el){
            if(el && !$lq.isElement(el)){return false;}
            var tagNames = {
                'select': 'input', 'change': 'input',
                'submit': 'form', 'reset': 'form',
                'error': 'img', 'load': 'img', 'abort': 'img'
            };
            var element= el?document.createElement(el.nodeName.toLowerCase()):document.createElement( tagNames[name] || "div");
            var eventName=name,ownProperty=false;
            switch(name){
                case "mousewheel":
                case "DOMMouseScroll":
                    return $lq.client.simple.name=="firefox"?"DOMMouseScroll":"mousewheel";
                    break;
            }
            var event="on"+eventName;
            //in ,只能判断可以枚举属性 event in element 不太严谨，同时，也无法判断出，属性是不是用户定义的还是原始属性  ownProperty= event in element;
            // 判断属性是不是在不能枚举的属性中，以及是不是用户定义属性还是原始属性
             if(!element.setAttribute || ($lq.client.simple.name=="ie"&&parseInt($lq.client.simple.ver)<8)){
                //适合BOM对象
                ownProperty=event in element || eventName in element;
                //ownProperty=element.hasOwnProperty(eventName);
            }else  if(element.setAttribute){
                 //适合DOM对象
                 //console.log($lq.client.simple)
                 element.setAttribute(event,"");
                 ownProperty=typeof element[event] === "function";
             }
            //元素上没有情况下，在window和html上再次判断
            if(!ownProperty){
                ownProperty=event in document || event in window
            }
            element=null;
            //ownProperty为true说明是源生事件，如果为flase，说明为2种情况，第一种为用户自定义属性，第二种为该元素没有该属性，由于，这个是新建的元素，所以只有第2种可能；
            return ownProperty && eventName;
        },
        hasOwnStyleEvent:function (name,el){
            var styleNames=["transition","animation"],attr=name;
            for(var i=0;i<styleNames.length;i++){
                if(name.toLowerCase().indexOf(styleNames[i])!=-1){
                    attr=styleNames[i];
                    break;
                }
            }
            var res=$lq.hasOwnStyle(attr,el);
            return res && name;
        },
        hasOwnEvent:function(attr,el){
            var ownProperty=false;
            ownProperty= $lq.hasOwnDomEvent(attr,el) || $lq.hasOwnStyleEvent(attr,el);
            return ownProperty;
        },
        isIn:function(array,value){
            for(var i in array){
                //console.log("属性名："+i+"---值："+array[i]);
                if( array[i]===value){
                    return true;
                }
            }
            return false;
        }

    });
    //util工具类
    $lq.extend($lq,{
        forEeach:function(arr,fn,el){
            var arr=arr || [],el=el || window;
            for(var i in arr){
                fn && fn.call(el,i,arr[i]);
            }
        },
        forPart:function(arr,setting,el){
            var arr=arr || [],el=el || window,fn=undefined,start= 0,end= 0,res;
            fn=$lq.isObject(setting)&&setting.fn!=undefined?setting.fn:($lq.isFunction(setting)?setting:undefined);
            start=setting.start!=undefined ? setting.start:0;
            end=setting.end !=undefined ? setting.end:0;
            if($lq.isArray(arr)){
                end= end!=0 ? end:arr.length;
                res=arr.slice(start,end);
            }else if($lq.isObject(arr)){
                res=[arr[start],arr[end]];
            };
            $lq.forEeach(res,fn,el);
        },
        //闭包节流
        throttle:function( fn, delay){
            //使用闭包的目的是为了传参数e
            var ie=$lq.client.simple;
            return (ie.name=="ie" && parseInt(ie.ver)<9)?function(e){
                fn.timer!=undefined && clearTimeout(fn.timer);
                var that=this;
                console.log("闭包节流"+fn.getName()+"函数：清除了timer:"+fn.timer);
                fn.timer=setTimeout(function(e){
                    console.log("闭包节流--e已经被销毁："+fn.getName()+"函数：执行timer:"+fn.timer);
                    var ev={};
                    $lq.extend(ev,e)//IE,6,7,8情况下，当延迟执行时，e对象已经被销毁，所以要拷贝保存在内存，考虑到效率，对最后一次的e进行拷贝
                    return function(){
                        fn.call(that,ev);
                    }

                }(e),delay);
            }:function(e){
                fn.timer!=undefined && clearTimeout(fn.timer);
                var that=this;
                console.log("闭包节流"+fn.getName()+"函数：清除了timer:"+fn.timer);
                fn.timer=setTimeout(function(){
                    console.log("闭包节流--e没有被销毁："+fn.getName()+"函数：执行timer:"+fn.timer);
                    fn.call(that,e);
                },delay);
            }
        },
        /*
         function(){
         $lq.on(this,type,handler);
         }
         * */
        loop:function(els,fn){
            var len=els.length-1;
            var lens=els.length;
            var lisE=els;
            switch(lens){
                case 0:
                    break;
                case 1:
                    fn.call(lisE[0],0);
                    break;
                default:
                    for(var i=len;i>=0;i--){
                        fn.call(lisE[i],i);//指定fn内部的执行环境，即this
                    }

            }
        },
        //判断属性是不是在原型中
        hasPrototypeProperty:function(obj,name){
            return !obj.hasOwnProperty(name) && name in obj;
        },
        //浅复制对象
        clone:function(obj){
            function F(){};
            F.prototype=obj;
            return new F();
        },
        createAnother:function(original,enhance){
            var clone=this.clone(original.prototype);
            if(enhance){
                for(var i in enhance){
                    clone[i]=enhance[i];
                }
            }
            return clone;
        }
    });
//获取元素
    $lq.extend($lq,{
        selects:function(id,context){
            //document.querySelector(id);
            return document.querySelectorAll ? (context||document).querySelectorAll(id) : $lq.commonGet(id,(context||document));
        },
        commonGet:function(id,context){
            console.log("使用普通的方法获取元素");
            //注意，IE6,7对于新标签，如header标签，虽然经过外部JS的处理，可以识别，但是，这种新标签在IE6,7下会缺少应有的方法和属性
            var elements=[];
            if(id.indexOf(",") !=-1){
                elements=$lq.group(id,context);//取得所有分组元素；    //有分组"a .b, .c d"
            }else if(id.indexOf(' ') != -1){
                elements=$lq.level(id,context);
            }else{
                //单个查询//find模拟
                //elements= $lq.find(id,context);
                elements= $lq.multipleFind(id,context);
            }
            return elements;
        },
        //id:function(id,context){return (context || document).getElementById(id);},
        //获取ID节点
        getId:function (id,context) {
            return context.getElementById?context.getElementById(id):document.getElementById(id);
        },
        //获取元素节点数组
        getTagName:function (tag, context) {
            var temps = [];
            var tags = context.getElementsByTagName?context.getElementsByTagName(tag):document.getElementsByTagName(tag);
            for (var i = 0; i < tags.length; i ++) {
                temps.push(tags[i]);
            }
            return temps;
        },
        //获取CLASS节点数组
        getClass:function (className, context) {
            var temps = [];
            if(document.getElementsByClassName){
                //注意IE6,7,8不支持
                temps=context.getElementsByClassName ?context.getElementsByClassName(className):document.getElementsByClassName(className);
            }else{
                var all = context.getElementsByTagName('*');
                for (var i = 0; i < all.length; i ++) {
                    if ((new RegExp('(\\s|^)' +className +'(\\s|$)')).test(all[i].className)) {
                        temps.push(all[i]);
                    }
                }
            }
            return temps;
        },
        find:function(id,context){
            //单个查询//find模拟
            var elements = [];
            switch (id.charAt(0)) {
                case '#' :
                    var el=$lq.getId(id.substring(1),context);
                    if(el !=null && el!=undefined){
                        elements.push(el);
                    }
                    break;
                case '.' :
                    elements = $lq.getClass(id.substring(1),context);
                    break;
                default :
                    elements = $lq.getTagName(id,context);
            }
            return elements
        },
        //层次".a .b #c d" 父子关系
        level:function(args,context){
            var elements = args.split(' ');			//把节点拆开分别保存到数组里
            var childElements = [];                //存放临时节点对象的数组，解决被覆盖的问题
            var node = [];							//用来存放父节点用的
            for (var i = 0; i < elements.length; i ++) {
                if (node.length == 0){ node.push(context || document);}//如果默认没有父节点，就把document放入
                childElements = [];
                for(var j=0;j<node.length;j+=1){
                    //var temps=$lq.find(elements[i],node[j]);
                    var temps=$lq.multipleFind(elements[i],node[j]);
                    for(var z=0;z<temps.length;z+=1){
                        childElements.push(temps[z]);
                    }
                }
                node = childElements;
            }
            //this.elements = childElements;
            return childElements;
        },
        //分组"a,.b,#c" ---" a,b c, d e" 并列关系
        group:function(args,context){
            var elements=args.split(",");
            var childElements=[];
            for(var i= 0;i<elements.length;i+=1){
                var groupStr=elements[i];
                if(groupStr.indexOf(" ") !=-1){  //分组字符中有层次
                    var temps=$lq.level(groupStr,(context || document));
                    for(var z=0;z<temps.length;z+=1){
                        childElements.push(temps[z]);
                    }
                }else{                          //分组字符中没有层次
                    //var temps=$lq.find(elements[i],(context || document));
                    var temps=$lq.multipleFind(elements[i],(context || document));
                    for(var j=0;j<temps.length;j+=1){
                        childElements.push(temps[j]);
                    }
                }
            }
            return childElements;
        },
        //递进：多条件选择器，多条件同时满足 "#a.b.c"-------".a.b.c.d"--------"a.b.c"-----"a#b.c.c"
        multipleFind:function(args,context){
            var els=[];
            //ID是唯一标识，只查询ID；
            var index=args.indexOf("#");
            if(index>=0){
                //示例：#a5.b.c或a#bdde.c或21#kkk或#a
                var num=args.indexOf(".",index);
                var id="";
                if(num>=0){
                    id=args.substring(index,num);
                }else{
                    id=args.substring(index);
                }
                //console.log(id,"---"+context.nodeType);
                els.push( $lq.getId(id.substring(1),context))
            }else{
                var arr=args.split(".");
                switch(args.charAt(0)){
                    case ".":
                        //示例： .b 或 .a.b.c
                        //console.log(arr.join(" "));
                        els=$lq.getClass($lq.trim(arr.join(" ")),context);
                        break;
                    default:
                        //示例：cc 或者 b.a.c
                        var tags=$lq.getTagName(arr.shift(),context);
                        var str=arr.join(" ");
                        if(str==""){
                            //说明只是一个标签查询
                            els=tags;
                        }else{
                            //console.log("---"+tags.length);
                            for(var i=0;i<tags.length;i++){
                                //className没值，为空，空数组join(" ")结果也是为空；恰好为标签查询“cc”
                                $lq.hasClass(tags[i],$lq.trim(str))&&(els.push(tags[i]));
                            }
                        }
                        break;
                }
            }
            return els;
        }
    });
//BOM  :window, location ,navigator, screen, history
    $lq.extend($lq,{
        //navigation
        sys:{},
        //loaction属性:hash host hostname href pathname port protocol search
        //location方法：assign ,replace, reload
        //window.location="163.com" 等同于location.href="163.com"等于location.assign("163.com")
        getQueryStringArgs:function(){
            //?lq=luo&num=10
            var qs=(location.search.length>0?location.search.substring(1):""),
                args={},
                items=qs.length?qs.split("&"):[],
                item=null,name=null,value=null,i= 0,len=items.length;
            for(i=0;i<len;i++){
                item=item[i].split("=");
                name=decodeURIComponent(item[0]);
                value=decodeURIComponent(item[1]);
                if(name.length){
                    args[name]=value;
                }
            }
            return args;
        },
        //检查浏览器插件:Flash,QuickTime
        hasPlugin:function (name){
            name=name.toLowerCase();
            for(var i=0;i<navigator.plugins.length;i++){
                if(navigator.plugins[i].name.toLowerCase().indexOf(name)>-1){
                    return true;
                }
            }
            return false;
        },
        //ShockwaveFlash.ShockwaveFlash, QuickTime.QuickTime
        hasIEPlugin:function (name){
            try{
                new ActiveXObject(name);
                return true;
            }catch(ex){
                return false;
            }
        },
        hasFlash:function(){
            var result=this.hasPlugin("Flash");
            if(!result){
                result=this.hasIEPlugin("ShockwaveFlash.ShockwaveFlash");
            }
            return result;
        },
        //客户端浏览器版本检查
        userAgent:function(){
            //console.log("789qqqqqqqqqqqqqqqqqqqqqqq")
        }()
        //window
    });
//元素操作
    $lq.extend($lq,{
        //获取文本-清空文本
        getSelection:function(){
            return window.getSelection ? window.getSelection().toString(): document.selection.createRange().text;
        },
        clearSelection:function(){
            // 防止拖动滑块的时候， 选中文字
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
        },
        transit:function(el){
            function over(){
                $lq.animateD(el,{opacity:1},function(){},{interval:10,async:false});
            }
            function out(){
                $lq.animateD(el,{opacity:30},function(){},{interval:10,async:false});
            }
            $lq.hover(el,over,out)
        },
        shade:function(el,isOut,opacity,con){
            var config={interval:16};
            var fn=function(){};
            var opa=(isOut||false)? 0 : 100;
            if(opa !=undefined){
                opa=opacity
            }
            if (con != undefined){
                for(var i in con ){
                    if(i=="callback"){
                        fn=con["callback"];
                    }else{
                        config[i]=con[i];
                    }
                }
            }
            $lq.animateD(el,{opacity:opa},fn,config)

        },
        fadeIn:function(el,opacity,con){
            $lq.shade(el,false,opacity,con);
        },
        fadeOut:function(el,opacity,con){
            $lq.shade(el,true,opacity,con);
        },
        hidden:function(el){
            el.style.visibility="hidden";
        },
        visible:function(el){
            el.style.visibility="visible";
        },
        hide:function(el){
            el.style.display="none";
        },
        show:function(el){
            el.style.display="block";
        }
    });
//元素样式操作
    /*
    * 获取样式3种方式
    * 1：style属性-行内获取方式：这种方法能够对内嵌的属性进行获取和设置，但是无法获取内联和链接的样式属性
    * 2：计算后的样式：这种方法获取的是计算后的所有样式，但是无法对属性进行设置，以及无法获得复合性属性值
    * 3：操作样式表：(1)className属性操作（2）styleSheet操作
    * */
    $lq.extend($lq,{
        //获取，设置元素样式-获取计算后样式
        //计算后的样式，指的是默认样式和设置后的样式
        //注意复合性属性计算后，该属性就不存在了，如broder,要获得该值就需要用他的单独的具体属性名称border-left等。
        getStyleValue:function(obj,attr){
            var attr=attr.indexOf("-")>=0?$lq.toHump(attr):attr;
            switch(attr){
                case "zindex":
                    attr="zIndex";
                    break;
            }
           /* if(obj.currentStyle){
                //ie,opera
                return obj.currentStyle[attr];
            }else{
                //w3c标准:获取计算后样式
                return window.getComputedStyle(obj,null)[attr];
            }*/
            if(window.getComputedStyle){
                //w3c标准:获取计算后样式
                return window.getComputedStyle(obj,null)[attr];
            }else{
                //ie,opera---注意当在IE情况下，height,width,等未定义值的情况下，他返回是auto而不是计算后的值。
                return obj.currentStyle[attr];
            }
        },
        getStyle:function(obj,attr){
            var value=undefined;
            /*
             * 之所以要使用offset系列，是因为parseInt直接取整数,offset是js计算四舍五入取整，因此2种方式取值有时会相差1px；
             * 相比较而言offset更为精准。
             * */
            var box={width:0,height:0,left:0,top:0,paddingLeft:0,paddingTop:0,paddingRight:0,paddingBottom:0,marginLeft:0,marginTop:0,marginRight:0,marginBottom:0};
            var offset={offsetLeft:0,offsetTop:0,offsetWidth:0,offsetHeight:0}
            var transforms={translate:"(0,0)",translate3d:"(0,0,0)",translateX:"0",translateY:"0",translateZ:"0",rotate:"0",rotateX:"0",rotateY:"0",rotateZ:"0",scale:"0",scaleX:"0",scaleY:"0",skewX:"0",skewY:"0"};
            var attrName= (box[attr]!=undefined && "box") || (offset[attr]!=undefined && "offset") || (transforms[attr]!=undefined && "transforms") || attr;
            switch(attrName){
                case 'box':
                    value=parseInt($lq.getStyleValue(obj,attr));//IE低版本，默认值为auto
                    !$lq.isNumber(value) && (value=0);
                    break;
                case 'offset':
                    value=obj[attr];
                    break;
                case 'transforms':
                    value=$lq.transform(obj,attr);
                    break;
                case 'opacity':
                    value=Math.round($lq.getStyleValue(obj,attr)*100);
                    !$lq.isNumber(value) && (value=100);
                    break;
                case "className":
                case "classname":
                    value=obj.className;
                    break;
                default:
                    value=$lq.getStyleValue(obj,attr);
            }
            //ar val=boxInfo=="none"?$lq.getStyleValue(obj,otherInfo):obj[boxInfo];
            // console.log((obj.id||obj.className||obj.nodeName)+"--"+attr+"-$lq.getStyle中-"+val);
            return value;
        },
/*        getStyle:function(obj,attr){
            var otherInfo=attr;
            var boxInfo=attr.toLowerCase();
            switch(boxInfo){
                case "offsetleft":
                case "left":
                    boxInfo="offsetLeft";
                    break;
                case "offsettop":
                case "top":
                    boxInfo="offsetTop";
                    break;
                case "offsetheight":
                case "height":
                    boxInfo="offsetHeight";
                    break;
                case "offsetwidth":
                case "width":
                    boxInfo="offsetWidth";
                    break;
                default:
                    boxInfo="none";
                    break;
            }
            /!*
            * 之所以要使用offset系列，是因为parseInt直接取整数,offset是js计算四舍五入取整，因此2种方式取值有时会相差1px；
            * 相比较而言offset更为精准。
            * *!/
            var val=boxInfo=="none"?$lq.getStyleValue(obj,otherInfo):obj[boxInfo];
           // console.log((obj.id||obj.className||obj.nodeName)+"--"+attr+"-$lq.getStyle中-"+val);
            return val;
        },*/
        getStyles:function(obj,arrAttr){
            var arrAttr=$lq.isArray(arrAttr)?arrAttr:[].push(arrAttr);
            var res=[];
            for(var i=0;i<arrAttr.length;i++){
                res.push($lq.getStyle(obj,arrAttr[i]));
            }
            return res;
        },
        setStyle:function(obj,attr,value){
            var attr=attr.indexOf("-")>=0?$lq.toHump(attr):attr;
            var prefix=attr;
            if(attr.charAt(0)=="$"){
                attr=attr.substring(1);
                prefix=$lq.hasOwnStyle(attr);
                if(prefix===false){return;}
            }
            var value=value;
            var transform={translate:"(0,0)",translate3d:"(0,0,0)",translateX:"0",translateY:"0",translateZ:"0",rotate:"0",rotateX:"0",rotateY:"0",rotateZ:"0",scale:"0",scaleX:"0",scaleY:"0",skewX:"0",skewY:"0"};
            if(transform[attr]!=undefined){
                $lq.transform(obj,attr,value);
                return;
            }
            switch(attr)
            {
                case 'width':
                case 'height':
                case 'paddingLeft':
                case 'paddingTop':
                case 'paddingRight':
                case 'paddingBottom':
                    value=Math.max(value,0);
                case 'left':
                case 'top':
                case 'marginLeft':
                case 'marginTop':
                case 'marginRight':
                case 'marginBottom':
                    obj.style[prefix]=value+'px';
                    break;
                case 'opacity':
                    if(value<=1){
                        if(value<=0){
                            value=0;
                        }else{
                            value=Math.round(value*100);
                        }
                    }
                    obj.style.filter="alpha(opacity:"+value+")";
                    obj.style.opacity=value/100;
                    break;
                case "className":
                case "classname":
                    obj.className=value;
                    break;
                default:
                    obj.style[prefix]=value;
            }
        },
        setStyles:function(obj,jsonAttr){
            var json=jsonAttr || {};
            for(var i in json){
                $lq.setStyle(obj,i,json[i]);
            }
        },
        outHeight:function(el){
            var arr=["height","marginTop","marginBottom","paddingTop","paddingBottom"];
            var height=0;
            for(var i=0;i<arr.length;i++){
                height+=parseInt($lq.getStyle(el,arr[i]));
            }
            return height
        },
        outWidth:function(el){
            var arr=["width","marginLeft","marginRight","paddingLeft","paddingRight"];
            var height=0;
            for(var i=0;i<arr.length;i++){
                height+=parseInt($lq.getStyle(el,arr[i]));
            }
            return height
        },
        cssMatrix:function(obj,rotate){
            var rotate=rotate;
            var a=Math.cos(rotate/180*Math.PI);
            var b=Math.sin(rotate/180*Math.PI);
            var c=-Math.sin(rotate/180*Math.PI);
            var d=Math.cos(rotate/180*Math.PI);

            var val="matrix("+a+","+b+","+c+","+d+","+0+","+0+")";
            var tran=$lq.hasOwnStyle("transform");
            if(tran.res==false){
                obj.style.filter="progid:DXImageTransform.Microsoft.Matrix( M11="+a+", M12="+c+", M21="+b+", M22="+d+",SizingMethod='auto expand')";
                return;
            }
            obj.style[tran.attr]=val;
        },
        transformJoin:function(value){
            //JSON.stringify(json);
            var val="";
            if($lq.isObject(value)){
                for(var i in value){
                    val+=value[i]+",";
                }
             val=val.substring(0,val.length-1);
            }
            return  $lq.trim(val);
        },
        parseTransition:function(attr,value){
            /*con的最终格式：
             * {
             *   transform:{transalteX:0,scale:"1,2",translate:"100,200"'}-----使用parseTransform解析
             *   width:200
             *   .......
             * }
             * */
            var name,opt={},con={},attrName,named=false;
            value!=undefined ?($lq.isObject(value)?(opt[attr]={},$lq.extend(opt[attr],value)):opt[attr]=value):$lq.extend(opt,attr);//这采用$lq.extend(opt,attr)而不是opt=attr,是因为，此时attr是对象引用进来，后续对opt的修改都会影响到该引用指针，所以为了切切断影响采用了拷贝
            for(var  i in opt){
                switch(i){
                    case "translate":case "translate3d":case "translateX":case "translateY":case "translateZ":
                    attrName="translate";named=true;
                    case "rotate":case "rotate3d":case "rotateX":case "rotateY":case "rotateZ":
                    !named && (attrName="rotate",named=true);
                    case "scale":case "scale3d":case "scaleX":case "scaleY":case "scaleZ":
                    !named && (attrName="scale",named=true);
                    case "skew":case "skewX":case "skewY":
                    !named && (attrName="skew",named=true);
                        name="transform",con[name] =con[name] ||{};var value={},transform={};
                        if($lq.isObject(opt[i])){
                            opt[i][attrName+"X"] !=undefined&&(value[attrName+"X"] = opt[i][attrName+"X"],delete opt[i][attrName+"X"]);
                            opt[i][attrName+"Y"]!=undefined&&(value[attrName+"Y"] = opt[i][attrName+"Y"],delete opt[i][attrName+"Y"]);
                            opt[i][attrName+"Z"]!=undefined&&(value[attrName+"Z"] = opt[i][attrName+"Z"],delete opt[i][attrName+"Z"]);
                            opt[i].value!=undefined&&(value[i]= opt[i].value,delete opt[i].value);
                            $lq.extend(con[name],opt[i]);
                            transform=$lq.parseTransform(value);
                        }else{
                            transform=$lq.parseTransform(i,opt[i]);
                        };
                        for(var k in transform){
                            con[name][k]=con[name][k] ||{};
                            $lq.isObject(transform[k])?$lq.extend(con[name][k],transform[k]):con[name][k]=transform[k];
                        };
                        transform=null;
                   /*   if($lq.isObject(opt[i])){
                          con[name][i]= con[name][i] ||  {};
                            console.log(con[name][i], opt[i]);
                            $lq.extend(con[name][i],opt[i]);
                        }else{
                         // console.log(i,opt[i])
                          var transform=$lq.parseTransform(i,opt[i]);
                          for(var k in transform){
                              console.log(k)
                              con[name][k]=con[name][k] ||{};
                              $lq.extend(con[name][k],transform[k]);
                          }
                        }*/
                    break;
                    case "transform":
                        con[i]=con[i] || {};var transform={},value={};
                        if( $lq.isObject(opt[i])){
                            if(opt[i].value !=undefined && !$lq.isObject(opt[i].value)){
                                opt[i].value=toObject(opt[i].value);
                            }
                            opt[i].value!=undefined&&($lq.extend(opt[i],opt[i].value),delete opt[i].value);
                            transform= $lq.parseTransform(opt[i]);
                        }else if($lq.isString(opt[i])){
                            transform= $lq.parseTransform(toObject(opt[i]));
                        }
                        for(var j in transform){
                            con[i][j]=con[i][j]||{};
                            $lq.isObject(transform[j])?$lq.extend(con[i][j],transform[j]):con[i][j]=transform[j];
                        }
                        transform=null;

                     /* con[i]=con[i] || {};var obj,isObj=false;
                        $lq.isObject(opt[i])?(obj=opt[i],isObj=true):($lq.isString(opt[i])?(obj=opt[i].split(" "),isObj=false):(obj=undefined));
                        if(obj){
                            for(var j in obj){
                                var name= j,value=obj[j]
                                if(!isObj){
                                    var startIndex=obj[j].indexOf("("),endIndex=obj[j].indexOf(")");
                                    name=obj[j].substring(0,startIndex);
                                    value=obj[j].substring(startIndex,endIndex+1);
                                }
                                var transform= name=="value"?$lq.parseTransform(value):$lq.parseTransform(name,value);
                                console.log(transform)
                                for(var m in transform){
                                    con[i][m]=con[i][m]||{};
                                    $lq.extend(con[i][m],transform[m]);
                                }
                                transform=null;
                            }
                        }*/

                 /*       if($lq.isObject(opt[i])){
                            //$lq.extend(con[i],opt[i]);
                            for(var n in opt[i]){
                                var transform=$lq.parseTransform(n,opt[i][n]);
                                for(var m in transform){
                                    con[i][m]=con[i][m]||{};
                                    $lq.extend(con[i][m],transform[m]);
                                }
                            }
                        }else if($lq.isString(opt[i])){
                            var array=opt[i].split(" ");
                            for(var j=0;j<array.length;j++){
                                var startIndex=array[j].indexOf("("),endIndex=array[j].indexOf(")");
                                var tName=array[j].substring(0,startIndex);
                                var tValue=array[j].substring(startIndex,endIndex+1);
                                var transform=$lq.parseTransform(tName,tValue);
                                for(var z in transform){
                                    con[i][z]=con[i][z] ||{};
                                    $lq.extend(con[i][z],transform[z]);
                                }
                            }
                            array=null;
                        }*/
                        break;
                    default:
                        con[i]=opt[i];
                        break;
                }
            };
            function toObject(str){
                var obj={};
                var arr=str.split(" ");
                for(var name=0;name<arr.length;name++){
                    var startIndex=arr[name].indexOf("("),endIndex=arr[name].indexOf(")");
                    var n=arr[name].substring(0,startIndex);
                    obj[n]=arr[name].substring(startIndex,endIndex+1)
                }
                return obj;
            }
            //con.transform && (con.transform=$lq.parseTransform(con.transform));
            return con;
        },
        parseTransform:function(attr,value){
            /*con的最终格式：
            * {
            *   translate:{transalteX:0,translateY,translateZ}
            *   scale:{scaleX:1,scaleY:1,scaleZ:1}
            *   .......
            * }
            * */
            var attrName,named=false,opt={},con={};
            value!=undefined ?($lq.isObject(value)?(opt[attr]={},$lq.extend(opt[attr],value)):opt[attr]=value):$lq.extend(opt,attr);//这采用$lq.extend(opt,attr)而不是opt=attr,是因为，此时attr是对象引用进来，后续对opt的修改都会影响到该引用指针，所以为了切断影响采用了拷贝
            for(var i in opt){
                attrName=i,named=false,value=opt[i];
                value=$lq.isString(opt[i]) && value.indexOf("(")!=-1?value.substring(value.indexOf("(")+1,value.indexOf(")")):value;
                switch(i){
                    case "translate":case "translate3d": case "translateX":case "translateY":case "translateZ":
                    attrName="translate";named=true;
                    case "rotate": case "rotate3d": case "rotateX":case "rotateY":case "rotateZ":
                    !named && (attrName="rotate",named=true);
                    case "scale": case "scale3d":  case "scaleX":case "scaleY":case "scaleZ":
                    !named && (attrName="scale",named=true);
                    case "skew": case "skewX":case "skewY":
                    !named && (attrName="skew",named=true);
                    con[attrName]=con[attrName]||{};
                    if($lq.isObject(value)){
                        $lq.extend(con[attrName],value);
                    }else if($lq.isString(value)){
                        var optName=i.indexOf("3d")!=-1?i.substring(0,i.indexOf("3d")):i;
                        var array= value.indexOf(",")!=-1 || optName==attrName?value.split(","):[],length=array.length;
                        length>=1 && (con[attrName][attrName+"X"]=array[0]);
                        length>=2 && (con[attrName][attrName+"Y"]=array[1]);
                        length==3 && (con[attrName][attrName+"Z"]=array[2]);
                        (length<1 || length>3) && ( con[attrName][i]=value);
                        array=null;
                    }else if($lq.isNumber(value)){
                        var optName=i.indexOf("3d")!=-1?i.substring(0,i.indexOf("3d")):i;
                        optName==attrName?con[attrName][attrName+"X"]=value:con[attrName][i]=value;
                    }
                        break;
                    default:
                        con[i]=opt[i];
                        break;
                }
            }
            opt=null;
            //console.log(".......",con)
            return con;
        },
        /*{transfrom:{
            trans:{translateX: translateY: translateZ}
            roate:
            roateX:
        }}*/
        transform:function(el,attr,val,isParsed){
            var parsed=false,argumentsLen=arguments.length;
            $lq.isBoolean(arguments[argumentsLen-1]) && ( parsed=arguments[argumentsLen-1],argumentsLen=argumentsLen-1);
            var transform=$lq.hasOwnStyle("transform");
            if(transform==false){
                console.log("transform==false");
                return false;}
            var init={
                translate:{translateX:0,translateY:0,translateZ:0},
                rotate:{rotateX:0,rotateY:0,rotateZ:0},
                scale:{scaleX:1,scaleY:1,scaleZ:1},
                skew:{skewX:0,skewY:0}
            };
            //($lq.getStyleValue(el,"transform")=="none" || $lq.getStyleValue(el,"transform") ==undefined)&& !el.transform &&$lq.ties("transform",init,el,true);
            !el.transform &&$lq.ties("transform",init,el,true);
            if(argumentsLen==2 && !$lq.isObject(arguments[1])){
                var data=el.transform?el.transform:{},attrName= attr.indexOf("3d")!=-1?attr.substring(0,attr.indexOf("3d")):attr;
                for(var i in data){
                    if(i==attrName){
                        return data[i];
                    }else if(attrName in data[i]){
                        return data[i][attrName];
                    }
                }
            }else{
                //var con=$lq.isObject(arguments[1])?$lq.tieTransform(el,arguments[1]): $lq.tieTransform(el,attr,val);
                //var con=argumentsLen==2?$lq.tieTransform(el,attr,parsed): $lq.tieTransform(el,attr,val,parsed),str="";

                var con=parsed && argumentsLen==2?attr:$lq.parseTransform(attr,val),str="";
                $lq.ties("transform",con,el,true);
                for(var s in con){
                    var item=con[s],x=item[s+"X"],y=item[s+"Y"],z=item[s+"Z"];
                    var unit= s=="translate"?"px":(s=="scale"?"":"deg");
                    if(x!=undefined && y!=undefined && z!=undefined && s!="rotate"){
                        str+=s+"3d("+x+unit+","+y+unit+","+z+unit+") ";
                    }else if(x!=undefined && y!=undefined){
                        str+=s+"("+x+unit+","+y+unit+") ";
                    }else {
                        x!=undefined && (str+=s+"X("+x+unit+") ");
                        y!=undefined && (str+=s+"Y("+y+unit+") ");
                        z!=undefined && (str+=s+"Z("+z+unit+") ");
                    }
                }
                el.style[transform]=str;
            }
        },
        setLeft:function(el,value){
            $lq.styleInfo.transform?   $lq.transform(el,"translateX",value):$lq.setStyle(el,"left",value);
        },
        setTop:function(el,value){
            $lq.styleInfo.transform?   $lq.transform(el,"translateY",value): $lq.setStyle(el,"top",value);
        },
        /*
        * 样式表操作
        * */
        ///判断是否存在这个class
        hasClass:function(element,className){
            //确保返回值是 Boolean 类型, 取了两次 非
            /*
            * var o={flag:true};  var test=!!o.flag;//等效于var test=o.flag||false;  alert(test);
             由于对null与undefined用!操作符时都会产生true的结果，
             所以用两个感叹号的作用就在于，
             如果明确设置了o中flag的值（非 null/undefined/0""/等值），自然test就会取跟o.flag一样的值；
             如果没有设置，test就会默认为false，而不是 null或undefined。
            * */
            return !!element.className.match(new RegExp('(\\s|^)'+className+'(\\s|$)'));
        },
        //添加一个class，如果不存在的话
        addClass:function(element,className){
            if(!$lq.hasClass(element,className)) {
                element.className=$lq.trim(element.className)+" "+className;
            }
        },
        //删除一个class，如果存在的话
        removeClass:function(element,className){
            if($lq.hasClass(element,className)){
                element.className=element.className.replace(
                    new RegExp('(\\s|^)'+className+'(\\s|$)')," ");
            }
        },
        //获取rules
        getRules:function(num,index){
            //注意chrome浏览器在本地运行时会出现问题， sheet.cssRules会变成 null， 只要把它放到服务器上允许即可正常
            //可用属性：style,cssText,selectorText,最为有用的属性为style
            var sheet=document.styleSheets[num];
            var rules=sheet.cssRules || sheet.rules;
            return index !=undefined? rules[index]:rules;
        },
        //添加link或style的CSS规则
        insertRule:function(sheet,selector, cssText,index){
            //如果是非IE
            if(sheet.insertRule){
                sheet.insertRule(selector+"{"+cssText+"}",index);
            //如果是IE
            }else if(sheet.addRule){
                sheet.addRule(selector,cssText,index);
            }
        },
        deleteRule:function(sheet,index){
            //如果是非IE
            if(sheet.deleteRule){
                sheet.deleteRule(index);
            //如果是IE
            }else if(sheet.removeRule){
                sheet.removeRule(index);
            }
        },
        addRule : function (num, selector, cssText, index) {
            var sheet = document.styleSheets[num];
            $lq.insertRule(sheet, selector, cssText, index);
            //return this;
        },
        //移除link或style的CSS规则
        removeRule : function (num, index) {
            var sheet = document.styleSheets[num];
            $lq.deleteRule(sheet, index);
            //return this;
        }

    });
//获取元素大小，及其位置
    /*
    clientWidth/height,scrollWidth/height,offsetWidth/height
    clientTop/left,scrollTop/left,offsetTop/left
    offsetParent
    * */
    $lq.extend($lq,{
        //CSSOM视图模式(CSSOM View Module)相关处理
        //浏览器窗口视图window
        htmlElement:(document.documentElement || (document.body.parentNode || document.body)),
        getClientWin:function(){
            return {
                w:window.innerWidth || $lq.htmlElement.clientWidth,
                h:window.innerHeight|| $lq.htmlElement.clientHeight
            }
        },
        getPageWin:function(){
            return {
                w:$lq.getClientWin().w+$lq.getScroll().x,
                h:$lq.getClientWin().h+$lq.getScroll().y
            }
        },
        //窗口和DOM视图滚轮
        getScroll:function(el){
         var is=$lq.isElement(el)&&el!=$lq.htmlElement&&el!=document.body;
          return {
              x: is?el["scrollLeft"]:window.pageXOffset|| window.scrollX || $lq.htmlElement.scrollLeft || document.body.scrollLeft,
              y: is?el["scrollTop"]:window.pageYOffset|| window.scrollY || $lq.htmlElement.scrollTop || document.body.scrollTop
          }
        },
        setScroll:function(num,el){
            var num= $lq.isObject(num) ? num :{};
            var is=$lq.isElement(el)&&el!=$lq.htmlElement&&el!=document.body;
            var toNum={};
            num.x !=undefined && (toNum.scrollLeft=num.x);
            num.y !=undefined && (toNum.scrollTop=num.y);
            for(var i  in toNum){
                if(is){
                    el[i]=toNum[i]
                }else{
                    $lq.htmlElement[i]=toNum[i];
                    document.body[i]=toNum[i];
                }
            }
        },
        //DOM元素视图，文档视图方法和属性
        getOffset:function(el){
            //相对于父元素的偏移量可视信息
            return {
                //相对父框左上角
                pageX: el.offsetLeft,
                pageY: el.offsetTop,
                //相对父框可视区左上角
                clientX: el.offsetLeft-$lq.getScroll(el.offsetParent).x,
                clientY: el.offsetTop-$lq.getScroll(el.offsetParent).y,
                //元素自身实际大小
                pageW: el.clientWidth+$lq.getScroll(el).x,//相当于el.scrollWidth
                pageH: el.clientHeight+$lq.getScroll(el).y,//相当于el.scrollHeight
                //元素自身可视区大小
                clientW: el.offsetWidth,
                clientH: el.offsetHeight
            }
        },
        getClientRect:function(el){
            //相对于窗口的可视信息
            var res={};
            if(el.getBoundingClientRect){
                var ro=el.getBoundingClientRect();
                res={
                    clientX:ro.left, clientY:ro.top, clientR:ro.right, clientB:ro.bottom,
                    pageX:ro.left+$lq.getScroll().x+$lq.htmlElement.clientLeft,//document.documentElement.clientLeft 在IE67中始终为2，其他高级点的浏览器为0
                    pageY:ro.top+$lq.getScroll().y+$lq.htmlElement.clientTop,//document.documentElement.clientTop 在IE67中始终为2，其他高级点的浏览器为0
                    clientW:ro.width || ro.right-ro.left,
                    clientH:ro.height|| ro.bottom-ro.top
                }
            }else{
                var view=$lq.getPos(el);
                res={
                    pageX:view.left+$lq.getScroll().x+$lq.htmlElement.clientLeft,////document.documentElement.clientLeft 在IE67中始终为2，其他高级点的浏览器为0,
                    pageY:view.top+$lq.getScroll().y+$lq.htmlElement.clientTop,//document.documentElement.clientTop 在IE67中始终为2，其他高级点的浏览器为0
                    clientX:view.left,
                    clientY:view.top,
                    clientR:el.offsetWidth+view.left,
                    clientB:el.offsetHeight+view.top,
                    clientW:el.offsetWidth,clientH:el.offsetHeight
                }
            }
            return res;
        },
        //元素距离最顶端的距离：该值应该等于可视区域高度加上已滚动的距离
        //原来名：offsetPosition
        //多用于获取鼠标在元素内部的坐标
        getPos:function(el,tarEl) {
            //获取定位父元素的相对left,top值；不写目标父元素tarEl，默认为body;
            //offsetParent是第一个定位父元素，parentNode是其第一个父元素（包含关系）。
            var position ={left:0,top:0};
            while (el !==null) { //如果还有上一层父元素,默认循环到body;
                position.left+=el.offsetLeft;
                position.top+=el.offsetTop;
                el=el.offsetParent; //得到本层的父元素
                if(el==tarEl){
                    return position;
                }
            }
            return position;
        },
        getClient:function (){
            if(window.innerWidth !=null){//IE 9+
                return {
                    width:window.innerWidth,
                    height:window.innerHeight
                }
            }else if(document.compatMode ==="CSS1Compat"){//标准浏览器W3C
                return {
                    width:document.documentElement.clientWidth,
                    height:document.documentElement.clientHeight
                }
            }else{
                return {//怪异模式下
                    width:document.body.clientWidth,
                    height:document.body.clientHeight
                }
            }
        },
        //文档视图(DocumentView)和元素视图(ElementView)方法
 /*       //跨浏览器获取滚动条位置（已滚动距离）
        getScroll:function () {
            return {
                top : document.documentElement.scrollTop || document.body.scrollTop,
                left : document.documentElement.scrollLeft || document.body.scrollLeft
            }
        },*/

        //leftT-leftB-rightT-rightB- topC - bottomC- center
        setPos:function(obj,con){
            //初始化
            var position=$lq.getStyle(obj,"position");
            position !="absolute"&&(function(obj){obj.style.position="absolute";obj.style.left=0;obj.style.top=0;})(obj);
            var con=$lq.isObject(con)?con :{tar:obj.offsetParent,type:"center"};
            var parent=$lq.isElement(con.tar) ?con.tar:obj.offsetParent;
            var type=con.type||"center";
            var typeName=$lq.isObject(type)?"locate":type;

            var pos={left:0,top:0}
            //获得元素相对的初始点
            if(parent !=obj.offsetParent){
                var posAll=$lq.getPos(obj,parent);
                pos.left=obj.offsetLeft-posAll.left;
                pos.top=obj.offsetTop-posAll.top;
            }

            var parentW=$lq.getStyle(parent,"width");
            var parentH=$lq.getStyle(parent,"height");
            var objW=$lq.getStyle(obj,"width");
            var objH=$lq.getStyle(obj,"height");
            switch(typeName){
                case "locate":
                    obj.style.left=pos.left+type.left+"px";
                    obj.style.top=pos.top+type.top+"px";
                    break;
                case "leftT"://左顶角
                    obj.style.left=pos.left+"px";
                    obj.style.top=pos.top+"px";
                    break;
                case "leftB"://左底角
                    obj.style.left=pos.left+"px";
                    obj.style.top=pos.top+(parentH-objH)+"px";
                    break;
                case "rightT"://右顶角
                    obj.style.left=pos.left+(parentW-objW)+"px";
                    obj.style.top=pos.top+"px";
                    break;
                case "rightB"://右底角
                    obj.style.left=pos.left+(parentW-objW)+"px";
                    obj.style.top=pos.top+(parentH-objH)+"px";
                    break;
                case "topC"://上底边中部
                    obj.style.left=pos.left+(parentW/2-objW/2)+"px";
                    obj.style.top=pos.top+"px";
                    break;
                case "bottomC"://下底边中部
                    obj.style.left=pos.left+(parentW/2-objW/2)+"px";
                    obj.style.top=pos.top+(parentH-objH)+"px";
                    break;
                case "leftC"://左边中部
                    obj.style.left=pos.left+"px";
                    obj.style.top=pos.top+(parentH/2-objH/2)+"px";
                    break;
                case "rightC"://右边中部
                    obj.style.left=pos.left+(parentW-objW)+"px";
                    obj.style.top=pos.top+(parentH/2-objH/2)+"px";
                    break;
                default: //中心
                    obj.style.left=pos.left+(parentW/2-objW/2)+"px";
                    obj.style.top=pos.top+(parentH/2-objH/2)+"px";
                    break;

            }
        },
        outLeft:function(el){
            var arr=["offsetLeft","marginLeft","marginRight","paddingLeft","paddingRight"];
            var left=0;
            for(var i=0;i<arr;i++){
                left+=parseInt($lq,getStyle(el,arr[i]));
            }
        },
        outTop:function(el){
            var arr=["offsetTop","marginTop","marginBottom","paddingTop","paddingBottom"];
            var top=0;
            for(var i=0;i<arr.length;i++){
                top+=parseInt($lq.getStyle(el,arr[i]));
            }
            return top
        },
        elContains:function(a, b){  //判断两个元素是否是嵌套关系：a 是否包含b关系，不包含a和b平级关系。
            return a.contains ? a != b && a.contains(b) : !!(a.compareDocumentPosition(b) & 16);
        }
        //元素偏移量
        //滚动区大小
    });
//元素内容获取和设置
    $lq.extend(lq,{
        html:function(el,str){
            if( str==undefined){
                return el.innerHTML;
            }
            el.innerHTML=str;
        },
        htmlText:function(el,str){
            var htmlText=typeof el.textContent =="string"?el.textContent:el.innerText;
            if( str==undefined){
                return htmlText;
            }
            htmlText=str;
        }
    });
//node操作
    $lq.extend($lq,{
        delay_file:function(url){
            var type = url.split('.'),
                file =type[type.length - 1];
            var path=url.split('/'),
                name=path.length==1?path[0].replace(".","_"):path[path.length-1].replace(".","_");
            var el=document.getElementById(name);
            if(el){        console.log("使用旧的"+url);return el;};
            console.log("新建"+url);
            if (file == 'css') {
                var obj = document.createElement('link'),
                    lnk = 'href',
                    tp = 'text/css';
                obj.setAttribute('rel', 'stylesheet');
            } else {
                var obj = document.createElement('script'),
                    lnk = 'src',
                    tp = 'text/javascript';
            };

            obj.setAttribute(lnk, url);
            obj.setAttribute('type', tp);
            obj.setAttribute("id",name);
            file == 'css' ? document.getElementsByTagName('head')[0].appendChild(obj) : document.body.appendChild(obj);
            return obj;

        },
        //直接写入JS或CSS样式
        loadScriptString:function(str){
            var script=document.createElement("script");
            script.type="text/javascript";
            try{
                script.appendChild(document.createTextNode(str));
            }catch(ex){
                script.text=str;
            }
            document.body.appendChild(script);
        },
        loadStyleString:function(str){
            var style=document.createElement("style");
            style.type="text/css";
            try{
                style.appendChild(document.createTextNode(str));
            }catch(ex){
                style.styleSheet.cssText=css;
            }
            var head=$lq.selects("head")[0];
            head.appendChild(style);
        },
    //操作nodeList ：appendChild-insertBefore; replaceChild-removeChild; cloneNode ; children ; parentNode
        selectorType:function(str){
            var propertyType="";
            var str=str.toLowerCase();
            switch(str.charAt(0)){
                case "#":
                    propertyType="id";
                    break;
                case ".":
                    propertyType="className";
                    break;
                default:
                    propertyType="nodeName";
                    break;
            }
            return propertyType;
        },
        findParentNode:function (src,tarTag){
            var srcEl=src;
            var tarEl=null;
            var srcTag="";
            var tarTag=tarTag.toLowerCase();
            var con=$lq.selectorType(tarTag);
            /*switch(tarTag.charAt(0)){
                case "#":
                    con="id";
                    break;
                case ".":
                    con="className";
                    break;
                default:
                    con="nodeName";
                    break;
            }*/
            srcTag=src[con].toLowerCase();
            while(srcTag!=tarTag){
                if(src.nodeType==1){/*防止非元素类型*/
                    srcEl=srcEl.parentNode;
                    srcTag=srcEl[con].toLowerCase();
                }else{
                    break;
                }
            }
            return srcTag ==tarTag?tarEl=srcEl:tarEl;
        },
        firstNode:function(node){
            return node[0];
        },
        lastNode:function(node){
            return node[node.length-1]
        },
        nextNode:function(el){
            //var nextNodes=el.nextElementSibling ;
            var nextNode=el.nextSibling ;//包含换行符，空格
            while(nextNode!=null && nextNode.nodeType!=1){
                nextNode=nextNode.nextSibling ;
            }
            return nextNode;
        },
        prevNode:function(el){
            //var prevNodes=el.previousElementSibling;
            var prevNode=el.previousSibling;
            while(prevNode!=null && prevNode.nodeType!=1){
                prevNode=prevNode.previousSibling;
            }
            return prevNode;
        },
       sibling:function(el,fn){
           var parent=el.parentNode;
           var children=parent.children;
           var sibling=[];
           for(var i=0;i<children.length;i++){
               if(el!=children[i]){
                   sibling.push(children[i]);
                   fn && fn.call(children[i]);
               }
           }
           return sibling;
       },
        //获取某一个节点的上一个节点的索引
        prevIndex:function (current, parent) {
            var length = parent.children.length;
            if (current == 0) return length - 1;
            return parseInt(current) - 1;
        },
        //获取某一个节点的下一个节点的索引
        nextIndex:function (current, parent) {
            var length = parent.children.length;
            if (current == length - 1) return 0;
            return parseInt(current) + 1;
        },
        removeChild:function(child){
            var parent=child.parentNode;
            parent.removeChild(child);
            child=null;
        },
        removeChildren:function(parent){
            var children=parent.children;
            for(var i = children.length - 1; i >= 0; i--) {
                parent.removeChild(children[i]);
                //children[i]=null;
                delete children[i];
            };
            children=null;
        },
        addNodes:function(root,data){
            var dataLen=data.length;
            for(var i=0;i<dataLen;i++){
                var newNode=document.createElement(data[i].node);
                if(data[i].attr){
                    $lq.attr(newNode,data[i].attr);
                }
                if(data[i].text){
                    newNode.innerHTML=data[i].text;
                }
                if(data[i].children){
                    $lq.addNodes(newNode,data[i].children,true);
                }
                if(arguments.length==3){
                    root.appendChild(newNode);
                }else{
                    root.insertBefore(newNode,root.children[0]);
                }
            }
        },
        //设置节点属性
        //获取，设置元素特性//obj,attr,value//obj,{arrt:value}//obj,attr
        attr:function(){
            var len=arguments.length;
            if(len==2){
                if($lq.isObject(arguments[1])){
                    for(var i in arguments[1]){
                        arguments[0].setAttribute(i,arguments[1][i]);
                    }
                }else if(lq.isArray(arguments[1])){
                    var arr=[];
                    for(var j=0;j<arguments[1].length;j++){
                        arr[j]=arguments[0].getAttribute(arguments[1][j]);
                    }
                    return arr;

                }else if($lq.isString(arguments[1])){
                    //获取特性
                    return arguments[0].getAttribute(arguments[1]);
                }
            }else if(len==3){//设置特性
                arguments[0].setAttribute(arguments[1],arguments[2]);
            }
        },
        dataSet:function(el,name){
            var len=arguments.length;
            if(len==2){
                if($lq.isObject(name)){
                    for(var i in name){
                        el.dataset?el.dataset[i]=name[i]:$lq.attr(el,"data-"+i,name[i]);
                    }
                }else if($lq.isArray(name)){
                    var arr=[];
                    for(var j=0;j<name.length; j++){
                        arr[j]=el.dataset?el.dataset[name[j]]:$lq.attr(el,"data-"+name[j]);
                    }
                    return arr;
                }else if($lq.isString(name)){
                    return el.dataset?el.dataset[name]:$lq.attr(el,"data-"+name);
                }
            }else if(len==3){
                el.dataset?el.dataset[name]=arguments[len-1]:$lq.attr(el,"data-"+name,arguments[len-1]);
            }
        }
    });
//数值操作
    $lq.extend($lq,{
        //随机数返回begin-end直接的值
        random: function (begin, end) {
            return Math.floor(Math.random() * (end - begin)) + begin;
        },
        randomDif:function(begin,end,n){
            var original=[];
            var tar=[];
            for(var i=begin;i<=end;i++){
                original.push(i);
            }
            original.sort(function(){ return 0.5 - Math.random(); });//打散数组
            for(var j=0;j<n;j++){
                tar.push(original[j]);
            }
            return tar;
        }
       /* //保留两位小数
        //功能：将浮点数四舍五入，取小数点后2位
        function toDecimal(x) {
        var f = parseFloat(x);
        if (isNaN(f)) {
            return;
        }
        f = Math.round(x*100)/100;
        return f;
    }


    //制保留2位小数，如：2，会在2后面补上00.即2.00
    function toDecimal2(x) {
        var f = parseFloat(x);
        if (isNaN(f)) {
            return false;
        }
        var f = Math.round(x*100)/100;
        var s = f.toString();
        var rs = s.indexOf('.');
        if (rs < 0) {
            rs = s.length;
            s += '.';
        }
        while (s.length <= rs + 2) {
            s += '0';
        }
        return s;
    }

    function fomatFloat(src,pos){
        return Math.round(src*Math.pow(10, pos))/Math.pow(10, pos);
    }
    //四舍五入
    alert("保留2位小数：" + toDecimal(3.14159267));
    alert("强制保留2位小数：" + toDecimal2(3.14159267));
    alert("保留2位小数：" + toDecimal(3.14559267));
    alert("强制保留2位小数：" + toDecimal2(3.15159267));
    alert("保留2位小数：" + fomatFloat(3.14559267, 2));
    alert("保留1位小数：" + fomatFloat(3.15159267, 1));

    //五舍六入
    alert("保留2位小数：" + 1000.003.toFixed(2));
    alert("保留1位小数：" + 1000.08.toFixed(1));
    alert("保留1位小数：" + 1000.04.toFixed(1));
    alert("保留1位小数：" + 1000.05.toFixed(1));

    //科学计数
    alert(3.1415.toExponential(2));
    alert(3.1455.toExponential(2));
    alert(3.1445.toExponential(2));
    alert(3.1465.toExponential(2));
    alert(3.1665.toExponential(1));
    //精确到n位，不含n位
    alert("精确到小数点第2位" + 3.1415.toPrecision(2));
    alert("精确到小数点第3位" + 3.1465.toPrecision(3));
    alert("精确到小数点第2位" + 3.1415.toPrecision(2));
    alert("精确到小数点第2位" + 3.1455.toPrecision(2));
    alert("精确到小数点第5位" + 3.141592679287.toPrecision(5));*/
});
//字符串操作
    $lq.extend($lq,{
        //首写字母大写，后面字符小写
        capitalize: function(string) {
            return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
        },
        //删除前后空格
        trim:function (str) {
            return str.replace(/(^\s*)|(\s*$)/g, '');
        },
        //将有 - 字符串变为大小驼峰写法
        toHump:function(str,isBigHump){
            var string=str;
            var isBigHump= isBigHump||false;
            if(!isBigHump){
                string =str.indexOf("-")==0? str.substring(1) : str;
            }
            return string.replace(/-(\w)/g, function($0, $1) {
                // console.log($0,$1)
                return $1.toUpperCase();
            });
        }
    });
//数组操作
    $lq.extend($lq,{
        //descending:true为升序排列，key为对象属性名
        sort:function(arr,descending,key){
            var des=descending || false;
            function compare(val1,val2){
                var val1=val1,val2=val2;
                if(key!=undefined){
                    val1=val1[key],val2=val2[key];
                }
                if(val1<val2){
                    return des?1:-1
                }else if(val1>val2){
                    return des?-1:1
                }else{
                    return 0
                }
            }
            return arr.sort(compare);
        },
        /*
         3、简单对象List自定义属性排序
         var objectList = new Array();
         function Persion(name,age){
         this.name=name;
         this.age=age;
         }
         objectList.push(new Persion('jack',20));
         objectList.push(new Persion('tony',25));
         objectList.push(new Persion('stone',26));
         objectList.push(new Persion('mandy',23));
         //按年龄从小到大排序
         objectList.sort(function(a,b){
         return a.age-b.age});
         for(var i=0;i<objectList.length;i++){
         document.writeln('<br />age:'+objectList[i].age+' name:'+objectList[i].name);
         }
        * */
        /*
        * 4、简单对象List对可编辑属性的排序
        * var objectList2 = new Array();
         function WorkMate(name,age){
         this.name=name;
         var _age=age;
         this.age=function(){
         if(!arguments)
         {
         _age=arguments[0];}
         else
         {
         return _age;}
         }

         }
         objectList2.push(new WorkMate('jack',20));
         objectList2.push(new WorkMate('tony',25));
         objectList2.push(new WorkMate('stone',26));
         objectList2.push(new WorkMate('mandy',23));
         //按年龄从小到大排序
         objectList2.sort(function(a,b){
         return a.age()-b.age();
         });
         for(var i=0;i<objectList2.length;i++){
         document.writeln('<br />age:'+objectList2[i].age()+' name:'+objectList2[i].name);
         }
        * */
        getMax:function(arr){
            Math.min.apply(null,arr);
            var max= Math.max.apply(null,arr);;
            var item=$lq.getIndex(max,arr);
            return {item:item,val:max};
        },
        getMin:function(arr){
            var min=Math.min.apply(null,arr);
            var item=$lq.getIndex(min,arr);
            return {item:item,val:min};
        },
        getIndex:function (height,arr){
            for(var i=0;i<arr.length;i++){
                if(height==arr[i]){
                    return i;
                }
            }
        }
    });
//缓存管理器
    $lq.extend($lq,{
        //缓存框架 - 内存篇
        //元素
        cache:{},
        copy:function(obj,copy){
            for(var i in copy){
                if($lq.isObject(obj[i])&&$lq.isObject(copy[i])){
                    $lq.copy(obj[i],copy[i]);
                }else{
                    obj[i]=copy[i];
                }
            }
        },
        bundle:function(itemName,attrName,val,el){
            var el=el||$lq;
            el[itemName]=el[itemName] || {};
            el[itemName][attrName]=el[itemName][attrName]||[];
            if($lq.isArray(val)){
                for(var i=0;i<val.length;i++){
                    el[itemName][attrName].push(val[i]);
                }
            }else{
                val!=undefined && el[itemName][attrName].push(val);
            }
        },
        bundles:function(itemName,json,el){
            var json=json||{};
            for(var  i in json){
                $lq.bundle(itemName,i,json[i],el);
            }
        },
        removeBundle:function(itemName,attrName,val,el){
            var el=el||$lq;
            var fns=el[itemName][attrName];
            if(!$lq.isArray(fns)){return ;}
            for(var i= 0,len=fns.length;i<len;i+=1){
                if(fns[i]===val){
                    break;
                }
            }
            fns.splice(i,1);
            val=null;
        },
        removeBundles:function(itemName,json,el){
            var json=json||{};
            for(var  i in json){
                $lq.removeBundle(itemName,i,json[i],el);
            }
        },
        tie:function(itemName,attrName,val,el,deep){
            var deep =deep || false;
            var el=el||$lq;
            el[itemName]=el[itemName] || {};
            deep &&$lq.isObject(el[itemName][attrName]) && $lq.isObject(val) ?$lq.extend(el[itemName][attrName],val):el[itemName][attrName]=val;
        },
        ties:function(itemName,json,el,deep){
            var deep =deep || false;
            var json=json||{};
            for(var i in json){
                $lq.tie(itemName,i,json[i],el,deep);
            }
        },
        removeTie:function(item,name,el){
            var el=el||$lq;
            el[item][name]=null;
            delete el[item][name];
        },
        removeTies:function(item,name,el){
            var el=el||$lq;
            var name=name||[];
            var fn=$lq.isArray(name)?function(i){return name[i]}:function(i){return i;};
            for(var i in name){
                $lq.removeTie(item,fn(i),el);
            }
        },
        record:function(attrName,val,el){
           $lq.tie("data",attrName,val,el);
        },
        records:function(json ,el){
           $lq.ties("data",json,el);
        },
        removeRecord:function(name,el){
            $lq.removeTie("data",name,el);
        },
        //json可以是对象，值随意，也可以是数组
        removeRecords:function(json,el){
           $lq.removeTies("data",json,el);
        },
        cookie:{

        }
    });
//事件
    $lq.extend($lq,{
        customEvent:function(type,config,el){
            var event=undefined,config=config || {bubbles:false,cancelable:false,detail:undefined};
            //console.log("-df-addf---"+document.createEventObject);
            console.log("---create>>>>>>>customEvent", type);
            if(el.customEvent  && el.customEvent[type]){
                return el.customEvent[type];
            }
            if(window.CustomEvent && $lq.isFunction(window.CustomEvent)){
                console.log("--->>>>>>>1");
                event= new CustomEvent(type,config);
            }else if(document.createEvent){
                console.log("--->>>>>>>2");
                event=document.createEvent("CustomEvent");
                event.initCustomEvent(type,config.bubbles,config.cancelable,config.detail);
            }else if(document.createEventObject){
                //IE678只能触发系统标准事件，用户自定义的非标准事件可以用onPropertyChange事件模拟
                console.log("--->>>>>>>IDDDDDDDD");
                event=$lq.hasOwnEvent(type)?document.createEventObject():event;
                /*event.screenX=100;
                 event.screenY=0;
                 event.clientX=0;
                 event.clientY=0;
                 event.ctrlKey=false;
                 event.altKey=false;
                 event.shiftKey=false;
                 event.button=0;*/
            }
            event && $lq.tie("customEvent",type,event,el);
            return event;
        },
        //事件3种处理程序：HTML,DOM0,DOM2,IE事件处理方式，其中HTML事件处理方式，是在标签处书写。
        on:function(el,type,handler,capture){
            var type=$lq.compatType(type),e=undefined;
            $lq.isElement(el) &&!$lq.hasOwnEvent(type,el) && (e=$lq.customEvent(type,{bubbles:true,cancelable:true ,detail:"lq"},el));
            if(el.addEventListener){//W3C标准DOM2
                el.addEventListener(type,handler,capture || false);//第3个参数false 表示冒泡，true表示捕获
            }else if(el.attachEvent){//IE8-
                //var lastArg=arguments[arguments.length-1];
                //var one =$lq.isBoolean(lastArg)?lastArg:false;//用于判断，是不是只执行一次的事件添加
                //if(handler.name==undefined && !one ){}//委托事件，是已经绑定过函数的，所以要判断区别
                /*
                 *注意在IE678中this指向的不是绑定的元素，而是window对象
                 * 解决方案是在方法中指定事情目标。
                 //var _this=event.srcElement||event.target;*/
                var fn=handler;
                if(handler.fnName==undefined){//委托事件，是已经包装过函数的，所以要判断区别
                    fn=function(e){handler.call(el,e)};//包装后的匿名函数
                    fn.fnName=handler.getName();//给匿名函数添加名字
                    $lq.bind(el,type,fn,true);//方法绑定元素
                }
                el.attachEvent("on"+type,fn);
            }else if($lq.hasOwnEvent(type,el)){//DOM0
                el["on"+type]=handler;
            }else if(!e){
                $lq.bind(el,type,handler);
            }
        },
        off:function(el,type,fn,capture){
            var type=$lq.compatType(type),bind=$lq.getBind(el,type,fn);
            $lq.removeEvent(el,type,bind || fn,capture);
            (el.events && bind) && $lq.removeBind(el,type,bind,true);
        },
        offs:function(el,json,capture){
            var con= json ||{};
            for(var type  in con){
                $lq.off(el,type,con[type],capture);
            }
        },
        trigger:function(el,type,config){
            //customEvent
            //console.log("trigger---start",el["listeners"])
            var e=el.customEvent && el.customEvent[type];
            !e&&$lq.isElement(el)&&(e=$lq.customEvent(type,{bubbles:true,cancelable:true ,detail:"lq"},el));
            if(e && el.dispatchEvent){
                //var e= $lq.customEvent(type,{bubbles:true,cancelable:true ,detail:"lq"},el);
                //标准浏览器
                el.dispatchEvent(e);
            }else if(el.attachEvent){
                //var e= $lq.customEvent(type,{bubbles:true,cancelable:true ,detail:"lq"},el);
                //IE6，7，8---cepn:custom , event, property, name
                if(e){
                    console.log("IE -----------",e);
                    el.fireEvent("on"+type,e);
                }else{
                    console.log("-------propertychange");
                    el["CEPN"+type]=0;
                    var wrap=function(e){
                        el.detachEvent("onpropertychange",wrap);
                        var e=$lq.compatEvent(e);
                        console.log(e.propertyName,el.events[type].length,"CEPN"+type);
                        if(e.propertyName=="CEPN"+type && el.events[type].length>0){
                            for(var fn in el.events[type]){
                                el.events[type][fn].call(this,e);
                            };
                        }
                    };
                    el.attachEvent("onpropertychange", wrap);
                    el["CEPN"+type]++;
                }
            };
            if(!e && el.listeners && el.listeners[type]){
                //用户定义行为
           /*     for (var i=0;i<el.listeners[type].length;i++){
                    el.listeners[type][i]();
                }*/
                var con={type:type};
                config && $lq.extend(con,config);
                $lq.fire(el,con);
            };

           // console.log("trigger---end")
        },
        ons:function(el,json,capture){
            var json=json||{};
            for(var type in json){
                $lq.on(el,type,json[type],capture);
            }
        },
        one:function(el,type,handler,capture){
            var type=$lq.compatType(type);
            function wrap(e){
                //$lq.remove(el,type,wrap);
                //(el.removeEventListener&&el.removeEventListener(type,wrap,false)) ||(el.detachEvent&&el.detachEvent("on"+type,wrap))||(el["on"+type]=null);
                //$lq.removeEvent(el,type,wrap);
                $lq.off(el,type,wrap);
                handler.call(el,e);
            };
            wrap.fnName="once";
            $lq.on(el,type,wrap,capture);
        },
        getBind:function(el,type,handler){
            var  res=undefined,fns=el.events || el.listeners;
            if(fns && fns[type] && fns[type].length>0){
                for(var i=0;i<fns[type].length;i++){
                    var fn=fns[type][i],is=fn.fnName ?fn.fnName==handler.getName():fn==handler;
                    is && (res=fn);
                }
            }
            return res ;
        },
        removeEvent:function(el,type,handler,capture){
            var type=$lq.compatType(type);
            (el.removeEventListener&&el.removeEventListener(type,handler,capture || false)) || (el.detachEvent&& (el.detachEvent("on"+type,handler),el.detachEvent(type,handler))) || ($lq.hasOwnEvent(type,el)&&(el["on"+type]=null)) || (el.listeners && el.listeners[type] && $lq.removeBind(el,type,handler));
            //el.customEvent && el.customEvent[type] && (el.customEvent[type]=null,delete(el.customEvent[type]));
        },
       /* remove:function(el,type, handler){
            var events= el.events;
            if(events){
                //events在标准浏览器下，有该属性的，只有委托事件。
                for(var i =0 ;i<events[type].length;i++){
                    if(events[type][i].fnName==handler.getName()){
                        ( el.removeEventListener&&el.removeEventListener(type,events[type][i],false)) || (el.detachEvent&& el.detachEvent("on"+type,events[type][i]));
                    }
                }
                $lq.removeBind(el,type,handler,true);
            }else{
                (el.removeEventListener&&el.removeEventListener(type,handler,false)) ||(el.detachEvent&&el.detachEvent("on"+type,handler))||(el["on"+type]=null);
            }
        },
        removes:function(el,json){
            var json=json||{};
            for(var i in json){
                $lq.remove(el,i,json[i]);
            }
        },*/
        compatType:function(type){
            var type=type;
            switch(type){
                case "DOMMouseScroll":case "wheel":case "mousewheel":
                    type=window.navigator.userAgent.toLowerCase().indexOf("firefox")!=-1?"DOMMouseScroll":"mousewheel";
                    break;
                case "down":case"start":case "mousedown":case"touchstart":
                    type=$lq.adaptor.touchstart;
                    break;
                case "move":case "mousemove":case "touchmove":
                    type=$lq.adaptor.touchmove;
                    break;
                case "up":case "end":case "mouseup":case "touchend":
                    type=$lq.adaptor.touchend;
                    break;
                case "out":case "mouseout":
                    type="mouseout";
                    break;
                default:
                    break;
            }
            return type;
        },
        compatEvent:function(e,el){
            var event=$lq.getEvent(e);
            //1处理：统一滚轮滚动方向和数值，数值都为1；
            $lq.getDelta(event);
            //2处理：统一目标对象
            if (!event.target && event.srcElement) {
                event.target = event.srcElement;
            }
            //3处理：统一取消默认方式的方法
            if (!event.preventDefault && event.returnValue !== undefined) {
                event.preventDefault = function() {event.returnValue = false;};
            }
            //4处理：统一阻止冒泡的方法
            if(!event.stopPropagation && event.cancelBubble !== undefined){
                event.stopPropagation=function(){event.cancelBubble=true;}
            }
            //5处理：统一上一次对象
            if(event.relatedTarget !=undefined){
                event.relatedTarget=event.type=="mouseover"?event.fromElement:event.toElement;
            }
            //6处理：鼠标坐标
            $lq.mousePostion(event,el || event.target);
            //7处理：鼠标按键
            event.buttonKey=$lq.getButton(event);
            /*
             ......其他一些兼容性处理 */
            return event;
        },
        //--------->事件对象
        getEvent:function(e){
            var e=e || window.event;
       /*     //ie6,7,8无pageXpageY属性。
            if(e.pageX == undefined){
                e.pageX= e.clientX, e.pageY= e.clientY;
            }*/
            return e;
        },
        getTouch:function(e,name){
            //touches,changedTouches,targetTouches
            var name= name || "changedTouches";
            if(!e[name]){
                e[name]=[];
                e[name][0]={
                    clientX: e.clientX,
                    clientY: e.clientY,
                    pageX: e.pageX,
                    pageY: e.pageY,
                    target: $lq.getTarget(e)
                }
            }
            return  e[name];
        },
        getTarget:function(e){
            //target是W3C标准，srcElement是IE678
            return e.target || e.srcElement;
        },
        getRelatedTarget: function (e) {
            return e.relatedTarget  || (e.type=="mouseover"?e.fromElement:e.toElement);
        },
        getDelta:function(e){
            var type=e.type;
            e.delta= e.delta || 0;
            if (type=="wheel" || type == 'mousewheel' || type == 'DOMMouseScroll' ) {
                e.delta = (e.wheelDelta) ? e.wheelDelta / 120 : -(e.detail || 0) / 3;
            }
        },
        getButton: function(event) {
            if(document.implementation.hasFeature("MouseEvents", "2.0")) {
                return event.button;
            } else {
                switch(event.button) {
                    case 0:
                    case 1:
                    case 3:
                    case 5:
                    case 7:
                        return 0;
                    case 2:
                    case 6:
                        return 2;
                    case 4:
                        return 1;
                }
            }
        },
        preventDefault:function(e){
            var e=$lq.getEvent(e);
            if(e.preventDefault){//W3C标准
                e.preventDefault();
            }else{
                //可以取消发生事件的源元素的默认动作。returnValue如果设置了该属性，它的值比事件句柄的返回值优先级高。把这个属性设置为 fasle，
                e.returnValue=false;//IE678
            }
        },
        stopPropagation:function(e){
            if(e.stopPropagation){//W3C标准
                e.stopPropagation();
            }else{
                e.cancelBubble=true;//IE678
            }
        },
        mousePostion:function(e,el){
            var el =el || $lq.getTarget(e);
            //var pos={};
            if(e.x ==undefined){
                e.x= e.x|| e.clientX;
                e.y= e.y|| e.clientY;
            }
            //IE6,7,8没有page属性
            if(e.pageX==undefined){
                e.pageX= e.pageX || e.clientX+$lq.getScroll().x;
                e.pageY= e.pageY || e.clientY+$lq.getScroll().y;
            }
            //由于兼容性差，直接替换
            var offsetEl=$lq.getClientRect(el);
            if(e.offsetX ==undefined){
                e.offsetX= e.pageX-offsetEl.pageX;
                e.offsetY= e.pageY-offsetEl.pageY;
            }
            e.offsetClientX= e.clientX-offsetEl.clientX;
            e.offsetClientY= e.clientY-offsetEl.clientY;
            //e.pos=pos;
        },
        unCapture:function(e,a){
            var type= e.type;
            var b=null;
            var a= e.currentTarget || a ;//(currentTarget在IE9以上才支持，在IE678,要传入this;)
            switch (type){
                case "mouseover":
                case "mouseout":
                    b=$lq.getRelatedTarget(e);
                    return ( !$lq.elContains(a,b) && a!=b);
                    break;
                default:
                    b=$lq.getTarget(e);
                    return a==b;
                    break
            }
        },
        //事件委托
        delegate:function(pEl, eventType, fn , selector ) {
            //参数处理
            var parent = pEl;

            function handle(e){
                var event=$lq.getEvent(e);
                var target = $lq.getTarget(event);
                //console.log("事件委托当前节点："+target.nodeName);
                var res=false;
                var propertyType="";
                function callFn(sel){
                    propertyType=$lq.selectorType(sel);
                    switch(propertyType){
                        case"id":
                            res=target[propertyType]===sel;
                            break;
                        case"className":
                            //res=target[propertyType].indexOf(sel.charAt(1)) !=-1;
                            var cname=sel.substring(1)
                            res=$lq.hasClass(target,cname);
                            //console.log(target[propertyType]+"---"+sel+"---"+cname+"--"+res)
                            break;
                        default:
                            res=target[propertyType].toLowerCase()===sel.toLowerCase();
                            break;
                    }
                    //res= propertyType=="className"?target[propertyType].indexOf(sel) !=-1:target[propertyType]===sel;
                    //res=target.nodeName.toLowerCase()=== selector || target.id === selector || target.className.indexOf(selector) != -1
                    if(res){
                        // 在事件冒泡的时候，回以此遍历每个子孙后代，如果找到对应的元素，则执行如下函数
                        fn.call(target,e);
                    }
                }
                if($lq.isString(selector)){
                    callFn(selector);
                }else if($lq.isArray(selector)){
                    for(var i = 0,len=selector.length;i<len;i+=1){
                        callFn(selector[i]);
                    }
                }

            };
            //之所以要写，是因为，在标准浏览器下，也是要进行寻找的
           //
     /*       Object.defineProperties(handle,{"name":{
                writable:true,enumerable:true,configurable:true,value:fn.getName()
            }});*/
            handle.fnName=fn.getName();//给匿名函数添加名字
            $lq.bind(parent,eventType,handle,true);//方法绑定元素
            $lq.on(parent,eventType,handle);
        },
        delegates:function(el,json,selector){
            var json=json||{};
            for(var type in json){
                $lq.delegate(el,type,json[type],selector);
            }
        },
        /*
        *    //用户事件
        *
        * */
        binds:function (el,json,isOn){
            var attrName= isOn ?"events":"listeners";//events表示DOM事件集合用包装，listeners用户自定义事件集合
            $lq.bundles(attrName,json,el);
        },
        bind:function(el,eventType,handler,isOn){
            var attrName= isOn ?"events":"listeners";//events表示DOM事件集合用包装，listeners用户自定义事件集合
          /*  el[attrName]=el[attrName] || {};
            el[attrName][eventType]=el[attrName][eventType]|| [];
            handler &&( el[attrName][eventType].push(handler));*/
            $lq.bundle(attrName,eventType,handler,el);
        },
        fire:function(el,event,isOn){
            var attrName= isOn ?"events":"listeners";
            if(!event.target){
                event.target=el;
            }
            el[attrName] || $lq.bind(el,event.type);
            var fns=el[attrName][event.type] || null
            if( !$lq.isArray(fns)){return;}
            for(var i= 0,len=fns.length;i<len;i+=1){
                var result=fns[i].call(el,event);
            }
        },
        removeBind:function(el,eventType,handler,isOn){
            var attrName= isOn ?"events":"listeners";
            $lq.removeBundle(attrName,eventType,handler,el);
        },
        removeBinds:function(el,json,isOn){
            var attrName= isOn ?"events":"listeners";
            $lq.removeBundles(attrName,json,el);
        }
        //---------> //事件类型处理
        //switch (type) case wheel: break ; case mouseup :break;
    });
//动画
    $lq.extend($lq,{
        parseAnimation:function(con,setting){
            var attr={config:{},group:{isGrouped:false,elapsed:{}}},str="",set={type:"linear",duration:500,delay:0},name;
            setting && $lq.extend(set,setting);
            var con=$lq.compatProperty(con) ||{},config,group=attr.group;
            config=attr.config,config.maxDuration=config.minDuration=set.duration,config.maxDelay=config.minDelay=set.delay,config.delays={};
            var defaultValue={value:undefined,type:set.type,delay:set.delay,duration:set.duration,toStr:""};

            for(var i in con){
                //基本配置
                attr[i]=attr[i] || {};
                con[i].type!=undefined ? (attr[i].type= con[i].type,delete con[i].type): attr[i].type=defaultValue.type;
                con[i].delay!=undefined ?(attr[i].delay= con[i].delay,delete con[i].delay):attr[i].delay= defaultValue.delay;
                con[i].duration!=undefined ?(attr[i].duration= con[i].duration,delete con[i].duration):attr[i].duration= defaultValue.duration;
                con[i].value!=undefined ?attr[i].value= con[i].value:(attr[i].value={},$lq.isObject(con[i])?$lq.extend(attr[i].value,con[i]):attr[i].value=con[i]);
                attr[i].toStr=attr[i].duration+(attr[i].delay>0?"ms "+attr[i].delay+"ms "+i:"ms "+i)+" "+attr[i].type;
                str+=attr[i].toStr+",";
                //config配置
                config.maxDuration=attr[i].duration>config.maxDuration?attr[i].duration:config.maxDuration;
                config.minDuration=attr[i].duration<config.minDuration?attr[i].duration:config.minDuration;
                config.maxDelay=attr[i].delay>config.maxDelay?attr[i].delay:config.maxDelay;
                config.minDelay=attr[i].delay<config.minDelay?attr[i].delay:config.minDelay;
                //group 配置：延时分组
                if(config.maxDelay!=0){
                    group.isGrouped=true;
                    var delay=group.delay= group.delay ||{}, delayObj=delay[attr[i].delay]=delay[attr[i].delay] ||{maxDuration:set.duration,minDuration:set.duration},
                        delayTime=group.elapsed.delay=group.elapsed.delay||{elapseTime:0};
                    var time=parseInt(attr[i].duration)+parseInt(attr[i].delay);
                    if(delayTime.elapseTime<time){
                        delayTime.elapseTime=time;delayTime.name=i;delayTime.duration=attr[i].duration;delayTime.delayTime=attr[i].delay;
                    }
                    delayObj.maxDuration=delayObj.maxDuration>attr[i].duration?delayObj.maxDuration:attr[i].duration;
                    delayObj.minDuration=delayObj.minDuration<attr[i].duration?delayObj.minDuration:attr[i].duration;
                    delayObj.con=delayObj.con ||{},delayObj.con[i]={duration:attr[i].duration,type:attr[i].type};
                }
            }
            config.toStr=str.substring(0,str.length-1);
            return attr;
        },
        //属性兼容
        compatProperty:function(con,complete){
            //主要是低版本IE兼容
            var support=$lq.styleInfo,translateXY=undefined,complete= complete ||false,con=$lq.parseTransition(con) ||{};
            if(complete && support.transform){
                translateXY={left:"translateX",top:"translateY"};
            }else if(!support.transform){
                translateXY={translateX:"left",translateY:"top"};
                if(con.transform && con.transform.translate){
                    con.transform.translate.translateX !=undefined && (con.translateX= con.transform.translate.translateX);
                    con.transform.translate.translateY !=undefined && (con.translateY= con.transform.translate.translateY);
                }
                con.transform && delete con.transform;
            }

            if(translateXY==undefined){return con};
            //function swtichTranslateXY(translateXY,con){}
            for(var i in translateXY){
                if($lq.isObject(con)&&con[i]!=undefined) {
                    var value = con[i];
                    delete con[i];
                    con[translateXY[i]] = value;
                }
            }
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",con);
            return con;
        },
        //动画兼容
        transition:function(el,con,setting){
            var support=$lq.styleInfo;
            //过渡兼容
            if( support.transition ){
                //$lq.getStyle(el[0],"transitionDuration")=="0s"&&    (el[0].style.transition=
                var con =con ||{}
                var setJson=function(set){
                    var defaultValue={duration:500,type:"ease-out"};
                    set==undefined?defaultValue:$lq.extend(defaultValue,set);
                    return defaultValue;
                }(setting);
                var conJson=$lq.parseAnimation(con,setJson),attributeArray=[];
                console.log(conJson);
                el.style.transition=conJson.config.toStr;
                //  $lq.getStyle(el[0],"transitionDuration")=="0s"&&    (el[0].style.transition="0.5s");
                var durations=$lq.getStyle(el,"transitionDuration").split(",");
                for(var i in conJson){
                    var val=conJson[i].value;
                    if(i=="transform"){
                        $lq.transform(el,val,true);
                        attributeArray.push(i);
                    }else if(i!="config" && i!="group"){
                        $lq.setStyle(el,i,val);
                        attributeArray.push(i);
                    }
                };

                setJson.end&& ( oneWrap.fnName="once",$lq.on(el,"transitionend",oneWrap));
            }else{
                $lq.animate(el,con,setting);
            }
            function oneWrap(e){
                attributeArray.length--;
                if(attributeArray.length==0){
                    $lq.removeEvent(el,"transitionend",oneWrap);
                    setJson.end.call(el,e);
                }
            };

        },
        animate:function(el,attrs,setting){
            if(!el.animationFrame){
                el.animationFrame=new $lq.animationFrame(el,attrs,setting);
            }else{
                el.animationFrame.init(attrs,setting);
            }
        },
        Tween:{
            /*
             * t：current time (当前时间)
             * b：beginning value (初始值-开始位置)
             * c：change in value (变化量-总距离)
             * d：duration (持续时间-总时间)
             * return (目标点)
             * */
            linear: function (t, b, c, d){  //匀速
                return c*t/d + b;
            },
            //Quad：二次方的缓动（t^2）；
            easeIn: function(t, b, c, d){  //加速曲线；由慢到快(从0开始加速的缓动)
                return c*(t/=d)*t + b;
            },
            easeOut: function(t, b, c, d){  //减速曲线：由快到慢(减速到0的缓动)
                return -c *(t/=d)*(t-2) + b;
            },
            easeBoth: function(t, b, c, d){  //加速减速曲线：先慢到快再由快到慢
                if ((t/=d/2) < 1) {
                    return c/2*t*t + b;
                }
                return -c/2 * ((--t)*(t-2) - 1) + b;
            },
            //Quart：四次方的缓动（t^4）；
            easeInStrong: function(t, b, c, d){  //加加速曲线
                return c*(t/=d)*t*t*t + b;
            },
            easeOutStrong: function(t, b, c, d){  //减减速曲线
                return -c * ((t=t/d-1)*t*t*t - 1) + b;
            },
            easeBothStrong: function(t, b, c, d){  //加加速减减速曲线
                if ((t/=d/2) < 1) {
                    return c/2*t*t*t*t + b;
                }
                return -c/2 * ((t-=2)*t*t*t - 2) + b;
            },
            //Elastic：指数衰减的正弦曲线缓动；
            elasticIn: function(t, b, c, d, a, p){  //正弦衰减曲线（弹动渐入）
                if (t === 0) {
                    return b;
                }
                if ( (t /= d) == 1 ) {
                    return b+c;
                }
                if (!p) {
                    p=d*0.3;
                }
                if (!a || a < Math.abs(c)) {
                    a = c;
                    var s = p/4;
                } else {
                    var s = p/(2*Math.PI) * Math.asin (c/a);
                }
                return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            },
            elasticOut: function(t, b, c, d, a, p){    //正弦增强曲线（弹动渐出）
                if (t === 0) {
                    return b;
                }
                if ( (t /= d) == 1 ) {
                    return b+c;
                }
                if (!p) {
                    p=d*0.3;
                }
                if (!a || a < Math.abs(c)) {
                    a = c;
                    var s = p / 4;
                } else {
                    var s = p/(2*Math.PI) * Math.asin (c/a);
                }
                return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
            },
            elasticBoth: function(t, b, c, d, a, p){
                if (t === 0) {
                    return b;
                }
                if ( (t /= d/2) == 2 ) {
                    return b+c;
                }
                if (!p) {
                    p = d*(0.3*1.5);
                }
                if ( !a || a < Math.abs(c) ) {
                    a = c;
                    var s = p/4;
                }
                else {
                    var s = p/(2*Math.PI) * Math.asin (c/a);
                }
                if (t < 1) {
                    return - 0.5*(a*Math.pow(2,10*(t-=1)) *
                        Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
                }
                return a*Math.pow(2,-10*(t-=1)) *
                    Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
            },
            //Back：超过范围的三次方缓动（(s+1)*t^3 - s*t^2）；
            backIn: function(t, b, c, d, s){     //回退加速（回退渐入）
                if (typeof s == 'undefined') {
                    s = 1.70158;
                }
                return c*(t/=d)*t*((s+1)*t - s) + b;
            },
            backOut: function(t, b, c, d, s){
                if (typeof s == 'undefined') {
                    s = 3.70158;  //回缩的距离
                }
                return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
            },
            backBoth: function(t, b, c, d, s){
                if (typeof s == 'undefined') {
                    s = 1.70158;
                }
                if ((t /= d/2 ) < 1) {
                    return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
                }
                return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
            },
            //Bounce：指数衰减的反弹缓动。
            bounceIn: function(t, b, c, d){    //弹球减振（弹球渐出）
                return c - $lq.Tween['bounceOut'](d-t, 0, c, d) + b;
            },
            bounceOut: function(t, b, c, d){
                if ((t/=d) < (1/2.75)) {
                    return c*(7.5625*t*t) + b;
                } else if (t < (2/2.75)) {
                    return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
                } else if (t < (2.5/2.75)) {
                    return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
                }
                return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
            },
            bounceBoth: function(t, b, c, d){
                if (t < d/2) {
                    return $lq.Tween['bounceIn'](t*2, 0, c, d) * 0.5 + b;
                }
                return $lq.Tween['bounceOut'](t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
            }
        }
    });
//Ajax
    $lq.extend($lq,{
        createXHR:function(){
            if(typeof XMLHttpRequest !="undefined"){
                return new XMLHttpRequest(); //IE7+及其w3c标准浏览器
            }else if(typeof ActiveXObject !="undefined"){
                //IE6-
                if(typeof $lq.createXHR.activeXString !="string"){
                    var versions=["MSXML2.XMLHttp.6.0","MSXML2.XMLHttp.3.0","MSXML2.XMLHttp"], i, len;
                    for(i=0,len=versions.length;i<len;i++){
                        try{
                            new ActiveXObject(versions[i]);
                            $lq.createXHR.activeXString=versions[i];
                            break;
                        }catch (ex){
                            //省略
                        }
                    }
                }
                return new ActiveXObject($lq.createXHR.activeXString);
            }else {
                throw new Error('您的系统或浏览器不支持XHR对象！');
            }
        },
        /*{
         url,method,asynchronous,data,success
         }*/
        ajax:function(json){
            var xhr=$lq.createXHR();
            json.async == undefined&&(json.async=true);//默认设置为异步
            json.method||(json.method="get");//设置默认为get;
            //json.url+=json.url.indexOf("?")==-1?"?":"&";
            json.data=(function(data){
                var arr=[];
                for(var i in data){
                    arr.push(encodeURIComponent(i)+"="+encodeURIComponent(data[i]))
                }
                return arr.join("&");
            })(json.data);
            if(json.method==="get"){
                json.url+=json.url.indexOf("?")==-1?"?"+json.data:"&"+json.data;
            }
            if(json.async===true){
                xhr.onreadystatechange=function(){
                    if(xhr.readyState==4){
                        callBack();
                    }
                };
            }
            console.log("async:"+json.async);
            xhr.open(json.method,json.url,json.async);
            //xhr.setRequestHeader("Myheader","MyValue");
            //var myHeader=xhr.getResponseHeader("MyHeader");
            //var allHeader=xhr.getAllResponseHeaders();
            if (json.method === 'post') {
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');//串联化格式给后台
                xhr.send(json.data);
            } else {
                xhr.send(null);
            }
            if (json.async === false) {
                callBack();
            }
            function callBack(){
                if((xhr.status >=200 && xhr.status<300) || xhr.status==304){
                    //console.log(xhr.responseText);//返回XML使用： xhr.responseXML
                    json.success && json.success(xhr.responseText);
                }else{
                    console.log("request was unsuccessful:"+xhr.status+ '，错误信息：' + xhr.statusText);
                    json.error && json.error("request was unsuccessful:"+xhr.status+ '，错误信息：' + xhr.statusText,xhr);
                }
            }
        },
        //将json转换成json格式的字符串
        stringify:function (json) {
            return (JSON&&JSON.stringify(json)) || false;
        },
        //将json格式的字符串转成json
        parseJson:function (str) {
            //有3种方法
            if( typeof JSON != "undefined"){
                return JSON.parse(str);//方法3---该方法需要高版本支持JSON对象,支持ECMASCRIPT5
            }else{
                console.log("使用eval来解析AJAX返回的结果");
                return eval("("+str+")"); //方法1--该方法执行存在执行恶意代码的风险
                //return (new Function("","return "+str))();//方法2
            }


        }
    });
//加载
    $lq.extend($lq,{
        //DOM加载
        addDomLoaded:function(fn) {
            var isReady = false,timer = null,b=$lq.client.simple.name || "no",ver=$lq.client.simple.ver || "no",e=$lq.client.simple.engine || "no",eVer=$lq.client.simple.eVer || "no";
            function doReady() {
                if (timer) clearInterval(timer);
                if (isReady) return;
                isReady = true;
                fn();
            }
            if ((b=="opera" && ver < 9) || (b=="firefox" && ver < 3) || (e=="webkit" && eVer < 525)) {
                //无论采用哪种，基本上用不着了
                /*timer = setInterval(function () {
                 if (/loaded|complete/.test(document.readyState)) { 	//loaded是部分加载，有可能只是DOM加载完毕，complete是完全加载，类似于onload
                 doReady();
                 }
                 }, 1);*/

                timer = setInterval(function () {
                    if (document && document.getElementById && document.getElementsByTagName && document.body) {
                        doReady();
                    }
                }, 1);
            } else if (document.addEventListener) {//W3C
                $lq.one(document, 'DOMContentLoaded', function executeLoad(e) {
                    fn();
                    //$lq.remove(document, 'DOMContentLoaded',executeLoad);
                    //严格模式下callee不能使用，1，提高了效率2，在早期版本由于不支持具名函数表达式，所以用callee，而现在已经支持具名函数表达式；
                    //$lq.remove(document, 'DOMContentLoaded', arguments.callee);
                });
            } else if (b=="ie" && ver < 9){
                var timer = null;
                timer = setInterval(function () {
                    console.log(">>>>>>>>>IE加载执行代码");
                    try {
                        document.documentElement.doScroll('left');
                        doReady();
                    } catch (e) {};
                }, 1);
            }
        },
        //js加载
        loadScript:function(url,callback){
            var elem =  $lq.delay_file(url);
            console.log(url+"创建完毕");
            var isIE = navigator.userAgent.indexOf('MSIE') == -1 ? false : true;

            if ( isIE ) {
                elem.onreadystatechange = function() {
                    if (this.readyState && this.readyState == 'loading') return;
                    if (callback) {
                        callback();
                    }
                };
            } else {
                elem.onload = function() {
                    if (callback) {
                        callback();
                    }
                };
            }
        },
        //样式加载
        loadStyle:function(url,callback){
            //对于异步加载的都需要进行回调处理
            var elem =  $lq.delay_file(url);
            console.log(url+"创建完毕");
            if (elem.attachEvent) {
                elem.attachEvent('onload', callback||function(){});
            } else {
                setTimeout(function() {
                    poll(elem, callback||function(){});
                }, 0);
            }

            function poll(_elem, callback) {

                var isLoaded = false;
                var sheet = _elem['sheet'];
                var isOldWebKit = (navigator.userAgent.replace(/.*AppleWebKit\/(\d+)\..*/, '$1')) * 1 < 536;

                if (isOldWebKit) { //webkit 版本小于 536
                    if (sheet) {
                        isLoaded = true;
                    }
                } else if (sheet) {
                    try {
                        if (sheet.cssRules) {
                            isLoaded = true;
                        }
                    } catch (ex) {
                        if (ex.code === 'NS_ERROR_DOM_SECURITY_ERR') {
                            isLoaded = true;
                        }
                    }
                }

                if (isLoaded) {
                    setTimeout(function() {
                        callback();
                    }, 1);
                } else {
                    setTimeout(function() {
                        poll(_elem, callback);
                    }, 1);
                }
            }

        },
        //图片加载
        loadImage:function(src,fn){
            var img=new Image();
            img.src=src;
            if(img.complete || img.width){
                console.log("图片已加载完成complete："+src);
                //(fn||function(){})();
                fn && fn.call(img,src,true);
            }else{
                $lq.ons(img,{
                    "load":function(){
                        console.log("图片已加载完成load："+src);
                        //(fn||function(){})();
                        fn && fn.call(img,src,true);
                    },
                    "error":function(){
                        console.log("图片已加载失败error："+src);
                        fn && fn.call(img,src,false);
                    }
                });
            }

        }
        //flash加载
       /* ,loadFlash:function(){
            function $(id){
                return document.getElementById(id)
            }
            var isIE = navigator.appVersion.indexOf("MSIE") != -1 ? true: false;
            // 监听flash是否加载成功
            function listenMovie(flash){
                try{
                    return Math.floor(flash.PercentLoaded()) == 100 ;
                }catch(e){
                    return false;
                }
            }
            // 获取FLASH对象
            function thisMovie(movieName) {
                if (isIE) {
                    return window[movieName];
                }
                else {
                    return document[movieName];
                }
            }
            // 创建flash
            function createFlash(id,url){
                var html = '<object id="flash" height="200" width="200" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">'+
                    '<PARAM NAME="FlashVars" VALUE="">'+
                    '<PARAM NAME="Movie" VALUE="'+url+'">'+
                    '<PARAM NAME="WMode" VALUE="Transparent">'+
                    '<PARAM NAME="Quality" VALUE="High">'+
                    '<PARAM NAME="AllowScriptAccess" VALUE="always">'+
                    '<embed type="application/x-shockwave-flash" src="'+url+'" id="flashFF" name="flashFF" wmode="window" quality="high" width="200" height="200"></embed>'+
                    '</object>';
                $(id).innerHTML = html;
            }

            window.onload = function(){
                createFlash('swfWrap','flips2.swf')
                var flashObj = isIE ? thisMovie("flash") : thisMovie("flashFF");
                var intervalID =  setInterval(function(){
                    if (listenMovie(flashObj)) {
                        clearInterval(intervalID);
                        intervalID = null;
                        $('load').innerHTML = 'flash加载完毕';
                    }
                },60)
            }
        }*/
    });
})($lq);

//帧动画
//{el,con,setting}
/*
* con : value || { value:number, type:tweentype}//例如：{top:20px,left:50px}--->{top:{value:20px,type:tweentype},left{value:20px,type:tweentype}}
* setting:{type:frame, callback:function, callin:function , duration:number, tweenType:tweentype}
* */
(function(){
    function frame(el,con,setting){
        this.obj=el;
        this.init(con,setting);
    }
    frame.prototype={
        constructor:frame,
        init:function(con,setting){
            /*待添加新功能，数组批量先后执行动画，模拟css3中animation*/
            this.timer=null;
            this.setting={
                duration:300,
                type:"easeOut"
            };
            this.con={};//运动配置// left:{type:"buffer",value:0}//属性运动配置格式
            this.b={};//样式初始值
            this.c={};//样式差值
            this.adaptor(con,setting);
            this.bundle();
            this.group.isGrouped?this.groupRun():this.run();
        },
        bundle:function(){
            this.setting.before &&$lq.on(this.obj,"frameBegin",this.setting.before);
            this.setting.ing &&$lq.on(this.obj,"frameIng",this.setting.ing);
            this.setting.end &&$lq.on(this.obj,"frameEnd",this.setting.end);
        },
        remove:function(){
            this.setting.before&&$lq.off(this.obj,"frameBegin",this.setting.before);
            this.setting.ing&&$lq.off(this.obj,"frameIng",this.setting.ing);
            this.setting.end&&$lq.off(this.obj,"frameEnd",this.setting.end);
        },
        adaptor:function(con,setting){
            var that=this;
            if(setting){
                $lq.extend(this.setting,setting);
                setting.before && (this.setting.before=function(e){setting.before.call(that,e,this)});
                setting.ing && (this.setting.ing=function(e){setting.ing.call(that,e,this)});
                setting.end && (this.setting.end=function(e){setting.end.call(that,e,this)});
            }
            this.setting.type=this.compatType(this.setting.type);
            this.setCon(con);
            this.setChangeValue();
        },
        compatType:function(type){
            /*tristion 运动类型
             *    ease：（逐渐变慢）默认值  linear：（匀速） ease-in：(加速) ease-out：（减速） ease-in-out：（先加速后减速）
             cubic-bezier 贝塞尔曲线（ x1, y1, x2, y2 ） http://matthewlein.com/ceaser/
             * */
            var trisition={
                ease:"linear",
                "ease-in":"easeIn",
                "ease-out":"easeOut",
                "ease-in-out":"easeBoth",
                "cubic-bezier":"easeOut"
            };
            return trisition[type]?trisition[type]:type;
        },
        setCon:function(con){
            var con=$lq.parseAnimation(con,this.setting);
            this.config=con.config,this.group=con.group;
            delete con.config,delete con.group;
            this.con=con;
            console.log(this.con,this.config,this.group);
        },
        countDuration:function(duration){
            return Math.ceil(duration/16.7);
        },
        setChangeValue:function(){
            this.t=0;
            //相当于1秒60帧；
            this.d=this.countDuration(this.config.maxDuration);
            for(var i  in this.con){
                this.con[i].type=this.compatType(this.con[i].type);
                this.con[i].d=this.countDuration(this.con[i].duration);
                if(i=="transform"){
                    var transform=this.con[i].value;
                    this.b[i]= this.b[i] || {};
                    this.c[i]= this.c[i] ||{};
                    for(var j in transform){
                        this.b[i][j]=this.b[i][j] || {};
                        this.c[i][j]=this.c[i][j] || {};
                        transform[j][j+"X"]!=undefined &&(this.b[i][j][j+"X"]=$lq.transform(this.obj,j+"X"),this.c[i][j][j+"X"]=transform[j][j+"X"]-this.b[i][j][j+"X"]);
                        transform[j][j+"Y"]!=undefined &&(this.b[i][j][j+"Y"]=$lq.transform(this.obj,j+"Y"),this.c[i][j][j+"Y"]=transform[j][j+"Y"]-this.b[i][j][j+"Y"]);
                        transform[j][j+"Z"]!=undefined &&(this.b[i][j][j+"Z"]=$lq.transform(this.obj,j+"Z"),this.c[i][j][j+"Z"]=transform[j][j+"Z"]-this.b[i][j][j+"Z"]);
                    }
                    console.log(this.b,this.c);
                }else{
                    this.b[i]=$lq.getStyle(this.obj,i);
                    this.c[i]=this.con[i].value-this.b[i];
                }
                console.log(this.con[i]);
            }
        },
        groupRun:function(){
            if(this.group.delay){
                var delay=this.group.delay,that=this,elapsedTime=0;
                console.log(">>>>>>>>>>",this.group.elapsed,this.group)
                for (var i in delay){
                    delay[i].d=this.countDuration(delay[i].maxDuration);
                    parseInt(i)==0?this.run(delay[0]): setTimeout(function(delayTime){
                        var time=delayTime;
                        return function(){
                            that.run(delay[time]);
                        }
                    }(i),parseInt(i));
                }
                //this.d=duration;
            }
        },
        run:function(group){
            this.setting.before&&$lq.trigger(this.obj,"frameBefore");
            var that=this,group=  group || this;
            console.log("<<<<<",group);
            cancelAnimationFrame(group.timer);
            group.t=0;
            function move(){
                if(group.t >= group.d){
                    console.log(group.t);
                    console.log("结束",group,"用时",group.t,group==that ||group==that.group.delay[that.group.elapsed.delay.delayTime]);
                    cancelAnimationFrame(group.timer);
                    if(group==that || group==that.group.delay[that.group.elapsed.delay.delayTime]){
                        console.log("完全结束");
                        that.setting.end&&$lq.trigger(that.obj,"frameEnd");
                        that.remove();
                    }
                } else {
                    group.t++;
                    for(var s in group.con){
                        if(group.t<=that.con[s].d){
                            that.moveTo(s,group.t);
                        }else{
                            console.log(s+"结束动画，已用帧数为："+that.con[s].d+" 未用用时间为："+that.t);
                        }
                    }
                    group.timer = requestAnimationFrame(move);
                }
            };
            group.timer = requestAnimationFrame(move);
        },
        moveTo:function(s,t){
            var val,that=this;
            that.setting.ing && $lq.trigger(that.obj,"frameIng");
            if( s=="transform"){
                val={};
                for(var  i in that.c[s]){
                    val[i]={};
                    var b=that.b[s][i],c=that.c[s][i];
                    c[i+"X"]!=undefined &&(  val[i][i+"X"]=$lq.Tween[that.con[s].type](t,b[i+"X"],c[i+"X"],that.con[s].d));
                    c[i+"Y"]!=undefined &&(  val[i][i+"Y"]=$lq.Tween[that.con[s].type](t,b[i+"Y"],c[i+"Y"],that.con[s].d));
                    c[i+"Z"]!=undefined &&(  val[i][i+"Z"]=$lq.Tween[that.con[s].type](t,b[i+"Z"],c[i+"Z"],that.con[s].d));
                }

                $lq.transform(that.obj,val,true);
            }else{
                val = $lq.Tween[that.con[s].type](t,that.b[s],that.c[s],that.con[s].d);
                $lq.setStyle(that.obj,s,val);
            }
        }
    }
    $lq.animationFrame=frame;
})();
/*
 *客户端检测
 * */
(function () {
    $lq.userAgent=navigator.userAgent;
    $lq.extend($lq,{
        //简单检测
        client:{
            simple:function(){
                var ua =$lq.userAgent.toLowerCase();
                var isMobile = /Mobile/i.test(ua);
                var browser,b={name:"",ver:"", mobile:isMobile};
                (browser = ua.match(/msie ([\d.]+)/)) ? (b.name="ie")&& (b.ver = browser[1]) :
                    (browser = ua.match(/firefox\/([\d.]+)/)) ? (b.name="firefox") && (b.ver = browser[1]) :
                        (browser = ua.match(/chrome\/([\d.]+)/)) ?  (b.name="chrome")&& (b.ver = browser[1]) :
                            (browser = ua.match(/opera\/.*version\/([\d.]+)/)) ?  (b.name="opera")&& (b.ver = browser[1]):
                                (browser = ua.match(/version\/([\d.]+).*safari/)) ? ( b.name="safari") && (b.ver = browser[1]) : 0;
                if (/webkit/.test(ua)){
                    b.engine="webkit";
                    b.eVer=ua.match(/webkit\/([\d.]+)/)[1];
                }
                return b;
            }(),
            //完全检测
            detail:function(){

                //rendering engines
                var engine = {
                    ie: 0,
                    gecko: 0,
                    webkit: 0,
                    khtml: 0,
                    opera: 0,

                    //complete version
                    ver: null
                };

                //browsers
                var browser = {

                    //browsers
                    ie: 0,
                    firefox: 0,
                    safari: 0,
                    konq: 0,
                    opera: 0,
                    chrome: 0,

                    //specific version
                    ver: null
                };


                //platform/device/OS
                var system = {
                    win: false,
                    mac: false,
                    x11: false,

                    //mobile devices
                    iphone: false,
                    ipod: false,
                    ipad: false,
                    ios: false,
                    android: false,
                    nokiaN: false,
                    winMobile: false,

                    //game systems
                    wii: false,
                    ps: false
                };

                //detect rendering engines/browsers
                var ua = $lq.userAgent;
                if (window.opera){
                    engine.ver = browser.ver = window.opera.version();
                    engine.opera = browser.opera = parseFloat(engine.ver);
                } else if (/AppleWebKit\/(\S+)/.test(ua)){
                    engine.ver = RegExp["$1"];
                    engine.webkit = parseFloat(engine.ver);

                    //figure out if it's Chrome or Safari
                    if (/Chrome\/(\S+)/.test(ua)){
                        browser.ver = RegExp["$1"];
                        browser.chrome = parseFloat(browser.ver);
                    } else if (/Version\/(\S+)/.test(ua)){
                        browser.ver = RegExp["$1"];
                        browser.safari = parseFloat(browser.ver);
                    } else {
                        //approximate version
                        var safariVersion = 1;
                        if (engine.webkit < 100){
                            safariVersion = 1;
                        } else if (engine.webkit < 312){
                            safariVersion = 1.2;
                        } else if (engine.webkit < 412){
                            safariVersion = 1.3;
                        } else {
                            safariVersion = 2;
                        }

                        browser.safari = browser.ver = safariVersion;
                    }
                } else if (/KHTML\/(\S+)/.test(ua) || /Konqueror\/([^;]+)/.test(ua)){
                    engine.ver = browser.ver = RegExp["$1"];
                    engine.khtml = browser.konq = parseFloat(engine.ver);
                } else if (/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)){
                    engine.ver = RegExp["$1"];
                    engine.gecko = parseFloat(engine.ver);

                    //determine if it's Firefox
                    if (/Firefox\/(\S+)/.test(ua)){
                        browser.ver = RegExp["$1"];
                        browser.firefox = parseFloat(browser.ver);
                    }
                } else if (/MSIE ([^;]+)/.test(ua)){
                    engine.ver = browser.ver = RegExp["$1"];
                    engine.ie = browser.ie = parseFloat(engine.ver);
                }

                //detect browsers
                browser.ie = engine.ie;
                browser.opera = engine.opera;


                //detect platform
                var p = navigator.platform;
                system.win = p.indexOf("Win") == 0;
                system.mac = p.indexOf("Mac") == 0;
                system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);

                //detect windows operating systems
                if (system.win){
                    if (/Win(?:dows )?([^do]{2})\s?(\d+\.\d+)?/.test(ua)){
                        if (RegExp["$1"] == "NT"){
                            switch(RegExp["$2"]){
                                case "5.0":
                                    system.win = "2000";
                                    break;
                                case "5.1":
                                    system.win = "XP";
                                    break;
                                case "6.0":
                                    system.win = "Vista";
                                    break;
                                case "6.1":
                                    system.win = "7";
                                    break;
                                default:
                                    system.win = "NT";
                                    break;
                            }
                        } else if (RegExp["$1"] == "9x"){
                            system.win = "ME";
                        } else {
                            system.win = RegExp["$1"];
                        }
                    }
                }

                //mobile devices
                system.iphone = ua.indexOf("iPhone") > -1;
                system.ipod = ua.indexOf("iPod") > -1;
                system.ipad = ua.indexOf("iPad") > -1;
                system.nokiaN = ua.indexOf("NokiaN") > -1;

                //windows mobile
                if (system.win == "CE"){
                    system.winMobile = system.win;
                } else if (system.win == "Ph"){
                    if(/Windows Phone OS (\d+.\d+)/.test(ua)){;
                        system.win = "Phone";
                        system.winMobile = parseFloat(RegExp["$1"]);
                    }
                }


                //determine iOS version
                if (system.mac && ua.indexOf("Mobile") > -1){
                    if (/CPU (?:iPhone )?OS (\d+_\d+)/.test(ua)){
                        system.ios = parseFloat(RegExp.$1.replace("_", "."));
                    } else {
                        system.ios = 2;  //can't really detect - so guess
                    }
                }

                //determine Android version
                if (/Android (\d+\.\d+)/.test(ua)){
                    system.android = parseFloat(RegExp.$1);
                }

                //gaming systems
                system.wii = ua.indexOf("Wii") > -1;
                system.ps = /playstation/i.test(ua);

                //return it
                return {
                    engine:     engine,
                    browser:    browser,
                    system:     system
                };

            }()
        },
        //样式检查
        styleInfo:$lq.hasOwnStyles(["transition","transform","animation","transform-style"]),
        //当前使浏览器使用的引擎信息
        getEngine:function(){
            var engine=$lq.client.detail.engine;
            for(var i in engine){
                if(parseInt(engine[i]) >0){
                    return {
                        name:i,
                        ver:engine[i],
                        version:engine.ver
                    }
                }
            }
        },
        //当前浏览器版本信息
        getBrowser:function(){
            var browser=$lq.client.detail.browser;
            for(var i in browser){
                if(parseInt(browser[i]) >0){
                    return {
                        name:i,
                        ver:browser[i],
                        version:browser.ver
                    }
                }
            }
        },
        //当前用户使用的电脑系统
        getSystem:function(){
            var system=$lq.client.detail.system;
            //platform/device/OS
            var s={};
            for(var i in system){
                if(system[i]){
                    s[i]=system[i]
                }
            }
            return s;
        },
        getMobile:function(){
            //mobile devices
            var mobile=["iphone","ipod","ipad","ios","android","nokiaN","winMobile"];
            var sys=$lq.getSystem();
            for(var i=0;i<mobile.length;i++){
                if(sys[mobile[i]] && $lq.client.simple.mobile){
                    return sys;
                }
            }
            return false;
        },
        isMobile:function(){
          return "ontouchstart" in window || $lq.getMobile();
        }
    });
})();
/*
* 设备兼容模块
* */
(function(){
    var isMobile = $lq.isMobile();
    $lq.isMobile();
    $lq.extend($lq,{
        adaptor:{
            isMobile:isMobile,
            touchstart:isMobile?"touchstart":"mousedown",
            touchmove:isMobile?"touchmove":"mousemove",
            touchend:isMobile?"touchend":"mouseup"
        }
    })
})();

/*
* ------------------组件控件区
* */
(function(){
    //元素大小变化
    var resize=function(el,fn){
        this.init(el,fn);
    };
    resize.prototype={
        constructor:resize,
        init:function(el,fn){
            this.element=$lq(el);
            this.pre={
                x:this.element[0].offsetWidth,
                h:this.element[0].offsetWidth
            }
            this.resize=function(){
                fn.call(this);
            }
            this.element.on("changesize",this.resize);
        },
        remove:function(){
          this.off("changesize",this.resize);
        },
        compare:function(data){
            console.log(data)
            var unX=true,unY=true;
            if(data["x"]!=undefined && this.pre.x!=data.x ){
                unX=false;
                this.pre.x=data.x;
            }
            if(data["y"]!=undefined && this.pre.y!=data.y ){
                unY=false;
                this.pre.y=data.y;
            };

            if(unX && unY){
                this.element.trigger("changesize");
            };
        }

    };
    //有效点击
    var tap=function(el,fn,setting){
        this.setting={
            position:"all",
            scope:2
        };
        this.init(el,fn,setting);
    };
    tap.prototype={
        constructor:tap,
        init:function(el,fn,setting){
            this.setTapper(el);
            this.setSetting(setting);
            this.setEventFn(fn);
            this.run();
        },
        setTapper:function(el){
            this.tapper=$lq(el);
        },
        setSetting:function(setting){
            if(setting){
                $lq.extend(this.setting,setting);
            }
        },
        setEventFn:function(fn){
            var that=this,scope=this.setting.scope;
            this.downFn=function(e){
                var e=$lq.compatEvent(e),touch=$lq.getTouch(e)[0];
                that.pre={x: touch.pageX,y: touch.pageY};
            };
            this.upFn=function(e){
                var e=$lq.compatEvent(e),touch=$lq.getTouch(e)[0],isTap=false;
                that.now={x: touch.pageX,y: touch.pageY};
                if(that.pre==undefined){return false;}
                switch(that.setting.position){
                    case "x":
                        isTap=Math.abs(that.now.x-that.pre.x)<=scope;
                        break;
                    case "y":
                        isTap=Math.abs(that.now.y-that.pre.y)<=scope;
                        break;
                    default:
                        isTap=Math.abs(that.now.x-that.pre.x)<=scope && Math.abs(that.now.y-that.pre.y)<=scope;
                        break;

                }
                if(isTap){
                    fn.call(this,e,that);
                }
            };
        },
        remove:function(){
            this.tapper.off("up",this.upFn);
            this.tapper.off("down",this.downFn);
        },
        run:function(){
            this.tapper.ons({
                up:this.upFn,
                down:this.downFn
            });
        }

    }
    //------------------控制
    var controller=function(contentUL,controlUL,moveType,setting){
        this.setting={
            active:0,
            type:"top",
            loop:false,
            lonely:false,
            before:undefined,
            ing:undefined,
            end:undefined
        };
        this.activeIndex=0;
        this.previousIndex=0;
        this.activeType=0;
        this.moving=false;
        this.moveType={};
        this.length=0;
        this.init(contentUL,controlUL,moveType,setting);
    };
    controller.prototype={
        constructor:controller,
        init:function(content,control,moveType,setting){
            this.adaptor(content,control,moveType,setting);
            this.bundle();
            this.initIndex();
            //this.moveTo();
        },
        setSetting:function(setting){
            var that=this;
            if(setting){
                $lq.extend(this.setting,setting);
                setting.before && (this.setting.before=function(e){setting.before.call(that,e,this)});
                setting.ing && (this.setting.ing=function(e){setting.ing.call(that,e,this)});
                setting.end && (this.setting.end=function(e){setting.end.call(that,e,this)});
            }
            (this.contentLis.length==1|| this.contentLis.length==0)&& (this.setting.lonely=true);
            this.setLength();
        },
        setLength:function(){
            var controlLen= 0,arrLen=[];
            for(var i=0;i<this.controlLis.length;i++){
                arrLen[i]=this.controlLis[i].length;
            }
            controlLen=Math.max.apply(null,arrLen);
            this.length=this.setting.lonely?controlLen:this.contentLis.length;
        },
        getLength:function(){
            return this.length;
        },
        setControlEls:function(content,control){
            if(!content ||  !control){return false};
            this.content=$lq(content),this.contentLis=$lq(this.content[0].children);var arr=$lq.isArray(control)?control:[control];
            this.control=[];this.controlLis=[];
            for(var i=0;i<arr.length;i++){
                this.control[i]=$lq.isElement(arr[i]) || $lq.isString(arr[i])?$lq(arr[i]):$lq(arr[i].id);
                arr[i].event && this.control[i].ons(arr[i].event);
                this.controlLis[i]=$lq(this.control[i][0].children);
            }
        },
        setMoveType:function(moveType){
            if(!(moveType && $lq.isObject(moveType))){return;}
            $lq.extend(this.moveType,moveType);
            this.activeType=moveType.activeType || this.activeType;
            this.setMoveTypeEl();
            this.switchType(this.activeType);
        },
        setMoveTypeEl:function(){
            if(this.moveType.id){
                this.typer=$lq(this.moveType.id);
                this.moveType.event && this.typer.ons(this.moveType.event);
            }
        },
        switchType:function(type){
            this.activeType=type;
            this.moveType.switchType && this.moveType.switchType.call(this,type);
        },
        adaptor:function(content,control,moveType,setting){
            this.isFirst=true;
            this.setControlEls(content,control);
            this.setMoveType(moveType);
            this.setSetting(setting);
        },
        bundle:function(){
            this.setting.before && $lq.on(this.content[0],"slideBefore",this.setting.before);
            this.setting.ing && $lq.on(this.content[0],"slideIng",this.setting.ing);
            this.setting.end && $lq.on(this.content[0],"slideEnd",this.setting.end);
        },
        remove:function(){
            this.setting.before && $lq.off(this.content[0],"slideBefore",this.setting.before);
            this.setting.ing && $lq.off(this.content[0],"slideIng",this.setting.ing);
            this.setting.end && $lq.off(this.content[0],"slideEnd",this.setting.end);
        },
        initIndex:function(){

            var len=this.getLength();
            if(this.setting.lonely){
                this.content.run(function(el,index){
                    //$lq.attr(el,"index",index);
                    $lq.dataSet(el,"index",index);
                });
                for(var i=0;i<this.controlLis.length;i++){
                    this.controlLis[i].run(function(el,index){
                        $lq.dataSet(el,"index",index);
                    });
                };
            }else{
                this.contentLis.run(function(el,index){
                    //$lq.attr(el,"index",index);
                    $lq.dataSet(el,"index",index);
                });
                for(var i=0;i<this.controlLis.length;i++){
                    for(var j=0;j<len;j++){
                        var el= this.controlLis[i][j];
                        $lq.dataSet(el,"index",j);
                    }
                };
            };
            this.previousIndex=this.activeIndex=this.setting.active;
        },
        rangeIndex:function(index){
            //var len=this.contentLis.length;
            var len=this.getLength();
            var num=this.activeIndex;
            if(index !=undefined ){
                num=index;
                if(num>len-1){
                    num=this.setting.loop?0:len-1;
                }else if (num<0){
                    num=this.setting.loop?len-1:0
                }
            }
            return num;
        },
        setIndex:function(index){
            var index=this.rangeIndex(index);
            this.previousIndex=this.activeIndex;
            this.activeIndex=index;
        },
        getMoving:function(){
            return this.moving;
        },
        setMoving:function(value){
            this.moving=value;
        },
        moveTo:function(index,refresh){
            var refresh= refresh || false;
            var index =index !=undefined ?index: this.activeIndex;
            if(this.getMoving()){console.log("动画执行中。。。");return false;};
            this.setting.before && $lq.trigger(this.content[0],"slideBefore");
            this.setIndex(index);
            this.setting.ing && $lq.trigger(this.content[0],"slideIng");
            //this.isFirst!=false&&(   this.isFirst==undefined ? this.isFirst=true:this.isFirst=false);
            this.run(refresh);
            //this.setting.end && $lq.trigger(this,"slideEnd");
            //$lq.animate(this.content[0],{translateY:-height*this.activeIndex},{type:"easeOut",duration:100});
            //this.content.setStyle("top",-height*this.activeIndex);
        },
        run:function(refresh){
            var refresh= refresh || false;
            var pre=this.previousIndex,act=this.activeIndex;
            if(pre!=act || this.isFirst || refresh){
                pre==act && (this.content.setStyle("transition","null"),console.log("transition null"), this.setMoving(false));
                this.moveType.move[this.activeType]&&this.moveType.move[this.activeType].call(this,this.activeType);
                this.isFirst=false;
            }else{
                this.setMoving(false);
            }
        },
        isSame:function(){
            return this.activeIndex==this.previousIndex;
        }
    };
    //------------------拖拽
    function drag(el,setting){
        this.setting={
            root:$lq.is$$(el)?el[0].offsetParent:el.offsetParent,//设定相对的父元素用于确定范围,//注意当el样式display为none时,offsetParent为none
            reference:document,//移动时鼠标参照坐标。
            clicker:el,//能够拖拽的有效部位
            transform:$lq.styleInfo.transform,//使用translate还是offset
            position:"all",//控制拖拽方向
            otherOffset:{x:0,y:0},
            scope:undefined,//设置拖动范围,
            overflow:true,//是否允许拖拽溢出范围。
            shake:true,//触碰到边界时是否抖动
            slide:true,//拖动时，是否有滑动效果
            overfull:true,//true当全部显示内容后，继续在范围内拖拽，false显示全部内容后就停止拖拽
            before:undefined,
            ing:undefined,
            end:undefined
        };
        this.timer=null;
        this.speed={x:0,y:0};
        this.init(el,setting);
    }
    drag.prototype={
        constructor:drag,
        init:function(el,setting){
            this.adaptor(el,setting);
            this.bundle();
            this.run();
        },
        adaptor:function(el,setting){
            this.setEl(el);
            this.setSetting(setting);
        },
        setEl:function(el){
            this.drager=$lq(el);
        },
        setSetting:function(setting){
            var that=this;
            if(setting){
                $lq.extend(this.setting,setting);
                setting.before && (this.setting.before=function(e){setting.before.call(that,e,this)});
                setting.ing && (this.setting.ing=function(e){setting.ing.call(that,e,this)});
                setting.end && (this.setting.end=function(e){setting.end.call(that,e,this)});
            }
            this.setRelation();
            console.log("reference-----------------",this.reference,this.reference==document );
            this.setting.transform?(this.now=this.transform):(this.setOtherOffset(),this.now=this.offset);
            this.start=this.now();
            this.setStartAt();
            this.setFollow();
            this.setTotal();
            this.setScope();
        },
        update:function(){
            //当元素添加，删减了子元素时，要更新
            this.setTotal();
            this.setScope();
        },
        bundle:function(){
            this.setting.before && $lq.on(this.drager[0],"dragBefore",this.setting.before);
            this.setting.ing && $lq.on(this.drager[0],"dragIng",this.setting.ing);
            this.setting.end && $lq.on(this.drager[0],"dragEnd",this.setting.end);
        },
        remove:function(){
            this.setting.before && $lq.off(this.drager[0],"dragBefore",this.setting.before);
            this.setting.ing && $lq.off(this.drager[0],"dragIng",this.setting.ing);
            this.setting.end && $lq.off(this.drager[0],"dragEnd",this.setting.end);
        },
        setStartAt:function(){
            var obj=this.drager[0],root=this.root,x= 0,y=0;
            this.startAt={x:0,y:0};
            if(root !=obj.offsetParent){
                if(root==$lq.htmlElement || root==document.body || root==window){
                    x=$lq.getClientRect(obj).clientX-this.start.x;
                    y=$lq.getClientRect(obj).clientY-this.start.y;
                }else{
                    x=$lq.getPos(obj,root).left-this.start.x;
                    y=$lq.getPos(obj).top-this.start.y;
                }
            }else{
                x=obj.offsetLeft-this.start.x;
                y=obj.offsetTop-this.start.y;
            }
            this.startAt.x=x;
            this.startAt.y=y;
        },
        setOtherOffset:function(){
            var obj=this.drager[0];
            this.otherOffset={};
            this.otherOffset.x= this.setting.otherOffset.x || parseInt($lq.getStyle(obj,"margin-left")) || 0;
            this.otherOffset.y= this.setting.otherOffset.y || parseInt($lq.getStyle(obj,"margin-top")) || 0;
        },
        getOtherOffset:function(){
            return this.otherOffset;
        },
        setRelation:function(){
            this.root=this.setting.root;
            var reference=this.setting.reference;
            this.reference=$lq.is$$(reference)?reference[0]:reference;
            this.clicker=$lq(this.setting.clicker);
        },
        setTotal:function(){
            var obj=this.drager[0],root=this.root;
            this.total={x:0,y:0};
            this.total.x=$lq.getStyle(root,"offsetWidth")-$lq.getStyle(obj,"offsetWidth");
            this.total.y=$lq.getStyle(root,"offsetHeight")-$lq.getStyle(obj,"offsetHeight");
            if(!this.setting.overfull){
                if(this.total.x>0){
                    //说明x范围内已经全部显示
                    this.total.x=0
                }
                if(this.total.y>0){
                    //说明y范围内已经全部显示
                    this.total.y=0
                }
            }
        },
        getTotal:function(){
            return {
                x:this.total.x,
                y:this.total.y
            }
        },
        atBorder:function(){
            var now=this.now(),scope=this.scope,obj=this.drager,b={};
            b.maxX=now.x==scope.x.maxX?true:false;
            b.minX=now.x==scope.x.minX?true:false;
            b.maxY=now.y==scope.y.maxY?true:false;
            b.minY=now.y==scope.y.minY?true:false;
            return b;
        },
        setScope:function(){
            var scope={},obj=this.drager[0],root=this.root,start=this.start,startAt=this.startAt;
            var totalX=this.getTotal().x,totalY=this.getTotal().y;
            if(this.setting.scope!=undefined){
                scope.x=this.setting.scope.x;
                scope.y=this.setting.scope.y;
            }
            if(this.setting.scope==undefined || !scope.x || !scope.y){
                scope.x={minX:0,maxX:0},scope.y={minY:0,maxY:0};
                scope.x.minX=totalX>0?(-startAt.x):(totalX-startAt.x);
                scope.x.maxX=totalX>0?(totalX-startAt.x):(start.x);
                scope.y.minY=totalY>0?(-startAt.y):(totalY-startAt.y);
                scope.y.maxY=totalY>0?(totalY-startAt.y):(start.y);

                console.log("scop",scope,obj.offsetTop,start.y,totalY)
            }

            this.scope=scope;
        },
        setFollow:function(){
            var obj=this.drager[0];
            switch(this.setting.position){
                case "x":
                    /*        if(this.setting.transform){
                     this.follow=function(nowX,nowY){$lq.transform(obj,{translate:{translateX:nowX}},true);};
                     this.getFollow=function(){return {x:$lq.transform(obj,"translateX")};}
                     }else{
                     this.follow=function(nowX,nowY){$lq.setStyle(obj,"left",nowX);};
                     this.getFollow=function(){return {x:this.start().x};};
                     };*/
                    this.follow=this.setting.transform?function(nowX,nowY){
                        $lq.transform(obj,{translate:{translateX:nowX}},true);
                    }:function(nowX,nowY){
                        $lq.setStyle(obj,"left",nowX);
                    };
                    break;
                case "y":
                    /*        if(this.setting.transform){
                     this.follow=function(nowX,nowY){$lq.transform(obj,{translate:{translateY:nowY}},true);};
                     this.getFollow=function(){return {y:$lq.transform(obj,"translateY")};}
                     }else{
                     this.follow=function(nowX,nowY){$lq.setStyle(obj,"top",nowY);};
                     this.getFollow=function(){return {y:this.start().y};};
                     };*/

                    this.follow=this.setting.transform?function(nowX,nowY){
                        $lq.transform(obj,{translate:{translateY:nowY}},true);
                    }:function(nowX,nowY){
                        $lq.setStyle(obj,"top",nowY);
                    };
                    break;
                default:
                    /*             if(this.setting.transform){
                     this.follow=function(nowX,nowY){$lq.transform(obj,{translate:{translateX:nowX,translateY:nowY}},true);};
                     this.getFollow=function(){
                     var pos=$lq.transform(obj,"translate");
                     return {x:pos.translateX,y:pos.translateY};
                     }
                     }else{
                     this.follow=function(nowX,nowY){ $lq.setStyles(obj,{"left":nowX,"top":nowY});};
                     this.getFollow=function(){return this.start();};
                     };*/

                    this.follow=this.setting.transform?function(nowX,nowY){
                        $lq.transform(obj,{translate:{translateX:nowX,translateY:nowY}},true);
                    }:function(nowX,nowY){
                        $lq.setStyles(obj,{"left":nowX,"top":nowY});
                    };
                    break;
            }

        },
        transform:function(){
            var obj=this.drager[0];
            return {x:$lq.transform(obj,"translateX"),y:$lq.transform(obj,"translateY")}
        },
        offset:function(){
            var obj=this.drager[0],offsetX=obj.offsetLeft,offsetY=obj.offsetTop,root=this.root,otherX=this.getOtherOffset().x,otherY=this.getOtherOffset().y;
            //offset值是，定位偏移量以及margin等其他的偏移量总和，简而言之就是元素最终在视图上相对定位父盒子的最终偏移位置。
            if(root !=obj.offsetParent){
                /*  if(root==$lq.htmlElement || root==document.body || root==window){
                 offsetX=$lq.getClientRect(obj).clientX-$lq.getClientRect(obj.offsetParent).clientX;
                 offsetY=$lq.getClientRect(obj).clientY-$lq.getClientRect(obj.offsetParent).clientY;
                 console.log(offsetX,offsetY)
                 }else{
                 offsetX=$lq.getPos(obj,root).left-$lq.getPos(obj.offsetParent,root).left;
                 offsetY=$lq.getPos(obj,root).top-$lq.getPos(obj.offsetParent,root).top;
                 }*/
            }
            var positionX=offsetX-otherX,positionY=offsetY-otherY;
            var marginL=$lq.getStyle(obj,"margin-left");
            return{x:positionX,y:positionY}
        },
        range:function(nowX,nowY){
            var pos={},now={x:nowX,y:nowY},scope=this.scope,maxX=this.scope.x.maxX,minX=this.scope.x.minX,maxY=this.scope.y.maxY,minY=this.scope.y.minY,over=this.setting.overflow;
            pos.x=nowX,pos.y=nowY;
            for(var i in pos){
                var max=scope[i]["max"+ i.toUpperCase()];
                var min=scope[i]["min"+ i.toUpperCase()];
                if(now[i]>=max){// 到达最远（尾W，底H）部
                    pos[i]=over?(now[i]-max)/5+max:max;
                }else if(now[i]<=min){//到达最近（头W，顶H）部
                    pos[i]=over?(now[i]-min)/5+min:min;
                }
            }
            /*         if(nowX>=maxX){// 到达最远（尾W，底H）部
             pos.x=over?(nowX-maxX)/5+maxX:maxX;
             }else if(nowX<=minX){//到达最近（头W，顶H）部
             pos.x=over?(nowX-minX)/5+minX:minX;
             }
             if(nowY>=maxY){
             pos.y=over?(nowY-maxY)/5+maxY:maxY;
             }else if(nowY<=minY){
             pos.y=over?(nowY-minY)/5+minY:minY;
             }*/
            return pos;
        },
        /*       rangeOut:function(nowX,nowY){
         var pos={},maxX=this.scope.x.maxX,minX=this.scope.x.minX,maxY=this.scope.y.maxY,minY=this.scope.y.minY;
         pos.x=nowX,pos.y=nowY;
         if(nowY>=minY){//到达头部
         pos.y=minY;
         }else if(nowY<=maxY){//到达底部
         pos.y=maxY;
         }else{

         }

         return pos;
         },*/
        run:function(){
            var drag=this,downTime= 0,upTime= 0,obj=this.drager[0],root=this.root;
            this.clicker.on("down",function(e){
                drag.setting.before && drag.drager.trigger("dragBefore",drag.setting.before);//拖动（滑动）开始/鼠标（手指）按下时事件
                cancelAnimationFrame(drag.timer);
                var e=$lq.compatEvent(e),touches=$lq.getTouch(e)[0], x= touches.pageX,y= touches.pageY;
                downTime=Date.now();
                var now=drag.now(),startX= now.x,startY= now.y,that=this,pre={x:x,y:y},setting=drag.setting,firstTouch=true;
                drag.moving=false;
                function move(e){
                    var e=$lq.compatEvent(e),touches= $lq.getTouch(e)[0],ingX= touches.pageX,ingY= touches.pageY;
                    if(pre.x==ingX && pre.y==ingY){
                        //防止移动端因接触面大而引起的touchmove误触情况（安卓）。
                        return false;
                    }
                    drag.moving=true;
                    setting.slide? (drag.speed.x=ingX-pre.x,drag.speed.y=ingY-pre.y):(drag.speed.x=1,drag.speed.y=1);
                    var disX=ingX- x,disY=ingY- y,nowX=startX+disX,nowY=startY+disY;
                    pre.x=ingX,pre.y=ingY;//记录最后一次移动的大小。
                    //console.log("x:",drag.speed.x,"y:",drag.speed.y);
                    if(firstTouch){
                        if(setting.position=="x" && Math.abs(drag.speed.x)<Math.abs(drag.speed.y)){
                            //单方向X拖拽，并且此时Y轴方向上拖拽大于X方向，说明用户是误触了X方向，实际是想移动Y方向
                            console.log("误触X");
                            return false;
                        }else if(setting.position=="y" && Math.abs(drag.speed.y)<Math.abs(drag.speed.x)){
                            //单方向Y拖拽，并且此时X轴方向上拖拽大于Y方向，说明用户是误触了Y方向，实际是想移动X方向
                            console.log("误触Y");
                            return false;
                        }
                        firstTouch=false;
                    }
                    var range=drag.range(nowX,nowY);
                    drag.follow(range.x,range.y);
                    setting.ing && drag.drager.trigger("dragIng",setting.ing);//拖动（滑动）中事件
                    window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();   // 防止拖动滑块的时候， 选中文字
                    e.stopPropagation();//防止防止父框中有移动事件甚至也有拖拽操作。
                }
                $lq.on(drag.reference,"move",move);
                $lq.one(drag.reference,"up",function(e){
                    if(!drag.moving){
                        //moving为true，说明 speed 是本次的缓冲速度，反之就是上一次的值
                        /*只进行点击和抬起操作时，当时间间隔过长，就清除上一次的 speed值，不再执行上一次的缓冲滚动*/
                        Date.now()-downTime>500 &&(  drag.speed.x=1,drag.speed.y=1);
                        console.log("停止=======过长");
                    }
                    var e=$lq.compatEvent(e);
                    $lq.off(drag.reference,"move",move);
                    function animation(){
                        //drag.slide.call(drag);
                        var speed=drag.speed,now=drag.now(),scope=drag.scope,shake=drag.setting.shake;
                        console.log("speed---",speed,now);
                        //注意1： speed值不能设置为<=1,因为当用户拖的比较慢时，鼠标最后的2个值是为1的，所以此时放手就无法执行缓冲动画。
                        if(Math.abs(speed.x)<1&&Math.abs(speed.y)<1 ){
                            console.log("speed结束！！！",drag.scope.y.maxY,drag.scope.y.minY);
                            drag.setting.end && drag.drager.trigger("dragEnd",drag.setting.end);//拖动（滑动）结束/鼠标（手指）抬起事件
                            cancelAnimationFrame(drag.timer);
                        }else{
                            for(var i in speed){
                                speed[i]*=0.9;
                                var max=scope[i]["max"+ i.toUpperCase()];
                                var min=scope[i]["min"+ i.toUpperCase()];
                                //注意当设置为大于等于或小于等于时，会有在边界抖动效果。该效果与用户拖动出手时的速度有关。当开始进来的速度为1时，就没有抖动效果了，当速度越大，抖动越明显。
                                if(shake?now[i]>max:now[i]>=max){
                                    now[i]=max;
                                }else if(shake? now[i]<min: now[i]<=min){
                                    now[i]=min;
                                }else{
                                    now[i]=parseFloat(now[i])+parseFloat(speed[i]);
                                }
                            };
                            drag.follow(now.x,now.y);
                            setting.ing && drag.drager.trigger("dragIng",setting.ing);//拖动（滑动）中事件
                            drag.timer=requestAnimationFrame(animation);
                        }
                    };
                    drag.timer=requestAnimationFrame(animation);
                    e.stopPropagation();//防止防止父框中有抬起事件甚至也有拖拽操作。
                });
                e.stopPropagation();//防止防止父框中有点击事件甚至也有拖拽操作。
                e.preventDefault();//注意当drager元素中有a标签子元素时，在火狐下点击移动后会引起a元素默认的系统拖拽事件，处理方式1： <a href="javascript:;" ondragstart="return false">方式2就是在父类中取消默认事件，考虑到效率，采用第2种方式。

            });
        }
    };
    $lq.extend($lq,{
        tap:tap,
        resize:resize,
        controller:controller,
        drag:drag
    });
})();
/*
* 层
* */
(function(){
    var layer=function(conf){
        this.obj=null;
        this.con={
            width:200,
            height:300
        }
        this.init(conf);
    }
    layer.prototype={
        constructor:layer,
        init:function(json){
          this.adaptor(json);
          this.createLay();
            this.show();
        },
        adaptor:function(json){
            $lq.extend(this.con,json);
        },
        createLay:function(){
            this.obj=document.createElement("div");
            this.obj.className="";
            this.setData();
            this.obj.innerHTML="<div style='width:129px;height:97px;position:absolute;left:0;top:453px;background:url(images\/paper-bottom.jpg);z-index:1001'></div>";
            //document.body.appendChild(this.obj);
            //document.body.insertBefore(this.obj,document.body.children[2]);
            $lq(".bodyBox").el(0).insertBefore(this.obj,$lq(".bodyBox").el(0).children[2]);
            $lq.setPos(this.obj,{type:{left:this.obj.offsetParent.offsetWidth/2,top:185}});

        },
        setData:function(){
            //this.obj.style.left=0;
            //this.obj.style.top=0;
            this.obj.style.position="relative";
          /*  this.obj.style.width="1px";
            this.obj.style.height="5px";*/
            this.obj.style.width=this.con.width+"px";
            this.obj.style.height=this.con.height+"px";
            this.obj.style.background="url(images/bgList.jpg)";
            //this.obj.style.opacity=0;
            this.obj.style.zIndex=1000;
            this.obj.style.transform="rotateY(120deg)";
        },
        show:function(){
            var that=this;
            console.log($lq.getPos(this.obj).left,(this.con.width/2),$lq.getPos(this.obj).left-this.con.width/2);
            $lq.bind(this.obj,"beforeAni",function(){console.log("开始动画---");});
            $lq.bind(this.obj,"afterAni",function(){console.log("---结束动画");});
          /*  $lq.animate(this.obj,{width:this.con.width,left:(this.obj.offsetLeft-this.con.width/2)},{attrCon:"bounceOut",duration:500,callback:function(){
                $lq.animate(that.obj,{height:that.con.height},{duration:1000,attrCon:"elasticOut"});
            },beforeAni:function(){console.log("开始动画");},afterAni:function(){console.log("结束动画")}});*/

           //this.obj.style.transition=".5s";
           // this.obj.style.transform="rotateY(0deg)";
           // this.obj.style.transform= "translateX("+(-this.obj.offsetParent.offsetWidth/4-30)+"px)";


        }
    }
    //$lq.extend($lq,{layer:layer})
    $lq.layer=layer;
})();
//1屏幕初始化
(function(){
    //全局事件：
    $lq.bind($lq,"load",resize);//打开页面时候初次出发一次；因为当第一次打开页面时候，不会触发resize事件的。
    function focus(){console.log("聚焦窗口："+focus.timer);$lq.fire($lq,{type:"focus"});};
    function blur(){console.log("光标离开窗口："+blur.timer);$lq.fire($lq,{type:"blur"});};
    function resize(e){console.log("执行resize："+resize.timer);$lq.trigger($lq,"resize");};
    function load(){$lq.fire($lq,{type:"load"});};
    function unload(){$lq.fire($lq,{type:"unload"});}
    //当页面所有加载完成后，初始化页面
    $lq.ons(window,{
        load:load,
        unload:unload,
        //focus:$lq.throttle(focus,100),
        //blur:$lq.throttle(blur,100),
        resize:$lq.throttle(resize,100)
    });
    //设备判断

})();




/*字符串*/
/*
itcast.extend(itcast, {
    camelCase : function(str){
        return str.replace(/\-(\w)/g, function(all, letter){
            return letter.toUpperCase();
        });
    },
    trim : function(str){
        return str.replace(/^\s+|\s+$/g, '')
    },
    //去除左边空格
    ltrim:function(str){
        return str.replace(/(^\s*)/g,'');
    },
    //去除右边空格
    rtrim:function(str){
        return str.replace(/(\s*$)/g,'');
    },
    //ajax - 前面我们学习的
    myAjax:function(URL,fn){
        var xhr = createXHR();	//返回了一个对象，这个对象IE6兼容。
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4){
                if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                    fn(xhr.responseText);
                }else{
                    alert("错误的文件！");
                }
            }
        };
        xhr.open("get",URL,true);
        xhr.send();

        //闭包形式，因为这个函数只服务于ajax函数，所以放在里面
        function createXHR() {
            //本函数来自于《JavaScript高级程序设计 第3版》第21章
            if (typeof XMLHttpRequest != "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject != "undefined") {
                if (typeof arguments.callee.activeXString != "string") {
                    var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0",
                            "MSXML2.XMLHttp"
                        ],
                        i, len;

                    for (i = 0, len = versions.length; i < len; i++) {
                        try {
                            new ActiveXObject(versions[i]);
                            arguments.callee.activeXString = versions[i];
                            break;
                        } catch (ex) {
                            //skip
                        }
                    }
                }

                return new ActiveXObject(arguments.callee.activeXString);
            } else {
                throw new Error("No XHR object available.");
            }
        }
    },
    //简单的数据绑定formateString
    formateString:function(str, data){
        return str.replace(/@\((\w+)\)/g, function(match, key){
            return typeof data[key] === "undefined" ? '' : data[key]});
    },
    //将json转换成字符串
    sjson:function (json) {
        return JSON.stringify(json);
    },
    //将字符串转成json
    json:function (str) {
        return eval(str);
    }
});*/
/*数组
itcast.extend(itcast, {

});
 */
/*Math
itcast.extend(itcast, {
    //随机数
    random: function (begin, end) {
        return Math.floor(Math.random() * (end - begin)) + begin;
    },
});
 */