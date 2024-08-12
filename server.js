const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");
const formidable = require("formidable");
let { users } = require("./data/users");
let { quizzes } = require("./data/quizzes");
let { fileNames } = require("./data/fileNames");
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "GET") {
    if (req.url === "/") {
      fs.readFile("./public/login.ejs", (err, data) => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
    }else if(req.url==="/leaderboard"){
      fs.readFile("./public/leaderboard.ejs", (err, data) => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
    }
     else if (req.url === "/student") {
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
    } else if (req.url === "/fileNames") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(fileNames));
    } else if (req.url.startsWith("/download")) {
      // Handle file download
      const query = url.parse(req.url, true).query;
      const fileName = query.file;
      const filePath = path.join(__dirname, "Course Material", fileName);

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Error reading file");
          return;
        }

        res.writeHead(200, {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename=${fileName}`,
        });
        res.end(data);
      });
    }
  } else if (req.method === "POST") {
    if (req.url === "/upload") {
      const form = new formidable.IncomingForm();

      // Optional: Set the upload directory
      const uploadDir = path.join(__dirname, "Course Material");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Set the upload directory
      form.uploadDir = uploadDir;

      // Handle fileBegin event to set the file path
      form.on("fileBegin", (name, file) => {
        file.filepath = path.join(form.uploadDir, file.originalFilename);
      });

      // Handle form parsing
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("File upload error:", err); // Log the error for debugging
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Error occurred during file upload: " + err.message); // Send the error message to the client
          return;
        }
        // console.log(files.courseMaterial[0].originalFilename);
        //add name to file
        Object.values(files).forEach((file, index) => {
          const uploadedFileName = file[index].originalFilename;
          if (uploadedFileName) {
            fileNames.push(uploadedFileName);
            console.log("Uploaded file name:", uploadedFileName); // Log the uploaded filename
          } else {
            console.error("Original filename is missing or null");
          }
        });
        fs.writeFile(
          "./data/fileNames.js",
          `module.exports = ${JSON.stringify({ fileNames }, null, 4)}`,
          (err) => {
            if (err) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Failed to save file name" }));
            } else {
              res.writeHead(302, { Location: "/teacher" }); // 302 is the status code for redirection
              res.end();
            }
          }
        );
      });
    } else {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        if (req.url === "/add-quiz") {
          const newQuiz = JSON.parse(body);
          quizzes[0].questions.push(newQuiz.questions[0]);

          fs.writeFile(
            "./data/quizzes.js",
            `module.exports = ${JSON.stringify({ quizzes }, null, 4)}`,
            (err) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Failed to save quiz" }));
              } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(newQuiz));
              }
            }
          );
        } else if (req.url === "/updatePoints") {
          const { earnedPoints, id } = JSON.parse(body);
          const currentUser = users.find((user) => user.id == id);
          // console.log(currentUser,currentUser.points);
          currentUser.points += earnedPoints;
          fs.writeFile(
            "./data/users.js",
            `module.exports = ${JSON.stringify({ users }, null, 4)}`,
            (err) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Failed to update user" }));
              } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(currentUser));
              }
            }
          );


          //----------------------------------------
        } else if (req.url === "/login") {
          const { email, password } = JSON.parse(body);
          console.log("Received email:", email);
          const user = users.find((u) => u.email === email);

          if (user && user.pass === password) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: true, role: user.role, id: user.id })
            );
          } else {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, message: "Invalid credentials" })
            );
          }
        } else if (req.url === "/add-user") {
          const newUser = JSON.parse(body);
          users.push(newUser);
          fs.writeFile(
            "./data/users.js",
            `module.exports = ${JSON.stringify({ users }, null, 4)}`,
            (err) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Failed to save user" }));
              } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(newUser));
              }
            }
          );
        } else if (req.url === "/disableQuiz") {
          const { id } = JSON.parse(body);
          quizzes[0].questions.forEach((quiz) => {
            if (quiz.QID === id) {
              quiz.state = "false";
            }
          });
          fs.writeFile(
            "./data/quizzes.js",
            `module.exports = ${JSON.stringify({ quizzes }, null, 4)}`,
            (err) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({ error: "Failed to update quizzes file" })
                );
              } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true }));
              }
            }
          );
        } else if (req.url === "/enableQuiz") {
          const { id } = JSON.parse(body);
          quizzes[0].questions.forEach((quiz) => {
            if (quiz.QID === id) {
              quiz.state = "true";
            }
          });
          fs.writeFile(
            "./data/quizzes.js",
            `module.exports = ${JSON.stringify({ quizzes }, null, 4)}`,
            (err) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({ error: "Failed to update quizzes file" })
                );
              } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true }));
              }
            }
          );
        } else if (req.url === "/setLimit") {
          const { updatedLimit } = JSON.parse(body);
          quizzes[0].timeLimit = updatedLimit;
          fs.writeFile(
            "./data/quizzes.js",
            `module.exports = ${JSON.stringify({ quizzes }, null, 4)}`,
            (err) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({ error: "Failed to update quizzes file" })
                );
              } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true }));
              }
            }
          );
        }
      });
    }
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

          fs.writeFile(
            "./data/users.js",
            `module.exports = ${JSON.stringify({ users }, null, 4)}`,
            (err) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Failed to update user" }));
              } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(updatedUser));
              }
            }
          );
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
            fs.writeFile(
              "./data/users.js",
              `module.exports = ${JSON.stringify({ users }, null, 4)}`,
              (err) => {
                if (err) {
                  res.writeHead(500, { "Content-Type": "application/json" });
                  res.end(
                    JSON.stringify({ error: "Failed to update users file" })
                  );
                } else {
                  res.writeHead(200, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ success: true }));
                }
              }
            );
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, message: "User not found" })
            );
          }
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid request body" }));
        }
      } else if (req.url === "/delete-quiz") {
        try {
          const { id } = JSON.parse(body);
          const initialLength = quizzes[0].questions.length;
          quizzes[0].questions = quizzes[0].questions.filter(
            (quiz) => quiz.QID !== id
          );

          if (quizzes.length < initialLength) {
            fs.writeFile(
              "./data/quizzes.js",
              `module.exports = ${JSON.stringify({ quizzes }, null, 4)}`,
              (err) => {
                if (err) {
                  res.writeHead(500, { "Content-Type": "application/json" });
                  res.end(
                    JSON.stringify({ error: "Failed to update quizzes file" })
                  );
                } else {
                  res.writeHead(200, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ success: true }));
                }
              }
            );
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, message: "Quiz not found" })
            );
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
