const db = require("../db")

async function testData(){
    await db.query("DELETE FROM invoices") 
    await db.query("DELETE FROM companies") 
    await db.query("SELECT setval('invoices_id_seq', 1, false)")
    
    await db.query(`INSERT INTO companies (code, name, description)
                        VALUES ('apple', 'Apple', 'Maker of OSX')
    `)

    const invoices = await db.query(
        `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
            VALUES ('apple', 200, false, '2019-02-02', null),
                    ('apple', 300, false, '2020-03-03', null)
            RETURNING id`
    )
}

module.exports = { testData }