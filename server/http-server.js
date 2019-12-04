const Database = require("better-sqlite3");
const http = require("http");
const os = require("os"); 

const {createDirIfNotExist,getSetting,putSetting,isEmpty}=require("./base.js"); 
const {createToken,getToken}=require("./token.js");
let {getRate,setRate,getDirNames,DATA_ROOT}=require("./index.js");

//http端口
const HTTP_PORT=getSetting("HTTP_PORT","8088");
const TOKEN=getSetting("TOKEN",{
	name:"admin",
	passwd:"12345678"
});


//开始http
const server = http.createServer(function(req, res) {
    console.log(req.url,req.headers);
	//允许跨域
	allowCors(req,res); 
    let myUrl = new URL("http://localhost" + req.url);
	//console.log(myUrl);  
    if (myUrl.pathname == "/api/userServer/login") {
		return onLogin(myUrl,req,res); 
	} else if (myUrl.pathname == "/api/userServer/logout"){
		return onLogout(myUrl,req,res);
	} else{ 
		//检查授权
		let userInfo=checkAuth(req); 
		if(userInfo==null){
			return sendJson(res,{code:5,msg:"请先登录"}); 
		}else if (myUrl.pathname == "/api/userServer/getUserInfo") {
			return sendData(res,userInfo);  
		}else if (myUrl.pathname == "/api/adminServer/getRate") {
			return sendData(res,getRate());  
		}else if (myUrl.pathname == "/api/adminServer/editRate") {
			return onEditRate(myUrl,req,res); 
		}else if (myUrl.pathname == "/api/adminServer/getSystemInfo") {
			return sendData(res,{
				arch:os.arch(),
				platform:os.platform(),
				release:os.release()
			}); 
		}else if (myUrl.pathname == "/api/adminServer/getNetworkInterfaces") {
			return sendData(res,os.networkInterfaces()); 
		}else if (myUrl.pathname == "/api/adminServer/getDirNames") { 
			return sendData(res,getDirNames()); 
		}else if (myUrl.pathname == "/api/adminServer/getMemList") { 
			return onGetList("mem",myUrl,req,res); 
		}else if (myUrl.pathname == "/api/adminServer/getCpusList") { 
			return onGetList("cpus",myUrl,req,res); 
		}else if (myUrl.pathname == "/api/adminServer/getThermalList") { 
			return onGetList("thermal",myUrl,req,res); 
		}else if (myUrl.pathname == "/api/adminServer/getLoadavgList") { 
			return onGetList("loadavg",myUrl,req,res); 
		}else if (myUrl.pathname == "/api/adminServer/getNetworkList") { 
			return onGetList("network",myUrl,req,res); 
		}else if (myUrl.pathname == "/api/adminServer/getDiskList") { 
			return onGetList("disk",myUrl,req,res); 
		} else {
			return sendJson(res,{code:1,msg:"未找到该api"}); 
		}
	} 
});
/**返回成功json格式*/
function sendData(res,data){
	res.setHeader("Content-Type", "application/json;charset=utf-8"); 
	res.end(JSON.stringify({code:0,msg:"OK",data:data}),"utf-8");
	return true;
}
/**返回json格式*/
function sendJson(res,data){
	res.setHeader("Content-Type", "application/json;charset=utf-8"); 
	res.end(JSON.stringify(data),"utf-8");
	return true;
}
/**允许跨域*/
function allowCors(req,res){
	if(req.headers.origin!=null){
		res.setHeader("Access-Control-Allow-Origin",req.headers.origin);
		res.setHeader("Access-Control-Allow-Credentials","true");
		res.setHeader("Vary","Accept-Encoding,Origin");
		res.setHeader("Access-Control-Allow-Methods","POST,GET,OPTIONS");
		res.setHeader("Access-Control-Allow-Headers","X-PINGOTHER,Content-Type");
		res.setHeader("Access-Control-Max-Age","86400");
	}
}
/**登录处理*/
function onLogin(myUrl,req,res){
	let name=myUrl.searchParams.get("name");
	let passwd=myUrl.searchParams.get("passwd"); 
	if(isEmpty(name)){
		return sendJson(res,{code:1,msg:"用户名不能为空"});
	}
	if(isEmpty(passwd)){
		return sendJson(res,{code:1,msg:"密码不能为空"});
	} 
	if(passwd.length<8){
		return sendJson(res,{code:1,msg:"密码不能低于8位"});
	} 
	if(TOKEN.name!=name||TOKEN.passwd!=passwd){
		return sendJson(res,{code:1,msg:"用户名密码不匹配"});
	}
	let token=createToken({name:name},TOKEN.passwd);//生成token 
	res.setHeader("Set-Cookie","token="+token+";path=/;HttpOnly"); 
	return sendData(res,{name});
}
/**退出处理*/
function onLogout(myUrl,req,res){ 
	res.setHeader("Set-Cookie","token=;path=/;Expires=Wed, 21 Oct 2015 08:01:00 GMT;;HttpOnly");
	return sendData(res);
}
/**修改刷新率处理*/
function onEditRate(myUrl,req,res){ 
	let rate=myUrl.searchParams.get("rate");
	if(isEmpty(rate)){
		return sendJson(res,{code:1,msg:"rate不能为空" });
	}
	rate=parseInt(rate);
	if(rate<1000){
		return sendJson(res,{code:1,msg:"不建议将刷新率设置低于1秒"});
	}
	setRate(rate);  
	return sendData(res,{rate});
}
/**查找数据库*/
function onGetList(tableName,myUrl,req,res){
	let dir=myUrl.searchParams.get("dir");
	let firstId=myUrl.searchParams.get("firstId");
	let lastId=myUrl.searchParams.get("lastId");
	let limit=myUrl.searchParams.get("limit");
	if(isEmpty(dir)){
		return sendJson(res,{code:1,msg:"dir不能为空"});
	}
	getList(dir,tableName,firstId,lastId,limit,data=>{
		sendData(res,data);
	},err=>{
		sendJson(res,{code:1,msg:"数据库查询异常:"+err.message});
	}); 
}
/**查找数据库*/
function getList(dir,tableName,firstId,lastId,limit,successback,errorback){
	let dataDir=DATA_ROOT+"/"+dir;
	let db ;
	let doQuery=function(){
		let wheres=[];
		if(firstId!=null){
			wheres.push("id>"+firstId);
		}
		if(lastId!=null){
			wheres.push("id<"+lastId);
		}
		let sql="select * from "+tableName;
		if(wheres.length>0){
			sql+=" where "+wheres.join(" and ");
		}
		sql+=" order by id desc";
		if(limit!=null){
			sql+=" limit "+limit;
		}
		console.log("执行sql语句:"+sql);
		try{
			let ps=db.prepare(sql);  
			let rows=ps.all();
			console.log("sql 结果:",rows)
			successback(rows); 
		}catch(err){
			console.log("执行sql语句异常:",err);
			errorback(err);
		}
		db.close();
	};
	//db= new Database(dataDir+"/sqlite3.db",{readonly:true}); 
	db= new Database(dataDir+"/sqlite3.db"); 
	if(db.open==false){
		errorback(new Error("数据库未打开"));
		return;
	}
	doQuery();
}
/**检查授权,返回用户信息*/
function checkAuth(req){ 
	if(isEmpty(req.headers.cookie)){
		//console.log("cookie为空");
		return ;
	}
	let i1=req.headers.cookie.indexOf("token=");
	if(i1==-1){
		//console.log("没有找到token头");
		return;
	}
	let i2=req.headers.cookie.indexOf(";",i1);
	let token;
	if(i2==-1){
		token=req.headers.cookie.substring(i1+6);
	}else{
		token=req.headers.cookie.substring(i1+6,i2);
	} 
	//console.log("token",token);
	let json=getToken(token,TOKEN.passwd);
	//console.log(json);
	return json;
}

server.listen(HTTP_PORT,()=>{
	console.log("http服务器已启动,请访问http://localhost:"+HTTP_PORT+"/");
});
