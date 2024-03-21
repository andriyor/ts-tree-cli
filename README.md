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

Open coverage tree on browser (works only if URL is less then 14 KB [URL_TOO_LONG](https://vercel.com/docs/errors/URL_TOO_LONG))

```shell
ts-tree -f='pathToComponent.tsx' -c='projectDir/coverage-summary.json' -w
```

## TODO

✅ save result to file

✅ handle coverage file

✅ calculate coverage

✅ open result on web app

✅ publish package

✅ output by threshold in console

❌ output by tree threshold in console

❌ colorized output

❌ config with file entries

❌ better CLI handling

❌ --help option

❌ fix typings in coverage processing

## Tech Debt

- update `open` package to latest version with ESM
