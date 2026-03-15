import type { Command } from 'commander';

function formatCommand(cmd: Command, prefix: string): string[] {
  const lines: string[] = [];

  for (const sub of cmd.commands) {
    if (sub.name() === 'help') {
      continue;
    }

    const subCommands = sub.commands.filter((c) => c.name() !== 'help');

    if (subCommands.length > 0) {
      lines.push(...formatCommand(sub, `${prefix} ${sub.name()}`));
    } else {
      const opts = sub.options
        .filter((o) => !o.hidden && o.long !== '--help')
        .map((o) => {
          const flag = o.long ?? o.short ?? '';
          const arg = o.required
            ? ` <${o.attributeName()}>`
            : o.optional
              ? ` [${o.attributeName()}]`
              : '';
          return o.mandatory ? `${flag}${arg}` : `[${flag}${arg}]`;
        })
        .join(' ');

      const desc = sub.description() ? `  # ${sub.description()}` : '';
      lines.push(`  ${prefix} ${sub.name()} ${opts}${desc}`.trimEnd());
    }
  }

  return lines;
}

export function registerHelpAll(program: Command) {
  program
    .command('help-all')
    .description('Show all commands and options')
    .action(() => {
      const lines = formatCommand(program, program.name());
      console.log(lines.join('\n'));
    });
}
