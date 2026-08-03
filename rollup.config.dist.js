import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import uglify from "@lopatnov/rollup-plugin-uglify";
import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy'

const replaceOpts = {
    'typeof CANVAS_RENDERER': JSON.stringify(true),
    'typeof WEBGL_RENDERER': JSON.stringify(true),
    'typeof EXPERIMENTAL': JSON.stringify(true),
    'typeof PLUGIN_CAMERA3D': JSON.stringify(false),
    'typeof PLUGIN_FBINSTANT': JSON.stringify(false),
    'typeof FEATURE_SOUND': JSON.stringify(true)
};

//  Fresh plugin instances per bundle (typescript2 keeps per-instance caches).
function corePlugins() {
    return [
        replace(replaceOpts),
        nodeResolve({ extensions: ['.ts', '.tsx'] }),
        commonjs({
            include: ['node_modules/eventemitter3/**', 'node_modules/phaser/**'],
            exclude: ['node_modules/phaser/src/polyfills/requestAnimationFrame.js'],
            sourceMap: false,
            ignoreGlobal: true
        }),
        typescript(),
        uglify({ mangle: false })
    ];
}

export default [
    //  The student game.
    {
        input: ['./src/game.ts'],
        output: { file: './dist/game.js', name: 'MyGame', format: 'iife', sourcemap: false, intro: 'var global = window;' },
        plugins: [
            copy({
                targets: [
                    { src: 'src/index.html', dest: 'dist' },
                    { src: 'src/index.css', dest: 'dist' },
                    { src: 'src/teacher.html', dest: 'dist' },
                    { src: 'src/teacher.css', dest: 'dist' },
                    { src: 'src/assets/*', dest: 'dist/assets' }
                ]
            }),
            ...corePlugins()
        ]
    },
    //  The teacher admin portal (separate page: dist/teacher.html + teacher.js).
    {
        input: ['./src/teacher.ts'],
        output: { file: './dist/teacher.js', name: 'Teacher', format: 'iife', sourcemap: false, intro: 'var global = window;' },
        plugins: corePlugins()
    }
];
