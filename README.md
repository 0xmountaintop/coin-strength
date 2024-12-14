## Coin Strength

Coin strength index tool, by evaluating how much a cryptocurrency would gain if $100 worth of the coin were purchased during each BTC dip.

## Usage
+ update `periods` in `src/config.ts`, the periods are the time ranges when a BTC dip happened.
+ add ticker to `coin_list.txt`, you can find the ticker using [`https://api.coingecko.com/api/v3/search?query=<KEYWORD>`](https://api.coingecko.com/api/v3/search?query=<KEYWORD>). If the `market_cap_rank` matches, the `api_symbol` is the ticker.
+ run `yarn install && make run`
+ the output will be saved in a CSV file located at `results/YYYY/MM/YYYY-MM-DD.csv`
+ if you want to visualize the results, you can run `yarn serve` and visit http://127.0.0.1:8080 in your browser

## Visualization

The tool provides two ways to visualize the data:

1. Table View (index.html): Shows daily investment values in a tabular format
2. Chart View (index2.html): Displays price trends over time with the following features:
   - View predefined periods from config
   - Custom date ranges
   - Multiple coin selection
   - Interactive tooltips and legend

To access the visualizations:
1. Run `make serve`
2. Visit:
   - http://127.0.0.1:8080/index.html for table view
   - http://127.0.0.1:8080/index2.html for chart view