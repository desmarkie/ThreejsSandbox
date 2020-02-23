import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'
import glslify from 'rollup-plugin-glslify'
import copy from 'rollup-plugin-copy'
import htmlTemplate from 'rollup-plugin-generate-html-template'

export default {
	input: './src/index.js',
	output: {
		file: 'dist/js/bundle.js',
		format: 'iife',
		sourcemap: 'inline'
	},
	plugins: [
		glslify({
			basedir: 'src/shaders',
			include: [
				'**/*.vs',
				'**/*.fs',
				'**/*.vert',
				'**/*.frag',
				'**/*.glsl'
			],
			exclude: 'node_modules/**'
		}),
		nodeResolve({
			modulesOnly: true
		}),
		babel({
			extensions: [".js"],
			exclude: "node_modules/**"
		}),
		commonjs({
			exclude: "node_modules/**"
		}),
		copy({
			targets: [
				{ src: 'src/index.html', dest: 'dist/' },
				{ src: 'static/assets/', dest: 'dist/' },
				{ src: 'static/libs/', dest: 'dist/' },
			]
		}),
		serve({
			open: true,
			verbose: true,
			contentBase: 'dist',
			// Options used in setting up server
			host: 'localhost',
			port: 8000,
			headers: {
				'Access-Control-Allow-Origin': '*'
			}
		}),
		htmlTemplate({
			template: 'src/index.html',
			target: 'dist/index.html',
		})
	],
}
