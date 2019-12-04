function DisksChart(container){ 
	DrawChart.call(this,container,api.adminServer.getDiskList); 
	let that=this;
	
	that.afterInit=function(){
		that.setOption({
			title:{
				text:"磁盘"
			},
			yAxis:{
				type:"value",
				name:"tps",
				axisLabel:{
					formatter:function (value){
						return (value);
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
						html+="<br>"+p.marker+p.seriesName+": "+(p.data[1].toMyFixed(2));
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
		//可能是临时增加的呢？ 
		for(let i=0;i<orginalData.length;i++){
			let item=orginalData[i];  
			let disks=item.disks; 
			 
			for(let diskName in disks){  
				let disk=disks[diskName]; 
				if(seriesDatasMap[diskName]==null){
					seriesDatasMap[diskName]={
						name:diskName+"("+sizeToStr(disk.size*1024/2)+")",//double size
						type:"line",
						smooth:true,
						symbol: "none", 
						sampling:"average",
						data:[]
					};
				} 
				
				let dataItem=[item.uptime].concat(disk.stat);
				//console.log(dataItem);
				seriesDatasMap[diskName].data.push(dataItem);
			}  
		}
		//console.log(seriesDatasMap);	
		let seriesDatas=[];
		for(let diskName in seriesDatasMap){
			let seriesData=seriesDatasMap[diskName]; 
			
			calcDiskSpeed(seriesData); 
			
			seriesDatas.push(seriesData);
		}
		
		//console.log(seriesDatas);
		return {
			series:seriesDatas
		};
	};  
	function calcDiskSpeed(seriesData){
		let data=seriesData.data;
		//console.log(seriesData); 
		let newData=[];
		for(let i=0;i<data.length;i++){ 
			let item=data[i]; 
			let nextItem=data[i-1];//上一个数据
			
			let time=item[0];
			
			let tps=0;
			let kB_read=0;
			let kB_wrt=0; 

			if(nextItem!=null){
				let detaTime=item[0]-nextItem[0];
				
				let detaRead=item[1]-nextItem[1];
				let detaWrt=item[5]-nextItem[5];
				 
				
				tps=(detaRead+detaWrt)/detaTime;  
			}   
			newData[i]=[time,tps]; 
		}	 
		
		//console.log(data);
		seriesData.data=newData;
		
	}
	
	/**前置加工数据*/
	that.beforeData=function(data){
		//console.log(data);
		for(let i=0;i<data.length;i++){
			let item=data[i]; 
			
			let disks=JSON.parse(item.disks);   
			for(let diskName in disks){
				let disk=disks[diskName];
				disk.size=parseInt(disk.size); 
				disk.stat=parseInts(disk.stat); 
				
				disks[diskName]=disk;
			}
			//save
			item.disks=disks; 
			
			data[i]=item;
		}   
	};   
	function parseInts(arr){
		for(let i=0;i<arr.length;i++){
			arr[i]=parseInt(arr[i]);
		}
		return arr;
	}
	this.init();
} 
 