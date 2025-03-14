## Coin Strength

Coin strength index tool, by evaluating how much a cryptocurrency would gain if $100 worth of the coin were purchased during each BTC dip.

## Usage
+ update `periods` in `src/config.ts`, the periods are the time ranges when a BTC dip happened.
+ add ticker to `coin_list.txt`, you can find the ticker using [`https://api.coingecko.com/api/v3/search?query=<KEYWORD>`](https://api.coingecko.com/api/v3/search?query=<KEYWORD>). If the `market_cap_rank` matches, the `api_symbol` is the ticker.
+ run `yarn install && make run`
+ the output will be saved in a CSV file located at `results/YYYY/MM/YYYY-MM-DD.csv`
+ if you want to visualize the results, you can run `yarn serve` and visit http://127.0.0.1:8080 in your browser
