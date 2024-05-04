#!/usr/bin/env node

import fs from 'node:fs';

import { typeFlag } from 'type-flag';
import lzString from 'lz-string';
import open from 'open';
import pc from 'picocolors';
import { getTreeByFile } from '@andriyorehov/ts-graph';

import { Coverage, FileTreeFlat, processCoverage, processFlatCoverage } from './helper';

const parsed = typeFlag({
  file: {
    type: String,
    alias: 'f'
  },
  outputFile: {
    type: String,
    alias: 'o'
  },
  web: {
    type: Boolean,
    alias: 'w'
  },
  coverageFile: {
    type: String,
    alias: 'c'
  },
  process: {
    type: Boolean,
    alias: 'p'
  },
  processFlat: {
    type: Boolean
  },
  threshold: {
    type: Number
  },
  tolerance: {
    type: Number,
    default: 0
  },
  bump: {
    type: Boolean
  },
  bail: {
    type: Boolean,
    alias: 'b'
  },
  margin: {
    type: Number,
    alias: 'm'
  }
});

type ThresholdPercentage = {
  lines: number;
  functions: number;
  statements: number;
  branches: number;
};

type FileEntry = {
  label: string;
  file: string;
  threshold?: ThresholdPercentage;
}

type Config = {
  team: string,
  threshold: ThresholdPercentage;
  owns: FileEntry[]
}[];

const getURlFromTree = (tree: unknown) => {
  const stringiFiedTree = JSON.stringify(tree);
  const compressedJson = lzString.compressToEncodedURIComponent(stringiFiedTree);
  return `https://coverage-tree.vercel.app/#${compressedJson}`;
};

