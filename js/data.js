// JavaScript Document

var child_data = [
		{
			circle:{size:10,x:100,y:100},
			text:{cont:'JS面向对象',x:115,y:106,rotate:45,progress:100}
		},
		{
			circle:{size:4,x:80,y:130}
		},
		{
			circle:{size:10,x:40,y:150},
			text:{cont:'JS组件',x:45,y:140,rotate:-80,progress:30}
		},
		{
			circle:{size:10,x:100,y:170}
		},
		{
			circle:{size:10,x:150,y:210},
			text:{cont:'JS模块化',x:75,y:212,rotate:0,progress:80}
		}
	];
var child_data1 = [
		{
			circle:{size:4,x:300,y:230}
		},
		{
			circle:{size:4,x:280,y:260}
		},
		{
			circle:{size:10,x:290,y:280},
			text:{cont:'Ajax数据交互',x:295,y:300,rotate:60}	
		},
		{
			circle:{size:4,x:220,y:300}
		},
		{
			circle:{size:10,x:200,y:290},
			text:{cont:'新浪微博',x:210,y:280,rotate:-10}	
		},
		{
			circle:{size:4,x:160,y:310}
		},
		{
			circle:{size:4,x:130,y:340}
		},
		{
			circle:{size:10,x:110,y:360},
			text:{cont:'瀑布流',x:100,y:390,rotate:-10}	
		},
		{
			circle:{size:4,x:70,y:330}
		},
		{
			circle:{size:10,x:40,y:320},
			text:{cont:'预加载',x:55,y:320,rotate:-10}	
		},
		{
			circle:{size:4,x:20,y:300}
		},
		{
			circle:{size:4,x:30,y:280}
		}
	];
var child_data2 = [
		{
			circle:{size:10,x:300,y:420},
			text:{cont:'游戏/专题页面制作',x:315,y:415,rotate:-40}	
		},
		{
			circle:{size:10,x:270,y:460},
			text:{cont:'模块化布局',x:280,y:470,rotate:20}	
		},
		{
			circle:{size:4,x:220,y:455}
		},
		{
			circle:{size:4,x:180,y:430}
		},
		{
			circle:{size:10,x:120,y:455},
			text:{cont:'CSS面试题',x:48,y:502,rotate:-30}	
		}
	];
var child_data3 = [
		{
			circle:{size:10,x:420,y:450},
			text:{cont:'网页制作基础',x:320,y:470,rotate:-10}	
		},
		{
			circle:{size:4,x:410,y:420}
		},
		{
			circle:{size:4,x:420,y:450,dot:'none',line:'none'}
		},
		{
			circle:{size:4,x:460,y:430}
		},
		{
			circle:{size:4,x:480,y:420}
		},
		{
			circle:{size:4,x:420,y:450,dot:'none',line:'none'}
		},
		{
			circle:{size:4,x:460,y:460}
		},
		{
			circle:{size:10,x:500,y:490},
			text:{cont:'精确贴图、兼容性',x:390,y:560,rotate:-30,progress:50}
		}
	];
var child_data4 = [
		{
			circle:{size:10,x:550,y:420},
			text:{cont:'JS基础',x:500,y:390,rotate:30}	
		},
		{
			circle:{size:4,x:580,y:470}
		},
		{
			circle:{size:4,x:630,y:485}
		},
		{
			circle:{size:4,x:660,y:475}
		},
		{
			circle:{size:10,x:700,y:440},
			text:{cont:'DOM、BOM、EVENT',x:705,y:460,rotate:60}	
		},
		{
			circle:{size:4,x:620,y:440}
		},
		{
			circle:{size:10,x:550,y:420,dot:'none'}
		}
	];
var child_data5 = [
		{
			circle:{size:4,x:660,y:270}
		},
		{
			circle:{size:4,x:690,y:280,line:'none'}
		},
		{
			circle:{size:10,x:665,y:310},
			text:{cont:'JQuery实现原理',x:540,y:310,rotate:0}
		},
		{
			circle:{size:4,x:660,y:270,line:'none',dot:'none'}
		},
		{
			circle:{size:10,x:665,y:310,dot:'none'}
		},
		{
			circle:{size:10,x:655,y:370},
			text:{cont:'JQuery库的使用',x:675,y:365,rotate:-45}	
		},
		{
			circle:{size:4,x:615,y:350}
		},
		{
			circle:{size:4,x:655,y:370,line:'none',dot:'none'}
		},
		{
			circle:{size:10,x:740,y:360},
			text:{cont:'JQuery运动算法',x:700,y:390,rotate:-5}	
		},
		{
			circle:{size:4,x:790,y:365}
		},
		{
			circle:{size:10,x:830,y:330},
			text:{cont:'JS性能优化',x:738,y:338,rotate:-5}	
		},
		{
			circle:{size:4,x:790,y:295}
		},
		{
			circle:{size:10,x:780,y:265},
			text:{cont:'正则表达式',x:800,y:265,rotate:-30}	
		},
		{
			circle:{size:4,x:775,y:225}
		}
	];
	
var child_data6 = [
		{
			circle:{size:10,x:550,y:165},
			text:{cont:'移动端开发',x:565,y:150,rotate:-60}	
		},	
		{
			circle:{size:4,x:590,y:180}
		},
		{
			circle:{size:4,x:610,y:160}
		},
		{
			circle:{size:10,x:650,y:160},
			text:{cont:'JQuery mobile',x:580,y:255,rotate:-50}	
		},	
		{
			circle:{size:4,x:700,y:190}
		},
		{
			circle:{size:4,x:730,y:180}
		},
		{
			circle:{size:10,x:780,y:190},
			text:{cont:'HTML5教程',x:700,y:230,rotate:-20}	
		},	
		{
			circle:{size:4,x:650,y:160,dot:'none',line:'none'}
		},
		{
			circle:{size:4,x:680,y:130}
		},
		{
			circle:{size:4,x:700,y:100}
		},
		{
			circle:{size:4,x:705,y:80}
		},
		{
			circle:{size:10,x:740,y:100},
			text:{cont:'CSS动画',x:755,y:95,rotate:-40}	
		},	
		{
			circle:{size:10,x:800,y:140},
			text:{cont:'canvas',x:740,y:160,rotate:-15}	
		}
	];
var child_data7 = [
		{
			circle:{size:10,x:260,y:100},
			text:{cont:'视觉差设计',x:180,y:125,rotate:-15}	
		},
		{
			circle:{size:10,x:320,y:110},
			text:{cont:'JS桌面级应用',x:335,y:120,rotate:15}	
		},	
		{
			circle:{size:10,x:325,y:60},
			text:{cont:'JS库编写',x:255,y:30,rotate:30}	
		},	
		{
			circle:{size:4,x:325,y:20}
		},	
		{
			circle:{size:4,x:360,y:40,line:'none'}
		},	
		{
			circle:{size:4,x:325,y:60,dot:'none'}
		},
		{
			circle:{size:10,x:320,y:110,dot:'none',line:'none'}
		},
		{
			circle:{size:10,x:400,y:80},
			text:{cont:'JS游戏开发',x:415,y:75,rotate:-30}	
		},	
		{
			circle:{size:4,x:380,y:60}
		},	
		{
			circle:{size:10,x:400,y:80,dot:'none',line:'none'}
		},	
		{
			circle:{size:4,x:430,y:90}
		},
		{
			circle:{size:10,x:450,y:100},
			text:{cont:'响应式设计',x:470,y:105,rotate:-30}	
		}
	];
	
	
	
	
	
	
	
	
	