## Coin Strength

Coin strength index tool, by evaluating how much a cryptocurrency would gain if $100 worth of the coin were purchased during each BTC dip.

## Usage
+ update `periods` in `src/config.ts`, the periods are the time ranges when a BTC dip happened.
+ add ticker to `coin_list.txt`, you can find the ticker on a specific cryptocurrency's coingecko page [`https://www.coingecko.com/en/coins/<TICKER>`](https://www.coingecko.com/en/coins/<TICKER>)
    + For example, the ticker of https://www.coingecko.com/en/coins/bitcoin is `bitcoin`
    + or you can also find it using [`https://api.coingecko.com/api/v3/search?query=<KEYWORD>`](https://api.coingecko.com/api/v3/search?query=<KEYWORD>)
+ run `yarn install && make run`
+ the output will be saved in a CSV file located at `results/YYYY/MM/YYYY-MM-DD.csv`

## TODO

- [ ] add frontend to visualize the results
