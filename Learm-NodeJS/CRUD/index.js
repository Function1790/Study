var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path')

print = (text) => { console.log(text) }

function putInTemplete(data) {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>CRUD</title>
    </head>
    <body>
        <h1><a href="/">Write Man</a></h1>
        <p>
            ${data}
        </p>
    </body>
    </html>`
}

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var parsed_url = url.parse(_url, true);
    var qeuryData = parsed_url.query;
    var pathname = parsed_url.pathname;

    if (pathname === "/") {
        fs.readdir("./Posts/", "utf8", (err, data) => {
            var filelist = "";
            for (var i = 0; i < data.length; i++) {
                filelist += `<li>
                <a href="/Posts/?name=${data[i]}">${data[i]}</a>
                </li>`
            }
            var _html = `
            <p>
            <h2><a href="./create">Create</a></h2>
            </p>
            <p>
            ${filelist}
            </p>`
            response.writeHead(200);
            response.end(putInTemplete(_html));
        });
    } else if (pathname === "/create") {
        fs.readFile("./create.html", "utf8", (err, data) => {
            response.writeHead(200);
            response.end(putInTemplete(data));
        });
    } else if (pathname === "/process_create") {
        var body = '';
        request.on("data", (data) => {
            body += data;
        });
        request.on("end", () => {
            var post = qs.parse(body);
            var title = post.title;
            var content = post.content;
            fs.writeFile(`Posts/${title}`, content, 'utf8', (err) => {
                response.writeHead(302, { Location: `/` });
                response.end();
            });
        });
    } else if (pathname === "/Posts/") {
        if (qeuryData.name === undefined) {
            response.writeHead(302, { Location: `/` });
            response.end();
        } else {
            var filteredPath = path.parse(qeuryData.name).base;
            fs.readFile(`./Posts/${filteredPath}`, "utf8", (err, data) => {
                response.writeHead(200);
                response.end(putInTemplete(`
                <h2>${qeuryData.name}</h2>
                <a href="/Modify/?name=${qeuryData.name}">Modify</a>
                <p>${data}</p>
                `));
            });
        }
    } else if (pathname === "/Modify/") {
        if (qeuryData.name === undefined) {
            response.writeHead(302, { Location: `/` });
            response.end();
        } else {
            var _name = qeuryData.name;
            var filteredPath = path.parse(_name).base;
            fs.readFile(`./Posts/${filteredPath}`, "utf8", (err, data) => {
                response.writeHead(200);
                response.end(putInTemplete(`
                <a href="/Delete?name=${filteredPath}">Delete</a>
                <form action="http://localhost:3000/process_modify" method="post">
                <input type="hidden" name="past_title" value="${filteredPath}">
                <p><input type="text" name="title" placeholder="title" value="${filteredPath}"></p>
                <p>
                <textarea name="content">${data}</textarea>
                </p>
                <p>
                <input type="submit">
                </p>
                </form>`));
            });
        }
    } else if (pathname === "/process_modify") {
        var body = '';
        request.on("data", (data) => {
            body += data;
        });
        request.on("end", () => {
            var post = qs.parse(body);
            var past_title = post.past_title;
            var title = post.title;
            var content = post.content;

            fs.rename(`Posts/${past_title}`, `Posts/${title}`, (err) => {
                fs.writeFile(`Posts/${title}`, content, 'utf8', (err) => {
                    response.writeHead(302, { Location: `/` });
                    response.end();
                });
            });
            response.writeHead(302, { Location: `/` });
            response.end();
        });
    } else if (pathname==="/Delete") {
        fs.unlink(`Posts/${qeuryData.name}`, (err) => {})
    } else {
        response.writeHead(404);
        response.end(putInTemplete("404 Not Found"));
    }
});
app.listen(3000)