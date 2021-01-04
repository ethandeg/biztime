// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
let testInvoice;
let testIndustry;

beforeEach(async () => {
  const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('fgl', 'Foreground Leads', 'marketing agency') RETURNING code, name, description`);
  testCompany = result.rows[0]
  const invoice = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('fgl', 150) RETURNING *`)
  testInvoice = invoice.rows[0]
  const industry = await db.query(`INSERT INTO industries (code, industry) VALUES ('mktg', 'Marketing') RETURNING code, industry`)
  testIndustry = industry.rows[0]
  await db.query(`INSERT INTO company_industries(industry_code, company_code)
  VALUES ('mktg', 'fgl')`)

})

afterEach(async () => {
  await db.query(`DELETE FROM companies`)
  await db.query(`DELETE FROM industries`)
})

afterAll(async () => {
  await db.end()

})

describe("GET /companies", () => {
  test("Get a list with one company", async () => {
    const res = await request(app).get('/companies')
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [testCompany] })
  })
})


describe("GET /companies/:code", () => {
  test("get single company data", async () => {
    const res = await request(app).get('/companies/fgl')
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({company: testCompany, invoices: [testInvoice.id], industries: [testIndustry.industry]})
  })
  test("get a 404 when searching for wrong company code", async () => {
    const res = await request(app).get('/companies/blank')
    expect(res.statusCode).toBe(404)
  })
})

describe("POST /", () => {
  test("create a new company", async () => {
    const res = await request(app).post('/companies').send({code: "msft", name: "Microsoft", description: "A technology company"})
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({company: {code: "msft", name: "Microsoft", description: "A technology company"}})
  })
})

describe("PUT /:code", async () => {
  test("Update an existing company", async () => {
    const res = await request(app).put("/companies/fgl").send({name: "Foreground Leads LLC", description: "A great digital marketing company"})
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({company: {code: "fgl", name: "Foreground Leads LLC", description: "A great digital marketing company"}})
  })
})


describe("DELETE /:code", () => {
  test("delete a company from db", async () => {
    const res = await request(app).delete("/companies/fgl")
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({message: 'DELETED'})
  })
})




