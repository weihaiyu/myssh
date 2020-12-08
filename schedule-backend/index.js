const Koa = require('koa');
const koaBody = require('koa-body');
const Router = require('koa-router');
const mysql2 = require('mysql2');
const app = new Koa();
const router = new Router();
const moment = require('moment');

const connection = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Kaikeba@0826',
    database: 'schedule'
});

app.use(koaBody());

router.post('/addTerm', async ctx => {
    let error = false;
    let res = [];
    const {term, data} = ctx.request.body;
    try {
        res = await connection.promise().query(`SELECT * FROM \`schedule\` WHERE \`term\`= (?)`, [term]);
    } catch (err) {
        if (err) ctx.body = {
            code: 0,
            msg: err
        };
        error = true;
    }
    if (res[0].length) return ctx.body = {
        code: 0,
        msg: '添加的期数已经存在，请确认后重新添加！'
    };
    if (error) return;
    try {
        await connection.promise().execute(`INSERT INTO \`schedule\` (\`term\`, \`data\`) VALUES (?,?)`, [term, data]);
        ctx.body = {
            code: 1,
            msg: '添加成功！'
        };
    } catch (err) {
        if (err) ctx.body = {
            code: 0,
            msg: err
        };
    }
});

router.post('/updateTerm', async ctx => {
    const {term, data} = ctx.request.body;
    try {
        await connection.promise().query(`UPDATE \`schedule\` SET \`data\` = (?) WHERE \`term\`= (?)`, [data, term]);
        ctx.body = {
            code: 1,
            msg: '修改成功'
        }
    } catch (err) {
        if (err) ctx.body = {
            code: 0,
            msg: err
        };
    }
});

router.get('/getData', async ctx => {
    const {term, teacher} = ctx.request.query;
    let data = {};
    const [rows] = await connection.promise().query(`SELECT * FROM \`schedule\``);
    rows.forEach(item => {
        if (term === '全部' && teacher === '全部') {
            Object.entries(item.data).forEach(child => {
                data[child[0]] = data[child[0]] ? [...data[child[0]], ...child[1]] : [...child[1]];
            });
        } else if (term === '全部' && teacher !== '全部') {
            Object.entries(item.data).filter(child => child[1][0].teacher === teacher).forEach(child => {
                data[child[0]] = data[child[0]] ? [...data[child[0]], ...child[1]] : [...child[1]];
            });
        } else if (term !== '全部' && teacher === '全部') {
            Object.entries(item.data).filter(child => child[1][0].term === term).forEach(child => {
                data[child[0]] = data[child[0]] ? [...data[child[0]], ...child[1]] : [...child[1]];
            });
        } else {
            Object.entries(item.data).filter(child => (child[1][0].teacher === teacher) && (child[1][0].term === term)).forEach(child => {
                data[child[0]] = data[child[0]] ? [...data[child[0]], ...child[1]] : [...child[1]];
            });
        }
    });
    let entriesData = Object.entries(data);
    entriesData.sort((a, b) => {
        if (moment(a[0]).isBefore(moment(b[0]))) {
            return -1;
        }
    });
    data = Object.fromEntries(entriesData);
    ctx.body = {
        code: 1,
        data
    };
});

router.get('/getTerm', async ctx => {
    const [rows] = await connection.promise().query(`SELECT \`term\` FROM \`schedule\``);
    ctx.body = rows.map(item => item.term);
});

router.get('/getTermMessage', async ctx => {
    const {term} = ctx.request.query;
    const [rows] = await connection.promise().query(`SELECT * FROM \`schedule\` WHERE \`term\`=?`, [term]);
    ctx.body = {
        start: Object.keys(rows[0].data)[0],
        end: Object.keys(rows[0].data)[Object.keys(rows[0].data).length - 1]
    }
});

router.get('/getTeacherColor', async ctx => {
    const [rows] = await connection.promise().query(`SELECT * FROM \`teacherColor\``);
    let data = {};
    rows.forEach(item => {
        data[item.teacher] = item.color;
    })
    ctx.body = {
        code: 1,
        data
    };
});

