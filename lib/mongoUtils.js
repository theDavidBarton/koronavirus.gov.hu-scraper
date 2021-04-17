/*
 * ___________
 * MIT License
 *
 * Copyright (c) 2020 David Barton
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const { MongoClient } = require('mongodb')

const mongoUsername = process.env.MONGO_USERNAME
const mongoPassword = process.env.MONGO_PASSWORD
const uri = `mongodb+srv://${mongoUsername}:${mongoPassword}@cluster0.htkjv.mongodb.net/covid_19?retryWrites=true&w=majority`

const mongoDbCreate = async covidDataItem => {
  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    const db = client.db('covid_19').collection('covid_19_hungary')
    await db.insertOne(covidDataItem)
    client.close()
  } catch (e) {
    console.error(e)
  }
}

const mongoDbCreateMany = async covidDataItem => {
  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    const db = client.db('covid_19').collection('covid_19_hungary_victims')
    await db.deleteMany({})
    await db.insertMany(covidDataItem)
    client.close()
  } catch (e) {
    console.error(e)
  }
}

const mongoDbUpdateMany = async covidDataItem => {
  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    const db = client.db('covid_19').collection('covid_19_hungary_victims')
    for (const el of covidDataItem) {
      await db.updateOne({ _id: el._id }, { $set: el }, { upsert: true })
    }
    client.close()
  } catch (e) {
    console.error(e)
  }
}

const mongoDbSearch = async (targetId, collection) => {
  let res
  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    const db = client.db('covid_19').collection(collection)
    if (parseInt(targetId)) {
      res = await db.findOne({ _id: parseInt(targetId) })
    } else {
      res = null
    }
    client.close()
  } catch (e) {
    console.error(e)
  }
  return res
}
const test = require('../result.json')
mongoDbCreateMany(test)

module.exports = { mongoDbCreate, mongoDbCreateMany, mongoDbUpdateMany, mongoDbSearch }
