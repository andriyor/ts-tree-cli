import lodash from 'lodash';
import type { FileTree } from '@andriyorehov/ts-graph/build/fileTree';

type CoverageInfo = {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
};

export type Coverage = {
  lines: CoverageInfo;
  functions: CoverageInfo;
  statements: CoverageInfo;
  branches: CoverageInfo;
};

export type FileTreeNew = FileTree & {
  totalMeta: Coverage;
  children: FileTreeNew[];
};

export const processCoverage = (tree: FileTree) => {
  const traverseAndBundleTree = (node: FileTreeNew) => {
    if (node.children.length) {
      for (const child of node.children) {
        if (!child['totalMeta']) {
          // @ts-expect-error
          child['totalMeta'] = lodash.cloneDeep(child.meta);
        }
        traverseAndBundleTree(child);
        for (const type of ['lines', 'functions', 'statements', 'branches']) {
          for (const prop of ['total', 'covered', 'skipped']) {
            // @ts-expect-error
            node['totalMeta'][type][prop] = node['totalMeta'][type][prop] + child['totalMeta'][type][prop];
          }
        }

        for (const type of ['lines', 'functions', 'statements', 'branches']) {
          // @ts-expect-error
          node['totalMeta'][type].pct = Number(((node['totalMeta'][type].covered * 100) / node['totalMeta'][type].total).toFixed(2));
        }
      }
    }
  };

  // @ts-expect-error
  tree['totalMeta'] = lodash.cloneDeep(tree.meta);
  return tree;
};


export const processFlatCoverage = (flatTree: Record<string, FileTree>) => {
  const emptyInfo: CoverageInfo = {
    total: 0,
    covered: 0,
    skipped: 0,
    pct: 0
  }
  const totalCoverage: Coverage = {
    lines: emptyInfo,
    functions: emptyInfo,
    statements: emptyInfo,
    branches: emptyInfo,
  }

  for (const flatTreeProperty in flatTree) {
    for (const type of ['lines', 'functions', 'statements', 'branches']) {
      for (const prop of ['total', 'covered', 'skipped']) {
        // @ts-expect-error
        totalCoverage[type][prop] = totalCoverage[type][prop] + flatTree[flatTreeProperty]['meta'][type][prop];
      }
    }
  }
  for (const type of ['lines', 'functions', 'statements', 'branches']) {
    // @ts-expect-error
    totalCoverage[type].pct = Number(((totalCoverage[type].covered * 100) / totalCoverage[type].total).toFixed(2));
  }

  return totalCoverage;
}
