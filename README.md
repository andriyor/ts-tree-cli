# ts-tree-cli

This CLI uses [ts-tree](https://github.com/andriyor/ts-tree) to get file tree and [coverage-tree](https://github.com/andriyor/coverage-tree-next) to show result on web

## Installation

```shell
npm i -g @andriyorehov/ts-tree-cli
```

## Usage

Process coverage and save to file

```shell
ts-tree -f='pathToComponent.tsx' -c='projectDir/coverage-summary.json' -p -o='tree.json'
```

Open coverage tree on browser

```shell
ts-tree -f='pathToComponent.tsx' -c='projectDir/coverage-summary.json' -w
```

## TODO

✅ save result to file

✅ handle coverage file

✅ calculate coverage

✅ open result on web app

❌ publish package

❌ better CLI handling

❌ --help option

❌ fix typings in coverage processing

## Tech Debt

- update `open` package to latest version with ESM
