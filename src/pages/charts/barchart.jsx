import React, {useState} from 'react';
import {Card, Button} from "antd";
import ReactECharts from 'echarts-for-react';

function BarChart() {
    const [sales, setSales] = useState([5, 20, 36, 10, 10, 20, 27]);
    const [storages, setStorages] = useState([23, 67, 9, 12, 50, 21, 49]);

    function updateData() {
        setSales(sales => sales.map(sale => sale + 1));
        setStorages(storages => storages.map(storage => storage - 1));
    }

    function getOption() {
        return {
            title: {text: 'Echarts示例'},
            tooltip: {},
            legend: {data: ['销量', '库存']},
            xAxis: {data: ['衬衫', '羊毛衫', '雪纺衫', '牛仔裤', '衬衫', '高跟鞋', '袜子']},
            yAxis: {},
            series: [
                {name: '销量', type: 'bar', data: sales},
                {name: '库存', type: 'bar', data: storages},
            ]
        }
    }

    return (
        <>
            <Card>
                <Button type={'primary'} onClick={updateData}>更新</Button>
            </Card>
            <Card title={'柱状图'}>
                <ReactECharts option={getOption()} style={{height: 400}} opts={{renderer: 'svg'}}/>
            </Card>
        </>
    );
}

export default BarChart;