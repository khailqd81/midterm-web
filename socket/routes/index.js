var express = require("express");
var router = express.Router();
var PresentationController = require("../controllers/PresentationController");
var SlideController = require("../controllers/SlideController");
var GroupController = require("../controllers/GroupController");
var ChatController = require("../controllers/ChatController");
var QuestionController = require("../controllers/QuestionController");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* Presentation. */
router.post("/presents", PresentationController.handlePresentationVote);
router.post("/slides", SlideController.handleSlideVote);
router.post("/groups", GroupController.handlePresentInGroup);
router.post("/chats", ChatController.handleNotifyNewChat);
router.post("/questions", QuestionController.handleNotifyNewQuestion);

module.exports = router;
