import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import moment from "moment";
import {
	Button,
	message,
	Modal,
	Steps,
	Form,
	Input,
	DatePicker,
	List,
	InputNumber,
	Select
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { getLessonDay } from "../utils/utils";

const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 8 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 16 },
	},
};

const steps = ['设置基本信息', '设置讲师信息', '调整课程时间', '完成'];

let lessonModule: any = {
	'es6基础': 1,
	'面向对象': 4,
	'es6高阶': 2,
	'promise原理': 1,
	'git': 1,
	'函数式编程': 1,
	'node': 4,
	'前后端交互': 4,
	'webpack': 2,
	'vue2.0': 6,
	'vue3.0': 4,
	'react': 8,
	'移动端': 2,
	'd3': 2,
	'echarts': 3,
	'小程序': 4,
	'面试': 4
};
lessonModule = Object.entries(lessonModule);
console.log('lessonModule', lessonModule);

function getTeacher(lesson, lessonTeacher) {
	let teacher = '';
	for (const teacherListKey in lessonTeacher) {
		const match = lesson.match(new RegExp(teacherListKey));
		match && (teacher = match[0]);
	}
	return lessonTeacher[teacher]
}

let lessonTeacher: any = {
	'es6基础': '海哥哥',
	'面向对象': '海哥哥',
	'es6高阶': '海哥哥',
	'promise原理': '海哥哥',
	'git': '海哥哥',
	'函数式编程': '海哥哥',
	'node': '钟老师',
	'前后端交互': '钟老师',
	'webpack': '钟老师',
	'vue': '效瑞老师',
	'react': '莫莫',
	'移动端': '彭小龙',
	'd3': '李伟老师',
	'echarts': '李伟老师',
	'小程序': '李伟老师',
	'面试': '不知道'
};
const teacherList = ['不知道', '钟老师', '莫莫', '效瑞老师', '海哥哥', '李伟老师', '彭小龙'];
let createLessonData = (data, startDate, term, parity, lessonTeacher) => {
	let realData: any[] = [];
	Object.entries(data).forEach(item => {
		// @ts-ignore
		for (let i = 1; i <= item[1]; i++) {
			realData.push(item[0] + '-' + 0 + i);
		}
	});
	// @ts-ignore
	let lessonDays = getLessonDay(startDate, parity, Object.values(data).reduce((prev, now) => prev as number + now as number));
	return Object.fromEntries(lessonDays.map((item, index) => [
		[item],
		[{ lesson: realData[index], teacher: getTeacher(realData[index], lessonTeacher), term }]
	]));
}

