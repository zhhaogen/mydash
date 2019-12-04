function LoadavgChart(container){ 
	DrawChart.call(this,container,api.adminServer.getLoadavgList); 
	let that=this;
	 
	that.afterInit=function(){
		that.setOption({
			title:{
				text:"负载"
			},
			yAxis:{
				type:"value",
				name:"分数"
			}, 
			tooltip:{
				trigger: 'axis',
				position: function (pt) {
					return [pt[0], '10%'];
				},
				formatter:function(params){
					let html=timeToChStr(params[0].data[0]);
					for(let p of params){
						html+="<br>"+p.marker+p.seriesName+": "+p.data[1].toMyFixed(2);
					} 
					return html;
				}
			},
			series:[{
				name:"1分钟",
				type:"line",
				smooth:true,
				symbol: "none", 
				sampling:"average",
				data:[]
			},{
				name:"5分钟",
				type:"line",
				smooth:true,
				symbol: "none", 
				sampling:"average",
				data:[]
			},{
				name:"15分钟",
				type:"line",
				smooth:true,
				symbol: "none", 
				sampling:"average",
				data:[]
			}]
		});
	}; 
	that.beforeData=function(data){ 
		for(let i=0;i<data.length;i++){
			let item=data[i]; 
			item.m1=parseFloat(item.m1);
			item.m5=parseFloat(item.m5);
			item.m15=parseFloat(item.m15);
			
			data[i]=item;
		}
	};
	that.makeOption=function(orginalData){  
		let seriesData1=[];
		let seriesData5=[];
		let seriesData15=[];
		for(let i=0;i<orginalData.length;i++){
			let item=orginalData[i]; 
			
			seriesData1[i]=[item.uptime,item.m1];
			seriesData5[i]=[item.uptime,item.m5];
			seriesData15[i]=[item.uptime,item.m15];
		}  
		return {
			series:[{
					name:"1分钟",
					data:seriesData1
				},{
					name:"5分钟",
					data:seriesData5
				},{
					name:"15分钟",
					data:seriesData15
			}]
		};
	}; 
	
	this.init();
}
 