var socketIoObject = require("../app.js");

// handle user submit vote => notify room present and room group and close old group (if have)
module.exports.handleNotifyNewQuestion = (req, res, next) => {
  // console.log("Req body (in present controller): ", req.body);
  //   socketIoObject.socketIo.to(req.body.room).emit({
  //     from: req.body.room,
  //   });
  console.log("To present controller");
  var present = req.body.presentation;
  var presentRoom = "present" + present.presentId;
  console.log("controller present presentR", presentRoom);
  socketIoObject.socketIo.to(presentRoom).emit("read_message", {
    ...req.body.presentation,
  });
  var group = req.body.group;
  console.log(req.body);
  if (group !== null) {
    var groupRoom = "group" + group.groupId;
    console.log("controller present group", groupRoom);
    socketIoObject.socketIo.to(groupRoom).emit("read_message", {
      ...req.body.presentation,
    });
  }
  var oldGroup = req.body.oldGroup;
  if (oldGroup !== null) {
    var groupRoom = "group" + oldGroup?.groupId;
    console.log("controller present old group", groupRoom);
    socketIoObject.socketIo.to(groupRoom).emit("read_message", {});
  }
  res.json({ vote: "ok" });
};
