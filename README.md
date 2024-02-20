# ts-tree-cli

This tool uses 

## Usage 

### CLI

Process coverage and save to file

```shell
tsx src/index.ts -f='pathToComponent.tsx' -c='projectDir/coverage-summary.json' -p -o='tree.json'
```

Open coverage tree on browser

```shell
tsx src/index.ts -f='pathToComponent.tsx' -c='projectDir/coverage-summary.json' -w
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
