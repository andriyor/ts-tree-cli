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
    alias: 'f',
  },
  outputFile: {
    type: String,
    alias: 'o',
  },
  web: {
    type: Boolean,
    alias: 'w',
  },
  coverageFile: {
    type: String,
    alias: 'c',
  },
  process: {
    type: Boolean,
    alias: 'p',
  },
  processFlat: {
    type: Boolean,
  },
  threshold: {
    type: Number,
  },
});

type ThresholdPercentage = {
  lines: number;
  functions: number;
  statements: number;
  branches: number;
};

type Config = {
  file: string;
  threshold?: ThresholdPercentage;
}[];

const getURlFromTree = (tree: unknown) => {
  const stringiFiedTree = JSON.stringify(tree);
  const compressedJson = lzString.compressToEncodedURIComponent(stringiFiedTree);
  return `https://coverage-tree.vercel.app/?json=${compressedJson}`;
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
  const tree = getTreeByFile(parsed.flags.file).flatTree;
  fs.writeFileSync(parsed.flags.outputFile, JSON.stringify(tree, null, 2), 'utf-8');
} else if (parsed.flags.file && parsed.flags.coverageFile && parsed.flags.web) {
  const coverage = JSON.parse(fs.readFileSync(parsed.flags.coverageFile, 'utf-8'));
  const tree = getTreeByFile(parsed.flags.file, coverage).flatTree;
  const url = getURlFromTree(tree);
  open(url);
} else if (parsed.flags.file && parsed.flags.coverageFile) {
  const coverage = JSON.parse(fs.readFileSync(parsed.flags.coverageFile, 'utf-8'));
  const tree = getTreeByFile(parsed.flags.file, coverage).fileTree;
  console.dir(tree, { depth: null });
} else if (parsed.flags.file && parsed.flags.web) {
  const tree = getTreeByFile(parsed.flags.file).flatTree;
  const url = getURlFromTree(tree);
  open(url);
} else if (parsed.flags.file) {
  const tree = getTreeByFile(parsed.flags.file).flatTree;
  console.dir(tree, { depth: null });
} else {
  const config: Config = JSON.parse(fs.readFileSync('tree-cov.json', 'utf-8'));
  const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf-8'));
  for (const configItem of config) {
    const tree = getTreeByFile(configItem.file, coverage);
    const processedTree = processFlatCoverage(tree.flatTree as Record<string, FileTreeFlat>);

    if (configItem.threshold) {
      for (const thresholdName in configItem.threshold) {
        const configThreshold = configItem.threshold[thresholdName as keyof ThresholdPercentage];
        if (processedTree[thresholdName as keyof Coverage].pct <= configThreshold) {
          console.log(
            pc.bold(
              pc.red(
                `Root entry ${configItem.file}: coverage threshold for ${thresholdName} (${configThreshold}%) not met: ${processedTree.lines.pct}%`
              )
            )
          );
        } else {
          console.log(
            pc.bold(
              pc.green(
                `Root entry ${configItem.file}: coverage threshold for ${thresholdName} (${configThreshold}%) met: ${processedTree.lines.pct}%`
              )
            )
          );
        }
      }
    } else {
      console.log(pc.bold(pc.yellow(`Root entry ${configItem.file}:`)));
    }

    for (const treeProperty in tree.flatTree) {
      const meta = tree.flatTree[treeProperty].meta as Coverage;
      if (meta.lines.pct <= 50) {
        console.log(
          pc.red(`${treeProperty} ${meta.lines.pct}% lines ${meta.lines.covered}/${meta.lines.total}`)
        );
      }
    }
    console.log('');
  }
}
