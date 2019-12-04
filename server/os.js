const fs = require("fs");

let os={};


os.memUsage=function(){
	//读取/proc/meminfo
	// MemTotal,MemFree,MemAvailable,Buffers,Cached,SwapCached;
	let res={};
	let txt=fs.readFileSync("/proc/meminfo","utf-8");
	let lines=txt.split("\n");
	//console.log(lines);
	for(let line of lines){
		if(line==""){
			continue;
		}
		let kvs=line.split(":"); 
		//console.log(kvs);
		let k=kvs[0];
		let vs=kvs[1].trim().split(" ");
		//console.log(vs);
		res[k]=vs[0];
		//res[k]=parseInt(vs[0]);
	} 
	if(res["MemAvailable"]==null){
		res["MemAvailable"]=parseInt(res["MemFree"])+parseInt(res["Buffers"])+parseInt(res["Cached"])+parseInt(res["SwapCached"]);
	}
	//console.log(res);
	return res;
};

os.cpusUsage=function(){
	let res={};
	let txt=fs.readFileSync("/proc/stat","utf-8");
	let lines=txt.split("\n");
	//console.log(lines);
	for(let line of lines){
		if(line.indexOf("cpu")!=0){
			break;
		}
		let vs=line.split(" "); 
		//console.log(vs);
		let cpuName=vs[0];
		res[cpuName]={
			user:vs[1],
			nice:vs[2],
			system:vs[3],
			idle:vs[4],
			iowait:vs[5],
			irrq:vs[6],
			softirq:vs[7],
			steal:vs[8],
			guest:vs[9],
			guest_nice:vs[10],
		};
	}
	
	return res;
};

os.loadavg=function(){ 
	let txt=fs.readFileSync("/proc/loadavg","utf-8");
	let vs=txt.split(" "); 
	//console.log(vs);
	let res={
		"m1":vs[0],
		"m5":vs[1],
		"m15":vs[2],
	};
	return res;
};

os.thermal=function(){ 
	let res={};
	if(!fs.existsSync("/sys/class/thermal/")){
		return res;
	};
	let fileNames=fs.readdirSync("/sys/class/thermal/");
	for(let fileName of fileNames){
		if(fileName.indexOf("thermal_zone")!=0){
			continue;
		}
		try{
			let type=fs.readFileSync("/sys/class/thermal/"+fileName+"/type","utf-8").trim();
			let temp=fs.readFileSync("/sys/class/thermal/"+fileName+"/temp","utf-8").trim();
			res[type]=temp;
		}catch(err){
			
		}
		
	}
	return res;
}; 

os.netUsage=function(){
	let res={};
	let txt=fs.readFileSync("/proc/net/dev","utf-8");
	let lines=txt.split("\n");
	//console.log(lines); 
	let names=lines[1].split("|");
	//console.log(names); 
	let ReceiveNames=names[1].split(/\s+/);//8
	let TransmitNames=names[2].split(/\s+/);//8
	//console.log(ReceiveNames.length,TransmitNames.length);
	for(let i=2;i<lines.length-1;i++){
		let line=lines[i];
		//console.log(line);
		let kvs=line.split(":");
		//console.log(kvs);
		let vs=kvs[1].trim().split(/\s+/);
		let interfaceName= kvs[0].trim();
		//console.log(vs); 
		let Receive={};
		let Transmit={};
		let j=0;
		for(let ReceiveName of ReceiveNames){
			Receive[ReceiveName]=vs[j++];
		} 
		
		for(let TransmitName of TransmitNames){
			Transmit[TransmitName]=vs[j++];
		}  
		res[interfaceName]={Receive,Transmit};
	}
	return res;
};

os.diskUsage=function(){
	let res={}; 
	//使用/sys/block/ 而不使用/proc/diskstats
	let fileNames=fs.readdirSync("/sys/block/");
	for(let fileName of fileNames){
		if(fileName.startsWith("loop")){//||fileName.startsWith("zram")
			continue;
		}
		let size=fs.readFileSync("/sys/block/"+fileName+"/size","utf-8").trim();
		if(size=="0"){
			continue;
		}
		let txt=fs.readFileSync("/sys/block/"+fileName+"/stat","utf-8");
		let stat=txt.trim().split(/\s+/); 
		res[fileName]={size,stat};
	} 
	return res;
};
//test
//console.log(os.diskUsage());

module.exports = os;
