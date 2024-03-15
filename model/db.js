const connectDB = async (req, res, next) => {

    try {
        const pg = require("pg")
        const bcrypt = require("bcrypt")

        const db = new pg.Client({
            user: process.env.PG_USER,
            password: process.env.PG_PW,
            port: process.env.PG_PORT,
            database: process.env.PG_DB,
            host: process.env.PG_HOST
        })
        db.connect()
    
        await db.query("CREATE TABLE IF NOT EXISTS shop_api_users ( \
            id SERIAL PRIMARY KEY, \
            creationdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \
            password TEXT NOT NULL, \
            fname TEXT NOT NULL, \
            lname TEXT NOT NULL, \
            email TEXT NOT NULL UNIQUE, \
            street TEXT NOT NULL, \
            city TEXT NOT NULL, \
            post_code INT NOT NULL, \
            house_nr TEXT NOT NULL, \
            country TEXT NOT NULL, \
            cart INT[], \
            is_seller BOOL NOT NULL DEFAULT false, \
            FOREIGN KEY (cart) REFERENCES shop_api_products(id) \
        )")

        await db.query("CREATE TABLE IF NOT EXISTS shop_api_sellers ( \
            id SERIAL PRIMARY KEY, \
            creationdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \
            password TEXT NOT NULL, \
            company TEXT NOT NULL UNIQUE, \
            email TEXT NOT NULL UNIQUE, \
            street TEXT NOT NULL, \
            city TEXT NOT NULL, \
            post_code INT NOT NULL, \
            house_nr TEXT NOT NULL, \
            country TEXT NOT NULL, \
            is_seller BOOL NOT NULL DEFAULT true \
        )")
    
        await db.query("CREATE TABLE IF NOT EXISTS shop_api_products ( \
            id SERIAL PRIMARY KEY, \
            creationdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \
            description TEXT NOT NULL, \
            seller_id INT NOT NULL, \
            price MONEY NOT NULL, \
            Currency TEXT NOT NULL, \
            FOREIGN KEY (seller) REFERENCES shop_api_sellers(id) \
        )")

        await db.query("CREATE TABLE IF NOT EXISTS shop_api_orders ( \
            id SERIAL PRIMARY KEY, \
            creationdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \
            seller_id INT NOT NULL, \
            user_id INT NOT NULL, \
            product_id INT NOT NULL, \
            FOREIGN KEY (seller_id) REFERENCES shop_api_sellers(id), \
            FOREIGN KEY (user_id) REFERENCES shop_api_users(id), \
            FOREIGN KEY (product_id) REFERENCES shop_api_products(id) \
        );");
        
        req.db = db
        console.log("Connected to database.");
        next()

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            error:"Internal server Error"
        })
    }
}

const disconnectDB = (req, res, next) => {
    res.on('finish', () => {
        if (req.db) {
          req.db.end();
        }
    });
    next(); 
}

module.exports = {connectDB, disconnectDB}
