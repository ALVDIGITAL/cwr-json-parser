import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'edi-preview': 'src/entries/edi-preview.ts',
    'record-parser': 'src/entries/record-parser.ts',
    schema: 'src/entries/schema.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  target: 'es2020',
  outDir: 'dist',
  cjsExtension: '.cjs',
  esbuildOptions(options) {
    options.keepNames = true;
  },
});
