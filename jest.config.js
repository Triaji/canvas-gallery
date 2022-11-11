module.exports = {
  clearMocks: true,
  setupFilesAfterEnv: ['regenerator-runtime/runtime'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFiles: ['fake-indexeddb/auto', 'jest-canvas-mock'],
};
