const Koa = require('koa');
const Router = require('koa-router');
const static = require('koa-static');
const axios = require('axios');
const queryString = require('querystring');
const jwt = require('jsonwebtoken');
const jwtAuth = require('koa-jwt');

const app = new Koa();
const router = new Router();


const accessTokens = {};

const secret = "it's a secret";
app.use(static(__dirname + '/'));

const config = {
    client_id:'Ov23liui4lpsrnLU64V3',
    client_secret: 'd817f2867f21b308a7f0597e8b1fa5fe6973e5bc'
}

router.get('/auth/github/login', async (ctx) => {
    console.log('github login')
    ctx.body = 'redirect';
    // 重定向页面
    const path = `https://github.com/login/oauth/authorize?${queryString.stringify({
        client_id: config.client_id
    })}`;
    ctx.redirect(path);
})

router.get('/auth/github/callback', async (ctx) => {
    
    const { code } = ctx.query;
    console.log('github callback, code: ' + code)

    const params = {
        client_id: config.client_id,
        client_secret: config.client_secret,
        code: code+''
    }
    const res = await axios.post(`https://github.com/login/oauth/access_token`, params);
    const { access_token } = queryString.parse(res.data);
    console.log('github callback, access_token: ' + JSON.stringify(res.data))
    const uid = (Math.random()*999999).toFixed();
    accessTokens[uid] = access_token;

    const token = jwt.sign(
        {
            data: uid,
            exp: Math.floor(Date.now() / 1000) + 60*60
        },
        secret
    )

    // 关闭认证页面，将token保存到localstorage
    ctx.response.body = `<script>
    window.localStorage.setItem('authSuccess', 'true');
    window.localStorage.setItem('token','${token}');
    window.close();
    </script>`
})

router.get('/auth/github/userinfo',jwtAuth({ secret }), async ctx => {
    console.log('jwt success: ', ctx.state.user.data, accessTokens);
    const access_token = accessTokens[ctx.state.user.data];
    console.log('access_token:', access_token);
    const url = `https://api.github.com/user`;
    try {
        const res = await axios.post(url, '', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        ctx.body = res.data;
    } catch (error) {
        console.log(error)
    }   
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(7001);
