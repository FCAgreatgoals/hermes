#!/usr/bin/env node

import { Command } from 'commander'
import { registerBuildCommand } from '../lib/cli/commands/build.cjs'

const program = new Command()
program.name('hermes').description('Hermes CLI')

registerBuildCommand(program)

program.parse()