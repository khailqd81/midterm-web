var socketIoObject = require("../app.js");

module.exports.handleSlideVote = (req, res, next) => {
  // console.log("Req body (in slidevote): ", req.body);
  var room = "present" + req.body.room;
  console.log("Slide controller room:", room);
  socketIoObject.socketIo.to(room).emit("read_message", {
    ...req.body.presentation,
  });
  res.json({ vote: "ok" });
};
