const router = require("express").Router()
const verify = require("../middleware/verify")
const pw = require("../middleware/password")
const jwt = require("jsonwebtoken")
const validator = require('validator');

// Gets seller Information
router.get("/:id", verify, async (req, res) => {
    const db = req.db
    const id = req.params.id
    try {

        const result = await db.query(`SELECT id,company,email,street,city,post_code,house_nr,country FROM shop_api_sellers WHERE id = $1`, [id])
        const data = result.rows[0]
        res.json({success: true, data})

    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error getting seller. Read the Documentation."})
    }
})

// Creates a new seller
router.post("/", async (req, res) => {
    const db = req.db
    try {
        const {password,company,email,street,city,post_code,house_nr,country} = req.body

        if (password && !validator.isStrongPassword(password)) {
            const err = {success: false, error: "Password to weak, at least 8 characters, One Uppercase, one lowecase, one Number and one Symbol required."}
            return res.json(err)
        }
    
        if (email && !validator.isEmail(email)) {
            const err = {success: false, error: "Email address not valid."}
            return res.json(err)
        }

        const passwordHash = await pw.hash(password)
        const result = await db.query(`
        INSERT INTO shop_api_sellers 
        (password,company,email,street,city,post_code,house_nr,country) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id,company,email,street,city,post_code,house_nr,country`, 
        [passwordHash,company,email,street,city,post_code,house_nr,country]
        )
        const data = result.rows[0]
        res.json({success: true, message: "Succesful Created a new seller.", data})

    } catch (error) {
        if (error.constraint === 'shop_api_sellers_email_key') {
            const err = { success: false, error: "Email already exists!"};
            return res.json(err);
        }
        if (error.constraint === 'shop_api_sellers_company_key') {
            const err = { success: false, error: "Company Account already exists!"};
            return res.json(err);
        }
        console.log(error);
        res.json({success: false, message: "Error creating seller. Please add all required params in the requests body. Read the Documentation."})
    }
})

/**
 * Login route. Requires username and password in the request body. Returns an JWT token as Cockie.
 */
router.post("/login", async (req, res) => {
    const db = req.db

    if (!req.body.email || !req.body.password) {
        const err = {success: false, error: "Email and password required."}
        return res.json(err)
    }

    const { email, password } = req.body

    const result = await db.query("SELECT * FROM shop_api_sellers WHERE email=$1", [email])

    if (result.rows.length !== 1) {
        const err = {success: false, error: "User not found."}
        return res.json(err)
    }
    const user = result.rows[0]
    if (await pw.verify(password, user.password)) {
        const token = jwt.sign({ user }, process.env.JWT_KEY, { expiresIn: process.env.JWT_EXPIRE });
        res.cookie('token', token, { maxAge: process.env.COCKIE_EXPIRE });
        return res.json({success: true, message: "Successful logged in.", token})
    } else {
        const err = {success: false, error: "Wrong Email or Password."}
        return res.json(err)
    }
})

// Updates a seller
router.put("/:id", verify, async (req, res) => {
    const db = req.db
    const id = req.params.id
    let query = "UPDATE shop_api_sellers SET "
    let params = [id]
    let counter = 2
    try {

        if (req.body.password && !validator.isStrongPassword(req.body.password)) {
            const err = {success: false, error: "Password to weak, at least 8 characters, One Uppercase, one lowecase, one Number and one Symbol required."}
            return res.json(err)
        }
    
        if (req.body.email && !validator.isEmail(req.body.email)) {
            const err = {success: false, error: "Email address not valid."}
            return res.json(err)
        }

        const allParams = ["password","company","email","street","city","post_code","house_nr","country"]
        let isSecondParam = false
        allParams.forEach(param => {
            if (req.body[param] && req.body[param] !== "") {
                if (isSecondParam) query += `, ${param} = $${counter}`
                    else query += `${param} = $${counter}`
                params.push(req.body[param])
                counter++
                isSecondParam = true
            }
        });

        const result = await db.query(`${query} WHERE id = $1 RETURNING id,company,email,street,city,post_code,house_nr,country`, params)
        const data = result.rows[0]
        res.json({success: true, message: "Succesful Updated seller.", data})

    } catch (error) {
        if (error.constraint === 'shop_api_sellers_email_key') {
            const err = { success: false, error: "Email already exists!"};
            return res.json(err);
        }
        if (error.constraint === 'shop_api_sellers_company_key') {
            const err = { success: false, error: "Company Account already exists!"};
            return res.json(err);
        }
        console.log(error);
        res.json({success: false, message: "Error creating seller. Please add all required params in the requests body. Read the Documentation."})
    }
})

// Deletes a seller
router.delete("/:id", verify, async (req, res) => {
    const db = req.db
    const id = req.params.id
    try {

        const result = await db.query(`DELETE FROM shop_api_sellers WHERE id = $1 RETURNING id,company,email,street,city,post_code,house_nr,country`, [id])
        const data = result.rows[0]
        res.clearCookie("token")
        res.json({success: true, message: "Succesful Deleted seller.", data})

    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error deleting seller. Read the Documentation."})
    }
})

module.exports = router