const express = require('express')
const ExpressError = require('../expressError')
const db = require('../db')
let router = new express.Router();


router.get('/', async (req, res, next) => {
    const results = await db.query(`SELECT * FROM invoices`)
    return res.json({ invoices: results.rows })
})


router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id])
        if (!results.rows.length) {
            throw new ExpressError(`There is no invoice with the given id: ${id}`, 404)
        }
        return res.json({ invoice: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})


router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`, [comp_code, amt])
        return res.status(201).json({ invoice: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})


router.put('/:id', async (req, res, next) => {
    try {
        let results;
        const { amt, paid } = req.body;
        const { id } = req.params
        let paidDate = null
        if(paid === true){
            paidDate = new Date()
        } else {
            paidDate = null
        }

        results = await db.query(`UPDATE invoices SET amt=$1, paid=$2, paid_date = $4 WHERE id=$3 RETURNING *`, [amt, paid, id, paidDate])
       
        if (!results.rows.length) {
            throw new ExpressError(`Can not find invoice with the id ${id}`)
        }
        return res.json({ invoice: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})


router.delete("/:id", async function (req, res, next) {
    try {
        let id = req.params.id;

        const result = await db.query(
            `DELETE FROM invoices
             WHERE id = $1
             RETURNING id`,
            [id]);

        if (result.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`, 404);
        }

        return res.json({ "status": "deleted" });
    }

    catch (err) {
        return next(err);
    }
});


module.exports = router;
