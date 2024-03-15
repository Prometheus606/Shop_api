const router = require("express").Router()
const verify = require("../middleware/verify")

// Gets all sellers products
router.get("/products", verify, async (req, res) => {
    const db = req.db
    const id = req.params.id
    const user = req.user
    try {

        const result = await db.query(`SELECT * FROM shop_api_products WHERE seller_id = $1`, [user.id])
        const data = result.rows
        res.json({success: true, data})

    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error getting products. Read the Documentation."})
    }
})

module.exports = router