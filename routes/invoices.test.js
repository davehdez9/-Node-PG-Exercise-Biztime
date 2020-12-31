// Connect the right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest")

// app imports
const app = require("../app")
const { testData } = require('./test_data')
const db = require("../db");
const { response } = require("express");

beforeEach(testData)

afterAll(async function(){
    await db.end()
})


/**GET /invoces */
describe("GET /invoices", () => {

    test('should return an invoice list', async () => {
        const response = await request(app).get('/invoices')
        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual({
            "invoices":[
                {id: 1, comp_code: "apple"},
                {id: 2, comp_code: "apple"},
            ]
        })
    })
    
})

/**GET /invoices/:id */
describe('GET /invoices/:id', () => {

    test('should return an object of given invoice', async () => {
        const response = await request(app).get(`/invoices/1`)
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(
            {
                "Invoice": {
                    id: 1,
                    amt: 200,
                    paid: false,
                    add_date: '2019-02-02T05:00:00.000Z',
                    paid_date: null,

                    company: {
                        // "code": 'apple',
                        "name": 'Apple',
                        "description": 'Maker of OSX',
                    }
                }
            }
        )
    })

    test('should return 404 if invoice cannot be found', async () => {
        const response = await request(app).get("/invoices/123")
        expect(response.status).toEqual(404)
    })
})

/**POST /invoices */
describe('POST /invoice', () => {

    test('should add an invoice', async () => {
        const response = await request(app).post("/invoices").send({amt: 500, comp_code: "apple"})
        expect(response.body).toEqual(
            {
                "invoice": {
                    id: 3,
                    comp_code: 'apple',
                    amt: 500,
                    add_date: expect.any(String),
                    paid: false,
                    paid_date: null
                }
            }
        )
        expect(response.status).toEqual(201)
    })  
})

/** PUT /invoices/:id */
describe('PUT /invoice/:id', () => {
    
    test('should update an invoice', async () => {
        const response = await request(app).put('/invoices/1').send({amt:1468, paid: false})
        expect(response.body).toEqual(
            {
                "invoice": {
                    id: 1,
                    comp_code: 'apple',
                    amt: 1468,
                    add_date: expect.any(String),
                    paid: false,
                    paid_date: null
                }
            })
    })

    test('should return 404 if invoice is not found', async () => {
        const response = await request(app).put('/invoice/122').send({amt:5555})
        expect(response.status).toEqual(404)
    })
})

/** DELETE /invoices/:id */
describe("DELETE /invoices/:id", () => {
    test('should delete an invoice', async () => {
        const response = await request(app).delete("/invoices/1")
        expect(response.body).toEqual({"status": "deleted"})
    })
    
    test('should return 404 if invoice is not found', async () => {
        const response = await request(app).delete("/invoices/4564")
        expect(response.status).toEqual(404)
    })
    
})



