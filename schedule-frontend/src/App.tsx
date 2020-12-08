import React, {useState, useEffect, useMemo, useRef} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import './App.css';
import {
	Layout,
	Button,
	Modal,
	Form,
	Select,
	Input,
	DatePicker,
	Radio,
	Carousel
} from "antd";
import Schedule from "./component/Schedule";
import axios from "axios";
import LessonChange from "./component/LessonChange";
import Teacher from "./component/Teacher";
import moment, {Moment} from 'moment';
import {downloadExl, isHoliday, returnWeekday, throttle, translateData} from "./utils/utils";
import MenuList from "./component/MenuList";
import CalcTime from "./component/CalcTime";
import Holiday from "./component/Holiday";

const {Header, Sider, Content} = Layout;

let cancel: any = [];

let addLesson = (data) => {
	return axios({
		method: 'post',
		url: 'addTerm',
		data
	});
};

axios.defaults.baseURL = '/api/';

function getData(setData, term, teacher) {
	axios.get(`/getData?term=${term}&teacher=${teacher}`, {
		cancelToken: new axios.CancelToken((c) => {
			cancel.push(c);
		})
	})
		.then(({data}) => {
			if (data.code) {
				setData(data.data);
			}
		});
}

const formItemLayout = {
	labelCol: {
		xs: {span: 24},
		sm: {span: 8},
	},
	wrapperCol: {
		xs: {span: 24},
		sm: {span: 16},
	},
};

function addAllDay(now, end, data) {
	function loop(now) {
		now = moment(now)
		if (moment(now).format('YYYY-MM-DD') === moment(end).format('YYYY-MM-DD')) return;
		data[moment(now).format('YYYY-MM-DD')] = data[moment(now).format('YYYY-MM-DD')] || [];
		now.add(1, 'd');
		loop(now);
	}
	
	loop(now);
}

const docs = [
	'首页',
	'放假时间管理',
	'新建假期',
	'添加课程-设置基本',
	'添加课程-设置讲师',
	'添加课程-调整课程',
	'添加单节课程',
	'讲师管理',
	'课程管理'
]

