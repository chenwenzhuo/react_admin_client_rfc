//用于修改antd默认配置
const CracoLessPlugin = require('craco-less');

module.exports = {
    //按需加载
    babel: {
        plugins: [[
            "import",
            {
                "libraryName": "antd",
                "libraryDirectory": "es",
                "style": true//设置为true即是less 这里用的是css
            }
        ]]
    },
    //配置主题
    plugins: [
        {
            plugin: CracoLessPlugin,
            options: {
                lessLoaderOptions: {
                    lessOptions: {
                        modifyVars: {'@primary-color': '#1DA57A'},
                        javascriptEnabled: true,
                    },
                },
            },
        },
    ],
};