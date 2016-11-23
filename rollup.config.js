import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
const version = require('./package.json').version;

let plugins = [
  nodeResolve({
    jsnext: true,
    browser: true
  }),
  commonjs(),
  babel({
    exclude: 'node_modules/**'
  })
];

if (process.env.NODE_ENV === 'production') {
  plugins.push(uglify());
}

export default {
  format: 'umd',
  moduleName: 'gsheets',
  plugins: plugins,
  banner: '/*! gsheets ' + version + ' */'
};
