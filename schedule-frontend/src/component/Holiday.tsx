import React, {useState} from 'react';
import {Calendar, Button, Row, Card, Modal, Tabs, DatePicker, message} from "antd";
import {isHoliday} from "../utils/utils";
import moment from 'moment';
import axios from "axios";

const {TabPane} = Tabs;
const {RangePicker} = DatePicker;

const Holiday = props => {
	const [visible, setVisible] = useState(false);
	const [activeKey, setActiveKey] = useState('range');
	const [date, setDate] = useState<any>([]);
	return (
        <Card>
	        <Row>
		        <Button
		            type='primary'
		            onClick={() => {
		            	setVisible(true);
		            }}
	            >
			        新建
		        </Button>
	        </Row>
	        <Calendar
	            dateCellRender={moment => {
		            if (isHoliday(moment.format('YYYY-MM-DD'))) return '假期'
		            return ''
	            }}
	        />
	        <Modal
		        visible={visible}
		        title='选择假期时间'
		        onCancel={() => {
		        	setVisible(false);
		        }}
		        onOk={() => {
		        	axios({
				        method: 'post',
				        url: '/addHoliday',
				        data: {
				        	type: activeKey,
					        data: date
				        }
			        }).then(({data}) => {
			        	data.code === 1 ?
				            message.success('保存成功') :
					        message.error('保存失败');
				        axios.get('/getHolidayList&Range')
					        .then(({data}) => {
						        for (const dataKey in data) {
							        localStorage.setItem('holiday' + dataKey.substr(0, 1).toUpperCase() + dataKey.substr(1), JSON.stringify(data[dataKey]))
						        }
						        setVisible(false);
						        setDate([moment().format('YYYY-MM-DD')]);
					        });
			        });
		        }}
	        >
		        <Tabs activeKey={activeKey} onChange={(activeKey) => {
		        	if (activeKey === 'list') setDate([moment().format('YYYY-MM-DD')]);
			        else setDate([]);
			        setActiveKey(activeKey);
		        }}>
			        <TabPane tab='选择假期范围' key='range'>
				        <RangePicker
					        allowClear={false}
					        value={date.map(item => moment(item))}
					        onChange={moment => {
						        setDate(moment?.map(item => item?.format('YYYY-MM-DD')))
					        }}
				        />
			        </TabPane>
			        <TabPane tab='选择单日假期' key='list'>
				       <DatePicker
					       allowClear={false}
					       value={moment(date[0])}
					       onChange={moment => {
								setDate([moment?.format('YYYY-MM-DD')])
					       }}
				       />
			        </TabPane>
		        </Tabs>
	        </Modal>
        </Card>
    )
};

export default Holiday;
