function CpusChart(container){ 
	DrawChart.call(this,container,api.adminServer.getCpusList); 
	let that=this;
	
	that.afterInit=function(){
		that.setOption({
			title:{
				text:"CPU"
			},
			yAxis:{
				type:"value",
				name:"利用率"
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
			series:[]
		});
	};
	that.makeOption=function(orginalData){
		//console.log(orginalData);
		let seriesDatas=[];  
		 
		//计算利用率 
		let cpuNames=Object.keys(orginalData[0].cpus);
		
		for(let i=0;i<orginalData.length;i++){
			let item=orginalData[i];
			let nextItem=orginalData[i-1]; 
			
			let cpus=item.cpus; 
			
			for(let j=0;j<cpuNames.length;j++){ 
				let cpuName=cpuNames[j];//cpu名称
				
				let cpu=cpus[cpuName];
				let nextCpu;
				if(nextItem!=null){
					nextCpu=nextItem.cpus[cpuName];
				} 
				
				if(seriesDatas[j]==null){
					seriesDatas[j]={
						name:cpuName,
						type:"line",
						smooth:true,
						symbol: "none", 
						sampling:"average",
						data:[]
					};
				}
				let percent=0; 
				if(nextItem!=null){
					let diffTotal=cpu.total-nextCpu.total; 
					let diffIdel=cpu.idle-nextCpu.idle; 
					percent=(1000*(diffTotal-diffIdel)/diffTotal+5)/10; 
				}  
				seriesDatas[j].data[i]=[item.uptime,percent];
			}  
		}  
		//console.log(seriesDatas);
		return {
			series:seriesDatas
		};
	};  
	   
	/**前置加工数据*/
	that.beforeData=function(data){
		//console.log(data);
		for(let i=0;i<data.length;i++){
			let item=data[i];
			let cpus=JSON.parse(item.cpus);  
			delete cpus["cpu"];//删除
			//总体cpu
			let total=0;
			let idle=0;
			for(let cpuName in cpus){
				let cpu=cpus[cpuName]; 
				
				calcCpuTotalTime(cpu);//计算cpu时间   
				 
				total+=cpu.total;
				idle+=cpu.idle;
				cpus[cpuName]=cpu; 
			}
			
			cpus["cpu"]={total,idle};
			//save
			item.cpus=cpus; 
			
			data[i]=item;
		}   
	};  
	function calcCpuTotalTime(cpu){
		let total=0;
		for(let key in cpu){
			cpu[key]=cpu[key]==""?0:parseInt(cpu[key]);
			total+=cpu[key];
		}
		cpu["total"]=total;
		//console.log(cpu);
		return cpu;
	} 
	this.init();
} 
 