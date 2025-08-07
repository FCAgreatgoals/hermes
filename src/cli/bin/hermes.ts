#!/usr/bin/env node

import { Command } from 'commander';
import { registerBuildCommand } from '../commands/build';

const program = new Command();
program.name('hermes').description('Hermes CLI');

registerBuildCommand(program);

program.parse();
