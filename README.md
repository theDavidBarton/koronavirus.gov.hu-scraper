# koronavirus.gov.hu-scraper

Data source: https://koronavirus.gov.hu/

Scraped data: [Google Sheets](https://docs.google.com/spreadsheets/d/15qn3VUl0H-C5ePOG3EtX4N2ZGe0j4BMqJvJIoBm1PqI/edit#gid=2114569011)

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
