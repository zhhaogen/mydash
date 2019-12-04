var apiurl="./api/";   
var userGet=true;
var testname="admin";
var testpwd="12345678";
var isRestPath=true;

if(localStorage.apiurl!=null){
	apiurl=	localStorage.apiurl;
}
if(localStorage.isRestPath!=null){
	window["isRestPath"]="true"==localStorage.isRestPath;
}