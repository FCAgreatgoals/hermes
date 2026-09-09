#!/usr/bin/env node

import { Command } from 'commander';
import { registerBuildCommand } from '../commands/build';
import { registerCheckCommand } from '../commands/check';
import { registerLockCommand } from '../commands/lock';
import { registerTodoCommand } from '../commands/todo';

const program = new Command();
program.name('hermes').description('Hermes CLI');

registerBuildCommand(program);
registerCheckCommand(program);
registerLockCommand(program);
registerTodoCommand(program);

program.parse();
