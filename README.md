# koronavirus.gov.hu-scraper

Data source: https://koronavirus.gov.hu/

Scraped data: [Google Sheets](https://docs.google.com/spreadsheets/d/15qn3VUl0H-C5ePOG3EtX4N2ZGe0j4BMqJvJIoBm1PqI/edit#gid=0)

## Run script

`app.env` (gitgnored) should be sourced to make MongoDB credentials availble:

app.env:

```bash
export MONGO_USERNAME="********"
export MONGO_PASSWORD="********"
```

```bash
sourece app.env
```

Finally run the sraper in Node.js:

```bash
node index.js
```

## License

MIT
