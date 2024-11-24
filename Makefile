TS_NODE = ./node_modules/.bin/ts-node
COIN_LIST = coin_list.txt

.PHONY: all install run

all: install run

install:
	yarn install

run: $(COIN_LIST)
	@echo "Running price_fetcher..."
	@$(TS_NODE) src/index.ts
