var socketIoObject = require("../app.js");

module.exports.handleSlideVote = (req, res, next) => {
  var present = req.body.presentation;
  var userAnswer = req.body.userAnswer;
  var answerList = req.body.answerList;
  var presentRoom = "present" + present.presentId;
  socketIoObject.socketIo.to(presentRoom).emit("read_message", {
    ...req.body.presentation,
    userAnswer,
    answerList,
  });
  var group = req.body.group;
  if (group !== null) {
    var groupRoom = "group" + group.groupId;
    socketIoObject.socketIo.to(groupRoom).emit("read_message", {
      ...req.body.presentation,
      userAnswer,
      answerList,
    });
  }
  res.json({ vote: "ok" });
};
