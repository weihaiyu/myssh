import moment from "moment";
import XLSX from "xlsx";

const nowYear: string = '2020';

function spliceArrToDblArr<T>(arr: T[], length: number): T[][] {
	const newArr: T[][] = [];
	while (arr.length > 0) {
		newArr.push(arr.splice(0, length));
	}
	return newArr;
}

function isHoliday(date) {
	const holidayList = JSON.parse(localStorage.getItem('holidayList') || '[]') as any[],
	holidayRange = JSON.parse(localStorage.getItem('holidayRange') || '[]') as any[];
	return holidayRange?.some(item => moment(date).isBetween(item[0], item[1])) || holidayRange?.some(item => item.some(child => moment(date).format('YYYY-MM-DD') === child)) || holidayList?.some(item => moment(date).format('YYYY-MM-DD') === item);
}

const getLessonDay = (startDate, parity, count) => {
	let n = 0;
	let arr: any = [];
	const isLesson = (d) => {
		d = moment(d);
		if (n < count) {
			if ((!(isHoliday(d)) && !!(parity.find(item => item === (moment(d).weekday() + 1))))) {
				n++;
				arr.push(d.format('YYYY-MM-DD'));
			}
			d.add(1, 'd')
			isLesson(d);
		}
	};
	isLesson(startDate);
	return arr;
}

function throttle(fn, delay = 200, start = true) {
	if (typeof fn !== "function") {
		return console.error("请传入一个函数");
	}
	let timer = 0;
	// 返回处理过防抖的新函数
	return function (...arg) {
		// @ts-ignore
		let _this = this;
		if (timer) {
			return;
		}
		start && fn.apply(_this, arg);
		// @ts-ignore
		timer = setTimeout(() => {
			(!start) && fn.apply(_this, arg);
			timer = 0;
		}, delay);
	}
}

var tmpDown;
const downloadExl = (json, type) => {
	let tmpdata: any = json[0];
	json.unshift({});
	var keyMap: any = []; //获取keys
	for (var k in tmpdata) {
		keyMap.push(k);
		json[0][k] = k;
	}
	tmpdata = [];//用来保存转换好的json
	json.map((v, i) => keyMap.map((k, j) => Object.assign({}, {
		v: v[k],
		position: (j > 25 ? getCharCol(j) : String.fromCharCode(65 + j)) + (i + 1)
	}))).reduce((prev, next) => prev.concat(next)).forEach((v, i) => tmpdata[v.position] = {
		v: v.v
	});
	for(let key in tmpdata){
		// console.log(key);
		let  reg = /[A-Z]1$/g;
		if(reg.test(key)){
			delete tmpdata[key];
		}
	}
	var outputPos = Object.keys(tmpdata); //设置区域,比如表格从A1到D10
	var tmpWB = {
		SheetNames: ['mySheet'], //保存的表标题
		Sheets: {
			'mySheet': Object.assign({},
				tmpdata, //内容
				{
					'!ref': outputPos[0] + ':' + outputPos[outputPos.length - 1] //设置填充区域
				})
		}
	};
	tmpDown = new Blob([s2ab(XLSX.write(tmpWB,
		{bookType: (type === undefined ? 'xlsx':type),bookSST: false, type: 'binary'}//这里的数据是用来定义导出的格式类型
	))], {
		type: ""
	}); //创建二进制对象写入转换好的字节流
	var href = URL.createObjectURL(tmpDown); //创建对象超链接
	return {
		href,
		revoke: () => {
			URL.revokeObjectURL(tmpDown);
		}
	};
}

const s2ab = (s) => { //字符串转字符流
	let buf = new ArrayBuffer(s.length);
	let view = new Uint8Array(buf);
	for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
	return buf;
}
// 将指定的自然数转换为26进制表示。映射关系：[0-25] -> [A-Z]。
const getCharCol = (n) => {
	let s = '',
		m = 0
	while (n > 0) {
		m = n % 26 + 1
		s = String.fromCharCode(m + 64) + s
		n = (n - m) / 26
	}
	return s
}

const returnWeekday = (num) => {
	switch (num) {
		case 0:
			return '周一';
		case 1:
			return '周二';
		case 2:
			return '周三';
		case 3:
			return '周四';
		case 4:
			return '周五';
		case 5:
			return '周六';
		case 6:
			return '周日';
	}
}

function translateData(key) {
	switch (key) {
		case 'term':
			return '期数';
		case 'teacher':
			return '讲师';
		case 'date':
			return '日期';
		case 'lesson':
			return '课程内容';
		case 'replace':
			return '是否为替换课程';
		default :
			return;
	}
}

export {
	nowYear,
	spliceArrToDblArr,
	isHoliday,
	getLessonDay,
	throttle,
	downloadExl,
	returnWeekday,
	translateData
};
