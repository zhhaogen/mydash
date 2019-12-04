/**
 *一个基础的工具js
 * @author zhg 
 */
/**
*简单的提示,用window.alert
*/
function tip(msg){
   // window.alert(msg );
   mdui.snackbar(msg);
}
/**
*null转为空字符串
*/
function notNullString(str){
	return str==null?"":str;
}
/**
*dom可以被操作了,但css、js、图像等可能未完全加载
*/
function domReady(init){
	if(init){
		if(document.readyState=="interactive"||document.readyState=="complete")
		{
			init();
		}else{
			document.addEventListener("DOMContentLoaded",init);
		}
		
	}
}
/**
*拼接数据,Object的key-value
*/
function makeDataStr(obj)
{
    var eles = Object.keys(obj);
    var data = "";
    for (var i = 0; i < eles.length; i++)
    {
        var ele = eles[i];
		var value=obj[ele];
		if(Array.isArray(value))
		{
			for(var i=0;i<value.length;i++)
			{
				data = data + encodeURIComponent(ele) + "=" + encodeURIComponent(value[i]) + "&";
			}
		}else if(value!=null)
		{
			data = data + encodeURIComponent(ele) + "=" + encodeURIComponent(value) + "&";
		} 
    } 
    return data;
}
/**
*拼接数据,FormData的key-value
*/
function makeFormDataStr(frt)
{ 
    var data = "";
    for (var key of frt.keys()) 
	{
		var value=frt.get(key);
		if(Array.isArray(value))
		{
			for(var i=0;i<value.length;i++)
			{
				data = data + encodeURIComponent(key) + "=" + encodeURIComponent(value[i]) + "&";
			}
		}else if(value!=null)
		{
			data = data + encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
		}  
	}
	
    return data;
}
/**
 *  post方式提交内容,返回json,使用方法:
 *  post(url)
 *  post(url,data)
 *  post(url,data,success)
 *  post(url,data,success,err)
 *  post(url,success)
 *  post(url,success,err)
 */
function post()
{
    var url;
    var data;
    var success;
    var error;
    url = arguments[0];
    var urlencoded=false;
    if (typeof (arguments[1]) == "string")
    {
        data = arguments[1];
        success = arguments[2];
        error = arguments[3];
        urlencoded=true;
    }else if (arguments[1] instanceof FormData)
    {
        data = makeFormDataStr(arguments[1]);
        success = arguments[2];
        error = arguments[3];
    }else if (typeof (arguments[1]) == "object")
    {
        data =makeDataStr(arguments[1]);
        success = arguments[2];
        error = arguments[3];
		urlencoded=true;
    } else if (typeof (arguments[1]) == "function")
    {
        success = arguments[1];
        error = arguments[2];
    }
    var req = new XMLHttpRequest();
    req.open("post", url);
    if(urlencoded)
    {
      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    req.responseType = "json";
	req.withCredentials=true;
    req.onload = function ()
    {
        if (req.status === 200)
        {
            if (success)
            { 
                if (typeof (req.response) === "string")
                {
                    success(JSON.parse(req.response));
                } else
                {
                    success(req.response);
                }
            }
        } else
        {
            if (error)
            {
                error(req.statusText);
            }
        }

    };
    req.onerror = function (err)
    {
        if (error)
        {
            error(err);
        }
    };
	if(data==null)
	{
		 req.send();
	}else
	{
		 req.send(data);
	}
   
}
/**
 *  get方式提交内容,使用方法:
 *  get(url)
 *  get(url,data)
 *  get(url,data,success)
 *  get(url,data,success,err)
 *  get(url,success)
 *  get(url,success,err)
 */
function get()
{
    var url;
    var data;
    var success;
    var error;
    url = arguments[0];
    var urlencoded=false;
    if (typeof (arguments[1]) == "string")
    {
        data = arguments[1];
		if(data[0]=="?")//除去前置'?'
		{
			data=data.substr(1);
		}
        success = arguments[2];
        error = arguments[3];
        urlencoded=true;
    }else if (arguments[1] instanceof FormData)
    {
        data = arguments[1];
        success = arguments[2];
        error = arguments[3];
    }else if (typeof (arguments[1]) == "object")
    {
        data =makeDataStr(arguments[1]);
        success = arguments[2];
        error = arguments[3];
		urlencoded=true;
    } else if (typeof (arguments[1]) == "function")
    {
        success = arguments[1];
        error = arguments[2];
    }
	//合并data到url中
	if(data!=null)
	{ 
		if(url.indexOf("?")!=-1)
		{
			url=url+"&"+data;
		}else
		{
			url=url+"?"+data;
		}		
	}
    var req = new XMLHttpRequest();
    req.open("get", url);
    if(urlencoded)
    {
      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    req.responseType = "json";
	req.withCredentials=true;
    req.onload = function ()
    {
        if (req.status === 200)
        {
            if (success)
            { 
                if (typeof (req.response) === "string")
                {
                    success(JSON.parse(req.response));
                } else
                {
                    success(req.response);
                }
            }
        } else
        {
            if (error)
            {
                error(req.statusText);
            }
        }

    };
    req.onerror = function (err)
    {
        if (error)
        {
            error(err);
        }
    };
    req.send(); 
} 