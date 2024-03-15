export default {
  entry: 'src/index.ts',
  cjs: 'babel',
  esm: { type: 'babel', importLibToEs: true },
  umd: {
    name: 'YuntiRequest',
  },
  runtimeHelpers: true,
};
