# koronavirus.gov.hu-scraper

> :warning: The Hungarian Government shut down https://koronavirus.gov.hu/ and stopped publishing COVID-19 data on 2nd January 2023.

Data source: https://koronavirus.gov.hu/

Scraped data: [Google Sheets](https://docs.google.com/spreadsheets/d/15qn3VUl0H-C5ePOG3EtX4N2ZGe0j4BMqJvJIoBm1PqI/edit#gid=2114569011)

> Since the number of COVID-19 victims exceeded 30000 the Google Sheets auto import exceeds the maximum importable rows. The data can be downloaded from [here](https://raw.githubusercontent.com/theDavidBarton/koronavirus.gov.hu-scraper/main/result.csv).

## Script running

`app.env` (gitignored) should be sourced to make MongoDB credentials available in the current environment:

app.env:

```bash
export MONGO_USERNAME="********"
export MONGO_PASSWORD="********"
```

```bash
source app.env
```

Run the sraper with Node.js:

```bash
node index.js
```

## License

MIT