const App: React.FC = () => {
	const [term, setTerm] = useState('全部');
	const [teacher, setTeacher] = useState('全部');
	const [visible, setVisible] = useState(false);
	const [exportVisible, setExportVisible] = useState(false);
	const [singleVisible, setSingleVisible] = useState(false);
	const [singleData, setSingleData] = useState({
		term: '',
		date: moment().format('YYYY-MM-DD'),
		teacher: '',
		lesson: '',
		replace: false
	});
	const [exportTerm, setExportTerm] = useState('');
	const [allTermList, setAllTermList] = useState([]);
	const [teacherColor, setTeacherColor] = useState({});
	const [data, setData] = useState();
	const [off, setOff] = useState(false);
	const banner = useRef<any>(null);
	const page = ({keyCode}) => {
		switch (keyCode) {
			case 37:
				banner.current.prev()
				break
			case 39:
				banner.current.next()
				break
		}
	};
	useEffect(() => {
		axios.get('/getTeacherColor', {
			cancelToken: new axios.CancelToken((c) => {
				cancel.push(c);
			})
		})
			.then(({data}) => {
				setTeacherColor(data.data)
			})
			.catch(e => {
			});
		axios.get('/getHolidayList&Range')
			.then(({data}) => {
				for (const dataKey in data) {
					localStorage.setItem('holiday' + dataKey.substr(0, 1).toUpperCase() + dataKey.substr(1), JSON.stringify(data[dataKey]))
				}
			});
	}, []);
	useEffect(() => {
		getData(setData, term, teacher);
		axios.get('/getTerm', {
			cancelToken: new axios.CancelToken((c) => {
				cancel.push(c);
			})
		})
			.then(({data}) => {
				// @ts-ignore
				setAllTermList([...data]);
			});
		return () => {
			cancel.forEach(item => {
				item && item();
			})
		}
	}, [term, teacher]);
	const memorized = useMemo(() => () => (
		<div>
			<Schedule
				off={off}
				data={data}
				term={term}
				setTerm={setTerm}
				teacher={teacher}
				setTeacher={setTeacher}
				teacherColor={teacherColor}
			/>
		</div>
	), [data, term, teacher, teacherColor, off])
	return (
		<Layout className="App">
			<Header className='header'>
				<div style={{float: 'left'}}>
					<img src={require('./img/img_kaikeba_logo_blue_new.png')} height={52} alt=''/>
				</div>
				<div style={{float: 'right'}}>
					<Button
						style={{marginRight: 20}}
						type='primary'
						onClick={() => {
							setVisible(true);
						}}
					>
						添加课程
					</Button>
					{/*<Button
						type='primary'
						onClick={() => {
							setVisible(true);
						}}
					>
						编辑课程
					</Button>*/}
					<Button
						style={{marginRight: 20}}
						type='primary'
						onClick={() => {
							setSingleVisible(true)
						}}
					>
						添加单节课程
					</Button>
					<Button
						style={{marginRight: 20}}
						type='primary'
						danger
						onClick={() => {
							setExportVisible(true);
						}}
					>
						导出
					</Button>
					<Button
						type='default'
						danger
						onClick={() => {
							window.addEventListener('keydown', page);
							setOff(true)
							
							Modal.info({
								title: '使用文档',
								content: <Carousel ref={banner}>
									{
										docs.map(item => <div key={item}>
											<div style={{
												width: '100%',
												height: '80vh',
												background: `url(${require('./img/' + item + '.png')})`,
												backgroundSize: '100% 100%'
											}}/>
										</div>)
									}
								</Carousel>,
								width: '100%',
								onOk() {
									setOff(false)
									window.removeEventListener('keydown', page)
								}
							})
						}}
					>
						使用文档
					</Button>
				</div>
			</Header>
			<Layout>
				<Sider>
					<MenuList/>
				</Sider>
				<Content
					style={{
						padding: 24,
						margin: 0,
						minHeight: 'calc(100vh - 64px)'
					}}
				>
					<Switch>
						<Route
							path='/schedule'
							exact
							render={memorized}
						/>
						<Route
							path='/teacher'
							exact
							component={() => (
								<Teacher
									type='Teacher'
								/>
							)}
						/>
						<Route
							path='/lesson'
							exact
							component={() => (
								<Teacher
									type='Lesson'
								/>
							)}
						/>
						<Route
							path='/calculate'
							exact
							component={() => (
								<CalcTime/>
							)}
						/>
						<Route
							path='/holiday'
							exact
							component={() => (
								<Holiday/>
							)}
						/>
						<Redirect from='/' to='/schedule'/>
					</Switch>
				</Content>
			</Layout>
			<LessonChange
				visible={visible}
				setVisible={setVisible}
				addLesson={addLesson}
				teacher={teacher}
				term={term}
				getData={getData}
				setData={setData}
			/>
			<Modal
				title='导出课程表'
				visible={exportVisible}
				onCancel={() => {
					setExportVisible(false);
				}}
				onOk={() => {
					axios.get(`/getData?term=${exportTerm}&teacher=全部`)
						.then(({data}) => {
							let arr = [];
							let res = data.data;
							let first = moment(Object.entries(res)[0][0]);
							let end = Object.entries(res)[Object.entries(res).length - 1][0];
							let firstWeekday = first.weekday();
							addAllDay(first, end, res);
							for (let i = 0; i < firstWeekday; i++) {
								let subtract = moment(first);
								subtract.subtract(i + 1, 'd');
								res[subtract.format('YYYY-MM-DD')] = [];
							}
							let entryRes = Object.entries(res);
							entryRes = entryRes.sort((a, b) => moment(a[0]).isBefore(moment(b[0])) ? -1 : 1);
							while (entryRes.length) {
								// @ts-ignore
								arr.push(entryRes.splice(0, 7));
							}
							// @ts-ignore
							if (arr[arr.length - 1].length < 7) {
								let pushArr: any = [];
								// @ts-ignore
								for (let i = 0; i < 7 - arr[arr.length - 1].length; i++) {
									// @ts-ignore
									let time = moment(arr[arr.length - 1][arr[arr.length - 1].length - 1][0]);
									time.add(i + 1, 'd');
									pushArr.push([time.format('YYYY-MM-DD'), []]);
								}
								pushArr.forEach(item => {
									// @ts-ignore
									arr[arr.length - 1].push(item);
								})
							}
							// @ts-ignore
							arr = arr.map(item => {
								let dateData = {};
								let weekData = {};
								let lessonData = {};
								// @ts-ignore
								item.forEach((child, index) => {
									let weekday: string = returnWeekday(index) as string;
									dateData[weekday] = child[0];
									weekData[weekday] = weekday;
									lessonData[weekday] = child[1].length ? child[1][0].lesson : isHoliday(child[0]) ? '放假' : '';
								})
								return [dateData, weekData, lessonData]
							});
							arr = arr.flat();
							let result = downloadExl(arr, 'xlsx');
							let a = document.createElement('a');
							a.download = `${exportTerm}.xlsx`;
							a.href = result.href;
							a.click();
							result.revoke();
						});
				}}
			>
				<Form {...formItemLayout}>
					<Form.Item label='选择导出课程期数'>
						<Select
							value={exportTerm}
							onChange={(val) => {
								setExportTerm(val);
							}}
						>
							{
								allTermList.map(item => (
									<Select.Option
										key={item}
										value={item}
									>
										{item}
									</Select.Option>
								))
							}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
			<Modal
				title='添加单节课程'
				visible={singleVisible}
				onCancel={() => {
					setSingleVisible(false)
				}}
				onOk={() => {
					axios({
						method: 'post',
						url: '/addSingleLesson',
						data: singleData
					})
						.then(() => {
							getData(setData, term, teacher);
							setSingleVisible(false)
						})
				}}
			>
				<Form {...formItemLayout}>
					{
						Object.keys(singleData).map(item => <Form.Item key={item} label={translateData(item)}>
							{
								item === 'date' ?
									<DatePicker
										value={moment(singleData[item])}
										onChange={(val) => {
											setSingleData({...singleData, date: (val as Moment).format('YYYY-MM-DD')});
										}}
									/> :
									''
							}
							{
								item === 'lesson' ?
									<Input
										value={singleData[item] as string}
										// @ts-ignore
										onChange={throttle(({target: {value}}) => {
											setSingleData({...singleData, lesson: value});
										})}
									/> :
									''
							}
							{
								(item === 'term' || item === 'teacher') ?
									<Select
										value={singleData[item] as string}
										onChange={(val) => {
											setSingleData({...singleData, [item]: val});
										}}
									>
										{
											(item === 'term' ? allTermList : Object.keys(teacherColor).filter(item => item !== '全部')).map(item => (
												<Select.Option
													key={item}
													value={item}
												>
													{item}
												</Select.Option>
											))
										}
									</Select> :
									''
							}
							{
								item === 'replace' ?
									<Radio.Group
										value={singleData[item]}
										onChange={({target: {value}}) => {
											setSingleData({...singleData, replace: value})
										}}
									>
										<Radio
											value={true}
										>
											是
										</Radio>
										<Radio
											value={false}
										>
											否
										</Radio>
									</Radio.Group> :
									''
							}
						</Form.Item>)
					}
				</Form>
			</Modal>
		</Layout>
	);
};

export default App;
