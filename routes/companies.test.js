// Connect the right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest")

// app imports
const app = require("../app")
const { testData } = require('./test_data')
const db = require("../db")

beforeEach(testData)

afterAll(async function() {
    // Close db connection
    await db.end()
})


/** GET /companies -> Return list of companies */
describe("GET /companies", () => {
    test("Get a list of a company", async () => {
        const response = await request(app).get(`/companies`);
        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual({ "companies":[{code: "apple", name:"Apple"}]  })
    })
})

/** GET /companies/[code] */
describe("GET /companies/:code", () => {

    test("Get a company from its code", async () => {
        const response = await request(app).get(`/companies/apple`);
        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual(
            {
                "company": {
                    code: "apple",
                    name: "Apple",
                    description: "Maker of OSX",
                    invoices: [1,2]
                }
            }
        )
    })
    test("Respond 404 for invalid code", async () => {
        const response = await request(app).get('/companies/rosds')
        expect(response.statusCode).toBe(404)
    })
})

/** POST /companies */
describe("POST /companies", () => {
    test("Add a company", async () => {
        const response = await request(app).post('/companies').send({code:"eataly", name:"Eataly", description:"Italian Restaurant"})
        expect(response.statusCode).toBe(201)
        expect(response.body).toEqual({
            company: { code: 'eataly', name: 'Eataly', description:'Italian Restaurant'}
        })
    })
})


/** PUT /companies/[code] */
describe("PUT /companies/:code", () => {
    test("Update existing company", async () => {
        const response = await  request(app).put('/companies/apple').send({name:"AppleNYC", description:"New Name"})

        expect(response.body).toEqual({
            "company": { code: "apple", name:'AppleNYC', description:"New Name"}
        })
    })

    test("Should return 404 if company cannot be found", async () => {
        const response = await request(app).put('/companies/rososa').send(
            {name:"nqkwe"}
        )
        expect(response.status).toEqual(404)
    })

})

/**DELETE /companies/[code] */
describe("DELETE /companies/:code", () => {
    test("Should delete a company", async () => {
        const response = await request(app).delete('/companies/apple')
        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual({"status": "deleted"})
    })
    test("Should return 404 if company cannot be found", async () => {
        const response = await request(app).delete('/companies/rososa').send(
            {name:"nqkwe"}
        )
        expect(response.status).toEqual(404)
    })
})





