#!/usr/bin/env node


'use strict';

let program = require('commander');
let pkg = require('./package.json');
let nnstats = require('nnstats');
let fs = require('fs');
let path = require('path');

program
  .version(pkg.version);

program
  .command('parse <path>')
  .description('Analyze model.')
  .option("-t, --tf", "Toggle Tensflow statistics.")
  .option("-o, --out <path>", "Save to file.")
  .option("-v, --verbose", "Silent.")
  .action(function(filepath, options) {
    let ops = {};
    ops.tensorflow = options.tf;

    let absPath = path.join(process.cwd(), filepath);
    let content = fs.readFileSync(absPath);
    try {
      content = JSON.parse(content);
      let stats = nnstats.analyzer.analyzeNetwork(content.layers, content.input, ops);

      if (options.out) {
        let outfile = path.join(process.cwd(), options.out);
        fs.writeFileSync(outfile, JSON.stringify(stats, 2, 4));
      }

      if (!options.verbose) 
        nnstats.utils.report(stats);
    } catch (e) {
      throw e
    }
  });

program
  .command('report <path>')
  .description('Print statistics.')
  .action(function(filepath, options) {
    let ops = {};
    ops.tensorflow = options.tf;

    let absPath = path.join(process.cwd(), filepath);
    let content = fs.readFileSync(absPath);
    try {
      let stats = JSON.parse(content);

      nnstats.utils.report(stats);
    } catch (e) {
      throw e
    }
  });

program.on('--help', function(){
  console.log('  Examples:');
  console.log('');
  console.log('    $ nnstats parse /path/to/file');
  console.log('');
});

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse(process.argv);