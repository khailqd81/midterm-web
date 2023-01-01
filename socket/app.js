var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var axios = require("axios");
var app = express();
require("dotenv").config();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
// app.use('/users', usersRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });
const server = require("http").createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected");
  console.log("Socket query room", socket.handshake.query.room);
  socket.join(socket.handshake.query.room);
  socket.on("present", (msg) => {
    console.log("message");
    console.log(msg);
    io.emit("number", {
      hello: "from server",
    });
  });
  socket.on("number", (msg) => {
    console.log("message");
    console.log(msg);
    io.emit("number", {
      hello: "from server",
    });
  });

  socket.on("send_vote", async (msg) => {
    console.log("message");
    console.log(msg);
    await axios.post(
      `${process.env.REST_API}/api/slides/vote/${msg.slideId}/${msg.option.optionId}`,
      {
        ...msg,
      }
    );
  });
});

console.log("server listen on port ", process.env.PORT || 3051);

server.listen(process.env.PORT || 3051);

const socketIoObject = io;
module.exports.socketIo = io;
//module.exports = server;
// socket.on("send from server", {
//   "name":"Server"
// });
