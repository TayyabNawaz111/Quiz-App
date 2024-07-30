const http = require("http");
const fs = require("fs");
let { users } = require("./data/users");
const { quizzes } = require("./data/quizzes");

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === "GET") {
        if (req.url === "/student") {
            fs.readFile("./public/student.ejs", (err, data) => {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(data);
            });
        } else if (req.url === "/teacher") {
            fs.readFile("./public/teacher.ejs", (err, data) => {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(data);
            });
        } else if (req.url === "/admin") {
            fs.readFile("./public/admin.ejs", (err, data) => {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(data);
            });
        } else if (req.url === "/users") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(users));
        } else if (req.url === "/quizzes") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(quizzes));
        }
    } else if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            if (req.url === "/add-quiz") {
                const newQuiz = JSON.parse(body);
                quizzes.push(newQuiz);
                fs.writeFile(
                    "./data/quizzes.js",
                    `module.exports = ${JSON.stringify({ quizzes }, null, 4)}`,
                    () => {}
                );
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(newQuiz));
            } else if (req.url === "/add-user") {
                const newUser = JSON.parse(body);
                users.push(newUser);
                fs.writeFile(
                    "./data/users.js",
                    `module.exports = ${JSON.stringify({ users }, null, 4)}`,
                    () => {}
                );
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(newUser));
            } else if (req.url === "/delete-user") {
                const { id } = JSON.parse(body);
                users = users.filter(user => user.id !== id);
                fs.writeFile(
                    "./data/users.js",
                    `module.exports = ${JSON.stringify({ users }, null, 4)}`,
                    () => {}
                );
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "User deleted successfully" }));
            }
        });
    }
});

server.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
