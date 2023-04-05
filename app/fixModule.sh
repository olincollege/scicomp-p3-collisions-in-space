#!/bin/bash

path='node_modules/canvas-sketch-cli/src/index.js'
sed -i '' 's/nodeModules: false/nodeModules: true/' $path

echo "Success! canvas-sketch-cli module changed to support imports."