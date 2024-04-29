import { parse } from 'path';
import { danger, warn } from 'danger';

// Ensure that people include a description on their PRs
if (danger.github.pr.body.length === 0) {
  fail('Please include a body for your PR');
}

const createOrAddLabelSafely = async (name: string, color: string): boolean => {
  try {
    await danger.github.utils.createOrAddLabel({
      name,
      color: color.replace('#', ''),
      description: '',
    });

    return true;
  } catch (error) {
    console.warn(error);
    warn(`Was unable to create or add label "${name}"`);

    return false;
  }
};

const labelBasedOnRules = async () => {
  const affectedRules = [
    ...danger.git.created_files,
    ...danger.git.modified_files,
    ...danger.git.deleted_files,
  ]
    .filter(filename => {
      const { dir, ext } = parse(filename);

      return dir === 'src/rules' && ext === '.ts';
    })
    .map(filename => parse(filename).name);

  await Promise.all(
    affectedRules.map(rule =>
      createOrAddLabelSafely(`rule: ${rule}`, '#7d3abc'),
    ),
  );
};

const labelBasedOnTitle = async (): Promise<boolean> => {
  if (danger.github.pr.title.startsWith('feat')) {
    return createOrAddLabelSafely('enhancement', '#84b6eb');
  }

  if (danger.github.pr.title.startsWith('fix')) {
    return createOrAddLabelSafely('bug', '#ee0701');
  }

  return false;
};

const labelBasedOnCommits = async () => {
  const commits = danger.github.commits.map(commits => commits.commit.message);

  if (commits.some(commit => commit.startsWith('fix'))) {
    await createOrAddLabelSafely('bug', '#ee0701');
  }

  if (commits.some(commit => commit.startsWith('feat'))) {
    await createOrAddLabelSafely('enhancement', '#84b6eb');
  }
};

const labelBasedOnTitleOrCommits = async () => {
  // prioritize labeling based on the title since most pull requests will get
  // squashed into a single commit with the title as the subject, but fallback
  // to looking through the commits if we can't determine a label from the title
  if (await labelBasedOnTitle()) {
    return;
  }

  await labelBasedOnCommits();
};

Promise.all([labelBasedOnRules(), labelBasedOnTitleOrCommits()]).catch(
  error => {
    console.error(error);
    fail(`Something went very wrong: ${error}`);
  },
);
