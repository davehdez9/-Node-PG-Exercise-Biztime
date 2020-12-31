const express = require('express')
const ExpressError = require("../expressError")
const router = express.Router()
const db = require("../db")

// Routes Needed 

/** GET /invoices
 *  Return info of invoices: like { invoices: [{id, comp_code}]}
*/
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT id, comp_code FROM invoices`)
        return res.json({invoices: results.rows})
    } catch (error) {
        next(error)
    }
})

/** GET /invoices/[id]
 * Return obj of given invoice 
 * If invoice cannot be found, return 404
 * Return {Invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}
*/

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const results = await db.query('SELECT id, amt, paid, add_date, paid_date, code, name,  description FROM invoices INNER JOIN  companies ON (invoices.comp_code = companies.code) WHERE id = $1', [id])
        if(results.rows.length === 0){
            throw new ExpressError(`Invoice not found`, 404)
        }
        const data = results.rows[0]
        const invoice = {
            id: data.id,
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,

            company: {
                code: data.comp_code,
                name: data.name,
                description: data.description,
            }
        }
        return res.json({"Invoice": invoice})
    } catch (error) {
        next(error)
    }
})

/** POST /invoices
 * Add invoices
 * Needs to be passed in JSON body of: {comp_code, amt}
 * Return: {invoice: {id, com_code, amt, paid, add_date, paid_date}}
*/

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt} = req.body

        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt])

        return res.status(201).json({"invoice": results.rows[0]})
    } catch (error) {
        next(error)
    }
})

/** PUT /invoices/[id]
 * Update an invoice
 * if invoice cannot be found, return 404
 * Need to be passed in JSON body of: {amt, paid}
 * if paying unpaid invoice -> sets paid_date to today
 *  if un-paying -> set paid_date to null
 *      else -> Keep current paid date
 * Return: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
*/
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const { amt, paid } = req.body
        let paidDate = null

        const currentResult = await db.query(
            `SELECT paid FROM invoices WHERE id = $1`, [id]
        )

        if(currentResult.rows.length === 0){
            throw new ExpressError(`Invoice ${id} not found`, 404)
        }

        const currentPaidDate = currentResult.rows[0].paid_date

        if(!currentPaidDate & paid){
            paidDate = new Date()
        } else if (!paid){
            paidDate = null
        } else {
            paidDate = currentPaidDate
        }

        const results = await db.query(`UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, paid, paidDate,id])
      
        return res.json({"invoice": results.rows[0]})
    } catch (error) {
        next(error)
    }
})

/** DELETE /companies/[id]
 * Deletes an invoice 
 * If invoice cannot be found, returns a 404.
 * Returns: {status: "deleted"}
*/

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const results = await db.query(`DELETE FROM invoices WHERE id=$1 RETURNING id`, [id])
        if (results.rows.length === 0) {
            throw new ExpressError(`Invoice ${id} not found`, 404)
        } else {
            return res.json({"status": "deleted"})
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router