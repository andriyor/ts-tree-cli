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

## Example config

`tree-cov.json`

```json
[
  {
    "file": "src/pages/reports/index.page.tsx",
    "threshold": {
      "branches": 50,
      "functions": 50,
      "lines": 50,
      "statements": 50
    }
  },
  {
    "file": "src/pages/settings/index.page.tsx",
    "threshold": {
      "branches": 50,
      "functions": 50,
      "lines": 50,
      "statements": 50
    }
  }
]
```


## TODO

✅ save result to file

✅ handle coverage file

✅ calculate coverage

✅ open result on web app

✅ publish package

✅ output by threshold in console

✅ config with file entries

❌ output by tree threshold in console

❌ colorized output

❌ better CLI handling

❌ --help option

❌ fix typings in coverage processing

## Tech Debt

- update `open` package to latest version with ESM
