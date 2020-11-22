const puppeteer = require('puppeteer')
const fs = require('fs')
const { Parser } = require('json2csv')

const runScrape = async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
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
          id: idValue,
          gender: genderValue,
          age: ageValue,
          conditions: conditionsValue
        }
        console.log(actual)
        obj.push(actual)
      } catch (e) {
        console.error(e)
      }
    }
  }

  fs.writeFileSync('result.json', JSON.stringify(obj))
  console.log('result.json saved')
  await browser.close()
  try {
    const json2csvParser = new Parser()
    const csv = json2csvParser.parse(obj)

    fs.writeFileSync('result.csv', csv)
    console.log('result.csv saved')
  } catch (e) {
    console.error(e)
  }
}
runScrape()
