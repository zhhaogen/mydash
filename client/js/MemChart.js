function MemChart(container){   
	DrawChart.call(this,container,api.adminServer.getMemList);
	let that=this;
	let totalmem;
	that.afterInit=function(){ 
		that.setOption({
			title:{
				text:"内存"
			}, 
			tooltip:{
				trigger: 'axis',
				position: function (pt) {
					return [pt[0], '10%'];
				},
				formatter:function(params){
					let html=timeToChStr(params[0].data[0]);
					for(let p of params){
						html+="<br>"+p.marker+p.seriesName+": "+sizeToStr(p.data[1])+" "+(p.data[1]*100/totalmem).toMyFixed(1)+"%";
					} 
					return html;
				}
			},
			yAxis:{
				type:"value",
				name:"内存",
				axisLabel:{
					formatter:function (value){
						return sizeToStr(value);
					}
				}
			},
			series:[{
				name:"使用内存",
				type:"line",
				smooth:true,
				symbol: "none", 
				sampling:"average",
				areaStyle:{
					normal:{
						color:"rgb(255, 192, 203)"
					}
				},
				data:[]
			},{
				name:"剩余内存",
				type:"line",
				smooth:true,
				symbol: "none", 
				sampling:"average",
				areaStyle:{
					normal:{
						color:"rgb(240, 248, 255)"
					}
				},
				data:[]
			}]
		});
	};
	/**前置加工数据*/
	that.beforeData=function(data){
		for(let i=0;i<data.length;i++){
			let item=data[i]; 
			
			item.MemTotal=item.MemTotal*1024;
			item.MemFree=item.MemFree*1024;
			item.MemAvailable=item.MemAvailable*1024; 
			item.MemUsed=item.MemTotal-item.MemAvailable;
			
			data[i]=item;
		}   
	};
	that.makeOption=function(orginalData){
		totalmem=orginalData[0].MemTotal;
		
		let seriesData1=orginalData.map(item=>[item.uptime,item.MemUsed]);
		let seriesData2=orginalData.map(item=>[item.uptime,item.MemFree]);
		return {
			yAxis:{
				max:totalmem
			},
			series:[{
				name:"使用内存",
				data:seriesData1
				},{
				name:"剩余内存",
				data:seriesData2
			}]
		};
	}; 
	//that.apiMethod=api.adminServer.getMemList;
	 
	this.init();
}

//MemChart.prototype =Object.create(DrawChart.prototype); 