// TODO: better args handling
// handle coverage and threshold like jest
if (parsed.flags.file && parsed.flags.coverageFile && parsed.flags.processFlat) {
  const coverage = JSON.parse(fs.readFileSync(parsed.flags.coverageFile, 'utf-8'));
  const tree = getTreeByFile(parsed.flags.file, coverage);
  for (const treeProperty in tree.flatTree) {
    const meta = tree.flatTree[treeProperty].meta as Coverage;
    if (meta.lines.pct <= 50) {
      console.log(`${treeProperty} ${meta.lines.pct}% lines ${meta.lines.total}/${meta.lines.covered}`);
    }
  }
  const processedTree = processFlatCoverage(tree.flatTree as Record<string, FileTreeFlat>);
  if (parsed.flags.threshold && processedTree.lines.pct <= parsed.flags.threshold) {
    process.exit(1);
  }
} else if (
  parsed.flags.file &&
  parsed.flags.outputFile &&
  parsed.flags.coverageFile &&
  parsed.flags.process
) {
  const coverage = JSON.parse(fs.readFileSync(parsed.flags.coverageFile, 'utf-8'));
  const tree = getTreeByFile(parsed.flags.file, coverage).fileTree;
  const processedTree = processCoverage(tree);
  fs.writeFileSync(parsed.flags.outputFile, JSON.stringify(processedTree, null, 2), 'utf-8');
} else if (parsed.flags.file && parsed.flags.coverageFile && parsed.flags.process) {
  const coverage = JSON.parse(fs.readFileSync(parsed.flags.coverageFile, 'utf-8'));
  const tree = getTreeByFile(parsed.flags.file, coverage).fileTree;
  const processedTree = processCoverage(tree);
  console.dir(processedTree, { depth: null });
} else if (parsed.flags.file && parsed.flags.outputFile && parsed.flags.coverageFile) {
  const coverage = JSON.parse(fs.readFileSync(parsed.flags.coverageFile, 'utf-8'));
  const tree = getTreeByFile(parsed.flags.file, coverage).fileTree;
  fs.writeFileSync(parsed.flags.outputFile, JSON.stringify(tree, null, 2), 'utf-8');
} else if (parsed.flags.file && parsed.flags.outputFile) {
  const tree = getTreeByFile(parsed.flags.file).fileTree;
  fs.writeFileSync(parsed.flags.outputFile, JSON.stringify(tree, null, 2), 'utf-8');
} else if (parsed.flags.file && parsed.flags.coverageFile && parsed.flags.web) {
  const coverage = JSON.parse(fs.readFileSync(parsed.flags.coverageFile, 'utf-8'));
  const tree = getTreeByFile(parsed.flags.file, coverage).fileTree;
  const url = getURlFromTree(tree);
  open(url);
} else if (parsed.flags.file && parsed.flags.coverageFile) {
  const coverage = JSON.parse(fs.readFileSync(parsed.flags.coverageFile, 'utf-8'));
  const tree = getTreeByFile(parsed.flags.file, coverage).fileTree;
  console.dir(tree, { depth: null });
} else if (parsed.flags.file && parsed.flags.web) {
  const tree = getTreeByFile(parsed.flags.file).fileTree;
  const url = getURlFromTree(tree);
  open(url);
} else if (parsed.flags.file) {
  const tree = getTreeByFile(parsed.flags.file).fileTree;
  console.dir(tree, { depth: null });
} else {
  const coverageFile = 'coverage/coverage-summary.json';
  if (!fs.existsSync(coverageFile)) {
    console.log(`You need to enable json-summary reporting and run all tests before running this report`);
    process.exit()
  }
  const config: Config = JSON.parse(fs.readFileSync('tree-cov.json', 'utf-8'));
  const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));
  let totalFailsCount = 0;
  for (const teamConfig of config) {
    let teamFailsCount = 0;
    const totalByTeam = {} as ThresholdPercentage;
    for (const teamConfigElement of teamConfig.owns) {
      const tree = getTreeByFile(teamConfigElement.file, coverage);
      const processedTree = processFlatCoverage(tree.flatTree as Record<string, FileTreeFlat>);

      const header = `${teamConfigElement.label} owned by ${teamConfig.team}`;
      if (teamConfigElement.threshold) {
        for (const thresholdName in teamConfigElement.threshold) {
          const configThreshold = teamConfigElement.threshold[thresholdName as keyof ThresholdPercentage];
          if (processedTree[thresholdName as keyof Coverage].pct < configThreshold) {
            console.log(
              pc.bold(
                pc.red(
                  `${header}: coverage threshold for ${thresholdName} (${configThreshold}%) not met: ${processedTree[thresholdName as keyof Coverage].pct}%`
                )
              )
            );
            teamFailsCount += 1;
            totalFailsCount += 1;
          } else {
            console.log(
              pc.bold(
                pc.green(
                  `${header}: coverage threshold for ${thresholdName} (${configThreshold}%) met: ${processedTree[thresholdName as keyof Coverage].pct}%`
                )
              )
            );
            const increased = processedTree[thresholdName as keyof Coverage].pct - parsed.flags.tolerance;
            if (increased - teamConfigElement.threshold[thresholdName as keyof ThresholdPercentage] >= (parsed.flags.margin || 0)) {
              teamConfigElement.threshold[thresholdName as keyof ThresholdPercentage] = increased;
            }
            totalByTeam[thresholdName as keyof ThresholdPercentage] = increased + (totalByTeam[thresholdName as keyof ThresholdPercentage] || 0);
          }
        }
      } else {
        console.log(pc.bold(pc.yellow(`${header}:`)));
      }

      // report files with less than 50% coverage
      for (const treeProperty in tree.flatTree) {
        const meta = tree.flatTree[treeProperty].meta as Coverage;
        if (meta.lines.pct >= 50 && meta.lines.pct <= 80) {
          console.log(
            pc.yellow(`${treeProperty} ${meta.lines.pct}% lines ${meta.lines.covered}/${meta.lines.total}`)
          );
        }
        if (meta.lines.pct <= 50) {
          console.log(
            pc.red(`${treeProperty} ${meta.lines.pct}% lines ${meta.lines.covered}/${meta.lines.total}`)
          );
        }
      }
      console.log('');
    }

    // bump team threshold
    for (const teamThreshold in teamConfig.threshold) {
      if (!teamFailsCount && (totalByTeam[teamThreshold as keyof ThresholdPercentage] / teamConfig.owns.length) - teamConfig.threshold[teamThreshold as keyof Coverage] >= (parsed.flags.margin || 0)) {
        teamConfig.threshold[teamThreshold as keyof ThresholdPercentage] = Number((totalByTeam[teamThreshold as keyof ThresholdPercentage] / teamConfig.owns.length).toFixed(2));
      }
    }

    if (parsed.flags.bail && totalFailsCount) {
      process.exit(1);
    }
  }

  if (parsed.flags.bump) {
    fs.writeFileSync('tree-cov.json', `${JSON.stringify(config, null, 2)}\n`, 'utf-8');
  }

  if (totalFailsCount > 0) {
    process.exit(1);
  }
}
