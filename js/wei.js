!(function(w){
    // 在window中创建一个对象用来接收各种方法
    w.wei = {}
    w.wei.css=function (node,type,val){
        // 获取到节点并且为节点初始化transform属性对象作为transform的容器
        if(typeof node ==="object" && typeof node["transform"] ==="undefined" ){
            node["transform"]={};
        }
        
        if(arguments.length>=3){
            //设置，重复设置的属性，后面的会覆盖前面的
            var text ="";
            node["transform"][type] = val;
            // 遍历node["transform"]对象里的保存的所有属性
            for( item in node["transform"]){
                // hasOwnProperty可以找到对象本身自有的属性，防止for in 查找属性时往原型链上查找
                if(node["transform"].hasOwnProperty(item)){
                    switch (item){
                        case "translateX":
                        case "translateY":
                            text +=  item+"("+node["transform"][item]+"px)";
                            break;
                        case "scale":
                            text +=  item+"("+node["transform"][item]+")";
                            break;
                        case "rotate":
                            text +=  item+"("+node["transform"][item]+"deg)";
                            break;
                    }
                }
            }
            // 将写入的属性赋给transform，每次写入的属性都应该被存起来，否则赋值的时候原来的效果会消失
            node.style.transform = node.style.webkitTransform = text;
        }else if(arguments.length==2){
            //读取
            val =node["transform"][type];
            if(typeof val === "undefined"){
                switch (type){
                    case "translateX":
                    case "translateY":
                    case "rotate":
                        val =0;
                        break;
                    case "scale":
                        val =1;
                        break;
                }
            }
            return val;
        }
    }
    w.wei.carousel = function (arr){

        var carouselWrap = document.querySelector('.carousel-wrap')
        // 发现有carouselWrap时才使用这个脚本
        if(carouselWrap){
            // 获取实际的小圆点的数量
            var pointslength = arr.length

            //根据提供的图片创建相应的ul
            var ulNode = document.createElement('ul')

            // 判断是否需要无缝滑屏
            var needCarousel = carouselWrap.getAttribute('needCarousel')
            needCarousel = needCarousel===null?false:true
            if(needCarousel){
                // 如果需要无缝滑屏，则创建2倍的arr,为无缝衔接做准备
                arr = arr.concat(arr)
            }

            ulNode.classList.add('list')
            //创建li
            for(var i=0;i<arr.length;i++){
                ulNode.innerHTML+='<li><a href="javascript:;"><img src='+arr[i]+'></a></li>'
            }
            // 将list的样式表插入head中
            var styleNode = document.createElement('style')
            styleNode.innerHTML='.carousel-wrap>.list>li{width:'+(1/arr.length*100)+'%}.carousel-wrap>.list{width:'+(arr.length*100)+'%}'
            carouselWrap.appendChild(ulNode)
            document.head.appendChild(styleNode)

            // 如果使用圆点
            var pointsWrap = document.querySelector('.carousel-wrap>.points-wrap')
            if(pointsWrap){
                for(var j=0;j<pointslength;j++){
                    // 第一个点默认点亮
                    if(j===0){
                        pointsWrap.innerHTML+='<span class="active"></span>'
                    }else{
                        pointsWrap.innerHTML+='<span></span>'
                    }
                }

            }

            // 设置carouselWrap的高度为img的高度，避免高度塌陷
            var imgNodes = document.querySelector(".carousel-wrap > .list > li > a >img");
            setTimeout(function(){
                carouselWrap.style.height=imgNodes.offsetHeight+"px";
            },100)

            // 滑屏原理：通过获取手指在carouselWrap上移动的距离，将其赋给ul，作为它的移动距离
            // 在carouselWrap里才能触发滑屏
            // 滑屏
            // 1.拿到元素一开始的位置
            // 2.拿到手指一开始点击的位置
            // 3.拿到手指move的实时距离
            // 4.将手指移动的距离加给元素


            //  防抖动
			//  1.判断用户首次滑屏的方向
			//  2.如果是x轴
			//  		以后不管用户怎么滑都会抖动
			//  3.如果是y轴
			//  		以后不管用户怎么滑都不会抖动	


            // 手指初始的位置
            var start = {}
            // 元素初始的位置
            var element = {X:0,Y:0}

            //首次滑屏的方向
            isFirst = false
            isX=false

            carouselWrap.addEventListener('touchstart',function(ev){
                
                ev = ev||event
                // 获取触发事件的手指列表及其坐标
                var touchFinger = ev.changedTouches[0]
                start = touchFinger
                
                // 重置过渡效果
                ulNode.style.transition = 'none'
                
                // 是否需要无缝
                if(needCarousel){
                    index = wei.css(ulNode,'translateX')/document.documentElement.clientWidth
                    if(index===0){
                        // 一点击就将第一张变成第二列的第一张
                        // index为负数
                        index = -pointslength
                    }else if(-index===(arr.length-1)){
                        // 从第二列开始滑动，滑动到第二列最后一张时,立即切换为第一列的最后一张
                        // index为负数
                        index = -(pointslength-1)
                    }
                    wei.css(ulNode,'translateX',index*document.documentElement.clientWidth)
                }

                //元素的偏移量每次都能被css函数记录下来
                element.X = wei.css(ulNode,'translateX')
                // 触屏时清除定时器
                clearInterval(timer)

                isFirst = true
                isX=true

            })
            // 在手指移动事件中移动元素
            carouselWrap.addEventListener('touchmove',function(ev){
                if(!isX){
                    return
                }
                ev = ev||event
                // 在move过程中实时获取手指移动的距离
                var TouchC = ev.changedTouches[0];
                // 事件触发时距离屏幕的位置
                var nowX = TouchC.clientX;
                var nowY= TouchC.clientY;
                // 移动的距离,startX不变，nowX向左变小，向右变大
                var disx = nowX - start.clientX
                var disy = nowY - start.clientY
                if(isFirst){
                    isFirst=false
                    if(Math.abs(disy)>Math.abs(disx)){
                        isX=false
                        return
                    }
                }
                // 移动过程中elementX不变，disx变化
                // ulNode.style.left = elementX + disx + 'px'
                // transform版,将有关left的操作全部换成平移。用translateX来储存ul偏移的距离
                wei.css(ulNode,'translateX',element.X+disx)
            })
            
            // 抬起手指的时候直接判断滑屏的方向，实现自动滑屏
            carouselWrap.addEventListener('touchend',function(ev){
                ev = ev||event
                // 用ul偏移的总长度比上屏幕的宽度可以抽象出每个图片对应的下标
                // 使用round函数可以直接四舍五入(负数的时候-0.51取-1)，帮助直接判断图片是否滑了一半
                // index取值范围（0~-5）
                index = Math.round(wei.css(ulNode,'translateX')/document.documentElement.clientWidth);
                
                // 给ul的left改变添加过渡效果,过渡效果只发生一次，每次滑屏时都要重置
                ulNode.style.transition = '1s'
                wei.css(ulNode,'translateX',index*(document.documentElement.clientWidth))
                pointmove(index)
                if(needAuto){
                    auto();
                }
            }) 

            // 轮播图的index从第一张开始播放，全局的index都可以抽象为ul的偏移量
            var timer = 0
            var index = 0
            var needAuto = carouselWrap.getAttribute('needAuto')
            needAuto = needAuto===null?false:true
            if(needAuto){
                auto()
            }
            function auto(){
                // 防止开启多个定时器
                clearInterval(timer);
                timer=setInterval(function(){
                    // 判断是否播放到尽头
                    if(index == 1-arr.length){
                        // 取消过渡动画，偷偷把最后一张换成第一列最后一张
                        ulNode.style.transition = 'none'
                        index = 1-arr.length/2
                        wei.css(ulNode,'translateX',index*document.documentElement.clientWidth)
                    }
                    // 
                    setTimeout(function(){
                        index--
                        ulNode.style.transition = '1s'
                        pointmove(index)
                        wei.css(ulNode,'translateX',index*document.documentElement.clientWidth)
                    },50)
                },2000)
            }

            // 圆点函数,传入index参数可以捕获到变化后的index
            function pointmove(index){
                var points = document.querySelectorAll('.carousel-wrap>.points-wrap>span')
                for(var i=0;i<points.length;i++){
                    points[i].classList.remove("active");
                }
                points[-index%pointslength].classList.add("active");

            }
       }
    }
    w.wei.vMove = function(wrap,callBack){
        var item = wrap.children[0]

        // 竖向防抖，防止横向变换到竖向影响滚动条
        var start={};
		var element ={};

        var isY =false;
		var isFirst = false;

        // 手指初始的移动距离
        var pointDis = 0;
        var lastPoint = 0;

        // 手指初始的时间,pointTime不能设置为0,否则touchend计算速度的时候会有计算错误
        var pointTime = 1
        var lastTime = 0

        // item能上滑的最远距离
        // 刚开始轮播图还没有渲染出来，所以item.offsetHeight的值会变小，需要在渲染完成后重新获取最远距离
        var minY = wrap.clientHeight - item.offsetHeight

        //即点即停
		var cleartime =0;
		var Tween = {
			Linear: function(t,b,c,d){ return c*t/d + b; },
			back: function(t,b,c,d,s){
	            if (s == undefined) s = 1.70158;
	            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        	}
		}
        
        item.addEventListener('touchstart',function(ev){
            ev = ev||event
            var finger = ev.changedTouches[0]

            // 渲染完成后重新获取最远距离
            minY = wrap.clientHeight - item.offsetHeight

            start = finger
            element.X = wei.css(item,'translateX')
            element.Y = wei.css(item,'translateY')
            item.style.transition = 'none'
            // 一上来就获取初始原点距离
            lastPoint = finger.clientY
            // 一上来就获取初始时间
            var lastTime = new Date().getTime()
            // 每一次点击时都重置move的距离，否则会产生记忆，touchend时会有速度
            pointDis = 0
            item.handMove = false;
			
			
			isY =true;
			isFirst = true;
            //即点即停
			clearInterval(cleartime);

            if(callBack&&typeof callBack["start"] === "function"){
				callBack["start"].call(item);
			}
        })
        
        item.addEventListener('touchmove',function(ev){
            if(!isY){
				return;
			}
            ev = ev||event
            var finger = ev.changedTouches[0]
            var nowY = finger.clientY
            var disY = nowY-start.clientY
            var nowX = finger.clientX
            var disX = nowX-start.clientX
            
            // 手指想让list移动的距离
            var translateY = disY+element.Y

            if(isFirst){
				isFirst = false;
				if(Math.abs(disX)>Math.abs(disY)){
					isY = false;
					return;
				}
			}

            // 每一次移动都获取当前手指的位置
            var nowPoint = finger.clientY
            // 计算出每次手指移动的距离
            pointDis = nowPoint - lastPoint
            // 计算完后将当前手指点变成lastPoint
            lastPoint = nowPoint
            
            // 获取当前滑屏的时间
            var nowTime = new Date().getTime()
            // 计算出最后一次滑屏的时间
            pointTime = nowTime-lastTime
            // 计算完后将当前手指点变成lastPoint
            lastTime = nowTime

            // 如果没有超过，points相关变量就没有用
            if(wei.css(item,'translateY')>0){
                // 超过边界触发橡皮筋效果
                item.handMove= true
                // 缩放比只有分母上的translateY是变化的，适合做缩放系数
                var scale = document.documentElement.clientHeight/((document.documentElement.clientHeight+translateY)*1.5);
                // 获取list的之前的偏移量并加上移动距离得到要偏移的距离
                translateY = wei.css(item,'translateY')+pointDis*scale
            }else if(wei.css(item,'translateY')<minY){
                // 超过边界触发橡皮筋效果
                item.handMove = true
                // 向左滑到尽头时，translateY是负数，越往左滑越小，scale要变小，所以scale的分母要换
                // 用over表示超出最小值的距离，计算出的结果是正数，translateY越小，over越大
                var over = minY-translateY
                var scale = document.documentElement.clientHeight/((document.documentElement.clientHeight+over)*1.5);
                translateY = wei.css(item,'translateY')+pointDis*scale
            }
            wei.css(item,'translateY',translateY)

            if(callBack&&typeof callBack["move"] === "function"){
				callBack["move"].call(item);
			}
        })

        item.addEventListener('touchend',function(ev){
            // 判断是否进入手动橡皮筋效果
            if(!item.handMove){
                ev = ev||event
                var finger = ev.changedTouches[0]
                // 计算出瞬时速度
                var speed = pointDis/pointTime
                // 将速度过滤，太小就不滑动
                speed = Math.abs(speed)<0.5?0:speed
                // 快速滑动的目标距离
                var targetY = wei.css(item,'translateY')+speed*200
                // 快速滑屏的过渡时间，与滚动条过渡时间一致
                var time = Math.abs(speed)*0.2;
				time = time<0.8?0.8:time;
				time = time>2?2:time;
				//快速滑屏的橡皮筋效果
				//var bsr="";
				var type = "Linear";
				if(targetY>0){
					targetY=0;
					type = "back";
					//bsr = "cubic-bezier(.26,1.51,.68,1.54)";
				}else if(targetY<minY){
					targetY = minY;
					type = "back";
					//bsr = "cubic-bezier(.26,1.51,.68,1.54)";
				}
				/*item.style.transition=time+"s "+bsr+" transform";
				damu.css(item,"translateY",targetY);*/
				bsr(type,targetY,time);
            }else{
                var time = 1
                if(wei.css(item,'translateY')>0){
                    item.style.transition = time+'s'
                    wei.css(item,'translateY',0)
                }else if(wei.css(item,'translateY')<minY){
                    item.style.transition = time+'s'
                    wei.css(item,'translateY',minY)
                }
                item.handMove = false
                if(callBack&&typeof callBack["end"] === "function"){
                    callBack["end"].call(item,time);
                }
            }
            
        })

        function bsr(type,targetY,time){
			clearInterval(cleartime);
			//当前次数
			var t=0;
			//初始位置
			var b = wei.css(item,"translateY");
			//最终位置 - 初始位置
			var c = targetY -b;
			//总次数
			var d = time*1000 / (1000/60);
			cleartime = setInterval(function(){
				t++;
				
				if(callBack&&typeof callBack["autoMove"] === "function"){
                    // 在自动滚动时可以实现头部的搜索框隐藏
					callBack["move"].call(item);
				}
				
				if(t>d){
					clearInterval(cleartime);
					
					if(callBack&&typeof callBack["end"] === "function"){
						callBack["end"].call(item,time);
					}
				}
				var point = Tween[type](t,b,c,d);
				wei.css(item,"translateY",point);
			},1000/60);
		}
    }
    
})(window)
    