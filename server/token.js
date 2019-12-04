const crypto = require("crypto");
const {createDirIfNotExist,getSetting,putSetting,isEmpty}=require("./base.js"); 
//随机密钥
const KEY = getSetting("KEY","");
//32位填充
const FILL="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

/**加密*/
function encode(str,passwd){
	let _passwd=(passwd+FILL).substr(0,32);
	let cipher = crypto.createCipheriv("aes-256-ecb", _passwd, KEY);
	cipher.setAutoPadding(true);
	let hash = cipher.update(str, "utf8", "base64");
    hash += cipher.final("base64");
	//console.log("原文",str,"密码",_passwd,"密文",hash);
	return hash;
}
/**解密*/
function decode(hash,passwd){
	let _passwd=(passwd+FILL).substr(0,32);
	let cipher = crypto.createDecipheriv("aes-256-ecb", _passwd, KEY);
	cipher.setAutoPadding(true);
	let str = cipher.update(hash, "base64", "utf8");
    str += cipher.final("utf8");
	//console.log("密文",hash,"密码",_passwd,"原文",str);
	return str;
}

function createToken(data,passwd){
	data["time"]=Date.now();
	let str=JSON.stringify(data);
	return encode(str,passwd);
}

function getToken(token,passwd){ 
	try{
		let str=decode(token,passwd);
		return JSON.parse(str);
	}catch(err){
		
	}
	
}
//let hash=encode("ddddddddddddddddd","12345670");
//decode("xxx","12345670");

module.exports = {createToken,getToken};