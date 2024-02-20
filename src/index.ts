import fs from 'node:fs';

import { typeFlag } from 'type-flag';
import lzString from "lz-string";
import open from 'open';
import { getTreeByFile } from '@andriyorehov/ts-graph';

import { processCoverage } from './helper';

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
});


const getURlFromTree = (tree: unknown) => {
  const stringiFiedTree = JSON.stringify(tree);
  const compressedJson = lzString.compressToEncodedURIComponent(stringiFiedTree);
  return `https://coverage-tree.vercel.app/?json=${compressedJson}`;
}

// TODO: better args handling
if (parsed.flags.file && parsed.flags.outputFile && parsed.flags.coverageFile && parsed.flags.process) {
  const coverage = JSON.parse(fs.readFileSync(parsed.flags.coverageFile, 'utf-8'));
  const tree = getTreeByFile(parsed.flags.file, coverage);
  const processedTree = processCoverage(tree);
  fs.writeFileSync(parsed.flags.outputFile, JSON.stringify(processedTree, null, 2), 'utf-8');
} else if (parsed.flags.file && parsed.flags.coverageFile && parsed.flags.process) {
  const coverage = JSON.parse(fs.readFileSync(parsed.flags.coverageFile, 'utf-8'));
  const tree = getTreeByFile(parsed.flags.file, coverage);
  const processedTree = processCoverage(tree);
  console.dir(processedTree, { depth: null })
} else if (parsed.flags.file && parsed.flags.outputFile && parsed.flags.coverageFile) {
  const coverage = JSON.parse(fs.readFileSync(parsed.flags.coverageFile, 'utf-8'));
  const tree = getTreeByFile(parsed.flags.file, coverage);
  fs.writeFileSync(parsed.flags.outputFile, JSON.stringify(tree, null, 2), 'utf-8');
} else if (parsed.flags.file && parsed.flags.outputFile) {
  const tree = getTreeByFile(parsed.flags.file);
  fs.writeFileSync(parsed.flags.outputFile, JSON.stringify(tree, null, 2), 'utf-8');
} else if (parsed.flags.file && parsed.flags.coverageFile && parsed.flags.web) {
  const coverage = JSON.parse(fs.readFileSync(parsed.flags.coverageFile, 'utf-8'));
  const tree = getTreeByFile(parsed.flags.file, coverage);
  const url = `${getURlFromTree(tree)}&mode=coverageTree`;
  open(url);
} else if (parsed.flags.file && parsed.flags.coverageFile) {
  const coverage = JSON.parse(fs.readFileSync(parsed.flags.coverageFile, 'utf-8'));
  const tree = getTreeByFile(parsed.flags.file, coverage);
  console.dir(tree, { depth: null });
} else if (parsed.flags.file && parsed.flags.web) {
  const tree = getTreeByFile(parsed.flags.file);
  const url = getURlFromTree(tree);
  open(url);
} else if (parsed.flags.file) {
  const tree = getTreeByFile(parsed.flags.file);
  console.dir(tree, { depth: null });
} else {
  console.log('provide required --file option');
}
