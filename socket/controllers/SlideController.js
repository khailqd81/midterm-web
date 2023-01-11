var socketIoObject = require("../app.js");

module.exports.handleSlideVote = (req, res, next) => {
  var present = req.body.presentation;
  var presentRoom = "present" + present.presentId;
  var returnToFrontend = { ...req.body.presentation };

  if (req.body.answerList) {
    returnToFrontend.answerList = req.body.answerList;
  }
  if (req.body.userAnswer) {
    returnToFrontend.userAnswer = req.body.userAnswer;
  }

  socketIoObject.socketIo.to(presentRoom).emit("read_message", {
    ...returnToFrontend,
  });
  var group = req.body.group;
  if (group !== null) {
    var groupRoom = "group" + group.groupId;
    socketIoObject.socketIo.to(groupRoom).emit("read_message", {
      ...returnToFrontend,
    });
  }
  res.json({ vote: "ok" });
};
