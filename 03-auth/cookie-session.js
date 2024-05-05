const http = require('http');

const server = http.createServer((req, res) => {
    
    console.log('req cookie:', req.headers.cookie)
    res.setHeader('Set-Cookie','name=yx;login=true');
    res.end('Hello Cookie-Session');
})

server.listen(3000, () => {
    console.log('server at 3000')
})