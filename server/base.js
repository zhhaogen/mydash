const fs = require('fs');

//日志储存目录
const LOG_ROOT="log";
//设置文件
const SETTING_PATH="setting.json";
/**判断是否为空*/
function isEmpty(str){
	return str==null||str=="";
}
/**创建文件夹**/
function createDirIfNotExist(dir){
	if(!fs.existsSync(dir)){
		fs.mkdirSync(dir); 
	}
}
/**读取配置*/
function getSetting(key,defVal){
	if(!fs.existsSync(SETTING_PATH)){
		let obj={};
		obj[key]=defVal;
		writeSetting(obj);
		return defVal;
	}
	let data=fs.readFileSync(SETTING_PATH,"utf-8");
	let setting=JSON.parse(data);
	//console.log("读取配置",setting);
	if(setting[key]==null){
		setting[key]=defVal;
		writeSetting(setting);
		return defVal;
	}
	return setting[key];
}
/**保存配置*/
function putSetting(key,val){
	if(!fs.existsSync(SETTING_PATH)){
		let obj={};
		obj[key]=val;
		writeSetting(obj);
		return;
	}
	let data=fs.readFileSync(SETTING_PATH,"utf-8");
	let setting=JSON.parse(data);
	//console.log("读取配置",setting); 
	setting[key]=val;
	writeSetting(setting); 
}
/**写入配置*/
function writeSetting(setting){ 
	//使用同步写入文件,保证线程安全
	try{
		fs.writeFileSync(SETTING_PATH,JSON.stringify(setting),"utf-8");
	}catch(err){ 
		console.error("写入["+SETTING_PATH+"]错误:",err);
	} 
}

module.exports = {createDirIfNotExist,getSetting,putSetting,isEmpty};
