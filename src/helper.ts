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

export type FileTreeFlat = FileTree & {
  meta: Coverage;
  children: FileTreeFlat[];
};

export const processCoverage = (tree: FileTree) => {
  const traverseAndBundleTree = (node: FileTreeNew) => {
    if (node.children.length) {
      for (const child of node.children) {
        if (!child['totalMeta']) {
          child['totalMeta'] = lodash.cloneDeep(child.meta) as Coverage;
        }
        traverseAndBundleTree(child);
        for (const type of ['lines', 'functions', 'statements', 'branches']) {
          for (const prop of ['total', 'covered', 'skipped']) {
            node.totalMeta[type as keyof Coverage][prop as keyof CoverageInfo] =
              node.totalMeta[type as keyof Coverage][prop as keyof CoverageInfo] +
              child.totalMeta[type as keyof Coverage][prop as keyof CoverageInfo];
          }
        }

        for (const type of ['lines', 'functions', 'statements', 'branches']) {
          node['totalMeta'][type as keyof Coverage].pct = Number(
            (
              (node.totalMeta[type as keyof Coverage].covered * 100) /
              node.totalMeta[type as keyof Coverage].total
            ).toFixed(2)
          );
        }
      }
    }
  };

  // @ts-expect-error
  tree['totalMeta'] = lodash.cloneDeep(tree.meta);
  traverseAndBundleTree(tree as FileTreeNew);
  return tree;
};


export const processFlatCoverage = (flatTree: Record<string, FileTreeFlat>) => {
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
    for (const type in totalCoverage) {
      for (const prop in emptyInfo) {
        totalCoverage[type as keyof Coverage][prop as keyof CoverageInfo] =
          totalCoverage[type as keyof Coverage][prop as keyof CoverageInfo] +
          flatTree[flatTreeProperty as keyof typeof flatTree]['meta'][type as keyof Coverage][
            prop as keyof CoverageInfo
          ];
      }
    }
  }
  for (const type in totalCoverage) {
    totalCoverage[type as keyof Coverage].pct = Number(
      (
        (totalCoverage[type as keyof Coverage].covered * 100) /
        totalCoverage[type as keyof Coverage].total
      ).toFixed(2)
    );
  }

  return totalCoverage;
}
