const http = require('http');
const fs = require('fs');
const { parse } = require('querystring');
const { users } = require('./data/users');
const { quizzes } = require('./data/quizzes');

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        if (req.url === '/') {
            fs.readFile('./public/index.html', (err, data) => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            });
        } else if (req.url === '/student') {
            fs.readFile('./public/student.html', (err, data) => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            });
        } else if (req.url === '/teacher') {
            fs.readFile('./public/teacher.html', (err, data) => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            });
        } else if (req.url === '/admin') {
            fs.readFile('./public/admin.html', (err, data) => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            });
        } else if (req.url === '/script.js') {
            fs.readFile('./public/script.js', (err, data) => {
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(data);
            });
        } else if (req.url === '/users') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(users));
        } else if (req.url === '/quizzes') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(quizzes));
        }
    } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        if (req.url === '/add-quiz') {
            req.on('end', () => {
                const newQuiz = JSON.parse(body);
                quizzes.push(newQuiz);
                fs.writeFile('./data/quizzes.js', `module.exports = ${JSON.stringify({ quizzes }, null, 4)}`, () => {});
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newQuiz));
            });
        } else if (req.url === '/add-user') {
            req.on('end', () => {
                const newUser = JSON.parse(body);
                users.push(newUser);
                fs.writeFile('./data/users.js', `module.exports = ${JSON.stringify({ users }, null, 4)}`, () => {});
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newUser));
            });
        } else if (req.url === '/delete-user') {
            req.on('end', () => {
                const { userId } = JSON.parse(body);
                const userIndex = users.findIndex(user => user.id === userId);
                if (userIndex !== -1) {
                    users.splice(userIndex, 1);
                    fs.writeFile('./data/users.js', `module.exports = ${JSON.stringify({ users }, null, 4)}`, () => {});
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'User not found' }));
                }
            });
        } else if (req.url === '/delete-quiz') {
            req.on('end', () => {
                const { quizId } = JSON.parse(body);
                const quizIndex = quizzes.findIndex(quiz => quiz.id === quizId);
                if (quizIndex !== -1) {
                    quizzes.splice(quizIndex, 1);
                    fs.writeFile('./data/quizzes.js', `module.exports = ${JSON.stringify({ quizzes }, null, 4)}`, () => {});
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Quiz not found' }));
                }
            });
        }
    }
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
