domReady(function(){  
	//加载iframe
	function init(){
		// 
		let menuItems=document.querySelectorAll("#drawerMenu li");
		//绑定菜单点击
		let bindClick=function(menuItem){ 
			for(let it of menuItems){
				if(it!=menuItem){
					it.classList.remove("mdui-list-item-active");
				}
			}
			menuItem.classList.add("mdui-list-item-active");
			titleText.innerText=menuItem.querySelector(".mdui-list-item-content").innerText; 
			loadFrame(menuItem.getAttribute("data-href"));
		};
		let activeItem;
		for(let menuItem of menuItems){
			menuItem.addEventListener("click",bindClick.bind(null,menuItem) ); 
			if(menuItem.classList.contains("mdui-list-item-active")){
				activeItem=menuItem;
			}
		}
		if(activeItem==null){
			progressPanel.style.display="none";
			return;
		} 
		titleText.innerText=activeItem.querySelector(".mdui-list-item-content").innerText; 
		loadFrame(activeItem.getAttribute("data-href"));
	} 
	function loadFrame(src){
		if(src==null){
			progressPanel.style.display="none";
			return;
		}
		//console.log("加载地址",src);
		progressPanel.style.display="block";
		contentPanel.src=src;
	} 
	contentPanel.addEventListener("load",function(){
		progressPanel.style.display="none";
	});
	/**获取用户信息*/ 
	api.userServer.getUserInfo(function(data){
         nameText.innerText=data.name; 
		 init();
		 refreshBtn.addEventListener("click",function(){ 
			 loadFrame(contentPanel.src);
		 });
    });   
	logoutBtn.addEventListener("click",function(){
		api.userServer.logout(function(){},function(){ 
			location.href="./";
		});
	}); 
});