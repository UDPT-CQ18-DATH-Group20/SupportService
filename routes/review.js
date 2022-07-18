const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const auth = require("../middleware/auth");

router.get("/comment", reviewController.findCommentByProduct);
router.get("/comment/store", auth , reviewController.findCommentByStore);

router.post("/comment", auth, reviewController.createComment);
router.post("/comment/reply", auth, reviewController.replyComment);

module.exports = router;