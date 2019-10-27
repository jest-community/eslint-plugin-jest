import { danger } from 'danger';

// Ensure that people include a description on their PRs
if (danger.github.pr.body.length === 0) {
  fail('Please include a body for your PR');
}

if (
  danger.git.created_files.find(filename => filename.startsWith('rules/')) &&
  !danger.git.modified_files.includes('README.md')
) {
  fail('Please update the README when new rules are added');
}
