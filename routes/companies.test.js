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
  console.log(testIndustry)
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
    expect(res.body).toEqual({company: testCompany, invoices: [testInvoice], industries: [testIndustry.industry]})
  })
})

// describe("GET /users/:id", () => {
//   test("Gets a single user", async () => {
//     const res = await request(app).get(`/users/${testUser.id}`)
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toEqual({ user: testUser })
//   })
//   test("Responds with 404 for invalid id", async () => {
//     const res = await request(app).get(`/users/0`)
//     expect(res.statusCode).toBe(404);
//   })
// })

// describe("POST /users", () => {
//   test("Creates a single user", async () => {
//     const res = await request(app).post('/users').send({ name: 'BillyBob', type: 'staff' });
//     expect(res.statusCode).toBe(201);
//     expect(res.body).toEqual({
//       user: { id: expect.any(Number), name: 'BillyBob', type: 'staff' }
//     })
//   })
// })

// describe("PATCH /users/:id", () => {
//   test("Updates a single user", async () => {
//     const res = await request(app).patch(`/users/${testUser.id}`).send({ name: 'BillyBob', type: 'admin' });
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toEqual({
//       user: { id: testUser.id, name: 'BillyBob', type: 'admin' }
//     })
//   })
//   test("Responds with 404 for invalid id", async () => {
//     const res = await request(app).patch(`/users/0`).send({ name: 'BillyBob', type: 'admin' });
//     expect(res.statusCode).toBe(404);
//   })
// })
// describe("DELETE /users/:id", () => {
//   test("Deletes a single user", async () => {
//     const res = await request(app).delete(`/users/${testUser.id}`);
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toEqual({ msg: 'DELETED!' })
//   })
// })


