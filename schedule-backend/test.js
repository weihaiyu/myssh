const koa =  require("koa");
const app  =new koa();
const Router = require("koa-router");
let router  = new Router();
router.get("/",ctx=>{
    ctx.body = "测试数据"
})
app.use(router.routes());
app.listen(8989);
