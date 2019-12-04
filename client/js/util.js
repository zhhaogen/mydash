/**最多保留digits位小数 **/
Number.prototype.toMyFixed=function(digits){
	if(digits<=0){
		return s;
	}
	var s=this.toFixed(digits); 
	var i=s.lastIndexOf("."); 
	if(i==-1){//是个整数
		return s;
	}
	var ds=s.substring(i+1);
	//除去0小数
	var limit=ds.length-1;
	while(limit>=0){
		var lastChar=ds.charAt(limit);
		if(lastChar!='0') {
			break;
		}
		limit--;
	} 
	if(limit==-1) {//小数全为0
		limit=-2;//去除小数点
	}
	return s.substring(0, i+limit+2);
};
/**大小转文字*/
function sizeToStr(value){
	if(value<1024){
		return value;
	}
	value=value/1024;
	if(value<1024){
		return value.toMyFixed(2)+"K";
	}
	value=value/1024;
	if(value<1024){
		return value.toMyFixed(2)+"M";
	}
	value=value/1024; 
	return value.toMyFixed(2)+"G"; 
}
/**时间转文字*/
function timeToStr(value){
	if(value<60){
		return value.toMyFixed(2)+"s";
	}
	var m=Math.floor(value/60);//分钟数 
	var s=value-m*60;//秒数
	if(m<60){
		return m+":"+s.toMyFixed(2);
	}
	var h=Math.floor(m/60);//时钟数
	m=m-h*60; 
	if(h<24){
		return h+":"+m+":"+s.toMyFixed(2);
	} 
	var d=Math.floor(h/24);
	h=h-d*24; 
	return d+" "+h+":"+m+":"+s.toMyFixed(2);
}
/**时间转中文文字*/
function timeToChStr(value){
	if(value<60){
		return value.toMyFixed(2)+"秒";
	}
	var m=Math.floor(value/60);//分钟数 
	var s=value-m*60;//秒数
	if(m<60){
		return m+"分"+s.toMyFixed(2)+"秒";
	}
	var h=Math.floor(m/60);//时钟数
	m=m-h*60; 
	if(h<24){
		return h+"小时"+m+"分"+s.toMyFixed(2)+"秒";
	} 
	var d=Math.floor(h/24);
	h=h-d*24; 
	return d+"天"+h+"小时"+m+"分"+s.toMyFixed(2)+"秒";
}
/**温度转文字*/
function tempToStr(value){ 
	return (value/1000).toMyFixed(2)+"°";
}
/**速度转文字*/
function speedToStr(value){
	 
	if(value<1024){
		return value.toMyFixed(2)+"B/s";
	}
	value=value/1024;
	if(value<1024){
		return value.toMyFixed(2)+"KB/s";
	}
	value=value/1024;
	if(value<1024){
		return value.toMyFixed(2)+"MB/s";
	}
	value=value/1024; 
	return value.toMyFixed(2)+"GB/s"; 
}