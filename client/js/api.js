/**
*API接口js入口
*
*/
let api;
(function(){
/**
*转换成路径模式,主要用于测试,将值拼起来作为传递测试
*@param obj 传入参数 
*/
function makeRestfulUrl(obj)
{
	var keys = Object.keys(obj);
	//对参数名进行自然排序
	//拼接成 key1/value1/key2/value21/key2/value22
	keys.sort();
    var data = "";
    for (var i = 0; i < keys.length; i++)
    {
        var key = keys[i];
		var value=obj[key]; 
		if(Array.isArray(value))
		{ 
			for(var i=0;i<value.length;i++)
			{
				data = data +  "/"+key+"/" + encodeURIComponent(value[i]); 
			} 
		}else if(value!=null)
		{
			 data = data +  "/"+key+"/" + encodeURIComponent(value);
		} 
    }  	
    return data;
}	
/**
*统一方法
*@param methodName 接口方法名
*@param obj 传入参数
*@param callback 接口相应成功回调
*/
function method(methodName,_obj,_callback,_finalCall)
{
	var obj,callback,finalCall;
	if(typeof(_obj)=="function"){
		obj={};
		callback=_obj;
		finalCall=_callback;
	}else{
		obj=_obj;
		callback=_callback;
		finalCall=_finalCall;
	}
	var err=function(msg)
	{
		//console.log(msg);
		tip("访问"+methodName+" Api错误["+msg+"]!");
		if(finalCall){
			finalCall();
		}
	};
	var success=function(res)
	{  
		if(res==null||res.code==null){
			tip(methodName+" Api响应格式错误!");
			return;
		}
		if(res.code==5){
			tip("请先登录!");
			location.href="./denglu";
			return;
		}
		if(res.code!=0)
		{
			tip(res.msg); 
			return;
		} 
		if(callback)
		{
			callback(res.data);
		}
		if(finalCall){
			finalCall();
		}
	}; 
	var finalCall=finalCall||function(){};
	if(window['isRestPath']==true)//test,离线测试
	{ 
		//console.log("GET",apiurl ,methodName,obj,success,err,finalCall);
		get(apiurl+methodName+makeRestfulUrl(obj)+".json",success,err);
	}else if(window['userGet']==true)
	{
		get(apiurl+methodName,obj,success,err);
	}else{
		//console.log("POST",apiurl ,methodName,obj,success,err,finalCall);
		post(apiurl+methodName,obj,success,err);
	}
	
}
function newServerProxy(serverName){
	return new Proxy({}, {
		get:function(target, name, receiver){
			return method.bind(null,serverName+"/"+name);
		}
	});
} 
api=new Proxy({}, {
	get:function(target, name, receiver){
		if(name.endsWith("Server")){
			return newServerProxy(name);
		}
		return method.bind(null,name);
	}	
});

})();