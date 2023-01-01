var socketIoObject = require("../app.js");

module.exports.handlePresentationVote = (req, res, next) => {
  // console.log("Req body (in present controller): ", req.body);
  //   socketIoObject.socketIo.to(req.body.room).emit({
  //     from: req.body.room,
  //   });
  var room = "present" + req.body.presentation.presentId;
  console.log("controller present room:", room);
  socketIoObject.socketIo.to(room).emit("read_message", {
    ...req.body.presentation,
  });
  console.log("To present controller");
  res.json({ vote: "ok" });
};
