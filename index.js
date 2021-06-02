const puppeteer = require('puppeteer')
const fs = require('fs')
const _ = require('lodash')
const { Parser } = require('json2csv')
const { mongoDbCreate, mongoDbCreateMany, mongoDbFindCollection } = require('./lib/mongoUtils')

const runScrape = async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  // daily statistics
  await page.goto('https://koronavirus.gov.hu')
  const activeCapitalValue = await page.evaluate(
    el => parseInt(el.innerText.replace(/\s/g, '')),
    (await page.$$('#content-fertozott-pest'))[0]
  )
  const activeCountrysideValue = await page.evaluate(
    el => parseInt(el.innerText.replace(/\s/g, '')),
    (await page.$$('#content-fertozott-videk'))[0]
  )
  const recoveredCapitalValue = await page.evaluate(
    el => parseInt(el.innerText.replace(/\s/g, '')),
    (await page.$$('#content-gyogyult-pest'))[0]
  )
  const recoveredCountrysideValue = await page.evaluate(
    el => parseInt(el.innerText.replace(/\s/g, '')),
    (await page.$$('#content-gyogyult-videk'))[0]
  )
  const deceasedCapitalValue = await page.evaluate(
    el => parseInt(el.innerText.replace(/\s/g, '')),
    (await page.$$('#content-elhunyt-pest'))[0]
  )
  const deceasedCountrysideValue = await page.evaluate(
    el => parseInt(el.innerText.replace(/\s/g, '')),
    (await page.$$('#content-elhunyt-videk'))[0]
  )
  const inQuarantineValue = await page.evaluate(
    el => parseInt(el.innerText.replace(/\s/g, '')),
    (await page.$$('#content-karantenban'))[0]
  )
  const testedforCOVID19Value = await page.evaluate(
    el => parseInt(el.innerText.replace(/\s/g, '')),
    (await page.$$('#content-mintavetel'))[0]
  )
  const vaccinatedValue = await page.evaluate(
    el => parseInt(el.innerText.replace(/\s/g, '')),
    (await page.$$('#content-beoltottak'))[0]
  )
  const dateValueRaw = await page.evaluate(
    el => el.innerText,
    (await page.$x('//*[contains(text(),"Legutolsó frissítés dátuma:")]'))[0]
  )
  const dateValue = new Date(Date.parse(dateValueRaw))
    .toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    .replace(/\.\s/g, '.')

  const daily = {
    date: dateValue,
    activeCapital: activeCapitalValue,
    activeCountryside: activeCountrysideValue,
    activeSum: activeCapitalValue + activeCountrysideValue,
    recoveredCapital: recoveredCapitalValue,
    recoveredCountryside: recoveredCountrysideValue,
    recoveredSum: recoveredCapitalValue + recoveredCountrysideValue,
    deceasedCapital: deceasedCapitalValue,
    deceasedCountryside: deceasedCountrysideValue,
    deceasedSum: deceasedCapitalValue + deceasedCountrysideValue,
    inQuarantine: inQuarantineValue,
    testedforCOVID19: testedforCOVID19Value,
    vaccinated: vaccinatedValue
  }
  if (process.env.GITHUB_ACTIONS) await mongoDbCreate(daily)
  console.log(daily)

  // statistics about Hungarian victims
  const obj = []

  await page.goto('https://koronavirus.gov.hu/elhunytak')
  const lastPage = await page.evaluate(el => el.href.match(/\d+/), (await page.$$('.pager-last > a'))[0])

  for (let i = 0; i < parseInt(lastPage[0]) + 1; i++) {
    try {
      await page.goto('https://koronavirus.gov.hu/elhunytak?page=' + i)
      const count = await page.$$eval('.views-field-field-elhunytak-sorszam', el => el.length)
      for (let j = 1; j < count; j++) {
        try {
          const idValue = await page.evaluate(el => el.innerText, (await page.$$('.views-field-field-elhunytak-sorszam'))[j])
          const genderValue = await page.evaluate(el => el.innerText, (await page.$$('.views-field-field-elhunytak-nem'))[j])
          const ageValue = await page.evaluate(el => el.innerText, (await page.$$('.views-field-field-elhunytak-kor'))[j])
          const conditionsValue = await page.evaluate(
            el => el.innerText,
            (await page.$$('.views-field-field-elhunytak-alapbetegsegek'))[j]
          )
          const actual = {
            _id: parseInt(idValue),
            gender: genderValue,
            age: parseInt(ageValue),
            conditions: conditionsValue
          }

          console.log(actual)
          obj.push(actual)
        } catch (e) {
          console.error(e)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  // filter duplicates:
  const uniqObj = _.uniqBy(obj, '_id')

  // create data of victims
  fs.writeFileSync('result.json', JSON.stringify(uniqObj))
  await browser.close()

  // create daily data from DB
  const dailyResult = await mongoDbFindCollection('covid_19_hungary')
  fs.writeFileSync('dailyResult.json', JSON.stringify(dailyResult))

  try {
    if (process.env.GITHUB_ACTIONS) await mongoDbCreateMany(uniqObj)
  } catch (e) {
    console.error(e)
  }

  // victim data to CSV
  try {
    const json2csvParser = new Parser()
    const csv = json2csvParser.parse(uniqObj)
    fs.writeFileSync('result.csv', csv)
  } catch (e) {
    console.error(e)
  }

  // daily data to CSV
  try {
    const json2csvParser = new Parser()
    const csv = json2csvParser.parse(dailyResult)
    fs.writeFileSync('dailyResult.csv', csv)
  } catch (e) {
    console.error(e)
  }
}
runScrape()