router.get('/getLessonColor', async ctx => {
    const [rows] = await connection.promise().query(`SELECT * FROM \`lessonColor\``);
    let data = {};
    rows.forEach(item => {
        data[item.lesson] = item.color;
    })
    ctx.body = {
        code: 1,
        data
    };
});

router.post('/updateTeacherColor', async ctx => {
    let {data} = ctx.request.body;
    // const error = [];
    // const result = [];
    data = Object.entries(data);
    for (let i = 0; i < data.length; i++) {
        const [rows] = await connection.promise().query(`SELECT * FROM \`teacherColor\` WHERE teacher=?`, [data[i][0]]);
        try {
            const [res] = rows.length ?
                await connection.promise().query(`UPDATE \`teacherColor\` SET \`color\`=(?) WHERE teacher="${data[i][0]}"`, [data[i][1]]) :
                await connection.promise().query(`INSERT \`teacherColor\` (teacher, \`color\`) VALUE (?, ?)`, [data[i][0], data[i][1]]);
            // result.push(res);
        } catch (e) {
            // error.push(e);
        }
    }
    ctx.body = {
        code: 1
    }
});

router.post('/updateLessonColor', async ctx => {
    let {data} = ctx.request.body;
    // const error = [];
    // const result = [];
    data = Object.entries(data);
    for (let i = 0; i < data.length; i++) {
        const [rows] = await connection.promise().query(`SELECT * FROM \`lessonColor\` WHERE lesson=?`, [data[i][0]]);
        try {
            const [res] = rows.length ?
                await connection.promise().query(`UPDATE \`lessonColor\` SET \`color\`=(?) WHERE lesson="${data[i][0]}"`, [data[i][1]]) :
                await connection.promise().query(`INSERT \`lessonColor\` (lesson, \`color\`) VALUE (?, ?)`, [data[i][0], data[i][1]]);
            // result.push(res);
        } catch (e) {
            // error.push(e);
        }
    }
    ctx.body = {
        code: 1
    }
});

router.post('/addSingleLesson', async ctx => {
    const {lesson, term, date, teacher, replace} = ctx.request.body;
    const [rows] = await connection.promise().query('SELECT * FROM `schedule` WHERE term=?', [term]);
    let res = rows[0].data;
    if (res[date]) {
        ctx.body = {
            code: 0,
            msg: `${term}${new RegExp('期').test(term) ? '' : '期'}班级在${date}已经有课，请重新输入日期！`
        }
        return;
    }
    if (replace) {
        // ctx.body = {
        //     code: 0,
        //     msg: '这功能实在是做不出来，啥时候有空再说吧'
        // }
        // return
        let entryRes = Object.entries(res);
        let index = entryRes.findIndex(item => item[1][0].lesson === lesson);
        for (let i = index; i < entryRes.length; i++) {
            if (i < entryRes.length - 1) {
                entryRes[i][1] = entryRes[i + 1][1]
            }
        }
        // console.log(entryRes);
        entryRes.pop();
        res = Object.fromEntries(entryRes);
    }
    res[date] = [{
        lesson,
        teacher,
        term
    }];
    try {
        await connection.promise().execute(`UPDATE \`schedule\` SET \`data\`=(?) WHERE \`term\`=? `, [res, term]);
    } catch (e) {
        ctx.body = {
            code: 0,
            msg: e
        }
        return
    }
    ctx.body = {
        code: 1
    }
});

router.post('/addHoliday', async ctx => {
    let {type, data} = ctx.request.body;
    // console.log(type, data);
    const [rows] = await connection.promise().query('SELECT * FROM `holiday` WHERE type=?', [type])

    if (type === 'range') {
        rows[0].data.push(data)
        data = rows[0].data
    } else {
        data = data.concat(rows[0].data)
    }
    await connection.promise().query('UPDATE `schedule`.`holiday` SET `data` = ? WHERE `type` = ?', [JSON.stringify(data), type]);
    ctx.body = {
        code: 1
    }
});

router.get('/getHolidayList&Range', async ctx => {
    const [rows] = await connection.promise().query('SELECT * FROM `holiday`');
    let data = {};
    rows.forEach(item => {
        data[item.type] = item.data;
    })
    ctx.body = data;
});

app.use(router.routes());
app.listen(4567);
