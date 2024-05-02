import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import stripAnsi from 'strip-ansi';
import { create } from 'ts-node';
import { detectJestVersion } from '../detectJestVersion';

const compileFnCode = (pathToFn: string) => {
  const fnContents = fs.readFileSync(pathToFn, 'utf-8');

  return create({
    transpileOnly: true,
    compilerOptions: { sourceMap: false },
  }).compile(fnContents, pathToFn);
};
const compiledFn = compileFnCode(require.resolve('../detectJestVersion.ts'));
const relativePathToFn = 'eslint-plugin-jest/lib/rules/detectJestVersion.js';

const runNodeScript = (cwd: string, script: string) => {
  const { stdout, stderr } = spawnSync(
    'node',
    ['-e', script.split('\n').join(' ')],
    { cwd, encoding: 'utf-8' },
  );

  return { stdout: stripAnsi(stdout.trim()), stderr: stripAnsi(stderr.trim()) };
};

const runDetectJestVersion = (cwd: string) => {
  return runNodeScript(
    cwd,
    `
      try {
        console.log(require('${relativePathToFn}').detectJestVersion());
      } catch (error) {
        console.error(error.message);
      }
    `,
  );
};

/**
 * Makes a new temp directory, prefixed with `eslint-plugin-jest-`
 *
 * @return {Promise<string>}
 */
const makeTempDir = () =>
  fs.mkdtempSync(path.join(os.tmpdir(), 'eslint-plugin-jest-'));

interface ProjectStructure {
  [key: `${string}/package.json`]: JSONSchemaForNPMPackageJsonFiles;
  [key: `${string}/${typeof relativePathToFn}`]: string;
  [key: `${string}/`]: null;
  'package.json'?: JSONSchemaForNPMPackageJsonFiles;
}

const setupFakeProject = (structure: ProjectStructure): string => {
  const tempDir = makeTempDir();

  for (const [filePath, contents] of Object.entries(structure)) {
    if (contents === null) {
      fs.mkdirSync(path.join(tempDir, filePath), { recursive: true });

      continue;
    }

    const folderPath = path.dirname(filePath);

    // make the directory (recursively)
    fs.mkdirSync(path.join(tempDir, folderPath), { recursive: true });

    const finalContents =
      typeof contents === 'string' ? contents : JSON.stringify(contents);

    fs.writeFileSync(path.join(tempDir, filePath), finalContents);
  }

  return tempDir;
};

describe('detectJestVersion', () => {
  describe('basic tests', () => {
    const packageJsonFactory = jest.fn<JSONSchemaForNPMPackageJsonFiles, []>();

    beforeEach(() => {
      jest.resetModules();
      jest.doMock(require.resolve('jest/package.json'), packageJsonFactory);
    });

    describe('when the package.json is missing the version property', () => {
      it('throws an error', () => {
        packageJsonFactory.mockReturnValue({});

        expect(() => detectJestVersion()).toThrow(
          /Unable to detect Jest version/iu,
        );
      });
    });

    it('caches versions', () => {
      packageJsonFactory.mockReturnValue({ version: '1.2.3' });

      const version = detectJestVersion();

      jest.resetModules();

      expect(detectJestVersion).not.toThrow();
      expect(detectJestVersion()).toBe(version);
    });
  });

  describe('when in a simple project', () => {
    it('finds the correct version', () => {
      const projectDir = setupFakeProject({
        'package.json': { name: 'simple-project' },
        [`node_modules/${relativePathToFn}`]: compiledFn,
        'node_modules/jest/package.json': {
          name: 'jest',
          version: '21.0.0',
        },
      });

      const { stdout, stderr } = runDetectJestVersion(projectDir);

      expect(stdout).toBe('21');
      expect(stderr).toBe('');
    });
  });

  describe('when in a hoisted mono-repo', () => {
    it('finds the correct version', () => {
      const projectDir = setupFakeProject({
        'package.json': { name: 'mono-repo' },
        [`node_modules/${relativePathToFn}`]: compiledFn,
        'node_modules/jest/package.json': {
          name: 'jest',
          version: '19.0.0',
        },
        'packages/a/package.json': { name: 'package-a' },
        'packages/b/package.json': { name: 'package-b' },
      });

      const { stdout, stderr } = runDetectJestVersion(projectDir);

      expect(stdout).toBe('19');
      expect(stderr).toBe('');
    });
  });

  describe('when in a subproject', () => {
    it('finds the correct versions', () => {
      const projectDir = setupFakeProject({
        'backend/package.json': { name: 'package-a' },
        [`backend/node_modules/${relativePathToFn}`]: compiledFn,
        'backend/node_modules/jest/package.json': {
          name: 'jest',
          version: '24.0.0',
        },
        'frontend/package.json': { name: 'package-b' },
        [`frontend/node_modules/${relativePathToFn}`]: compiledFn,
        'frontend/node_modules/jest/package.json': {
          name: 'jest',
          version: '15.0.0',
        },
      });

      const { stdout: stdoutBackend, stderr: stderrBackend } =
        runDetectJestVersion(path.join(projectDir, 'backend'));

      expect(stdoutBackend).toBe('24');
      expect(stderrBackend).toBe('');

      const { stdout: stdoutFrontend, stderr: stderrFrontend } =
        runDetectJestVersion(path.join(projectDir, 'frontend'));

      expect(stdoutFrontend).toBe('15');
      expect(stderrFrontend).toBe('');
    });
  });

  describe('when jest is not installed', () => {
    it('throws an error', () => {
      const projectDir = setupFakeProject({
        'package.json': { name: 'no-jest' },
        [`node_modules/${relativePathToFn}`]: compiledFn,
        'node_modules/pack/package.json': { name: 'pack' },
      });

      const { stdout, stderr } = runDetectJestVersion(projectDir);

      expect(stdout).toBe('');
      expect(stderr).toContain('Unable to detect Jest version');
    });
  });

  describe('when jest is changed on disk', () => {
    it('uses the cached version', () => {
      const projectDir = setupFakeProject({
        'package.json': { name: 'no-jest' },
        [`node_modules/${relativePathToFn}`]: compiledFn,
        'node_modules/jest/package.json': { name: 'jest', version: '26.0.0' },
      });

      const { stdout, stderr } = runNodeScript(
        projectDir,
        `
          const { detectJestVersion } = require('${relativePathToFn}');
          const fs = require('fs');

          console.log(detectJestVersion());
          fs.writeFileSync(
            'node_modules/jest/package.json',
            JSON.stringify({
              name: 'jest',
              version: '25.0.0',
            }),
          );
          console.log(detectJestVersion());
        `,
      );

      const [firstCall, secondCall] = stdout.split('\n');

      expect(firstCall).toBe('26');
      expect(secondCall).toBe('26');
      expect(stderr).toBe('');
    });
  });
});
