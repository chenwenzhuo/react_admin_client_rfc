const {createProxyMiddleware} = require('http-proxy-middleware')

module.exports = function (app) {
    app.use(createProxyMiddleware('/ajaxProxy', {  //ajaxProxy是需要转发的请求前缀(所有带有/ajaxProxy前缀的请求都会转发给5001)
            target: 'http://localhost:5001', //配置转发目标地址(能返回数据的服务器地址)
            changeOrigin: true, //控制服务器接收到的请求头中host字段的值
            /*
                changeOrigin设置为true时，服务器收到的请求头中的host为：localhost:5000
                changeOrigin设置为false时，服务器收到的请求头中的host为：localhost:3000
                changeOrigin默认值为false，但我们一般将changeOrigin值设为true
            */
            pathRewrite: {'^/ajaxProxy': ''} //去除请求前缀，保证交给后台服务器的是正常请求地址(必须配置)
        }),
        createProxyMiddleware('/weatherProxy', {
            target: 'https://api.map.baidu.com',
            changeOrigin: true,
            pathRewrite: {'^/weatherProxy': ''}
        }));
}
