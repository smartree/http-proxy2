# 一个可用于内网穿透的HTTP代理工具

## 需要准备的
一台拥有公网IP的服务器
一台需要内网穿透的客户端

## 原理
1. 在服务器上启动一个HTTP服务器，用于接收用户的请求
2. 服务器和客户端Socket连接。服务器作为Socket的Server端，客户端作为Socekt的Client端
3. Server端将接收到的HTTP请求进行解析，转发到Client端
4. Client端解析收到的Socket数据，并将其转发到需要代理的端口
5. Client向Server端返回数据
6. Server端的HTTP服务器向用户返回数据

<img src="https://raw.githubusercontent.com/zjhch123/http-proxy2/master/assets/demo.png" width="520">

## 难点
1. TCP下的黏包、拆包问题
2. 针对HTTP请求，POST请求，图片请求等解析
3. Socket编程中一些令人意想不到的坑点