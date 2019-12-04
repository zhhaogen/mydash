function DrawChart(container,apiMethod){
	let that=this;
	 
	let myIcon="path://M15 8.25H5.87l4.19-4.19L9 3 3 9l6 6 1.06-1.06-4.19-4.19H15v-1.5z";
	let rate=8000;
	let limit=10; 
	let taskId;
	let orginalData=[];
	//是否为第一次加载
	let isFirstLoading=true; 
	//当前加载内容
	let currentDir;
	let currentRefresh; 
	//防止点击太快
	let isLoadingMore=false;
	that.chart=null; 
	//-----抽象内容--------------------------  
	/**前置数据加工*/
	that.beforeData=function(){
		//
	};
	/**初始化之后*/
	that.afterInit=function(){
		//console.log("初始化内容之后");
	}; 
	/**加工数据*/
	that.makeOption=function(orginalData){
		
	};
	//---------------抽象内容结束-------------------------
	/**初始化内容*/
	that.init=function(){  
		that.chart=echarts.init(container);
		let option={ 
			toolbox:{ 
				feature:{ 
					myTool1:{
						title:"往前",
						icon:myIcon,
						onclick:function(){
							getMoreData();
						}
					},
					myTool2:{
						title:"全部",
						icon:myIcon,
						onclick:function(){
							getMoreData(-1);
						}
					},
					//dataZoom:{},
					saveAsImage:{}
				}
			},
			tooltip:{
				trigger: 'axis',
				position: function (pt) {
					return [pt[0], '10%'];
				}
			},
			dataZoom:[{type:"slider"}],
			xAxis:{
				type:"value",
				name:"时间",
				axisLabel:{
					formatter:function (value){
						return timeToStr(value);
					}
				},
				min:"dataMin",
				scale:true
			},
			yAxis:{
				type:"value"
			}
		};  
		that.setOption(option,true);//不合并重置数据 
		that.chart.showLoading({text:"正在加载.."}); 
		that.afterInit();
	};
	//that.init();
	
	/**生成绘制图表*/
	function drawChart(){
		if(orginalData.length==0){
			that.init();
			that.afterInit();
			return;
		}
		//加工数据    
		//console.log(seriesDatas); 
		that.setOption(that.makeOption(orginalData));
	} 
	/**往前获取数据*/
	function getMoreData(myLimit){
		if(myLimit==null){
			myLimit=limit;
		}else if(myLimit==-1){
			myLimit=null;
		}
		if(isLoadingMore){
			console.log("正在往前加载..");
			return;
		}
		isLoadingMore=true;
		let lastId;
		if(orginalData.length==0){
			lastId=null;
		}else{ 
			lastId=orginalData[0].id;
		} 
		let dir=currentDir;
		apiMethod({dir,lastId,limit:myLimit},function(data){
			if(dir!=currentDir){
				//非当前任务
				console.log(dir,"非当前任务",currentDir);
				return;
			} 
			isLoadingMore=false;
			if(data.length>0){
				//获取到的数据是倒序的,先顺序过来
				data.reverse();
				//前置加工数据
				that.beforeData(data);
				orginalData=data.concat(orginalData);//插入到头部	 
				drawChart(); 
			} 
		});
	} 
	/**加载最新数据*/
	function loadData(dir){
		let firstId;
		if(orginalData.length==0){
			firstId=null;
		}else{
			firstId=orginalData[orginalData.length-1].id;
		} 
		apiMethod({dir,firstId,limit},function(data){
			if(dir!=currentDir){
				//非当前任务
				console.log(dir,"非当前任务",currentDir);
				return;
			} 
			if(isFirstLoading){
				that.chart.hideLoading(); 
				isFirstLoading=false;
			}
			if(data.length>0){
				//获取到的数据是倒序的,先顺序过来
				data.reverse();
				//前置加工数据
				that.beforeData(data); 
				orginalData=orginalData.concat(data);//插入到尾部
				drawChart(); 
			}
			
			//自动刷新内容
			if(currentRefresh){
				setTimeout(function(){
					loadData(dir);
				},rate);	
			} 
		});
	}
	/**停止加载,显示初始化界面*/
	that.stop=function(){
		if(taskId!=null){
			clearTimeout(taskId);
			taskId=null;
		}
		currentDir=null;
		currentRefresh=false;
		isFirstLoading=true;
		orginalData=[];
		drawChart();
		that.chart.hideLoading();
	};
	that.load=function(dir,refresh){
		//停止原来的加载任务
		if(taskId!=null){
			clearTimeout(taskId);
			taskId=null;
		}
		//重置数据  
		currentDir=dir;
		currentRefresh=refresh;
		isFirstLoading=true;
		orginalData=[];
		that.chart.showLoading({text:"正在加载.."});
		
		//开始加载数据
		loadData(dir); 
	}; 
	that.setOption=function(a1,a2,a3){
		that.chart.setOption(a1,a2,a3);
	};
	that.getOrginalData=function(){
		return orginalData;
	}
}