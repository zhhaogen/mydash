function NetworkChart(container){ 
	DrawChart.call(this,container,api.adminServer.getNetworkList); 
	let that=this;
	
	that.afterInit=function(){
		that.setOption({
			title:{
				text:"网络"
			},
			yAxis:{
				type:"value",
				name:"速度",
				axisLabel:{
					formatter:function (value){
						return speedToStr(value);
					}
				}
			}, 
			tooltip:{
				trigger: 'axis',
				position: function (pt) {
					return [pt[0], '10%'];
				},
				formatter:function(params){
					let html=timeToChStr(params[0].data[0]);
					for(let p of params){
						html+="<br>"+p.marker+p.seriesName+": "+speedToStr(p.data[1]);
					} 
					return html;
				}
			},
			series:[]
		});
	};
	that.makeOption=function(orginalData){
		//console.log(orginalData);
		let seriesDatasMap={};  
		//可能网卡是临时增加的呢？ 
		for(let i=0;i<orginalData.length;i++){
			let item=orginalData[i];  
			let networks=item.networks; 
			 
			for(let networkName in networks){  
				let network=networks[networkName]; 
				if(seriesDatasMap[networkName]==null){
					seriesDatasMap[networkName]={
						name:networkName,
						type:"line",
						smooth:true,
						symbol: "none", 
						sampling:"average",
						data:[]
					};
				} 
				let dataItem=[item.uptime,network.Receive.bytes,network.Transmit.bytes];
				//console.log(dataItem);
				seriesDatasMap[networkName].data.push(dataItem);
			}  
		}
		//console.log(seriesDatasMap);	
		let seriesDatas=[];
		for(let networkName in seriesDatasMap){
			let seriesData=seriesDatasMap[networkName];
			
			calcNetSpeed(seriesData); 
			
			seriesDatas.push(seriesData);
		}
		
		//console.log(seriesDatas);
		return {
			series:seriesDatas
		};
	};  
	function calcNetSpeed(seriesData){
		let data=seriesData.data;
		//console.log(seriesData); 
		let newData=[];
		
		for(let i=0;i<data.length;i++){ 
			let item=data[i]; 
			let nextItem=data[i-1];//上一个数据
			
			let time=item[0];
			
			let downSpeed=0;
			let upSpeed=0;
			if(nextItem!=null){
				let detaDownBytes=item[1]-nextItem[1];
				let detaUpBytes=item[2]-nextItem[2];
				let detaTime=item[0]-nextItem[0];
				downSpeed=detaDownBytes/detaTime; 
				upSpeed=detaUpBytes/detaTime; 
			}   
			newData[i]=[time,downSpeed,upSpeed]; 
		}	 
		
		//console.log(data);
		seriesData.data=newData;
		
	}	
	/**前置加工数据*/
	that.beforeData=function(data){
		//console.log(data);
		for(let i=0;i<data.length;i++){
			let item=data[i]; 
			
			let networks=JSON.parse(item.networks);   
			for(let networkName in networks){
				let network=networks[networkName];
				network.Receive=parseInts(network.Receive);
				network.Transmit=parseInts(network.Transmit);
				
				networks[networkName]=network;
			}
			//save
			item.networks=networks; 
			
			data[i]=item;
		}   
	};   
	function parseInts(obj){
		for(let key in obj){
			obj[key]=parseInt(obj[key]);
		}
		return obj;
	}
	this.init();
} 
 