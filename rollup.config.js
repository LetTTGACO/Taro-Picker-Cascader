import path from 'path'
import postcss from 'rollup-plugin-postcss'
import RollupTypescript from 'rollup-plugin-typescript2'
import alias from '@rollup/plugin-alias'
import base64 from 'postcss-base64'
import postcssurl from 'postcss-url'
import pkg from './package.json'

const resolveFile = (source) => path.resolve(__dirname, source)

const externalPackages = [
  'react',
  'react-dom',
  '@tarojs/components',
  '@tarojs/runtime',
  '@tarojs/taro',
  '@tarojs/react',
]

export default {
  input: resolveFile(pkg.source),
  output: [
    {
      file: resolveFile('build/index.js'),
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
    },
    {
      file: resolveFile('build/index.esm.js'),
      format: 'es',
      sourcemap: true,
      exports: 'auto',
    },
  ],
  external: externalPackages,
  plugins: [
    alias({
      entries: [{ find: '@', replacement: resolveFile('src') }],
    }),
    postcss({
      extract: resolveFile('build/index.css'),
      minimize: true,
      plugins: [
        postcssurl({
          url: 'inline',
        }),
        base64({
          extensions: ['.png', '.jpeg'],
        }),
      ],
    }),
    RollupTypescript({
      tsconfig: resolveFile('tsconfig.rollup.json'),
    }),
  ],
}
