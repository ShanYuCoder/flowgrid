export const FLOWGRID_PROJECT_IGNORES = [
  '.flowgrid',
  '.agents',
  '.gemini',
  '.cursor',
  '.claude',
  '.codex',
  '.opencode',
  '.hermes',
  '.kiro',
  '.kilo',
];

export function appendFlowgridProjectIgnores(content, ignores = FLOWGRID_PROJECT_IGNORES) {
  let gitignoreContent = content || '';
  const appended = [];
  for (const ignore of ignores) {
    const regex = new RegExp(`^\\/?${ignore.replace('.', '\\.')}\\/?$`, 'm');
    if (!regex.test(gitignoreContent)) {
      gitignoreContent +=
        (gitignoreContent && !gitignoreContent.endsWith('\n') ? '\n' : '') + ignore + '\n';
      appended.push(ignore);
    }
  }
  return { content: gitignoreContent, appended };
}

export function removeFlowgridProjectIgnores(content, ignores) {
  let gitignoreContent = content || '';
  let modified = false;
  for (const ignore of ignores) {
    const regex = new RegExp(`^\\/?${ignore.replace('.', '\\.')}\\/?$(\\r?\\n)?`, 'gm');
    if (regex.test(gitignoreContent)) {
      gitignoreContent = gitignoreContent.replace(regex, '');
      modified = true;
    }
  }
  return { content: gitignoreContent, modified };
}
