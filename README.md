# 一个简单Linux系统监控
这是一个**简单的**、**前后端分离的**、**持续性的**Linux系统监控

事实上，已经有一些不错的系统监控软件，如：[linux-dash](https://github.com/afaqurk/linux-dash "linux-dash")、[netdata](https://github.com/netdata/netdata "netdata")、[zabbix](https://sourceforge.net/projects/zabbix/ "zabbix")等，为什么还要造这个轮子呢？来源于如下需要:
## 需求分析
<ol>
<li>
需要持续性监控系统资源，主要是内存和cpu，不需要太多复杂的功能
</li>
<li>
运行在资源紧缺的机器上，如单片机、最小vps，内存可能都不足250M，需要监控程序尽量少占资源
</li>
<li>
在单片机或路由器上，可能经常重启，断电重启并不自带电池，在同步时间(或断网)之前时间未必是准确的
</li>
</ol>

## 前端演示或截图
这时一个**完全前后端分离**的项目，也就是说仅仅需要一个静态服务容器就可以访问，前端离线演示访问地址[https://zhhaogen.github.io/mydash/client](https://zhhaogen.github.io/mydash/client)

正式使用前，请修改或删除**js\config.js**的内容`apiurl`,~~`userGet`~~,~~`testname`~~,~~`testpwd`~~,~~`isRestPath`~~

## 后端
采用nodejs + sqlite3，下载依赖
```
cd server
npm install
```
单纯记录数据，执行
```
node index.js
```
记录数据和开启http访问服务
```
node http-server.js
```
正式使用前，请修改或删除**http-server.js**的内容`HTTP_PORT`,`TOKEN`

## 修改
- 如果只需要监测内存和cpu?
- 如果需要添加其他系统检查项，如:proc?
- 如果...

请自行修改代码，这个并不是复杂的内容

## 后续改进
- 图表显示合理
- 时间查询
- 使用cpp来编写?