const LessonChange = props => {
	const [disabled, setDisabled] = useState(false);
	const [term, setTerm] = useState(localStorage.getItem('term') || '');
	const [date, setDate] = useState(moment(localStorage.getItem('date') || new Date()));
	const [parity, setParity] = useState(JSON.parse(localStorage.getItem('parity') || '[]'));
	const [lessonData, setLessonData] = useState(JSON.parse(localStorage.getItem('data') || JSON.stringify(lessonModule)));
	const [loading, setLoading] = useState(false);
	const [current, setCurrent] = useState(Number(localStorage.getItem('current')) || 0);
	const [list, setList] = useState(JSON.parse(localStorage.getItem('list') || JSON.stringify(lessonTeacher)));
	const { visible, setVisible, addLesson, getData, setData, term: propTerm, teacher } = props;
	useEffect(() => {
		localStorage.setItem('data', JSON.stringify(lessonData));
	}, [lessonData]);
	useEffect(() => {
		let parity = (((moment(date).weekday() + 1) % 2 === 0) && ((moment(date).weekday() + 1) >= 1 && (moment(date).weekday() + 1) <= 6)) ? [2, 4, 6] : [1, 3, 5];
		setParity(parity);
	}, [date]);
	return (
		<Modal
			visible={visible}
			onCancel={() => {
				setVisible(false);
			}}
			width={620}
			footer={<div>
				{
					current > 0 &&
					<Button
						type='primary'
						onClick={() => {
							let num = current;
							setCurrent(--num);
						}}
					>
						上一步
						</Button>
				}
				{
					current < 2 ?
						<Button
							onClick={() => {
								setVisible(false);
							}}
						>
							关闭
						</Button> :
						''
				}
				<Button
					disabled={disabled}
					type='primary'
					onClick={async () => {
						switch (current) {
							case 0:
								setCurrent(1);
								break;
							case 1:
								setCurrent(2);
								break;
							case 2:
								setDisabled(true);
								setLoading(true);
								const { data } = await addLesson({
									term,
									data: createLessonData(Object.fromEntries(lessonData), date, term, parity, list)
								});
								message[data?.code ? 'success' : 'error'](data?.msg);
								setDisabled(false);
								setLoading(false);
								setCurrent(3);
								break;
							case 3:
								getData(setData, propTerm, teacher);
								setCurrent(0);
								setVisible(false);
								setTerm('');
								setLessonData(lessonModule);
								setDate(moment());
								setParity([]);
								setList({});
								localStorage.clear();
						}
						if (current !== 3) {
							localStorage.setItem('current', (current + 1).toString());
							localStorage.setItem('term', term);
							localStorage.setItem('parity', JSON.stringify(parity));
							localStorage.setItem('list', JSON.stringify(list));
							localStorage.setItem('date', date.toString());
						}
					}}
				>
					{
						current < 2 ?
							'下一步' :
							current === 2 ?
								'提交' :
								'完成'
					}
				</Button>
			</div>}
		>
			<div style={{ padding: 20 }}>
				<Steps
					current={current}
				>
					{
						steps.map(item => (
							<Steps.Step
								icon={(loading && (item === '调整课程时间')) ? <LoadingOutlined /> : ''}
								key={item}
								title={item}
							/>
						))
					}
				</Steps>
				<div style={{ marginTop: 30 }}>
					<DragDropContext
						onDragEnd={end => {
							// 事情在这里搞 end就行 里面有source是从哪里来 destination是去哪儿 然后对数据处理一下看看能不能行
							let data = lessonData.map(item => [...item]);
							data.splice(end.destination?.index, 0, data.splice(end.source?.index, 1)[0]);
							setLessonData(JSON.parse(JSON.stringify(data)));
						}}
					>
						{
							!current && (
								<Form {...formItemLayout}>
									<Form.Item label="期数">
										<Input value={term} onChange={(e) => {
											setTerm(e.target.value);
										}} />
									</Form.Item>
									<Form.Item label="课程起始时间">
										<DatePicker value={date} onChange={date => {
											// @ts-ignore
											setDate(date);
										}} />
									</Form.Item>
									<Form.Item label="上课时间">
										<Select
											value={JSON.stringify(parity) === '[]' ? '' : JSON.stringify(parity)}
											onChange={val => {
												// @ts-ignore
												setParity(JSON.parse(val));
											}}
										>
											<Select.Option
												value='[1,3,5]'
											>
												一三五上课
											</Select.Option>
											<Select.Option
												value='[2,4,6]'
											>
												二四六上课
											</Select.Option>
										</Select>
									</Form.Item>
								</Form>
							)
						}
						{
							current === 1 && (
								<Form {...formItemLayout}>
									{
										Object.entries(list).map(item => (
											<Form.Item label={item[0]} key={item[0]}>
												{
													// @ts-ignore
													<Select value={item[1]} onChange={(val) => {
														let data = Object.entries(list);
														data = data.map(data => {
															if (data[0] !== item[0]) {
																return data;
															} else {
																return [data[0], val];
															}
														})
														setList(Object.fromEntries(data));
													}}>
														{
															teacherList.map(item => (
																<Select.Option
																	key={item}
																	value={item}
																>
																	{item}
																</Select.Option>
															))
														}
													</Select>
												}
											</Form.Item>
										))
									}
								</Form>
							)
						}
						{
							current === 2 && (
								<Droppable
									droppableId='1'
								>
									{
										provided => (
											<div
												ref={provided.innerRef}
												{...provided.droppableProps}
											>
												<List>
													{
														lessonData?.map((item, index) => (
															<Draggable
																// @ts-ignore
																draggableId={item[0]}
																index={index}
																// @ts-ignore
																key={item[0]}
															>
																{(provided1, snapshot) => (
																	<div
																		ref={provided1.innerRef}
																		{...provided1.draggableProps}
																		{...provided1.dragHandleProps}
																	>
																		<List.Item
																			actions={[<InputNumber
																				// @ts-ignore
																				value={item[1]}
																				onChange={(val) => {
																					let data = lessonData.map(item => [...item]);
																					data[index][1] = val;
																					setLessonData(data);
																				}}
																			/>]}
																		>
																			{
																				// @ts-ignore
																				item[0]
																			}

																		</List.Item>
																	</div>
																)}
															</Draggable>
														))
													}
												</List>
												{provided.placeholder}
											</div>

										)
									}
								</Droppable>
							)
						}
					</DragDropContext>
				</div>
			</div>
		</Modal>
	)
};

export default LessonChange;
