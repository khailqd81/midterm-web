var socketIoObject = require("../app.js");

// handle user submit vote => notify room present and room group and close old group (if have)
module.exports.handleNotifyNewQuestion = (req, res, next) => {
  var present = req.body.presentation;
  var presentRoom = "present" + present.presentId;
  socketIoObject.socketIo.to(presentRoom).emit("read_message", {
    ...req.body.presentation,
  });
  var group = req.body.group;
  console.log(req.body);
  if (group !== null) {
    var groupRoom = "group" + group.groupId;
    socketIoObject.socketIo.to(groupRoom).emit("read_message", {
      ...req.body.presentation,
    });
  }
  var oldGroup = req.body.oldGroup;
  if (oldGroup !== null) {
    var groupRoom = "group" + oldGroup?.groupId;
    socketIoObject.socketIo.to(groupRoom).emit("read_message", {});
  }
  res.json({ vote: "ok" });
};
