var socketIoObject = require("../app.js");

// handle user submit vote => notify room present and room group and close old group (if have)
module.exports.handleNotifyNewQuestion = (req, res, next) => {
  var present = req.body.presentation;
  var presentRoom = "present" + present.presentId;
  socketIoObject.socketIo.to(presentRoom).emit("read_message", {
    ...req.body.presentation,
  });

  if (req.body.group) {
    var group = req.body.group;
    var groupRoom = "group" + group.groupId;
    console.log("controller present group", groupRoom);
    socketIoObject.socketIo.to(groupRoom).emit("read_message", {
      ...req.body.presentation,
    });
  }
  res.json({ vote: "ok" });
};
