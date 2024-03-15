const router = require("express").Router()

router.get("/", (req, res) => {
    res.json({message: "I'm online!"})
})

module.exports = router