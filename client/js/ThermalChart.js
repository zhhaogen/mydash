function ThermalChart(container){
	DrawChart.call(this,container,api.adminServer.getThermalList); 
	let that=this;
	  
	that.afterInit=function(){
		that.setOption({
			title:{
				text:"温度"
			},
			yAxis:{
				type:"value",
				name:"温度",
				axisLabel:{
					formatter:function (value){
						return tempToStr(value);
					}
				}, 
				//min:30*1000,
				//min:"dataMin",
				scale:true
			}, 
			tooltip:{
				trigger: 'axis',
				position: function (pt) {
					return [pt[0], '10%'];
				},
				formatter:function(params){
					let html=timeToChStr(params[0].data[0]);
					for(let p of params){
						html+="<br>"+p.marker+p.seriesName+": "+tempToStr(p.data[1]);
					} 
					return html; 
				}
			},
			series:[]
		});
	};
	/**前置加工数据*/
	that.beforeData=function(data){
		for(let i=0;i<data.length;i++){
			let item=data[i]; 
			
			item.temps=JSON.parse(item.temps); 
			
			data[i]=item;
		}   
	};
	that.makeOption=function(orginalData){
		let seriesDatas=[];
		
		for(let i=0;i<orginalData.length;i++){
			let item=orginalData[i];
			let temps=item.temps;
			let names=Object.keys(temps);
			if(names.length==0){
				//没有温度记录 
				//console.log("没有温度记录"); 
				break;
			}
			for(let j=0;j<names.length;j++){
				let name=names[j];
				if(seriesDatas[j]==null){
					seriesDatas[j]={
						name:name,
						type:"line",
						smooth:true,
						symbol: "none", 
						sampling:"average",
						data:[]
					};
				}
				seriesDatas[j].data[i]=[item.uptime,temps[name]];				
			}
			
		}
		
		return { 
			series:seriesDatas
		};
	};  
	
	this.init();
}
 