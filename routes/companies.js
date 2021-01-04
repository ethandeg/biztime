const express = require("express");
const ExpressError = require("../expressError")
const db = require("../db");
let router = new express.Router();


router.get('/', async (req, res, next) => {
    const results = await db.query(`SELECT * FROM companies`)
    return res.json({ companies: results.rows })
})

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
        const invoices = await db.query(`SELECT id FROM invoices WHERE comp_code = $1`, [code])
        const industries = await db.query(`SELECT industry FROM industries JOIN company_industries ON industries.
        code = company_industries.industry_code WHERE company_industries.company_code =$1`, [code])
        if(!results.rows.length){
            throw new ExpressError(`Cannot find company with code ${code}`, 404)
        }
        return res.json({ company: results.rows[0], invoices: invoices.rows.map(i => i.id), industries:industries.rows.map(i => i.industry) })
    } catch(e){
        return next(e)
    }

})

router.post('/', async (req, res, next) => {
    try {
        const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`, [req.body.code, req.body.name, req.body.description])
        return res.status(201).json({ company: result.rows[0] })
    } catch (e) {
        return next(e)
    }
})


router.put('/:code', async (req, res, next) => {

    try {
        let { name, description } = req.body;
        let { code } = req.params;
        const result = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code,name,description`, [name, description, code])
        if (!result.rows.length) {
            throw new ExpressError(`${req.params.code} is not a valid code`, 404)
        }
        return res.json({ company: result.rows[0] })
    } catch (e) {
        return next(e)
    }

})

router.delete('/:code', async (req, res, next) => {
    try {
        const result = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING code`, [req.params.code])
        if (!result.rows.length) {
            throw new ExpressError(`Can not find company ${req.params.code}`, 404)
        }
        return res.json({ message: 'DELETED' })
    } catch (e) {
        return next(e)
    }
})





module.exports = router;