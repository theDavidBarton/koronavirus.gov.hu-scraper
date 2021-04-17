const puppeteer = require('puppeteer')
const fs = require('fs')
const { Parser } = require('json2csv')
const { mongoDbCreate, mongoDbCreateMany } = require('./lib/mongoUtils')

const runScrape = async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  // daily statistics
  await page.goto('https://koronavirus.gov.hu')
  const activeCapitalValue = await page.evaluate(
    el => parseInt(el.innerText.replace(/\s/g, '')),
    (await page.$$('#content-fertozott-pest'))[0]
  )
  const activeCountrySideValue = await page.evaluate(
    el => parseInt(el.innerText.replace(/\s/g, '')),
    (await page.$$('#content-fertozott-videk'))[0]
  )
  const recoveredCapitalValue = await page.evaluate(
    el => parseInt(el.innerText.replace(/\s/g, '')),
    (await page.$$('#content-gyogyult-pest'))[0]
  )
  const recoveredCountrySideValue = await page.evaluate(
    el => parseInt(el.innerText.replace(/\s/g, '')),
    (await page.$$('#content-gyogyult-videk'))[0]
  )
  const deceasedCapitalValue = await page.evaluate(
    el => parseInt(el.innerText.replace(/\s/g, '')),
    (await page.$$('#content-elhunyt-pest'))[0]
  )
  const deceasedCountrySideValue = await page.evaluate(
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
    activeCountrySide: activeCountrySideValue,
    activeSum: activeCapitalValue + activeCountrySideValue,
    recoveredCapital: recoveredCapitalValue,
    recoveredCountrySide: recoveredCountrySideValue,
    recoveredSum: recoveredCapitalValue + recoveredCountrySideValue,
    deceasedCapital: deceasedCapitalValue,
    deceasedCountrySide: deceasedCountrySideValue,
    deceasedSum: deceasedCapitalValue + deceasedCountrySideValue,
    inQuarantine: inQuarantineValue,
    testedforCOVID19: testedforCOVID19Value
  }
  if (process.env.GITHUB_ACTIONS) await mongoDbCreate(daily)
  console.log(daily)

  // statistics about Hungarian victims
  const obj = []

  await page.goto('https://koronavirus.gov.hu/elhunytak')
  const lastPage = await page.evaluate(el => el.href.match(/\d+/), (await page.$$('.pager-last > a'))[0])

  for (let i = 0; i < parseInt(lastPage[0]) + 1; i++) {
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
        // there are two victims with id 1762, later it will require correct duplicate research with lodash
        // as it is obviously unmaintainable
        if (parseInt(idValue) === 1762 && parseInt(ageValue) === 59) actual._id += 0.5

        console.log(actual)
        obj.push(actual)
      } catch (e) {
        console.error(e)
      }
    }
  }

  if (!process.env.GITHUB_ACTIONS) fs.writeFileSync('result.json', JSON.stringify(obj))
  await browser.close()

  try {
    if (process.env.GITHUB_ACTIONS) await mongoDbCreateMany(obj)
  } catch (e) {
    console.error(e)
  }
  try {
    const json2csvParser = new Parser()
    const csv = json2csvParser.parse(obj)
    if (!process.env.GITHUB_ACTIONS) fs.writeFileSync('result.csv', csv)
  } catch (e) {
    console.error(e)
  }
}
runScrape()
