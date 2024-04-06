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

✅ output by all files in tree threshold in console

✅ config with file entries

✅ colorized output

✅ auto bump threshold

✅ exit code on when threshold not met

❌ output by accumulated tree threshold in console?

❌ better CLI handling

❌ --help option

## Tech Debt

- update `open` package to latest version with ESM

- try [JLarky on X: "fun fact: while chrome URL limit is 2,083 characters the hash part of URL is not limited by this number, that's why I was able to put 100kb of code into typescript playground :)" / X](https://twitter.com/jlarky/status/1771603877676142666)
