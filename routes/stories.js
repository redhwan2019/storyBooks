const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const Story = require("../models/Story");

router.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .lean()
      .populate("user");
    res.render("stories/index", {
      stories: stories,
    });
  } catch (error) {
    console.error(error);
    res.render("error/500");
  }
});

router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id }).lean();
    res.render("dashboard", {
      name: req.user.firstname,
      stories: stories,
    });
  } catch (error) {
    console.error(error);
    res.render("error/404");
  }
});

router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add");
});

router.get("/user/:id", ensureAuth, async (req, res) => {
  try {
    let stories = await Story.find({
      user: req.params.id,
      status: "public",
    })
      .lean()
      .populate("user");

    res.render("stories/index", {
      stories,
    });
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

router.get("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findOne({
      _id: req.params.id,
    })
      .lean()
      .populate("user");

    res.render("stories/show", {
     story,
    });
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});
router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findOne({ _id: req.params.id }).lean();

    if (!story) {
      res.render("error/404");
    }
    if (story.user.toString() != req.user._id.toString()) {
      res.redirect("/stories");
    } else {
      res.render("stories/edit", { story });
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user._id;
    await Story.create(req.body);
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

router.put("/:id", ensureAuth, async (req, res) => {
  try {
    await Story.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

router.delete("/delete/:id", ensureAuth, async (req, res) => {
  try {
    await Story.findByIdAndRemove(req.params.id);
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

module.exports = router;
