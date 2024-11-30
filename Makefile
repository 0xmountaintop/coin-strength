TS_NODE = ./node_modules/.bin/ts-node
COIN_LIST = coin_list.txt

.PHONY: all install run serve

all: install run

install:
	yarn install
