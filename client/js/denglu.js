domReady(function(){
    apiText.value=apiurl;
	restPathCheck.checked=window['isRestPath']==true;
	if(window['testname']!=null){
        nameText.value=window['testname']; 
    }
    if(window['testpwd']!=null){
        passwdText.value=window['testpwd']; 
	}  
    dengluBtn.addEventListener("click",function(){  
		if(apiText.value==""){
			tip(apiText.placeholder);
			return;
		}
		localStorage["apiurl"]=apiText.value;
		window["apiurl"]=apiText.value;
		
		localStorage["isRestPath"]=restPathCheck.checked;
		window["isRestPath"]=restPathCheck.checked;
		
		let data={
			name:nameText.value,
			passwd:passwdText.value
		};
		if(data.name==""){
			tip(nameText.placeholder);
			return;
		}
		if(data.passwd==""){
			tip(passwdText.placeholder);
			return;
		}
        api.userServer.login(data,function(){
            location.href="./guanli";
        }); 
    });
});