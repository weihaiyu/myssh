import React, {useEffect, useState} from 'react';
import {Form, Input, Popover, Button, Modal, message} from "antd";
import {SketchPicker} from 'react-color';
import axios from "axios";

interface Iprops {
	type: string
}

const formItemLayout = {
	labelCol: {
		xs: {span: 24},
		sm: {span: 4},
	},
	wrapperCol: {
		xs: {span: 24},
		sm: {span: 20},
	},
};

const colorChange = (color) => {
	var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
	var sColor = color.toLowerCase();
	if (sColor && reg.test(sColor)) {
		if (sColor.length === 4) {
			var sColorNew = "#";
			for (let i = 1; i < 4; i += 1) {
				sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
			}
			sColor = sColorNew;
		}
		var sColorChange = [];
		for (let i = 1; i < 7; i += 2) {
			// @ts-ignore
			sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
		}
		return {r: sColorChange[0], g: sColorChange[1], b: sColorChange[2], a: 1};
	} else {
		return sColor;
	}
};

const Teacher: React.FC<Iprops> = props => {
	const {type} = props;
	const [data, setData] = useState({});
	const [visible, setVisible] = useState(false);
	const [teacher, setTeacher] = useState('');
	const [count, setCount] = useState(0);
	useEffect(() => {
		axios.get(`/get${type}Color`)
			.then(({data}) => {
				setData(data.data);
			});
	}, [count, type]);
	const setColor = (item, value) => {
		let cloneData = JSON.parse(JSON.stringify(data));
		cloneData = Object.fromEntries(Object.entries(cloneData)
			.map(data => {
				if (data[0] === item) {
					return [item, value];
				} else {
					return data;
				}
			})
		)
		setData(cloneData);
	};
	return (
		<div>
			<div>
				<Button
					onClick={() => {
						setVisible(true);
					}}
				>
					{type === 'Teacher' ? '添加讲师' : '添加课程'}
				</Button>
			</div>
			<Form {...formItemLayout}>
				{
					Object.entries(data)?.map(item => (
						<Form.Item
							label={item[0]}
							key={item[0]}
						>
							<Input.Group
								compact={true}
							>
								<Input
									// @ts-ignore
									value={item[1]}
									onChange={(e) => {
										let value = e.target.value;
										setColor(item[0], value);
									}}
									addonAfter={<Popover
										placement="bottom"
										trigger="click"
										content={
											<SketchPicker
												color={colorChange(item[1])}
												// @ts-ignore
												onChange={(color) => {
													// @ts-ignore
													let value = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
													setColor(item[0], value);
												}}
												onChangeComplete={(color) => {
													// @ts-ignore
													let value = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
													setColor(item[0], value);
												}}
											/>
										}
									>
										<Button type='primary'>
											选择颜色
										</Button>
									</Popover>}
								/>
							</Input.Group>
						</Form.Item>
					))
				}
			</Form>
			<Modal
				title={type === 'Teacher' ? '添加讲师' : '添加课程'}
				visible={visible}
				onOk={() => {
					setData({...data, [teacher]: '#fff'});
					setTeacher('');
					setVisible(false);
				}}
				onCancel={() => {
					setVisible(false);
				}}
			>
				<Input
					value={teacher}
					onChange={e => {
						setTeacher(e.target.value)
					}}
				/>
			</Modal>
			<div style={{textAlign: 'right'}}>
				<Button
					type='primary'
					onClick={() => {
						axios({
							method: 'post',
							url: `/update${type}Color`,
							data: {
								data
							}
						}).then(() => {
							let num = count;
							setCount(++num);
							message.success('保存成功');
						});
					}}
				>
					保存
				</Button>
			</div>
		</div>
	)
};

export default Teacher;
