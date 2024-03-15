const router = require("express").Router()
const verify = require("../middleware/verify")

// Gets all orders for the seller or buyer
router.get("/orders", verify, async (req, res) => {
    const db = req.db
    const id = req.params.id
    const user = req.user
    try {

        const result = await db.query(`SELECT * FROM shop_api_orders WHERE seller_id = $1`, [user.id])
        const data = result.rows
        res.json({success: true, data})

    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error getting orders. Read the Documentation."})
    }
})

module.exports = router