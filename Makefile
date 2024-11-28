TS_NODE = ./node_modules/.bin/ts-node
COIN_LIST = coin_list.txt

.PHONY: all install run serve

all: install run

install:
	yarn install

run: $(COIN_LIST)
	@echo "Running price_fetcher..."
	@$(TS_NODE) src/index.ts

serve:
	@echo "Starting static file server..."
	@$(TS_NODE) src/server.ts
