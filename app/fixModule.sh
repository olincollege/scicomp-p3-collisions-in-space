#!/bin/bash

path='node_modules/canvas-sketch-cli/src/index.js'
sed -i 's/nodeModules: false/nodeModules: true/' $path
