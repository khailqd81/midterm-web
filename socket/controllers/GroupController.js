var socketIoObject = require("../app.js");

// handle notify user about presentation in group
module.exports.handlePresentInGroup = (req, res, next) => {
  console.log(req.body);
  socketIoObject.socketIo.to("public").emit("present_group", {
    ...req.body.group,
    room: req.body.room,
  });
  var presentRoom = "present" + req.body.presentation.presentId;
  socketIoObject.socketIo.to(presentRoom).emit("read_message", {
    ...req.body.presentation,
  });
  var groupRoom = "group" + req.body.group.groupId;
  socketIoObject.socketIo.to(groupRoom).emit("read_message", {
    ...req.body.presentation,
  });
  var oldGroup = req.body.oldGroup;
  if (oldGroup !== null) {
    var oldGroupRoom = "group" + req.body.oldGroup.groupId;
    socketIoObject.socketIo.to(oldGroupRoom).emit("read_message", {});
  }
  res.json({ vote: "ok" });
};
