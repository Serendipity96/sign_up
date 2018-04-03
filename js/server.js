var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
    console.log('请指定端口号\nnode server.js 8888 这样')
    process.exit(1)
}

var server = http.createServer(function (request, response) {
    var parsedUrl = url.parse(request.url, true)
    var path = request.url
    console.log(path)
    var query = ''
    if (path.indexOf('?') >= 0) {
        query = path.substring(path.indexOf('?'))
    }
    var pathNoQuery = parsedUrl.pathname
    var queryObject = parsedUrl.query
    var method = request.method
    response.setHeader('Access-Control-Allow-Origin', '*')

    /******** 从这里开始看，上面不要看 ************/
    if (path === '/sign_up' && method === 'GET') {
        var string = fs.readFileSync('../sign_up.html', 'utf8')
        response.statusCode = 200
        response.setHeader('Content-type', 'text/html;charset=utf-8')
        response.write(string)
        response.end()
    } else if (path === '/sign_up' && method === 'POST') {
        getFormData(request).then((formData) => {
            let formDatas = formData.split('&') // ['email=1','password=2','password_confirm=3']
            let hash = {}
            formDatas.forEach((formItem) => {
                let parts = formItem.split('=')// ['email','1']
                let key = parts[0]
                let value = parts[1]
                hash[key] = value
            })
            let {email,password,password_confirm} = hash//等同于  let email = hash.email
            if(email.indexOf('@') === -1){
                response.statusCode = 400
                response.setHeader('Content-type', 'application/json;charset=utf-8')
                response.write(`{
                    "errors":{
                        "email":"invaild"
                    }
                }`)
            }else if(password !== password_confirm){
                response.statusCode = 400
                response.write(`{
                    "errors":{
                        "password":"not match"
                    }
                }`)
            }else{
                response.statusCode = 200
            }
            response.end()
        })
    }
    else {
        response.statusCode = 404
        response.end()
    }

    /******** 代码结束，下面不要看 ************/
})

function getFormData(request) {
    return new Promise((resolve, reject) => {
        let body = [];//请求体
        request.on('data', (chunk) => { //chunk一部分数据
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            resolve(body)
        });
    })

}

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)