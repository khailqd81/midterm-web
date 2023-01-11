var socketIoObject = require("../app.js");

// handle notify user about presentation in group
module.exports.handlePresentInGroup = (req, res, next) => {
  socketIoObject.socketIo.to("public").emit("present_group", {
    ...req.body.group,
    room: req.body.room,
  });
  var returnToFrontend = { ...req.body.presentation };
  if (req.body.answerList) {
    returnToFrontend.answerList = req.body.answerList;
  }
  if (req.body.chatList) {
    returnToFrontend.chatList = req.body.chatList;
  }
  if (req.body.totalPage) {
    returnToFrontend.totalPage = req.body.totalPage;
  }
  var presentRoom = "present" + req.body.presentation.presentId;
  socketIoObject.socketIo.to(presentRoom).emit("read_message", {
    ...returnToFrontend,
  });

  var groupRoom = "group" + req.body.group.groupId;
  socketIoObject.socketIo.to(groupRoom).emit("read_message", {
    ...returnToFrontend,
  });
  var oldGroup = req.body.oldGroup;
  if (oldGroup !== null) {
    var oldGroupRoom = "group" + req.body.oldGroup.groupId;
    socketIoObject.socketIo.to(oldGroupRoom).emit("read_message", {});
  }
  res.json({ vote: "ok" });
};
