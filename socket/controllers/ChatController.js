var socketIoObject = require("../app.js");

// handle user submit vote => notify room present and room group and close old group (if have)
module.exports.handleNotifyNewChat = (req, res, next) => {
  var present = req.body.presentation;
  var presentRoom = "present" + present.presentId;
  console.log("controller present presentR", presentRoom);
  socketIoObject.socketIo.to(presentRoom).emit("read_message", {
    chat: req.body.chat,
  });

  if (req.body.group) {
    var group = req.body.group;
    var groupRoom = "group" + group.groupId;
    console.log("controller present group", groupRoom);
    socketIoObject.socketIo.to(groupRoom).emit("read_message", {
      ...req.body.presentation,
      chat: req.body.chat,
    });
  }
  res.json({ vote: "ok" });
};
