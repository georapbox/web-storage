import * as esbuild from 'esbuild';

const PACKAGE_NAME = 'web-storage';

const ctx = await esbuild.context({
  entryPoints: [`src/${PACKAGE_NAME}.js`],
  bundle: true,
  sourcemap: true,
  format: 'esm',
  outdir: 'dist',
  metafile: true,
  plugins: [
    {
      name: 'rebuild-notify',
      setup(build) {
        build.onEnd(result => {
          console.log(`Build ended with ${result.errors.length} errors`);
        });
      }
    }
  ]
});

await ctx.watch();
