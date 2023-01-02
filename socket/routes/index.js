var express = require("express");
var router = express.Router();
var PresentationController = require("../controllers/PresentationController");
var SlideController = require("../controllers/SlideController");
var GroupController = require("../controllers/GroupController");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* Presentation. */
router.post("/presents", PresentationController.handlePresentationVote);
router.post("/slides", SlideController.handleSlideVote);
router.post("/groups", GroupController.handlePresentInGroup);
module.exports = router;
