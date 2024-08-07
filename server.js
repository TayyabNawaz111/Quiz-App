const http = require("http");
const fs = require("fs");
const url = require("url");
let { users } = require("./data/users");
let { quizzes } = require("./data/quizzes");

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "GET") {
    if (req.url === "/") {
      fs.readFile("./public/index.ejs", (err, data) => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
    } else if (req.url === "/student") {
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
        quizzes[0].questions.push(newQuiz.questions[0]);

        fs.writeFile("./data/quizzes.js", `module.exports = ${JSON.stringify({ quizzes }, null, 4)}`, (err) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to save quiz" }));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(newQuiz));
          }
        });
      } else if (req.url === "/add-user") {
        const newUser = JSON.parse(body);
        users.push(newUser);
        fs.writeFile("./data/users.js", `module.exports = ${JSON.stringify({ users }, null, 4)}`, (err) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to save user" }));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(newUser));
          }
        });
      } else if (req.url === "/disableQuiz") {
        const { id } = JSON.parse(body);
        quizzes[0].questions.forEach((quiz) => {
          if (quiz.QID === id) {
            quiz.state = "false";
          }
        });
        fs.writeFile("./data/quizzes.js", `module.exports = ${JSON.stringify({ quizzes }, null, 4)}`, (err) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to update quizzes file" }));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
          }
        });
      } else if (req.url === "/enableQuiz") {
        const { id } = JSON.parse(body);
        quizzes[0].questions.forEach((quiz) => {
          if (quiz.QID === id) {
            quiz.state = "true";
          }
        });
        fs.writeFile("./data/quizzes.js", `module.exports = ${JSON.stringify({ quizzes }, null, 4)}`, (err) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to update quizzes file" }));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
          }
        });
      }
    });
  } else if (req.method === "PUT") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const parsedUrl = url.parse(req.url, true);
      const pathname = parsedUrl.pathname;
      if (pathname.startsWith("/editUser/")) {
        const updatedUser = JSON.parse(body);
        const userIndex = users.findIndex((user) => user.id === updatedUser.id);

        if (userIndex !== -1) {
          users[userIndex] = updatedUser;

          fs.writeFile("./data/users.js", `module.exports = ${JSON.stringify({ users }, null, 4)}`, (err) => {
            if (err) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Failed to update user" }));
            } else {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(updatedUser));
            }
          });
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "User not found" }));
        }
      }
    });
  } else if (req.method === "DELETE") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (req.url === "/delete-user") {
        try {
          const { id } = JSON.parse(body);
          const initialLength = users.length;
          users = users.filter((user) => user.id !== id);

          if (users.length < initialLength) {
            fs.writeFile("./data/users.js", `module.exports = ${JSON.stringify({ users }, null, 4)}`, (err) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Failed to update users file" }));
              } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true }));
              }
            });
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, message: "User not found" }));
          }
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid request body" }));
        }
      } else if (req.url === "/delete-quiz") {
        try {
          const { id } = JSON.parse(body);
          const initialLength = quizzes[0].questions.length;
          quizzes[0].questions = quizzes[0].questions.filter((quiz) => quiz.QID !== id);

          if (quizzes.length < initialLength) {
            fs.writeFile("./data/quizzes.js", `module.exports = ${JSON.stringify({ quizzes }, null, 4)}`, (err) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Failed to update quizzes file" }));
              } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true }));
              }
            });
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, message: "Quiz not found" }));
          }
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid request body" }));
        }
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
