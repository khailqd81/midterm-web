var socketIoObject = require("../app.js");

module.exports.handlePresentInGroup = (req, res, next) => {
  console.log(req.body);
  socketIoObject.socketIo.to("public").emit("present_group", {
    ...req.body.group,
    room: req.body.room,
  });
  res.json({ vote: "ok" });
};
