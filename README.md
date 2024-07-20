# ts-tree-cli

This CLI uses [ts-tree](https://github.com/andriyor/ts-tree) to get file tree
and [coverage-tree](https://github.com/andriyor/coverage-tree-next) to show result on web

## Motivation

Using global thresholds in a large monolith, which is managed by multiple teams, threshold coverage is not so precise
and clear.
For instance, while a global threshold may be set at 70 percent, certain pages might not be covered at all.
This lack of coverage is not noticeable since we have a lot of lines of code on other pages. Additionally, different
pages may have different requirements for coverage depending on criticality.

In Jest, it's possible to specify thresholds by glob pattern, but it's not what we want since page code can be imported
from different folders.

So I decided to build a tool that generates a coverage report per entry file based on all files which imported into this
page.

## Installation

```shell
npm i -g @andriyorehov/ts-tree-cli
```

## Usage

Process coverage and save to file

```shell
ts-tree -f='pathToComponent.tsx' -c='projectDir/coverage-summary.json' -p -o='tree.json'
```

Open coverage tree on browser (works only if URL is less then 14
KB [URL_TOO_LONG](https://vercel.com/docs/errors/URL_TOO_LONG))

```shell
ts-tree -f='pathToComponent.tsx' -c='projectDir/coverage-summary.json' -w
```

By using team based config

```shell
ts-tree --bump --tolerance=1 --margin='1'
```

### Example config

`tree-cov.json`

```json
[
  {
    "team": "teamName",
    "threshold": {
      "lines": 50.09
    },
    "owns": [
      {
        "label": "Reports page",
        "file": "src/pages/reports/index.page.tsx",
        "threshold": {
          "branches": 50,
          "functions": 50,
          "lines": 50,
          "statements": 50
        }
      },
      {
        "label": "Settings page",
        "file": "src/pages/settings/index.page.tsx",
        "threshold": {
          "branches": 50,
          "functions": 50,
          "lines": 50,
          "statements": 50
        }
      }
    ]
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

✅ threshold per team

❌ output by accumulated tree threshold in console?

❌ better CLI handling

❌ --help option

## Tech Debt

- update `open` package to latest version with ESM
- use cache between files or use workers to increase performance


## Related

[[Feature]: Isolated coverage reports · Issue #13876 · jestjs/jest](https://github.com/jestjs/jest/issues/13876)
