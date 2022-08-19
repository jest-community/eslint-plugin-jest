import { parse } from 'path';
import { danger, warn } from 'danger';

// Ensure that people include a description on their PRs
if (danger.github.pr.body.length === 0) {
  fail('Please include a body for your PR');
}

const createOrAddLabelSafely = async (name: string, color: string) => {
  try {
    await danger.github.utils.createOrAddLabel({
      name,
      color,
      description: '',
    });
  } catch (error) {
    console.warn(error);
    warn(`Was unable to create or add label "${name}"`);
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

const labelBasedOnCommits = async () => {
  const commits = danger.github.commits.map(commits => commits.commit.message);

  if (commits.some(commit => commit.startsWith('fix'))) {
    await createOrAddLabelSafely('bug', '#ee0701');
  }

  if (commits.some(commit => commit.startsWith('feat'))) {
    await createOrAddLabelSafely('enhancement', '#84b6eb');
  }
};

Promise.all([labelBasedOnRules(), labelBasedOnCommits()]).catch(error => {
  console.error(error);
  fail(`Something went very wrong: ${error}`);
});
