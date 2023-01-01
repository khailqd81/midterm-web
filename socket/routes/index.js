var express = require("express");
var router = express.Router();
var PresentationController = require("../controllers/PresentationController");
var SlideController = require("../controllers/SlideController");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* Presentation. */
router.post("/presents", PresentationController.handlePresentationVote);
router.post("/slides", SlideController.handleSlideVote);
module.exports = router;
