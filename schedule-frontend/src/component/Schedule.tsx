import React, {useEffect, useState} from 'react';
import {Badge, Calendar, Card, Row, Col, Select} from "antd";
import moment from "moment";
import axios from "axios";
import {isHoliday} from "../utils/utils";

interface IProps {
	data?: any,
	term?: any
	setTerm?: any
	teacher?: any
	setTeacher?: any
	teacherColor?: any
	off: Boolean
}

const {Option} = Select;

let cancel: any = [];

const Schedule: React.FC<IProps> = (props) => {
	const {
		data: propData,
		term,
		setTerm,
		teacher,
		setTeacher,
		teacherColor
	} = props;
	const [allTermList, setAllTermList] = useState([]);
	const [termMessage, setTermMessage] = useState({
		start: '',
		end: ''
	});
	const [date, setDate] = useState(moment());
	const [lessonColor, setLessonColor] = useState({});
	const calendar = e => {
		e.stopPropagation();
		const {keyCode} = e;
		switch (keyCode) {
			case 37:
				setDate(moment(date.subtract(1, 'month')))
				break
			case 39:
				setDate(moment(date.add(1, 'month')))
				break
		}
	};
	useEffect(() => {
		axios.get('/getTerm', {
			cancelToken: new axios.CancelToken((c) => {
				cancel.push(c);
			})
		})
			.then(({data}) => {
				// @ts-ignore
				setAllTermList(['全部', ...data]);
			})
			.catch(e => {
			});
		axios.get('/getLessonColor', {
			cancelToken: new axios.CancelToken((c) => {
				cancel.push(c);
			})
		})
			.then(({data}) => {
				setLessonColor(data.data)
			})
			.catch(e => {
			});
		return () => {
			cancel.forEach(item => {
				item && item();
			});
		}
	}, []);
	useEffect(() => {
		if (props.off) {
			window.onkeydown = null
		} else {
			window.onkeydown = calendar
		}
		return () => {
			window.onkeydown = null
		}
	}, [props.off])
	useEffect(() => {
		let cancel: any = null;
		if (term !== '全部') {
			axios.get(`/getTermMessage?term=${term}`, {
				cancelToken: new axios.CancelToken((c) => {
					cancel = c;
				})
			})
				.then(({data}) => {
					// @ts-ignore
					setTermMessage({...data});
				})
		}
		return () => {
			cancel && cancel();
		}
	}, [term])
	return (
		<div id='calendar'>
			<Row style={{padding: '20px'}}>
				<Col span={8}>
					<span>
						期数：
					</span>
					<Select style={{width: '150px'}} value={term} onChange={(val) => {
						setTerm(val);
					}}>
						{
							allTermList.map(term => <Option key={term} value={term}>{term}</Option>)
						}
					</Select>
					{
						term !== '全部' &&
						<div style={{display: 'inline-block'}}>
							<span>
								当期信息：{moment(termMessage.start).format('YYYY-MM-DD')} 至{moment(termMessage.end).format('YYYY-MM-DD')}
							</span>

						</div>
					}
				</Col>
				<Col span={8}>
					<span>
						讲师：
					</span>
					<Select style={{width: '150px'}} value={teacher} onChange={(val) => {
						setTeacher(val);
					}}>
						{
							['全部', ...Object.keys(teacherColor)].map(teacher => <Option key={teacher} value={teacher}>{teacher}</Option>)
						}
					</Select>
				</Col>
			</Row>
			<Calendar
				onSelect={val => {
					setDate(val)
				}}
				value={date}
				className='scheduleCalendar'
				dateCellRender={(date) => {
					if (propData?.[moment(date).format('YYYY-MM-DD')]) {
						return propData[moment(date).format('YYYY-MM-DD')].map(item => (
							<Card key={item.term} style={{
								height: `${300 / propData[moment(date).format('YYYY-MM-DD')].length}px`,
								backgroundColor: teacherColor[item.teacher]
							}}>
								<div>
									{item.teacher}: {item.lesson}
								</div>
								<div>
									{<Badge style={{backgroundColor: lessonColor[item.term]}} count={item.term}/>}
								</div>
							</Card>
						))
					} else if (isHoliday(date) || (moment(date).weekday() === 6)) {
						return <div
							style={{
								textAlign: 'center',
								lineHeight: '300px'
							}}
						>
							放假
						</div>
					} else {
						return ''
					}
				}}
				// value={day}
				// onPanelChange={value => {
				// 	setDay(value as Moment);
				// }}
			/>
		</div>
	);
};

export default Schedule;
