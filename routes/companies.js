/** companies Routes   */

const express = require("express")
const ExpressError = require("../expressError")
const router = express.Router()
const slugify = require("slugify")
const db = require("../db")

// Routes Needed

/** GET /companies -> Return list of companies */
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name FROM companies`)
        return res.json({companies: results.rows})
    } catch (error) {
        next(error)
    }
})

/** GET /companies/[code] -> 
 * Return obj of companies
 * If the company cannot be found, return 404 status response
 */
router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params

        const compData = await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
        const invData = await db.query(`SELECT id FROM invoices WHERE comp_code = $1`, [code])

        if(compData.rows.length === 0){
            throw new ExpressError(`Cannot found company with code of ${code}`, 404)
        }

        const company = compData.rows[0]
        const invoices = invData.rows

        company.invoices = invoices.map(inv => inv.id)

        return res.json({ "company": company})
    } catch (error) {
        next(error)
    }
})

/** POST /companies -> 
 *  [x]Add company  
 *  [x]need to be given JSON : { code, name, description }
 *  [x]Return obj with new company : { company: { code, name, description }}
*/
router.post('/', async (req,res, next) => {
    try {
        const { name, description } = req.body
        const code = slugify(name, {lower: true})

        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description])
        return res.status(201).json({ company: results.rows[0]})
    } catch (error) {
        next(error)
    }
})

/** PUT /companies/[code] -> 
 * Edit Existing company
 * Should return 4040 if company cannot be found
 * Needs to be given JSON like: {name, description}
 * Return update company object: {company: { code, name, description } }
*/

router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params
        const { name, description} = req.body
        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description', [name, description, code])
        if(results.rows.length === 0){
            throw new ExpressError(`Can't update this code: ${code}`, 404)
        }
        return res.send({company: results.rows[0]})
    } catch (error) {
        next(error)
    }
})

// DELETE /companies/[code] -> Delete company, return 404 if company cannot be found
/** DELETE /companies/[code] -> 
 * Deletes Company
 * Should return 404 if company cannot be found 
 * return {status: "deleted"}
*/
router.delete('/:code', async (req, res, next) => {
    try {
        const {code} = req.params
        const results = await db.query("DELETE FROM companies WHERE code=$1 RETURNING code", [code])
        
        if(results.rows.length === 0){
            throw new ExpressError(`Not Found company: ${code}`, 404)
        } else {
            return res.json({"status": "deleted"})
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router