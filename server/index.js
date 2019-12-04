const os = require("./os.js");
const fs = require("fs");
const process = require("process");
const { spawn } = require("child_process");
const Database = require("better-sqlite3");

const {createDirIfNotExist,getSetting,putSetting,isEmpty}=require("./base.js");
 

//换行符号
const ENDL="\n";
//数据储存目录
const DATA_ROOT="data";

//刷新率
let RATE=getSetting("RATE",3000);

//创建数据文件夹
let dataDir=createDataDir();


//预编译语句
let stmts={};
let db = new Database(dataDir+"/sqlite3.db");

//记录内存
function saveMem(){
	//console.log("刷新内存记录"); 
	appendDataFile("mem",os.memUsage()); 
}
//记录cpu
function saveCpu(){
	//console.log("刷新cpu记录"); 
	appendDataFile("cpus",{cpus:JSON.stringify(os.cpusUsage())}); 
}
//记录温度
function saveThermal(){
	//console.log("刷新温度记录");
	appendDataFile("thermal",{temps:JSON.stringify(os.thermal())}); 
}
//记录平均负载
function saveLoadavg(){ 
	//console.log("刷新平均负载记录"); 
	appendDataFile("loadavg",os.loadavg()); 
}

//记录网络
function saveNetwork(){ 
	//console.log("刷新网络记录"); 
	appendDataFile("network",{networks:JSON.stringify(os.netUsage())}); 
}

//记录磁盘
function saveDisks(){ 
	//console.log("刷新磁盘记录"); 
	appendDataFile("disk",{disks:JSON.stringify(os.diskUsage())}); 
}

/**保存任务*/
function doSave(){ 
	saveMem();
	saveCpu();  
	saveLoadavg();
	saveThermal(); 
	saveNetwork(); 
	saveDisks(); 
	//console.log("刷新率",RATE);
	setTimeout(doSave,RATE);
}
//初始化数据库
function init() { 
	
	db.exec("CREATE TABLE mem(id INTEGER PRIMARY KEY AUTOINCREMENT,uptime REAL,MemTotal TEXT,MemFree TEXT,MemAvailable TEXT)"); 
	stmts["mem"]=db.prepare("INSERT INTO mem (uptime,MemTotal,MemFree,MemAvailable)values(@uptime,@MemTotal,@MemFree,@MemAvailable);"); 
		
	db.exec("CREATE TABLE cpus(id INTEGER PRIMARY KEY AUTOINCREMENT,uptime REAL,cpus TEXT)");
	stmts["cpus"]=db.prepare("INSERT INTO cpus (uptime,cpus)values(@uptime,@cpus);"); 
	
	db.exec("CREATE TABLE thermal(id INTEGER PRIMARY KEY AUTOINCREMENT,uptime REAL,temps TEXT)");
	stmts["thermal"]=db.prepare("INSERT INTO thermal (uptime,temps)values(@uptime,@temps);"); 
	
	db.exec("CREATE TABLE loadavg(id INTEGER PRIMARY KEY AUTOINCREMENT,uptime REAL,m1 TEXT,m5 TEXT,m15 TEXT)");
	stmts["loadavg"]=db.prepare("INSERT INTO loadavg (uptime,m1,m5,m15)values(@uptime,@m1,@m5,@m15);"); 
	
	db.exec("CREATE TABLE network(id INTEGER PRIMARY KEY AUTOINCREMENT,uptime REAL,networks TEXT)");
	stmts["network"]=db.prepare("INSERT INTO network (uptime,networks)values(@uptime,@networks);"); 
	
	db.exec("CREATE TABLE disk(id INTEGER PRIMARY KEY AUTOINCREMENT,uptime REAL,disks TEXT)");
	stmts["disk"]=db.prepare("INSERT INTO disk (uptime,disks)values(@uptime,@disks);"); 
	
	db.exec("CREATE TABLE time(id INTEGER PRIMARY KEY AUTOINCREMENT,uptime REAL,time TEXT)");
	stmts["time"]=db.prepare("INSERT INTO time (uptime,time)values(@uptime,@time);"); 
	
	doSave(); 
};

init();

//记录时间
function doGetTime(){
	//执行timedatectl命令
	//console.log("校验时间记录");
	let ls = spawn("timedatectl");
	let tags="System clock synchronized: yes";
	ls.stdout.on("data", lines => {
	  if(lines.indexOf(tags)!=-1){ 
		appendDataFile("time",{time:Date.now()}); 
	  }else{
		setTimeout(doGetTime,5000); 
	  }
	}); 
} 

setTimeout(doGetTime,5000);



/**创建本次记录*/
function createDataDir(){ 
	let dirNames=getDirNames();
	let dataDir; 
	if(dirNames.length==0){
		dataDir=DATA_ROOT+"/1";
	}else{
		dataDir=DATA_ROOT+"/"+(dirNames[0]+1);
	} 
	console.log("创建文件夹:"+dataDir);
	fs.mkdirSync(dataDir);
	return dataDir;
}

/**获取数据储存文件夹*/
function getDirNames(){
	createDirIfNotExist(DATA_ROOT);  
	let fileNames=fs.readdirSync(DATA_ROOT);
	//console.log(fileNames);
	let dirNames=[];
	for(let fileName of fileNames){
		if(fs.statSync(DATA_ROOT+"/"+fileName).isDirectory()
			&&!isNaN(fileName)
		){
			dirNames.push(parseInt(fileName));
		}
	} 
	//console.log(dirNames);
	dirNames.sort((a,b)=>b-a);
	return dirNames;
}

/**写入数据文件*/
function appendDataFile(fileName,data){ 
	data["uptime"]=process.uptime(); 
	//console.log("插入数据",data);
	stmts[fileName].run(data); 	
}

function setRate(rate){
	RATE=rate;
	putSetting("RATE",RATE);
}
function getRate(){
	return RATE;
}
module.exports = {getRate,setRate,getDirNames,DATA_ROOT};