## [29.4.1](https://github.com/jest-community/eslint-plugin-jest/compare/v29.4.0...v29.4.1) (2025-12-14)


### Bug Fixes

* **prefer-to-have-been-called-times:** actually check that current matcher is `toHaveLength` ([#1878](https://github.com/jest-community/eslint-plugin-jest/issues/1878)) ([3415744](https://github.com/jest-community/eslint-plugin-jest/commit/341574473a4151f8182e6d6dd41fdd5de6d88058))

# [29.4.0](https://github.com/jest-community/eslint-plugin-jest/compare/v29.3.0...v29.4.0) (2025-12-13)


### Features

* create new `prefer-to-have-been-called-times` rule ([281085a](https://github.com/jest-community/eslint-plugin-jest/commit/281085ac5df90b77f8d4bbb7720f17d720add762))
* create new `prefer-to-have-been-called` rule ([24e2acd](https://github.com/jest-community/eslint-plugin-jest/commit/24e2acd12004731d8162d8eb78eda8385ce896d7))

# [29.3.0](https://github.com/jest-community/eslint-plugin-jest/compare/v29.2.3...v29.3.0) (2025-12-13)


### Features

* **prefer-expect-assertions:** support basic uses of `hasAssertions` in `beforeEach` and `afterEach` hooks ([#1871](https://github.com/jest-community/eslint-plugin-jest/issues/1871)) ([eed9acb](https://github.com/jest-community/eslint-plugin-jest/commit/eed9acb98a9d2a64abb42dba2af4a2f36838caff))

## [29.2.3](https://github.com/jest-community/eslint-plugin-jest/compare/v29.2.2...v29.2.3) (2025-12-13)


### Bug Fixes

* **prefer-expect-assertions:** use correct word in error message ([#1873](https://github.com/jest-community/eslint-plugin-jest/issues/1873)) ([c48c48c](https://github.com/jest-community/eslint-plugin-jest/commit/c48c48c9d03ed04eda01a78959ab7f794e1fa448))

## [29.2.2](https://github.com/jest-community/eslint-plugin-jest/compare/v29.2.1...v29.2.2) (2025-12-12)


### Bug Fixes

* **no-export:** report on `export =` usage ([#1870](https://github.com/jest-community/eslint-plugin-jest/issues/1870)) ([9d90466](https://github.com/jest-community/eslint-plugin-jest/commit/9d90466af1849270ae1652d05f6f233f4f43c8d6))

## [29.2.1](https://github.com/jest-community/eslint-plugin-jest/compare/v29.2.0...v29.2.1) (2025-11-23)


### Bug Fixes

* **valid-mock-module-path:** report on `ERR_PACKAGE_PATH_NOT_EXPORTED` errors ([#1860](https://github.com/jest-community/eslint-plugin-jest/issues/1860)) ([6cd4e89](https://github.com/jest-community/eslint-plugin-jest/commit/6cd4e89da0cc2dafbc4b9659800f33143229b7f6))

# [29.2.0](https://github.com/jest-community/eslint-plugin-jest/compare/v29.1.0...v29.2.0) (2025-11-20)


### Features

* create new `valid-mock-module-path` rule ([#1845](https://github.com/jest-community/eslint-plugin-jest/issues/1845)) ([a8625f1](https://github.com/jest-community/eslint-plugin-jest/commit/a8625f1e77758aacb1daedc4eb628050a797082a))

# [29.1.0](https://github.com/jest-community/eslint-plugin-jest/compare/v29.0.1...v29.1.0) (2025-11-10)


### Features

* **prefer-lowercase-title:** allow ignoring `todo`s ([#1843](https://github.com/jest-community/eslint-plugin-jest/issues/1843)) ([4658638](https://github.com/jest-community/eslint-plugin-jest/commit/4658638ef45a58e35e9aed1fa959f9421361a476))

## [29.0.1](https://github.com/jest-community/eslint-plugin-jest/compare/v29.0.0...v29.0.1) (2025-06-18)


### Bug Fixes

* update semantic-release config so new v29 major is marked as latest on `npm` ([#1772](https://github.com/jest-community/eslint-plugin-jest/issues/1772)) ([531c8ba](https://github.com/jest-community/eslint-plugin-jest/commit/531c8ba10afb993886a49c893d5250c13c329df1))

# [29.0.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.14.0...v29.0.0) (2025-06-18)


### Bug Fixes

* remove `jest/no-alias-methods` from `styles` config ([d3bf1dc](https://github.com/jest-community/eslint-plugin-jest/commit/d3bf1dcec9322304a37fe45e6a5cdeee7775c543))


### Features

* drop support for `[@typescript-eslint](https://github.com/typescript-eslint)` v6 ([fe61a40](https://github.com/jest-community/eslint-plugin-jest/commit/fe61a409d41ef4e7ab8137b8b3d3f66cee6d40a6))
* drop support for `[@typescript-eslint](https://github.com/typescript-eslint)` v7 ([5ca65d3](https://github.com/jest-community/eslint-plugin-jest/commit/5ca65d3f941e5c0684876c20f251e2d467fc5a15))
* drop support for ESLint v7 ([b06e7d0](https://github.com/jest-community/eslint-plugin-jest/commit/b06e7d000fd730c24c7eb7a21d34e5cf92b30835))
* drop support for ESLint v8.x prior to v8.57.0 ([d79765a](https://github.com/jest-community/eslint-plugin-jest/commit/d79765af01e67db6646d3416cbf26df6bab414e7))
* drop support for Node v16 ([aaf62cd](https://github.com/jest-community/eslint-plugin-jest/commit/aaf62cd0da1ada072101d4d84b6a66a35d82425c))
* drop support for Node v18 ([598880c](https://github.com/jest-community/eslint-plugin-jest/commit/598880c4cb26eed177d1efdf3f8d4293956b58ac))
* drop support for Node v20.x prior to v20.12.0 ([2f2fb68](https://github.com/jest-community/eslint-plugin-jest/commit/2f2fb68db315388230fe5bcefbcafcc2716e07e4))
* drop support for Node v21 ([a366393](https://github.com/jest-community/eslint-plugin-jest/commit/a366393fb38a55c91d0200791315e727fcfe3e90))
* drop support for Node v23 ([1fb1a67](https://github.com/jest-community/eslint-plugin-jest/commit/1fb1a6747ed0f15ce4532624715c2b2a079e18f2))
* **unbound-method:** remove `docs.recommended` and `docs.requiresTypeChecking` properties ([945651c](https://github.com/jest-community/eslint-plugin-jest/commit/945651c36c471f424b743f0aae3ccca6271f21ba))


### BREAKING CHANGES

* dropped support for ESLint v8.x prior to v8.57.0
* dropped support for Node v20.x prior to v20.12.0
* dropped support for Node v23
* dropped support for Node v18
* **unbound-method:** removed `docs.recommend` and `docs.requiresTypeChecking` from `unbound-method`
* dropped support for `@typescript-eslint` v7
* dropped support for `@typescript-eslint` v6
* `jest/no-alias-methods` has been removed from the `styles` config as its already in
 the `recommended` config
* dropped support for ESLint v7
* dropped support for Node v21
* dropped support for Node v16

# [28.14.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.13.5...v28.14.0) (2025-06-15)


### Features

* **unbound-method:** mark `docs.recommended` and `docs.requiresTypeChecking` as deprecated ([#1762](https://github.com/jest-community/eslint-plugin-jest/issues/1762)) ([30440ef](https://github.com/jest-community/eslint-plugin-jest/commit/30440ef7509ee565690507c003da9bccf574b4bf))

## [28.13.5](https://github.com/jest-community/eslint-plugin-jest/compare/v28.13.4...v28.13.5) (2025-06-13)


### Bug Fixes

* handle string-based import names when resolving Jest functions ([#1761](https://github.com/jest-community/eslint-plugin-jest/issues/1761)) ([d8b5e0e](https://github.com/jest-community/eslint-plugin-jest/commit/d8b5e0e8340d57282f30d414b7ae84d6b88e4af8))

## [28.13.4](https://github.com/jest-community/eslint-plugin-jest/compare/v28.13.3...v28.13.4) (2025-06-13)


### Bug Fixes

* **prefer-importing-jest-globals:** handle string-based import names ([#1756](https://github.com/jest-community/eslint-plugin-jest/issues/1756)) ([547e67b](https://github.com/jest-community/eslint-plugin-jest/commit/547e67bfb194c1dcc42d082ea20eb324a2c30948))

## [28.13.3](https://github.com/jest-community/eslint-plugin-jest/compare/v28.13.2...v28.13.3) (2025-06-10)


### Bug Fixes

* **prefer-importing-jest-globals:** preserve `require` property renames ([#1754](https://github.com/jest-community/eslint-plugin-jest/issues/1754)) ([41b9523](https://github.com/jest-community/eslint-plugin-jest/commit/41b95239ef3bcb413b0ea6f1e33c23aca43ad3c5))

## [28.13.2](https://github.com/jest-community/eslint-plugin-jest/compare/v28.13.1...v28.13.2) (2025-06-10)


### Bug Fixes

* **prefer-importing-jest-globals:** preserve `as` imports ([#1753](https://github.com/jest-community/eslint-plugin-jest/issues/1753)) ([3a5af78](https://github.com/jest-community/eslint-plugin-jest/commit/3a5af78febd4a0f71ac4297530d11fa9a0e785fb))

## [28.13.1](https://github.com/jest-community/eslint-plugin-jest/compare/v28.13.0...v28.13.1) (2025-06-10)


### Bug Fixes

* **prefer-ending-with-an-expect:** don't report on `await expect` ([#1752](https://github.com/jest-community/eslint-plugin-jest/issues/1752)) ([5e3d687](https://github.com/jest-community/eslint-plugin-jest/commit/5e3d687f2f304ece35fb683091e9f819e99641f7))

# [28.13.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.12.0...v28.13.0) (2025-06-06)


### Features

* create new `prefer-ending-with-an-expect` rule ([#1742](https://github.com/jest-community/eslint-plugin-jest/issues/1742)) ([fe1349b](https://github.com/jest-community/eslint-plugin-jest/commit/fe1349bbc7e91a9ea5420481a28fe8d86f5a0b69))

# [28.12.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.11.2...v28.12.0) (2025-05-29)


### Features

* **no-disabled-tests:** improve error message and simplify rule ([#1739](https://github.com/jest-community/eslint-plugin-jest/issues/1739)) ([1fb5a4a](https://github.com/jest-community/eslint-plugin-jest/commit/1fb5a4acf04de3d8829125593279ee8705f358c7))

## [28.11.2](https://github.com/jest-community/eslint-plugin-jest/compare/v28.11.1...v28.11.2) (2025-05-29)


### Bug Fixes

* **no-commented-out-tests:** make message less ambiguous ([#1740](https://github.com/jest-community/eslint-plugin-jest/issues/1740)) ([14c27ab](https://github.com/jest-community/eslint-plugin-jest/commit/14c27ab73fba6ea2b6509d4ede88ecab8a40e2db))

## [28.11.1](https://github.com/jest-community/eslint-plugin-jest/compare/v28.11.0...v28.11.1) (2025-05-27)


### Bug Fixes

* **no-large-snapshots:** use a far better message for when an unexpected snapshot is found ([#1736](https://github.com/jest-community/eslint-plugin-jest/issues/1736)) ([0f5b873](https://github.com/jest-community/eslint-plugin-jest/commit/0f5b873edcce08988d1ce51e17eb67c21ddf102d))

# [28.11.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.10.1...v28.11.0) (2025-01-15)


### Features

* **valid-expect:** allow calling `expect` with no arguments ([#1688](https://github.com/jest-community/eslint-plugin-jest/issues/1688)) ([ff0349e](https://github.com/jest-community/eslint-plugin-jest/commit/ff0349ea0beb399fdd6d08676b88a32b2fab722c))

## [28.10.1](https://github.com/jest-community/eslint-plugin-jest/compare/v28.10.0...v28.10.1) (2025-01-15)


### Bug Fixes

* **padding-around-test-blocks:** update description ([#1691](https://github.com/jest-community/eslint-plugin-jest/issues/1691)) ([9cb4ecc](https://github.com/jest-community/eslint-plugin-jest/commit/9cb4eccab0439c7f56608ffa1e6c9441178bf6d5))

# [28.10.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.9.0...v28.10.0) (2024-12-19)


### Features

* **unbound-method:** ignore functions passed to `jest.mocked` ([#1681](https://github.com/jest-community/eslint-plugin-jest/issues/1681)) ([d868636](https://github.com/jest-community/eslint-plugin-jest/commit/d868636623497060f32c6b4ecd397ac7f40c2eae))

# [28.9.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.8.3...v28.9.0) (2024-11-05)


### Features

* add TypeScript types ([#1667](https://github.com/jest-community/eslint-plugin-jest/issues/1667)) ([1ce1258](https://github.com/jest-community/eslint-plugin-jest/commit/1ce12588e7081558bd727dfe10428aed08080167))

## [28.8.3](https://github.com/jest-community/eslint-plugin-jest/compare/v28.8.2...v28.8.3) (2024-09-04)


### Bug Fixes

* **prefer-importing-jest-globals:** don't add imports in the middle of statements ([#1645](https://github.com/jest-community/eslint-plugin-jest/issues/1645)) ([9c4197c](https://github.com/jest-community/eslint-plugin-jest/commit/9c4197c91fa96d7991acba8eac4fca909f28f8d0))

## [28.8.2](https://github.com/jest-community/eslint-plugin-jest/compare/v28.8.1...v28.8.2) (2024-09-02)


### Performance Improvements

* **prefer-importing-jest-globals:** stop collecting import specifiers for no reason ([#1646](https://github.com/jest-community/eslint-plugin-jest/issues/1646)) ([0660242](https://github.com/jest-community/eslint-plugin-jest/commit/066024289ec09e2ecf83db001cc93930aa6288a8))

## [28.8.1](https://github.com/jest-community/eslint-plugin-jest/compare/v28.8.0...v28.8.1) (2024-08-29)


### Bug Fixes

* **prefer-importing-jest-globals:** support typescript-eslint parser ([#1639](https://github.com/jest-community/eslint-plugin-jest/issues/1639)) ([307f6a7](https://github.com/jest-community/eslint-plugin-jest/commit/307f6a7b3aad7a5c891d8fea9f115e5d2f4f3fbb))

# [28.8.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.7.0...v28.8.0) (2024-08-07)


### Features

* import formatting rules from `eslint-plugin-jest-formatting` ([#1563](https://github.com/jest-community/eslint-plugin-jest/issues/1563)) ([74078ee](https://github.com/jest-community/eslint-plugin-jest/commit/74078ee13dd7c7d257d514809dadc5593a214e74))

# [28.7.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.6.0...v28.7.0) (2024-08-03)


### Features

* allow `[@typescript-eslint](https://github.com/typescript-eslint)` v8 ([#1636](https://github.com/jest-community/eslint-plugin-jest/issues/1636)) ([fb43171](https://github.com/jest-community/eslint-plugin-jest/commit/fb43171a150922524744194e023841af12b3f76b))

# [28.6.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.5.0...v28.6.0) (2024-06-06)


### Features

* **prefer-jest-mocked:** add new rule ([#1599](https://github.com/jest-community/eslint-plugin-jest/issues/1599)) ([4b6a4f2](https://github.com/jest-community/eslint-plugin-jest/commit/4b6a4f29c51ccc2dbb79a2f24d4a5cecd8195a8b))
* **valid-expect:** supporting automatically fixing adding async in some cases ([#1579](https://github.com/jest-community/eslint-plugin-jest/issues/1579)) ([5b9b47e](https://github.com/jest-community/eslint-plugin-jest/commit/5b9b47e3822e7895f8d74d73b0e07e3eff406523))

# [28.5.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.4.0...v28.5.0) (2024-05-03)


### Features

* allow `@typescript-eslint/utils` v7 as a direct dependency ([#1567](https://github.com/jest-community/eslint-plugin-jest/issues/1567)) ([1476f10](https://github.com/jest-community/eslint-plugin-jest/commit/1476f10d39ce78fe5675b8b2c9d7095573eceb6b))

# [28.4.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.3.0...v28.4.0) (2024-05-03)


### Features

* **valid-expect:** supporting automatically fixing missing `await` in some cases ([#1574](https://github.com/jest-community/eslint-plugin-jest/issues/1574)) ([a407098](https://github.com/jest-community/eslint-plugin-jest/commit/a40709833cd12a87b746ddf2e26a10af838bca0a))

# [28.3.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.2.0...v28.3.0) (2024-04-27)


### Features

* prefer importing jest globals for specific types ([#1568](https://github.com/jest-community/eslint-plugin-jest/issues/1568)) ([c464ae3](https://github.com/jest-community/eslint-plugin-jest/commit/c464ae311b81f005af29df610d4032519125bafa))

# [28.2.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.1.1...v28.2.0) (2024-04-06)


### Features

* support providing aliases for `@jest/globals` package ([#1543](https://github.com/jest-community/eslint-plugin-jest/issues/1543)) ([744d4f6](https://github.com/jest-community/eslint-plugin-jest/commit/744d4f6fa5685e0c87062cc867ecadbad9b2e06c))

## [28.1.1](https://github.com/jest-community/eslint-plugin-jest/compare/v28.1.0...v28.1.1) (2024-04-06)


### Bug Fixes

* **max-expects:** properly reset counter when exiting a test case ([#1550](https://github.com/jest-community/eslint-plugin-jest/issues/1550)) ([b4b7cbc](https://github.com/jest-community/eslint-plugin-jest/commit/b4b7cbc6195b47ba032fcf9ef1443de6b851d42b))

# [28.1.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.0.0...v28.1.0) (2024-04-06)


### Features

* add `prefer-importing-jest-globals` rule ([#1490](https://github.com/jest-community/eslint-plugin-jest/issues/1490)) ([37478d8](https://github.com/jest-community/eslint-plugin-jest/commit/37478d860eb15841f2ab73bb3fb6d94f51841638)), closes [#1101](https://github.com/jest-community/eslint-plugin-jest/issues/1101)

# [28.0.0](https://github.com/jest-community/eslint-plugin-jest/compare/v27.9.0...v28.0.0) (2024-04-06)


### Bug Fixes

* allow ESLint 9 as peer dependency ([#1547](https://github.com/jest-community/eslint-plugin-jest/issues/1547)) ([3c5e167](https://github.com/jest-community/eslint-plugin-jest/commit/3c5e1673afd02dc2c9b90d259c0452326715ae6c))
* drop support for Node 19 ([#1548](https://github.com/jest-community/eslint-plugin-jest/issues/1548)) ([c87e388](https://github.com/jest-community/eslint-plugin-jest/commit/c87e3887e736c40d1460af9cdbdffe30f79fdaea))
* **no-large-snapshots:** avoid `instanceof RegExp` check for ESLint v9 compatibility ([#1542](https://github.com/jest-community/eslint-plugin-jest/issues/1542)) ([af4a9c9](https://github.com/jest-community/eslint-plugin-jest/commit/af4a9c94d624b5db4643c994f5bec96b0cb889b8))


### Features

* drop support for `@typescript-eslint/eslint-plugin` v5 ([#1530](https://github.com/jest-community/eslint-plugin-jest/issues/1530)) ([150e355](https://github.com/jest-community/eslint-plugin-jest/commit/150e3558a637b49ddd76d362f88332b30f78dc5c))
* drop support for Node v14 ([#1527](https://github.com/jest-community/eslint-plugin-jest/issues/1527)) ([df5e580](https://github.com/jest-community/eslint-plugin-jest/commit/df5e58081d1bd15fbed8bd22f6c03d5f350d73b6))
* remove `no-if` rule ([#1528](https://github.com/jest-community/eslint-plugin-jest/issues/1528)) ([f976fc8](https://github.com/jest-community/eslint-plugin-jest/commit/f976fc8c71fc5e9f55cd5ae09092f15ee277fd2c))
* remove `snapshot` processor and `flat/snapshot` config ([#1532](https://github.com/jest-community/eslint-plugin-jest/issues/1532)) ([98087f9](https://github.com/jest-community/eslint-plugin-jest/commit/98087f9bb27082f9fbda59a56c65536fb9d8a0dc))
* upgrade `@typescript-eslint/utils` to v6 ([#1508](https://github.com/jest-community/eslint-plugin-jest/issues/1508)) ([dc6e8cd](https://github.com/jest-community/eslint-plugin-jest/commit/dc6e8cd249817de585b50e473c2146e1542dd146))


### BREAKING CHANGES

* Node v19 is no longer supported
* removed unneeded `snapshot` processor and `flat/snapshot` config
* dropped support for `@typescript-eslint/eslint-plugin` v5
* dropped support for Node v14
* removed `no-if` in favor of `no-conditional-in-test`

# [28.0.0-next.7](https://github.com/jest-community/eslint-plugin-jest/compare/v28.0.0-next.6...v28.0.0-next.7) (2024-04-06)


### Bug Fixes

* allow ESLint 9 as peer dependency ([#1547](https://github.com/jest-community/eslint-plugin-jest/issues/1547)) ([3c5e167](https://github.com/jest-community/eslint-plugin-jest/commit/3c5e1673afd02dc2c9b90d259c0452326715ae6c))
* drop support for Node 19 ([#1548](https://github.com/jest-community/eslint-plugin-jest/issues/1548)) ([c87e388](https://github.com/jest-community/eslint-plugin-jest/commit/c87e3887e736c40d1460af9cdbdffe30f79fdaea))


### BREAKING CHANGES

* Node v19 is no longer supported

# [28.0.0-next.6](https://github.com/jest-community/eslint-plugin-jest/compare/v28.0.0-next.5...v28.0.0-next.6) (2024-03-29)


### Bug Fixes

* **no-large-snapshots:** avoid `instanceof RegExp` check for ESLint v9 compatibility ([#1542](https://github.com/jest-community/eslint-plugin-jest/issues/1542)) ([af4a9c9](https://github.com/jest-community/eslint-plugin-jest/commit/af4a9c94d624b5db4643c994f5bec96b0cb889b8))

# [28.0.0-next.5](https://github.com/jest-community/eslint-plugin-jest/compare/v28.0.0-next.4...v28.0.0-next.5) (2024-03-27)


### Features

* remove `snapshot` processor and `flat/snapshot` config ([#1532](https://github.com/jest-community/eslint-plugin-jest/issues/1532)) ([98087f9](https://github.com/jest-community/eslint-plugin-jest/commit/98087f9bb27082f9fbda59a56c65536fb9d8a0dc))


### BREAKING CHANGES

* removed unneeded `snapshot` processor and `flat/snapshot` config

# [28.0.0-next.4](https://github.com/jest-community/eslint-plugin-jest/compare/v28.0.0-next.3...v28.0.0-next.4) (2024-03-23)


### Features

* drop support for `@typescript-eslint/eslint-plugin` v5 ([#1530](https://github.com/jest-community/eslint-plugin-jest/issues/1530)) ([150e355](https://github.com/jest-community/eslint-plugin-jest/commit/150e3558a637b49ddd76d362f88332b30f78dc5c))


### BREAKING CHANGES

* dropped support for `@typescript-eslint/eslint-plugin` v5

# [28.0.0-next.3](https://github.com/jest-community/eslint-plugin-jest/compare/v28.0.0-next.2...v28.0.0-next.3) (2024-03-22)


### Features

* upgrade `@typescript-eslint/utils` to v6 ([#1508](https://github.com/jest-community/eslint-plugin-jest/issues/1508)) ([dc6e8cd](https://github.com/jest-community/eslint-plugin-jest/commit/dc6e8cd249817de585b50e473c2146e1542dd146))

# [28.0.0-next.2](https://github.com/jest-community/eslint-plugin-jest/compare/v28.0.0-next.1...v28.0.0-next.2) (2024-03-21)


### Features

* drop support for Node v14 ([#1527](https://github.com/jest-community/eslint-plugin-jest/issues/1527)) ([df5e580](https://github.com/jest-community/eslint-plugin-jest/commit/df5e58081d1bd15fbed8bd22f6c03d5f350d73b6))


### BREAKING CHANGES

* dropped support for Node v14

# [28.0.0-next.1](https://github.com/jest-community/eslint-plugin-jest/compare/v27.9.0...v28.0.0-next.1) (2024-03-21)


### Features

* remove `no-if` rule ([#1528](https://github.com/jest-community/eslint-plugin-jest/issues/1528)) ([f976fc8](https://github.com/jest-community/eslint-plugin-jest/commit/f976fc8c71fc5e9f55cd5ae09092f15ee277fd2c))


### BREAKING CHANGES

* removed `no-if` in favor of `no-conditional-in-test`

# [27.9.0](https://github.com/jest-community/eslint-plugin-jest/compare/v27.8.0...v27.9.0) (2024-02-16)


### Features

* add should-be-fine support for flat configs ([#1505](https://github.com/jest-community/eslint-plugin-jest/issues/1505)) ([4cc2a1b](https://github.com/jest-community/eslint-plugin-jest/commit/4cc2a1b680507ff006b5d2b02fa6d262584bb263))

# [27.8.0](https://github.com/jest-community/eslint-plugin-jest/compare/v27.7.0...v27.8.0) (2024-02-13)


### Features

* support `failing.each` ([#1499](https://github.com/jest-community/eslint-plugin-jest/issues/1499)) ([9e9cf83](https://github.com/jest-community/eslint-plugin-jest/commit/9e9cf8302ae182402da853a11b05e1560ccc63ee))

# [27.7.0](https://github.com/jest-community/eslint-plugin-jest/compare/v27.6.3...v27.7.0) (2024-02-13)


### Features

* allow `[@typescript-eslint](https://github.com/typescript-eslint)` v7 ([#1500](https://github.com/jest-community/eslint-plugin-jest/issues/1500)) ([6be2928](https://github.com/jest-community/eslint-plugin-jest/commit/6be2928816c69afca88a598e302910b113068ee9))

## [27.6.3](https://github.com/jest-community/eslint-plugin-jest/compare/v27.6.2...v27.6.3) (2024-01-12)


### Bug Fixes

* replace use of deprecated methods ([#1453](https://github.com/jest-community/eslint-plugin-jest/issues/1453)) ([9204a51](https://github.com/jest-community/eslint-plugin-jest/commit/9204a51b4a43541e5e59c6c7fb3a3da1e2d49c2b))

## [27.6.2](https://github.com/jest-community/eslint-plugin-jest/compare/v27.6.1...v27.6.2) (2024-01-10)


### Reverts

* Revert "chore: use relative path to parent `tsconfig.json` (#1476)" ([5e6199d](https://github.com/jest-community/eslint-plugin-jest/commit/5e6199d62154e21ccc732bc09d8bbb87bd3ef748)), closes [#1476](https://github.com/jest-community/eslint-plugin-jest/issues/1476)

## [27.6.1](https://github.com/jest-community/eslint-plugin-jest/compare/v27.6.0...v27.6.1) (2024-01-01)


### Bug Fixes

* include plugin `meta` information with snapshot processor for ESLint v9 ([#1484](https://github.com/jest-community/eslint-plugin-jest/issues/1484)) ([067e246](https://github.com/jest-community/eslint-plugin-jest/commit/067e246864813fa88933f06628b6ca0ff31ca863))

# [27.6.0](https://github.com/jest-community/eslint-plugin-jest/compare/v27.5.0...v27.6.0) (2023-10-26)


### Features

* include plugin `meta` information for ESLint v9 ([#1454](https://github.com/jest-community/eslint-plugin-jest/issues/1454)) ([4d57146](https://github.com/jest-community/eslint-plugin-jest/commit/4d571467631a407a038d5b4d61bc45f4622954f1))

# [27.5.0](https://github.com/jest-community/eslint-plugin-jest/compare/v27.4.3...v27.5.0) (2023-10-26)


### Features

* **valid-title:** allow ignoring tests with non-string titles ([#1460](https://github.com/jest-community/eslint-plugin-jest/issues/1460)) ([ea89da9](https://github.com/jest-community/eslint-plugin-jest/commit/ea89da9b4e726980d80f97b69d31a4c4f81ff562))

## [27.4.3](https://github.com/jest-community/eslint-plugin-jest/compare/v27.4.2...v27.4.3) (2023-10-20)


### Bug Fixes

* **expect-expert:** change reporting node ([#1452](https://github.com/jest-community/eslint-plugin-jest/issues/1452)) ([64d5cda](https://github.com/jest-community/eslint-plugin-jest/commit/64d5cda7e64df7c73cde03ca057dfb71e87f50c4))

## [27.4.2](https://github.com/jest-community/eslint-plugin-jest/compare/v27.4.1...v27.4.2) (2023-09-29)


### Bug Fixes

* make rule message punctuation consistent ([#1444](https://github.com/jest-community/eslint-plugin-jest/issues/1444)) ([84121ee](https://github.com/jest-community/eslint-plugin-jest/commit/84121eee018cc8cc32e6c7a267fc27efd3a4a0a0))

## [27.4.1](https://github.com/jest-community/eslint-plugin-jest/compare/v27.4.0...v27.4.1) (2023-09-29)


### Bug Fixes

* **no-focused-tests:** make reporting location consistent ([#1443](https://github.com/jest-community/eslint-plugin-jest/issues/1443)) ([a871775](https://github.com/jest-community/eslint-plugin-jest/commit/a87177504430d1c469af70d6fc3b674a388291d8))

# [27.4.0](https://github.com/jest-community/eslint-plugin-jest/compare/v27.3.0...v27.4.0) (2023-09-15)


### Features

* **valid-title:** support ignoring leading and trailing whitespace ([#1433](https://github.com/jest-community/eslint-plugin-jest/issues/1433)) ([bc96473](https://github.com/jest-community/eslint-plugin-jest/commit/bc96473488e004885d8926dc716ef96f889c3d1b))

# [27.3.0](https://github.com/jest-community/eslint-plugin-jest/compare/v27.2.3...v27.3.0) (2023-09-15)


### Features

* add `no-confusing-set-time` rule ([#1425](https://github.com/jest-community/eslint-plugin-jest/issues/1425)) ([ff8e482](https://github.com/jest-community/eslint-plugin-jest/commit/ff8e482380b36bf8423dac7f9fb6340aca8ae313))

## [27.2.3](https://github.com/jest-community/eslint-plugin-jest/compare/v27.2.2...v27.2.3) (2023-07-13)


### Bug Fixes

* allow `@typescript-eslint/eslint-plugin` v6 as peer dep ([#1400](https://github.com/jest-community/eslint-plugin-jest/issues/1400)) ([04b2bf2](https://github.com/jest-community/eslint-plugin-jest/commit/04b2bf29bf086f8ce8173a9c3bc15ce31915dbe2)), closes [#1398](https://github.com/jest-community/eslint-plugin-jest/issues/1398)

## [27.2.2](https://github.com/jest-community/eslint-plugin-jest/compare/v27.2.1...v27.2.2) (2023-06-19)


### Bug Fixes

* add missing (optional) peer dependency on Jest ([#1384](https://github.com/jest-community/eslint-plugin-jest/issues/1384)) ([34c3d32](https://github.com/jest-community/eslint-plugin-jest/commit/34c3d32cab726c88dc385a9e7a8998c727f4720c))

## [27.2.1](https://github.com/jest-community/eslint-plugin-jest/compare/v27.2.0...v27.2.1) (2023-01-06)


### Bug Fixes

* **valid-expect-in-promise:** handle sparse arrays ([#1325](https://github.com/jest-community/eslint-plugin-jest/issues/1325)) ([21e72c9](https://github.com/jest-community/eslint-plugin-jest/commit/21e72c9d94ed66c1006212e5da78bac8b62fa8c7))

# [27.2.0](https://github.com/jest-community/eslint-plugin-jest/compare/v27.1.7...v27.2.0) (2022-12-31)


### Features

* create `no-untyped-mock-factory` rule ([#1314](https://github.com/jest-community/eslint-plugin-jest/issues/1314)) ([ee43c3f](https://github.com/jest-community/eslint-plugin-jest/commit/ee43c3f4d5de5e6935d0242cc846f1dec43af20d))

## [27.1.7](https://github.com/jest-community/eslint-plugin-jest/compare/v27.1.6...v27.1.7) (2022-12-15)


### Bug Fixes

* **prefer-spy-on:** improve autofix ([#1308](https://github.com/jest-community/eslint-plugin-jest/issues/1308)) ([5d1b7a7](https://github.com/jest-community/eslint-plugin-jest/commit/5d1b7a76dbc07eb52b5c9111213c32b09e3bec9b))

## [27.1.6](https://github.com/jest-community/eslint-plugin-jest/compare/v27.1.5...v27.1.6) (2022-11-24)


### Bug Fixes

* ensure rule fixes produce valid code when function params and args have trailing commas ([#1282](https://github.com/jest-community/eslint-plugin-jest/issues/1282)) ([8eca0b7](https://github.com/jest-community/eslint-plugin-jest/commit/8eca0b78920011d62eee35b42a90663082862131))

## [27.1.5](https://github.com/jest-community/eslint-plugin-jest/compare/v27.1.4...v27.1.5) (2022-11-10)


### Performance Improvements

* use `Set` instead of iterating, and deduplicate a function ([#1278](https://github.com/jest-community/eslint-plugin-jest/issues/1278)) ([0e048f1](https://github.com/jest-community/eslint-plugin-jest/commit/0e048f1577565119cf686eac4477be64a41b2a08))

## [27.1.4](https://github.com/jest-community/eslint-plugin-jest/compare/v27.1.3...v27.1.4) (2022-11-04)


### Performance Improvements

* don't collect more info than needed when resolving jest functions ([#1275](https://github.com/jest-community/eslint-plugin-jest/issues/1275)) ([e4a5674](https://github.com/jest-community/eslint-plugin-jest/commit/e4a567434d84585e01efcdd22ca7e77288069ae5))

## [27.1.3](https://github.com/jest-community/eslint-plugin-jest/compare/v27.1.2...v27.1.3) (2022-10-18)


### Bug Fixes

* **no-restricted-jest-methods:** don't crash on `jest()` ([#1269](https://github.com/jest-community/eslint-plugin-jest/issues/1269)) ([4450daa](https://github.com/jest-community/eslint-plugin-jest/commit/4450daa17ae542bbfed85d16845c5dac1c310dea))

## [27.1.2](https://github.com/jest-community/eslint-plugin-jest/compare/v27.1.1...v27.1.2) (2022-10-14)


### Bug Fixes

* **valid-expect-in-promise:** adjust grammar in rule message ([#1264](https://github.com/jest-community/eslint-plugin-jest/issues/1264)) ([4494ed2](https://github.com/jest-community/eslint-plugin-jest/commit/4494ed21686edeb1bc4535cb2159989f87a7493e))

## [27.1.1](https://github.com/jest-community/eslint-plugin-jest/compare/v27.1.0...v27.1.1) (2022-10-05)


### Bug Fixes

* **prefer-to-be:** support negative numbers ([#1260](https://github.com/jest-community/eslint-plugin-jest/issues/1260)) ([557dd39](https://github.com/jest-community/eslint-plugin-jest/commit/557dd394a4535276a4c6fa046bfb525f4c412800))

# [27.1.0](https://github.com/jest-community/eslint-plugin-jest/compare/v27.0.4...v27.1.0) (2022-10-03)


### Features

* create `no-restricted-jest-methods` rule ([#1257](https://github.com/jest-community/eslint-plugin-jest/issues/1257)) ([b8e61b1](https://github.com/jest-community/eslint-plugin-jest/commit/b8e61b192ac79971575a3a250df2c54056eadc90))

## [27.0.4](https://github.com/jest-community/eslint-plugin-jest/compare/v27.0.3...v27.0.4) (2022-09-10)


### Bug Fixes

* consistent rule doc notices and sections ([#1226](https://github.com/jest-community/eslint-plugin-jest/issues/1226)) ([2580563](https://github.com/jest-community/eslint-plugin-jest/commit/25805639edf59b5d8825cd4245e1fa66aff56382))

## [27.0.3](https://github.com/jest-community/eslint-plugin-jest/compare/v27.0.2...v27.0.3) (2022-09-09)


### Bug Fixes

* ensure jest globals are enabled in `styles` config ([#1241](https://github.com/jest-community/eslint-plugin-jest/issues/1241)) ([a165e98](https://github.com/jest-community/eslint-plugin-jest/commit/a165e98b2a8728c427d6c484122dc9e64629052b))

## [27.0.2](https://github.com/jest-community/eslint-plugin-jest/compare/v27.0.1...v27.0.2) (2022-09-08)


### Bug Fixes

* **no-restricted-matchers:** improve check to not be solely based on the start of the matcher chain ([#1236](https://github.com/jest-community/eslint-plugin-jest/issues/1236)) ([5fe4568](https://github.com/jest-community/eslint-plugin-jest/commit/5fe45680c93ff50745fc8f8f271607c21d9cae87)), closes [#1235](https://github.com/jest-community/eslint-plugin-jest/issues/1235)

## [27.0.1](https://github.com/jest-community/eslint-plugin-jest/compare/v27.0.0...v27.0.1) (2022-08-28)


### Bug Fixes

* **prefer-expect-assertions:** report on concise arrow functions with `expect` call ([#1225](https://github.com/jest-community/eslint-plugin-jest/issues/1225)) ([64ec9c1](https://github.com/jest-community/eslint-plugin-jest/commit/64ec9c10b0b67a19893e09f4462d5b1a1e984baf))

# [27.0.0](https://github.com/jest-community/eslint-plugin-jest/compare/v26.9.0...v27.0.0) (2022-08-28)


### Bug Fixes

* **unbound-method:** don't suppress errors from base rule ([#1219](https://github.com/jest-community/eslint-plugin-jest/issues/1219)) ([7c1389e](https://github.com/jest-community/eslint-plugin-jest/commit/7c1389e3d8c59e283de37ed86f3f4c12fb38c3ff))


### Features

* drop support for `eslint@6` ([#1212](https://github.com/jest-community/eslint-plugin-jest/issues/1212)) ([21fc2fe](https://github.com/jest-community/eslint-plugin-jest/commit/21fc2feea67a8fd9f6673fd6a1e91ca1f5bdda11))
* drop support for Node versions 12 and 17 ([#1211](https://github.com/jest-community/eslint-plugin-jest/issues/1211)) ([4c987f5](https://github.com/jest-community/eslint-plugin-jest/commit/4c987f5f566398d95584668bd2bc18bfdf438e40))
* make `no-alias-methods` recommended ([#1221](https://github.com/jest-community/eslint-plugin-jest/issues/1221)) ([914b24a](https://github.com/jest-community/eslint-plugin-jest/commit/914b24a0bc12a151e6f7ecec37a440769b555b94))
* **no-jest-import:** remove rule ([#1220](https://github.com/jest-community/eslint-plugin-jest/issues/1220)) ([918873b](https://github.com/jest-community/eslint-plugin-jest/commit/918873beb15d4a698fe5150d826d44b696283683))
* **no-restricted-matchers:** match based on start of chain, requiring each permutation to be set ([#1218](https://github.com/jest-community/eslint-plugin-jest/issues/1218)) ([f4dd97a](https://github.com/jest-community/eslint-plugin-jest/commit/f4dd97a7ec3b985d0f7e42a5a6331bc0c65a7d56))


### BREAKING CHANGES

* `no-alias-methods` is now recommended as the methods themselves will be removed in the next major version of Jest
* **no-jest-import:** removed `no-jest-import` rule
* **unbound-method:** errors thrown by the `unbound-method` base rule are no longer suppressed - really this means that if you don't specify `project` when this rule is enabled and `@typescript-eslint/eslint-plugin` is present, that error will no longer be suppressed instead of silently doing nothing; it will still not throw if this rule is enabled without the base rule being present
* **no-restricted-matchers:** `no-restricted-matchers` now checks against the start of the expect chain, meaning you have to explicitly list each possible matcher & modifier permutations that you want to restrict
* Support for ESLint version 6 is removed
* Node versions 12 and 17 are no longer supported

# [27.0.0-next.2](https://github.com/jest-community/eslint-plugin-jest/compare/v27.0.0-next.1...v27.0.0-next.2) (2022-08-28)


### Bug Fixes

* **unbound-method:** don't suppress errors from base rule ([#1219](https://github.com/jest-community/eslint-plugin-jest/issues/1219)) ([7c1389e](https://github.com/jest-community/eslint-plugin-jest/commit/7c1389e3d8c59e283de37ed86f3f4c12fb38c3ff))


### Features

* make `no-alias-methods` recommended ([#1221](https://github.com/jest-community/eslint-plugin-jest/issues/1221)) ([914b24a](https://github.com/jest-community/eslint-plugin-jest/commit/914b24a0bc12a151e6f7ecec37a440769b555b94))
* **no-jest-import:** remove rule ([#1220](https://github.com/jest-community/eslint-plugin-jest/issues/1220)) ([918873b](https://github.com/jest-community/eslint-plugin-jest/commit/918873beb15d4a698fe5150d826d44b696283683))
* **no-restricted-matchers:** match based on start of chain, requiring each permutation to be set ([#1218](https://github.com/jest-community/eslint-plugin-jest/issues/1218)) ([f4dd97a](https://github.com/jest-community/eslint-plugin-jest/commit/f4dd97a7ec3b985d0f7e42a5a6331bc0c65a7d56))


### BREAKING CHANGES

* `no-alias-methods` is now recommended as the methods themselves will be removed in the next major version of Jest
* **no-jest-import:** removed `no-jest-import` rule
* **unbound-method:** errors thrown by the `unbound-method` base rule are no longer suppressed - really this means that if you don't specify `project` when this rule is enabled and `@typescript-eslint/eslint-plugin` is present, that error will no longer be suppressed instead of silently doing nothing; it will still not throw if this rule is enabled without the base rule being present
* **no-restricted-matchers:** `no-restricted-matchers` now checks against the start of the expect chain, meaning you have to explicitly list each possible matcher & modifier permutations that you want to restrict

# [27.0.0-next.1](https://github.com/jest-community/eslint-plugin-jest/compare/v26.8.7...v27.0.0-next.1) (2022-08-23)


### Features

* drop support for `eslint@6` ([#1212](https://github.com/jest-community/eslint-plugin-jest/issues/1212)) ([21fc2fe](https://github.com/jest-community/eslint-plugin-jest/commit/21fc2feea67a8fd9f6673fd6a1e91ca1f5bdda11))
* drop support for Node versions 12 and 17 ([#1211](https://github.com/jest-community/eslint-plugin-jest/issues/1211)) ([4c987f5](https://github.com/jest-community/eslint-plugin-jest/commit/4c987f5f566398d95584668bd2bc18bfdf438e40))


### BREAKING CHANGES

* Support for ESLint version 6 is removed
* Node versions 12 and 17 are no longer supported

# [26.9.0](https://github.com/jest-community/eslint-plugin-jest/compare/v26.8.7...v26.9.0) (2022-08-28)


### Features

* create `prefer-each` rule ([#1222](https://github.com/jest-community/eslint-plugin-jest/issues/1222)) ([574eaed](https://github.com/jest-community/eslint-plugin-jest/commit/574eaed9fafcdc4ed5624451f792c8951eb49f0a))

## [26.8.7](https://github.com/jest-community/eslint-plugin-jest/compare/v26.8.6...v26.8.7) (2022-08-21)


### Bug Fixes

* **prefer-expect-assertions:** report on concise arrow functions ([#1207](https://github.com/jest-community/eslint-plugin-jest/issues/1207)) ([f928747](https://github.com/jest-community/eslint-plugin-jest/commit/f92874783dd437108463231bf83afdb946641229))

## [26.8.6](https://github.com/jest-community/eslint-plugin-jest/compare/v26.8.5...v26.8.6) (2022-08-21)


### Bug Fixes

* **max-expect:** reset `expect` counter when entering and exiting test function calls ([#1206](https://github.com/jest-community/eslint-plugin-jest/issues/1206)) ([3908ab8](https://github.com/jest-community/eslint-plugin-jest/commit/3908ab8c4bf7453d70a5ed04e22bf3ed90834576))

## [26.8.5](https://github.com/jest-community/eslint-plugin-jest/compare/v26.8.4...v26.8.5) (2022-08-20)


### Bug Fixes

* **prefer-expect-assertions:** use scoped based jest fn call parser for `expect` checks ([#1201](https://github.com/jest-community/eslint-plugin-jest/issues/1201)) ([fd54ca1](https://github.com/jest-community/eslint-plugin-jest/commit/fd54ca15575692c56a0caa28cb6227e0fb4aa4e2))

## [26.8.4](https://github.com/jest-community/eslint-plugin-jest/compare/v26.8.3...v26.8.4) (2022-08-19)


### Bug Fixes

* **prefer-mock-promise-shorthand:** ignore `mockImplementation` functions that have parameters ([#1199](https://github.com/jest-community/eslint-plugin-jest/issues/1199)) ([78ccbef](https://github.com/jest-community/eslint-plugin-jest/commit/78ccbefc01720f5c44ae439389cb27afda0315c2))

## [26.8.3](https://github.com/jest-community/eslint-plugin-jest/compare/v26.8.2...v26.8.3) (2022-08-15)


### Performance Improvements

* cache jest fn call parsing results ([#1187](https://github.com/jest-community/eslint-plugin-jest/issues/1187)) ([525631e](https://github.com/jest-community/eslint-plugin-jest/commit/525631ebddbb0ebbfe9415c330b3751100bee6a5))

## [26.8.2](https://github.com/jest-community/eslint-plugin-jest/compare/v26.8.1...v26.8.2) (2022-08-09)


### Bug Fixes

* **max-expects:** don't count `expect.<member>()` calls towards max ([#1194](https://github.com/jest-community/eslint-plugin-jest/issues/1194)) ([75a0ff2](https://github.com/jest-community/eslint-plugin-jest/commit/75a0ff2d74abca9cffe3c9135f16469116c73633))

## [26.8.1](https://github.com/jest-community/eslint-plugin-jest/compare/v26.8.0...v26.8.1) (2022-08-08)


### Bug Fixes

* **no-standalone-expect:** only report on `expect.hasAssertions` & `expect.assertions` member calls ([#1191](https://github.com/jest-community/eslint-plugin-jest/issues/1191)) ([4bf9eea](https://github.com/jest-community/eslint-plugin-jest/commit/4bf9eea3985a4855e7d3b575bd65f70fa62b9e0a))

# [26.8.0](https://github.com/jest-community/eslint-plugin-jest/compare/v26.7.0...v26.8.0) (2022-08-07)


### Features

* resolve `expect` based on scope ([#1173](https://github.com/jest-community/eslint-plugin-jest/issues/1173)) ([aa4be21](https://github.com/jest-community/eslint-plugin-jest/commit/aa4be21dc4ad9be0d2f27a95f25c10555c653a4b))

# [26.7.0](https://github.com/jest-community/eslint-plugin-jest/compare/v26.6.0...v26.7.0) (2022-07-29)


### Features

* create `prefer-mock-promise-shorthand` rule ([#1167](https://github.com/jest-community/eslint-plugin-jest/issues/1167)) ([d965592](https://github.com/jest-community/eslint-plugin-jest/commit/d965592bef6e120358b43fbc0a741bd5b516dae9))

# [26.6.0](https://github.com/jest-community/eslint-plugin-jest/compare/v26.5.3...v26.6.0) (2022-07-14)


### Features

* create `max-expects` rule ([#1166](https://github.com/jest-community/eslint-plugin-jest/issues/1166)) ([5b6fd20](https://github.com/jest-community/eslint-plugin-jest/commit/5b6fd20b37baee87779c9aef856f747e55e0f467))

## [26.5.3](https://github.com/jest-community/eslint-plugin-jest/compare/v26.5.2...v26.5.3) (2022-06-06)


### Bug Fixes

* **prefer-equality-matcher:** handle `resolves` and `rejects` modifiers correctly ([#1146](https://github.com/jest-community/eslint-plugin-jest/issues/1146)) ([0fad4df](https://github.com/jest-community/eslint-plugin-jest/commit/0fad4df6a342f6eebf57f7a9fd7f13a17fbc0d1b))

## [26.5.2](https://github.com/jest-community/eslint-plugin-jest/compare/v26.5.1...v26.5.2) (2022-06-06)


### Bug Fixes

* **prefer-comparison-matcher:** handle `resolves` and `rejects` modifiers correctly ([#1145](https://github.com/jest-community/eslint-plugin-jest/issues/1145)) ([b1795ff](https://github.com/jest-community/eslint-plugin-jest/commit/b1795ff8aca9901b1c5054584d653fb0c04caebf))

## [26.5.1](https://github.com/jest-community/eslint-plugin-jest/compare/v26.5.0...v26.5.1) (2022-06-05)


### Bug Fixes

* **prefer-called-with:** handle `resolves` and `rejects` modifiers correctly ([#1143](https://github.com/jest-community/eslint-plugin-jest/issues/1143)) ([dff1cb4](https://github.com/jest-community/eslint-plugin-jest/commit/dff1cb4709941fe5538d2edf0a1cf4d3df508acf))

# [26.5.0](https://github.com/jest-community/eslint-plugin-jest/compare/v26.4.7...v26.5.0) (2022-06-04)


### Features

* support aliases for jest globals (e.g. `context`) ([#1129](https://github.com/jest-community/eslint-plugin-jest/issues/1129)) ([02ec945](https://github.com/jest-community/eslint-plugin-jest/commit/02ec945f0794949ce38a11addb0ef3ceafa1aed2))

## [26.4.7](https://github.com/jest-community/eslint-plugin-jest/compare/v26.4.6...v26.4.7) (2022-06-04)


### Bug Fixes

* **no-restricted-matchers:** allow restricting negated `resolves` and `rejects` modifiers ([#1142](https://github.com/jest-community/eslint-plugin-jest/issues/1142)) ([0950a96](https://github.com/jest-community/eslint-plugin-jest/commit/0950a968f3bc92cb6ed25cbbcbd6fc616245bf44))

## [26.4.6](https://github.com/jest-community/eslint-plugin-jest/compare/v26.4.5...v26.4.6) (2022-05-30)


### Bug Fixes

* **no-disabled-tests:** don't report on `it.todo` & `test.todo` ([#1137](https://github.com/jest-community/eslint-plugin-jest/issues/1137)) ([b651443](https://github.com/jest-community/eslint-plugin-jest/commit/b651443b820126cf05ad6803648c789afde0172f))

## [26.4.5](https://github.com/jest-community/eslint-plugin-jest/compare/v26.4.4...v26.4.5) (2022-05-29)


### Bug Fixes

* **expect-expect:** include numbers when matching assert function names with wildcards ([#1134](https://github.com/jest-community/eslint-plugin-jest/issues/1134)) ([2d0ef11](https://github.com/jest-community/eslint-plugin-jest/commit/2d0ef11137dc556f8b1e08a510d70c0dbea8a083))

## [26.4.4](https://github.com/jest-community/eslint-plugin-jest/compare/v26.4.3...v26.4.4) (2022-05-29)


### Bug Fixes

* don't consider template tags in the middle of a possible jest function chain to be valid ([#1133](https://github.com/jest-community/eslint-plugin-jest/issues/1133)) ([430de17](https://github.com/jest-community/eslint-plugin-jest/commit/430de17abc453da833a697c6ca425f2cc50febcc))

## [26.4.3](https://github.com/jest-community/eslint-plugin-jest/compare/v26.4.2...v26.4.3) (2022-05-29)


### Bug Fixes

* don't consider method calls on literals or `new` to be jest functions ([#1132](https://github.com/jest-community/eslint-plugin-jest/issues/1132)) ([379ceb3](https://github.com/jest-community/eslint-plugin-jest/commit/379ceb31467bb957f6988821c57611e475e59313))
* produce valid code when when fixing properties accessed with square brackets ([#1131](https://github.com/jest-community/eslint-plugin-jest/issues/1131)) ([6cd600d](https://github.com/jest-community/eslint-plugin-jest/commit/6cd600dbd4846fcb7ba8c7756ac0cf4b8b0e0a4b))

## [26.4.2](https://github.com/jest-community/eslint-plugin-jest/compare/v26.4.1...v26.4.2) (2022-05-28)


### Bug Fixes

* don't consider `concurrent.skip` and `concurrent.only` valid test functions ([#1124](https://github.com/jest-community/eslint-plugin-jest/issues/1124)) ([0aa5eb6](https://github.com/jest-community/eslint-plugin-jest/commit/0aa5eb60f6ad53316b9ec9343c9d0240e7ff5f1d))
* **no-disabled-tests:** use jest function call parser for checking number of args ([#1126](https://github.com/jest-community/eslint-plugin-jest/issues/1126)) ([b67e389](https://github.com/jest-community/eslint-plugin-jest/commit/b67e389b401ee6adb31fbfd0a7f903312544e5e8))

## [26.4.1](https://github.com/jest-community/eslint-plugin-jest/compare/v26.4.0...v26.4.1) (2022-05-28)


### Bug Fixes

* **no-disabled-tests:** switch to using jest function call parser ([#1125](https://github.com/jest-community/eslint-plugin-jest/issues/1125)) ([32931c3](https://github.com/jest-community/eslint-plugin-jest/commit/32931c331d5eb5584c7b6a24306d834d620c8470))
* support `failing` property on test functions ([#1123](https://github.com/jest-community/eslint-plugin-jest/issues/1123)) ([6d75e8d](https://github.com/jest-community/eslint-plugin-jest/commit/6d75e8da7a33d1386db1f8d4a04544c42bec443e))

# [26.4.0](https://github.com/jest-community/eslint-plugin-jest/compare/v26.3.0...v26.4.0) (2022-05-28)


### Features

* improve how jest function calls are resolved to account for import aliases ([#1122](https://github.com/jest-community/eslint-plugin-jest/issues/1122)) ([781f00e](https://github.com/jest-community/eslint-plugin-jest/commit/781f00e0120a02e992e213042e05c0c03da90330))

# [26.3.0](https://github.com/jest-community/eslint-plugin-jest/compare/v26.2.2...v26.3.0) (2022-05-28)


### Features

* create `prefer-hooks-in-order` rule ([#1098](https://github.com/jest-community/eslint-plugin-jest/issues/1098)) ([384654c](https://github.com/jest-community/eslint-plugin-jest/commit/384654cf44b8f4bcf0e03eed11aaa726dcf6b680))

## [26.2.2](https://github.com/jest-community/eslint-plugin-jest/compare/v26.2.1...v26.2.2) (2022-05-14)


### Bug Fixes

* use the last reference definition when checking jest fn scope ([#1109](https://github.com/jest-community/eslint-plugin-jest/issues/1109)) ([1b2b9c1](https://github.com/jest-community/eslint-plugin-jest/commit/1b2b9c1695a6dec1088daf0b44749100989226a4))

## [26.2.1](https://github.com/jest-community/eslint-plugin-jest/compare/v26.2.0...v26.2.1) (2022-05-14)


### Bug Fixes

* use correct scope for checking references ([#1107](https://github.com/jest-community/eslint-plugin-jest/issues/1107)) ([89ab1a0](https://github.com/jest-community/eslint-plugin-jest/commit/89ab1a03c3f0eab53fd5af2f5051a4e4d010578e))

# [26.2.0](https://github.com/jest-community/eslint-plugin-jest/compare/v26.1.5...v26.2.0) (2022-05-13)


### Features

* support `@jest/globals` ([#1094](https://github.com/jest-community/eslint-plugin-jest/issues/1094)) ([84d7a68](https://github.com/jest-community/eslint-plugin-jest/commit/84d7a68e8c64720a46fddddbcb1ba248cd61fd08))

## [26.1.5](https://github.com/jest-community/eslint-plugin-jest/compare/v26.1.4...v26.1.5) (2022-04-22)


### Bug Fixes

* **prefer-expect-assertions:** properly handle checking across multiple tests ([#1089](https://github.com/jest-community/eslint-plugin-jest/issues/1089)) ([8b61b0c](https://github.com/jest-community/eslint-plugin-jest/commit/8b61b0c0dd79e8f3a83cbbd78eada2bc8dee52e8))

## [26.1.4](https://github.com/jest-community/eslint-plugin-jest/compare/v26.1.3...v26.1.4) (2022-04-08)


### Bug Fixes

* **prefer-snapshot-hint:** don't report multi snapshots in different tests within the same describe ([#1078](https://github.com/jest-community/eslint-plugin-jest/issues/1078)) ([98e5166](https://github.com/jest-community/eslint-plugin-jest/commit/98e5166347990901b55c64b30f48907984890c48))

## [26.1.3](https://github.com/jest-community/eslint-plugin-jest/compare/v26.1.2...v26.1.3) (2022-03-24)


### Bug Fixes

* change node engine version to match dependencies ([#1072](https://github.com/jest-community/eslint-plugin-jest/issues/1072)) ([ef2c093](https://github.com/jest-community/eslint-plugin-jest/commit/ef2c093477457e462d5c272e97deadc5089ae0b9))

## [26.1.2](https://github.com/jest-community/eslint-plugin-jest/compare/v26.1.1...v26.1.2) (2022-03-19)


### Bug Fixes

* **prefer-snapshot-hint:** support passing hint to `toMatchSnapshot` as first argument ([#1070](https://github.com/jest-community/eslint-plugin-jest/issues/1070)) ([97b1f9d](https://github.com/jest-community/eslint-plugin-jest/commit/97b1f9d8063811d8ebb7ad41b92a5286c56aa2c4))

## [26.1.1](https://github.com/jest-community/eslint-plugin-jest/compare/v26.1.0...v26.1.1) (2022-02-15)


### Bug Fixes

* **docs:** use the correct function name ([#1056](https://github.com/jest-community/eslint-plugin-jest/issues/1056)) ([7435556](https://github.com/jest-community/eslint-plugin-jest/commit/74355566e6eef64b98a7da675c0cdcc2e8dc9df6))

# [26.1.0](https://github.com/jest-community/eslint-plugin-jest/compare/v26.0.0...v26.1.0) (2022-02-06)


### Features

* create `no-conditional-in-test` rule ([#1027](https://github.com/jest-community/eslint-plugin-jest/issues/1027)) ([d551850](https://github.com/jest-community/eslint-plugin-jest/commit/d5518503e7c5c3051e698bf1a53e9fa2b6d840dc))
* create `prefer-snapshot-hint` rule ([#1012](https://github.com/jest-community/eslint-plugin-jest/issues/1012)) ([d854723](https://github.com/jest-community/eslint-plugin-jest/commit/d85472365eb45d6073625965c390ba3445a18935))
* deprecate `no-if` in favor of `no-conditional-in-test` ([#1049](https://github.com/jest-community/eslint-plugin-jest/issues/1049)) ([35f32cc](https://github.com/jest-community/eslint-plugin-jest/commit/35f32cc9da8741649766c2e33b8a6bcaa46ac0e7))

# [26.1.0-next.2](https://github.com/jest-community/eslint-plugin-jest/compare/v26.1.0-next.1...v26.1.0-next.2) (2022-02-06)


### Features

* deprecate `no-if` in favor of `no-conditional-in-test` ([#1049](https://github.com/jest-community/eslint-plugin-jest/issues/1049)) ([b15f3af](https://github.com/jest-community/eslint-plugin-jest/commit/b15f3af2d370b7d8d6a0293bc78d560cb874aef6))

# [26.1.0-next.1](https://github.com/jest-community/eslint-plugin-jest/compare/v26.0.0...v26.1.0-next.1) (2022-02-06)


### Features

* create `no-conditional-in-test` rule ([#1027](https://github.com/jest-community/eslint-plugin-jest/issues/1027)) ([004ddc5](https://github.com/jest-community/eslint-plugin-jest/commit/004ddc5cff58e57489ff55cc783b0fa9b964b09a))

# [26.0.0](https://github.com/jest-community/eslint-plugin-jest/compare/v25.7.0...v26.0.0) (2022-01-24)


### Bug Fixes

* migrate to non-experimental ts-eslint utils ([#1035](https://github.com/jest-community/eslint-plugin-jest/issues/1035)) ([e894f51](https://github.com/jest-community/eslint-plugin-jest/commit/e894f51a0d12e3872a4a41d6ea01950b81c07950))


### BREAKING CHANGES

* Drop support for `@typescript-eslint/eslint-plugin@4`

# [25.7.0](https://github.com/jest-community/eslint-plugin-jest/compare/v25.6.0...v25.7.0) (2022-01-15)


### Features

* create `prefer-equality-matcher` rule ([#1016](https://github.com/jest-community/eslint-plugin-jest/issues/1016)) ([341353b](https://github.com/jest-community/eslint-plugin-jest/commit/341353bc7d57685cc5e0b31501d6ca336a0dbaf0))
* **valid-expect:** support `asyncMatchers` option and default to `jest-extended` matchers ([#1018](https://github.com/jest-community/eslint-plugin-jest/issues/1018)) ([c82205a](https://github.com/jest-community/eslint-plugin-jest/commit/c82205a73a4e8de315a2ad4d413b146e27c14a34))

# [25.6.0](https://github.com/jest-community/eslint-plugin-jest/compare/v25.5.0...v25.6.0) (2022-01-15)


### Features

* create `prefer-comparison-matcher` rule ([#1015](https://github.com/jest-community/eslint-plugin-jest/issues/1015)) ([eb11876](https://github.com/jest-community/eslint-plugin-jest/commit/eb118761a422b3589311113cd827a6be437f5bb5))

# [25.5.0](https://github.com/jest-community/eslint-plugin-jest/compare/v25.4.0...v25.5.0) (2022-01-15)


### Features

* **prefer-expect-assertions:** support requiring only if `expect` is used in a callback ([#1028](https://github.com/jest-community/eslint-plugin-jest/issues/1028)) ([8d5fd33](https://github.com/jest-community/eslint-plugin-jest/commit/8d5fd33eed633f0c0bbdcb9e86bd2d8d7de79c4b))

# [25.4.0](https://github.com/jest-community/eslint-plugin-jest/compare/v25.3.4...v25.4.0) (2022-01-15)


### Features

* **prefer-expect-assertions:** support requiring only if `expect` is used in a loop ([#1013](https://github.com/jest-community/eslint-plugin-jest/issues/1013)) ([e6f4f8a](https://github.com/jest-community/eslint-plugin-jest/commit/e6f4f8aaf7664bcf9d9d5549c3c43b1b09f49461))

## [25.3.4](https://github.com/jest-community/eslint-plugin-jest/compare/v25.3.3...v25.3.4) (2022-01-01)


### Bug Fixes

* **prefer-lowercase-title:** ignore `it` and `test` separately ([#1011](https://github.com/jest-community/eslint-plugin-jest/issues/1011)) ([f1a7674](https://github.com/jest-community/eslint-plugin-jest/commit/f1a767400967bd923512f79e80f283b3b2afa772))

## [25.3.3](https://github.com/jest-community/eslint-plugin-jest/compare/v25.3.2...v25.3.3) (2021-12-30)


### Bug Fixes

* **prefer-to-contain:** support square bracket accessors ([#1009](https://github.com/jest-community/eslint-plugin-jest/issues/1009)) ([73984a7](https://github.com/jest-community/eslint-plugin-jest/commit/73984a79f790986a17116589a587506bcc10efc0))
* **prefer-to-have-length:** support square bracket accessors ([#1010](https://github.com/jest-community/eslint-plugin-jest/issues/1010)) ([9e70f55](https://github.com/jest-community/eslint-plugin-jest/commit/9e70f550e341432f69a1cd334c19df87513ea906))

## [25.3.2](https://github.com/jest-community/eslint-plugin-jest/compare/v25.3.1...v25.3.2) (2021-12-27)


### Bug Fixes

* **no-large-snapshots:** only count size of template string for inline snapshots ([#1005](https://github.com/jest-community/eslint-plugin-jest/issues/1005)) ([5bea38f](https://github.com/jest-community/eslint-plugin-jest/commit/5bea38f9773ab686f08a7cc25247a782d50aa5ed))
* **prefer-hooks-on-top:** improve message & docs ([#999](https://github.com/jest-community/eslint-plugin-jest/issues/999)) ([f9e7ae2](https://github.com/jest-community/eslint-plugin-jest/commit/f9e7ae29233daad7bfea2230bea7266659299328))

## [25.3.1](https://github.com/jest-community/eslint-plugin-jest/compare/v25.3.0...v25.3.1) (2021-12-27)


### Bug Fixes

* **prefer-to-be:** support template literals ([#1006](https://github.com/jest-community/eslint-plugin-jest/issues/1006)) ([aa428e6](https://github.com/jest-community/eslint-plugin-jest/commit/aa428e6598d5f7b259d3cec1bc505989a0fe9885))

# [25.3.0](https://github.com/jest-community/eslint-plugin-jest/compare/v25.2.4...v25.3.0) (2021-11-23)


### Features

* **require-hook:** add `allowedFunctionCalls` setting ([#983](https://github.com/jest-community/eslint-plugin-jest/issues/983)) ([9d9336a](https://github.com/jest-community/eslint-plugin-jest/commit/9d9336a7624c53c0bb3ee899b8cc336a0b3349cb))

## [25.2.4](https://github.com/jest-community/eslint-plugin-jest/compare/v25.2.3...v25.2.4) (2021-11-08)


### Bug Fixes

* **prefer-to-be:** preserve `resolves` and `rejects` modifiers ([#980](https://github.com/jest-community/eslint-plugin-jest/issues/980)) ([a1296bd](https://github.com/jest-community/eslint-plugin-jest/commit/a1296bdee3a3a8ec5f64f95735ca01b91e8f4118))

## [25.2.3](https://github.com/jest-community/eslint-plugin-jest/compare/v25.2.2...v25.2.3) (2021-11-04)


### Bug Fixes

* **no-deprecated-functions:** mark jest as an optional peer dependency ([#970](https://github.com/jest-community/eslint-plugin-jest/issues/970)) ([f468752](https://github.com/jest-community/eslint-plugin-jest/commit/f468752fc0aba89dd9bcce5fe676a04cb2fa6407))

## [25.2.2](https://github.com/jest-community/eslint-plugin-jest/compare/v25.2.1...v25.2.2) (2021-10-17)


### Bug Fixes

* **require-hook:** check variables are either `const` or declarations ([#959](https://github.com/jest-community/eslint-plugin-jest/issues/959)) ([ce8cd61](https://github.com/jest-community/eslint-plugin-jest/commit/ce8cd612b7c4c16dc29934118b191d3fbe1ffc07))

## [25.2.1](https://github.com/jest-community/eslint-plugin-jest/compare/v25.2.0...v25.2.1) (2021-10-15)


### Bug Fixes

* **expect-expect:** don't error on `it.todo` & `test.todo` calls ([#954](https://github.com/jest-community/eslint-plugin-jest/issues/954)) ([d3cc0db](https://github.com/jest-community/eslint-plugin-jest/commit/d3cc0db129f8d2021cf278f656b73b8c7efb2dc2))

# [25.2.0](https://github.com/jest-community/eslint-plugin-jest/compare/v25.1.0...v25.2.0) (2021-10-14)


### Features

* **expect-expect:** support `additionalTestBlockFunctions` option ([#850](https://github.com/jest-community/eslint-plugin-jest/issues/850)) ([3b94c62](https://github.com/jest-community/eslint-plugin-jest/commit/3b94c62b81a50bc8b213c597bb59799cff1ef207))

# [25.1.0](https://github.com/jest-community/eslint-plugin-jest/compare/v25.0.6...v25.1.0) (2021-10-14)


### Features

* support `eslint@8` ([#940](https://github.com/jest-community/eslint-plugin-jest/issues/940)) ([5a9e45f](https://github.com/jest-community/eslint-plugin-jest/commit/5a9e45f61888a3c32eac3cbfeaf3acdfaa5d9c83))

## [25.0.6](https://github.com/jest-community/eslint-plugin-jest/compare/v25.0.5...v25.0.6) (2021-10-14)


### Bug Fixes

* **valid-expect-in-promise:** allow `expect.resolve` & `expect.reject` ([#948](https://github.com/jest-community/eslint-plugin-jest/issues/948)) ([71b7e17](https://github.com/jest-community/eslint-plugin-jest/commit/71b7e17953b4310a4f2845adc951c68cf062cdc1)), closes [#947](https://github.com/jest-community/eslint-plugin-jest/issues/947)
* **valid-expect-in-promise:** support `await` in arrays ([#949](https://github.com/jest-community/eslint-plugin-jest/issues/949)) ([a62130c](https://github.com/jest-community/eslint-plugin-jest/commit/a62130c28d01dea065cc6900a062180de2079876))

## [25.0.5](https://github.com/jest-community/eslint-plugin-jest/compare/v25.0.4...v25.0.5) (2021-10-11)


### Bug Fixes

* support `@typescript-eslint/eslint-plugin@5` ([#942](https://github.com/jest-community/eslint-plugin-jest/issues/942)) ([9b842a3](https://github.com/jest-community/eslint-plugin-jest/commit/9b842a309fb8e4263896f3e5b5150cf091d48698))

## [25.0.4](https://github.com/jest-community/eslint-plugin-jest/compare/v25.0.3...v25.0.4) (2021-10-11)


### Bug Fixes

* update `@typescript-eslint/experimental-utils` to v5 ([#941](https://github.com/jest-community/eslint-plugin-jest/issues/941)) ([afad49a](https://github.com/jest-community/eslint-plugin-jest/commit/afad49a885eeb1ac52f00d8e1666259210a4b675))

## [25.0.3](https://github.com/jest-community/eslint-plugin-jest/compare/v25.0.2...v25.0.3) (2021-10-11)


### Bug Fixes

* **valid-expect-in-promise:** support awaited promises in arguments ([#936](https://github.com/jest-community/eslint-plugin-jest/issues/936)) ([bd2c33c](https://github.com/jest-community/eslint-plugin-jest/commit/bd2c33c858573d5414d8bc0d401eb6f27801ad2b))

## [25.0.2](https://github.com/jest-community/eslint-plugin-jest/compare/v25.0.1...v25.0.2) (2021-10-11)


### Bug Fixes

* **valid-expect-in-promise:** support out of order awaits ([#939](https://github.com/jest-community/eslint-plugin-jest/issues/939)) ([07d2137](https://github.com/jest-community/eslint-plugin-jest/commit/07d213719de974d6b5a1cab75e836dc39b432f87))

## [25.0.1](https://github.com/jest-community/eslint-plugin-jest/compare/v25.0.0...v25.0.1) (2021-10-10)


### Bug Fixes

* specify peer dependency ranges correctly ([cb87458](https://github.com/jest-community/eslint-plugin-jest/commit/cb87458d5f7dc7f669ab0c4067d75fc06ee29553))

# [25.0.0](https://github.com/jest-community/eslint-plugin-jest/compare/v24.7.0...v25.0.0) (2021-10-10)


### Bug Fixes

* stop testing ESLint 5 ([#893](https://github.com/jest-community/eslint-plugin-jest/issues/893)) ([47a0138](https://github.com/jest-community/eslint-plugin-jest/commit/47a0138856e6247cde00b17682e49865b8f5a1f6))
* stop testing on Node 10 and 15 ([#891](https://github.com/jest-community/eslint-plugin-jest/issues/891)) ([bcd8d11](https://github.com/jest-community/eslint-plugin-jest/commit/bcd8d112fcd98a7652c767bd246d05101979239c))


### Features

* add `prefer-to-be` to style ruleset ([2a3376f](https://github.com/jest-community/eslint-plugin-jest/commit/2a3376fc9f5fe60d03d9aad0c4e5c7c423487e60))
* **lowercase-name:** rename to `prefer-lowercase-title` ([b860084](https://github.com/jest-community/eslint-plugin-jest/commit/b8600841e371d5d9f36be4e50e53252fd8f62734))
* **prefer-to-be-null:** remove rule ([809bcda](https://github.com/jest-community/eslint-plugin-jest/commit/809bcda12c555a24c764d152bcac9814ea55e72f))
* **prefer-to-be-undefined:** remove rule ([3434d9b](https://github.com/jest-community/eslint-plugin-jest/commit/3434d9bd22b92bace6e0a50e2c72b401ac17704d))
* remove deprecated rules ([#661](https://github.com/jest-community/eslint-plugin-jest/issues/661)) ([e8f16ec](https://github.com/jest-community/eslint-plugin-jest/commit/e8f16ec0e204a94a0e549cb9b415b3c6c8981aee))
* **valid-describe:** rename to `valid-describe-callback` ([f3e9e9a](https://github.com/jest-community/eslint-plugin-jest/commit/f3e9e9a64e183a0fb8af3436611a7f70366a528d))


### BREAKING CHANGES

* **valid-describe:** renamed `valid-describe` to `valid-describe-callback`
* **lowercase-name:** renamed `lowercase-name` to `prefer-lowercase-title`
* **prefer-to-be-undefined:** removed `prefer-to-be-undefined` rule
* **prefer-to-be-null:** removed `prefer-to-be-null` rule
* recommend `prefer-to-be` rule
* Removes rules `no-expect-resolves`, `no-truthy-falsy`, `no-try-expect`, and `prefer-inline-snapshots`
* Drop support for ESLint 5
* Drop support for Node 10 and 15

# [25.0.0-next.7](https://github.com/jest-community/eslint-plugin-jest/compare/v25.0.0-next.6...v25.0.0-next.7) (2021-10-10)


### Features

* add `prefer-to-be` to style ruleset ([2a3376f](https://github.com/jest-community/eslint-plugin-jest/commit/2a3376fc9f5fe60d03d9aad0c4e5c7c423487e60))
* **lowercase-name:** rename to `prefer-lowercase-title` ([b860084](https://github.com/jest-community/eslint-plugin-jest/commit/b8600841e371d5d9f36be4e50e53252fd8f62734))
* **prefer-to-be-null:** remove rule ([809bcda](https://github.com/jest-community/eslint-plugin-jest/commit/809bcda12c555a24c764d152bcac9814ea55e72f))
* **prefer-to-be-undefined:** remove rule ([3434d9b](https://github.com/jest-community/eslint-plugin-jest/commit/3434d9bd22b92bace6e0a50e2c72b401ac17704d))
* **valid-describe:** rename to `valid-describe-callback` ([f3e9e9a](https://github.com/jest-community/eslint-plugin-jest/commit/f3e9e9a64e183a0fb8af3436611a7f70366a528d))


### BREAKING CHANGES

* **valid-describe:** renamed `valid-describe` to `valid-describe-callback`
* **lowercase-name:** renamed `lowercase-name` to `prefer-lowercase-title`
* **prefer-to-be-undefined:** removed `prefer-to-be-undefined` rule
* **prefer-to-be-null:** removed `prefer-to-be-null` rule
* recommend `prefer-to-be` rule

# [25.0.0-next.6](https://github.com/jest-community/eslint-plugin-jest/compare/v25.0.0-next.5...v25.0.0-next.6) (2021-10-10)


### Bug Fixes

* **lowercase-name:** consider skip and only prefixes for ignores ([#923](https://github.com/jest-community/eslint-plugin-jest/issues/923)) ([8716c24](https://github.com/jest-community/eslint-plugin-jest/commit/8716c24678ea7dc7c9f692b573d1ea19a67efd84))
* **prefer-to-be:** don't consider RegExp literals as `toBe`-able ([#922](https://github.com/jest-community/eslint-plugin-jest/issues/922)) ([99b6d42](https://github.com/jest-community/eslint-plugin-jest/commit/99b6d429e697d60645b4bc64ee4ae34d7016118c))


### Features

* create `require-hook` rule ([#929](https://github.com/jest-community/eslint-plugin-jest/issues/929)) ([6204b31](https://github.com/jest-community/eslint-plugin-jest/commit/6204b311e849b51a0e4705015575139f590ae7a4))
* deprecate `prefer-to-be-null` rule ([4db9161](https://github.com/jest-community/eslint-plugin-jest/commit/4db91612e988e84ac2facbfe466331b22eeccec9))
* deprecate `prefer-to-be-undefined` rule ([fa08f09](https://github.com/jest-community/eslint-plugin-jest/commit/fa08f0944e89915fb215bbeff970f12459121cb8))
* **valid-expect-in-promise:** re-implement rule ([#916](https://github.com/jest-community/eslint-plugin-jest/issues/916)) ([7a49c58](https://github.com/jest-community/eslint-plugin-jest/commit/7a49c5831e3d85a60c11e385203b8f83d98ad580))

# [25.0.0-next.5](https://github.com/jest-community/eslint-plugin-jest/compare/v25.0.0-next.4...v25.0.0-next.5) (2021-09-29)


### Bug Fixes

* **no-deprecated-functions:** remove `process.cwd` from resolve paths ([#889](https://github.com/jest-community/eslint-plugin-jest/issues/889)) ([6940488](https://github.com/jest-community/eslint-plugin-jest/commit/6940488d7b5a47577e2823e6d4385b511c5becf4))
* **no-identical-title:** always consider `.each` titles unique ([#910](https://github.com/jest-community/eslint-plugin-jest/issues/910)) ([a41a40e](https://github.com/jest-community/eslint-plugin-jest/commit/a41a40eafaf1db444ba940cccd2014cb0dc41be9))
* **valid-expect-in-promise:** support `finally` ([#914](https://github.com/jest-community/eslint-plugin-jest/issues/914)) ([9c89855](https://github.com/jest-community/eslint-plugin-jest/commit/9c89855d23534272230afe6d9e665b8e11ef3075))
* **valid-expect-in-promise:** support additional test functions ([#915](https://github.com/jest-community/eslint-plugin-jest/issues/915)) ([4798005](https://github.com/jest-community/eslint-plugin-jest/commit/47980058d8d1ff86ee69a376c4edd182d462d594))


### Features

* create `prefer-expect-resolves` rule ([#822](https://github.com/jest-community/eslint-plugin-jest/issues/822)) ([2556020](https://github.com/jest-community/eslint-plugin-jest/commit/2556020a777f9daaf1d362a04e3f990415e82db8))
* create `prefer-to-be` rule ([#864](https://github.com/jest-community/eslint-plugin-jest/issues/864)) ([3a64aea](https://github.com/jest-community/eslint-plugin-jest/commit/3a64aea5bdc55465f1ef34f1426ae626d6c8a230))
* **require-top-level-describe:** support enforcing max num of describes ([#912](https://github.com/jest-community/eslint-plugin-jest/issues/912)) ([14a2d13](https://github.com/jest-community/eslint-plugin-jest/commit/14a2d1391c9f6f52509316542f45df35853c9b79))
* **valid-title:** allow custom matcher messages ([#913](https://github.com/jest-community/eslint-plugin-jest/issues/913)) ([ffc9392](https://github.com/jest-community/eslint-plugin-jest/commit/ffc93921348b0d4a394125f665d2bb09148ea37e))

# [25.0.0-next.4](https://github.com/jest-community/eslint-plugin-jest/compare/v25.0.0-next.3...v25.0.0-next.4) (2021-09-20)


### Bug Fixes

* mark rules that suggest fixes with `hasSuggestion` for ESLint v8 ([#898](https://github.com/jest-community/eslint-plugin-jest/issues/898)) ([ec0a21b](https://github.com/jest-community/eslint-plugin-jest/commit/ec0a21b0d98d043a9949138e495814e0935d5e31))
* use correct property `hasSuggestions` rather than `hasSuggestion` ([#899](https://github.com/jest-community/eslint-plugin-jest/issues/899)) ([dfd2368](https://github.com/jest-community/eslint-plugin-jest/commit/dfd2368d1cb1789b6a95a11be24c36868bb8a819))

# [25.0.0-next.3](https://github.com/jest-community/eslint-plugin-jest/compare/v25.0.0-next.2...v25.0.0-next.3) (2021-09-17)


### Features

* remove deprecated rules ([#661](https://github.com/jest-community/eslint-plugin-jest/issues/661)) ([e8f16ec](https://github.com/jest-community/eslint-plugin-jest/commit/e8f16ec0e204a94a0e549cb9b415b3c6c8981aee))


### BREAKING CHANGES

* Removes rules `no-expect-resolves`, `no-truthy-falsy`, `no-try-expect`, and `prefer-inline-snapshots`

# [25.0.0-next.2](https://github.com/jest-community/eslint-plugin-jest/compare/v25.0.0-next.1...v25.0.0-next.2) (2021-09-13)


### Bug Fixes

* stop testing ESLint 5 ([#893](https://github.com/jest-community/eslint-plugin-jest/issues/893)) ([47a0138](https://github.com/jest-community/eslint-plugin-jest/commit/47a0138856e6247cde00b17682e49865b8f5a1f6))


### BREAKING CHANGES

* Drop support for ESLint 5

# [25.0.0-next.1](https://github.com/jest-community/eslint-plugin-jest/compare/v24.4.0...v25.0.0-next.1) (2021-09-13)


### Bug Fixes

* stop testing on Node 10 and 15 ([#891](https://github.com/jest-community/eslint-plugin-jest/issues/891)) ([bcd8d11](https://github.com/jest-community/eslint-plugin-jest/commit/bcd8d112fcd98a7652c767bd246d05101979239c))


### BREAKING CHANGES

* Drop support for Node 10 and 15

# [24.7.0](https://github.com/jest-community/eslint-plugin-jest/compare/v24.6.0...v24.7.0) (2021-10-10)


### Features

* create `require-hook` rule ([#929](https://github.com/jest-community/eslint-plugin-jest/issues/929)) ([6204b31](https://github.com/jest-community/eslint-plugin-jest/commit/6204b311e849b51a0e4705015575139f590ae7a4))
* deprecate `prefer-to-be-null` rule ([4db9161](https://github.com/jest-community/eslint-plugin-jest/commit/4db91612e988e84ac2facbfe466331b22eeccec9))
* deprecate `prefer-to-be-undefined` rule ([fa08f09](https://github.com/jest-community/eslint-plugin-jest/commit/fa08f0944e89915fb215bbeff970f12459121cb8))

# [24.6.0](https://github.com/jest-community/eslint-plugin-jest/compare/v24.5.2...v24.6.0) (2021-10-09)


### Features

* **valid-expect-in-promise:** re-implement rule ([#916](https://github.com/jest-community/eslint-plugin-jest/issues/916)) ([7a49c58](https://github.com/jest-community/eslint-plugin-jest/commit/7a49c5831e3d85a60c11e385203b8f83d98ad580))

## [24.5.2](https://github.com/jest-community/eslint-plugin-jest/compare/v24.5.1...v24.5.2) (2021-10-04)


### Bug Fixes

* **lowercase-name:** consider skip and only prefixes for ignores ([#923](https://github.com/jest-community/eslint-plugin-jest/issues/923)) ([8716c24](https://github.com/jest-community/eslint-plugin-jest/commit/8716c24678ea7dc7c9f692b573d1ea19a67efd84))

## [24.5.1](https://github.com/jest-community/eslint-plugin-jest/compare/v24.5.0...v24.5.1) (2021-10-04)


### Bug Fixes

* **prefer-to-be:** don't consider RegExp literals as `toBe`-able ([#922](https://github.com/jest-community/eslint-plugin-jest/issues/922)) ([99b6d42](https://github.com/jest-community/eslint-plugin-jest/commit/99b6d429e697d60645b4bc64ee4ae34d7016118c))

# [24.5.0](https://github.com/jest-community/eslint-plugin-jest/compare/v24.4.3...v24.5.0) (2021-09-29)


### Bug Fixes

* **no-deprecated-functions:** remove `process.cwd` from resolve paths ([#889](https://github.com/jest-community/eslint-plugin-jest/issues/889)) ([6940488](https://github.com/jest-community/eslint-plugin-jest/commit/6940488d7b5a47577e2823e6d4385b511c5becf4))
* **no-identical-title:** always consider `.each` titles unique ([#910](https://github.com/jest-community/eslint-plugin-jest/issues/910)) ([a41a40e](https://github.com/jest-community/eslint-plugin-jest/commit/a41a40eafaf1db444ba940cccd2014cb0dc41be9))


### Features

* create `prefer-expect-resolves` rule ([#822](https://github.com/jest-community/eslint-plugin-jest/issues/822)) ([2556020](https://github.com/jest-community/eslint-plugin-jest/commit/2556020a777f9daaf1d362a04e3f990415e82db8))
* create `prefer-to-be` rule ([#864](https://github.com/jest-community/eslint-plugin-jest/issues/864)) ([3a64aea](https://github.com/jest-community/eslint-plugin-jest/commit/3a64aea5bdc55465f1ef34f1426ae626d6c8a230))
* **require-top-level-describe:** support enforcing max num of describes ([#912](https://github.com/jest-community/eslint-plugin-jest/issues/912)) ([14a2d13](https://github.com/jest-community/eslint-plugin-jest/commit/14a2d1391c9f6f52509316542f45df35853c9b79))
* **valid-title:** allow custom matcher messages ([#913](https://github.com/jest-community/eslint-plugin-jest/issues/913)) ([ffc9392](https://github.com/jest-community/eslint-plugin-jest/commit/ffc93921348b0d4a394125f665d2bb09148ea37e))

## [24.4.3](https://github.com/jest-community/eslint-plugin-jest/compare/v24.4.2...v24.4.3) (2021-09-28)


### Bug Fixes

* **valid-expect-in-promise:** support `finally` ([#914](https://github.com/jest-community/eslint-plugin-jest/issues/914)) ([9c89855](https://github.com/jest-community/eslint-plugin-jest/commit/9c89855d23534272230afe6d9e665b8e11ef3075))
* **valid-expect-in-promise:** support additional test functions ([#915](https://github.com/jest-community/eslint-plugin-jest/issues/915)) ([4798005](https://github.com/jest-community/eslint-plugin-jest/commit/47980058d8d1ff86ee69a376c4edd182d462d594))

## [24.4.2](https://github.com/jest-community/eslint-plugin-jest/compare/v24.4.1...v24.4.2) (2021-09-17)


### Bug Fixes

* use correct property `hasSuggestions` rather than `hasSuggestion` ([#899](https://github.com/jest-community/eslint-plugin-jest/issues/899)) ([dfd2368](https://github.com/jest-community/eslint-plugin-jest/commit/dfd2368d1cb1789b6a95a11be24c36868bb8a819))

## [24.4.1](https://github.com/jest-community/eslint-plugin-jest/compare/v24.4.0...v24.4.1) (2021-09-17)


### Bug Fixes

* mark rules that suggest fixes with `hasSuggestion` for ESLint v8 ([#898](https://github.com/jest-community/eslint-plugin-jest/issues/898)) ([ec0a21b](https://github.com/jest-community/eslint-plugin-jest/commit/ec0a21b0d98d043a9949138e495814e0935d5e31))

# [24.4.0](https://github.com/jest-community/eslint-plugin-jest/compare/v24.3.7...v24.4.0) (2021-07-21)


### Features

* create `max-nested-describe` rule ([#845](https://github.com/jest-community/eslint-plugin-jest/issues/845)) ([8067405](https://github.com/jest-community/eslint-plugin-jest/commit/8067405deb609cc1800bce596e929c1840d290ab))

## [24.3.7](https://github.com/jest-community/eslint-plugin-jest/compare/v24.3.6...v24.3.7) (2021-07-21)


### Bug Fixes

* **valid-describe:** report on concise-body arrow functions ([#863](https://github.com/jest-community/eslint-plugin-jest/issues/863)) ([71c5299](https://github.com/jest-community/eslint-plugin-jest/commit/71c5299b14cac6d85ba8f8bd939461503a60468f))

## [24.3.6](https://github.com/jest-community/eslint-plugin-jest/compare/v24.3.5...v24.3.6) (2021-04-26)


### Bug Fixes

* **no-conditional-expect:** check for expects in `catch`s on promises ([#819](https://github.com/jest-community/eslint-plugin-jest/issues/819)) ([1fee973](https://github.com/jest-community/eslint-plugin-jest/commit/1fee973429a74c60b14eead6a335623b4349b5f2))
* **valid-expect:** support async `expect` in ternary statements ([#833](https://github.com/jest-community/eslint-plugin-jest/issues/833)) ([7b7a396](https://github.com/jest-community/eslint-plugin-jest/commit/7b7a396e12c46d3087b467227887ed64854480c0))
* improve handling of `.each` calls and with tagged literals ([#814](https://github.com/jest-community/eslint-plugin-jest/issues/814)) ([040c605](https://github.com/jest-community/eslint-plugin-jest/commit/040c605cf7929a00980b3fa58331cd78ac6274f6))

## [24.3.5](https://github.com/jest-community/eslint-plugin-jest/compare/v24.3.4...v24.3.5) (2021-04-10)


### Bug Fixes

* **valid-describe:** support using `each` with modifiers ([#820](https://github.com/jest-community/eslint-plugin-jest/issues/820)) ([cbdbcef](https://github.com/jest-community/eslint-plugin-jest/commit/cbdbcef47984eb01509493bd5b2423f518a2663d))

## [24.3.4](https://github.com/jest-community/eslint-plugin-jest/compare/v24.3.3...v24.3.4) (2021-04-05)


### Bug Fixes

* support all variations of `describe`, `it`, & `test` ([#792](https://github.com/jest-community/eslint-plugin-jest/issues/792)) ([0968b55](https://github.com/jest-community/eslint-plugin-jest/commit/0968b557dd9cdb5cfcaf8a0d84e8a456825e6b25))

## [24.3.3](https://github.com/jest-community/eslint-plugin-jest/compare/v24.3.2...v24.3.3) (2021-04-02)


### Bug Fixes

* **no-duplicate-hooks:** support `describe.each` ([#797](https://github.com/jest-community/eslint-plugin-jest/issues/797)) ([243cb4f](https://github.com/jest-community/eslint-plugin-jest/commit/243cb4f970e40aa195a3bffa0528dbdbfef7c4f5)), closes [#642](https://github.com/jest-community/eslint-plugin-jest/issues/642)
* **prefer-expect-assertions:** support `.each` ([#798](https://github.com/jest-community/eslint-plugin-jest/issues/798)) ([f758243](https://github.com/jest-community/eslint-plugin-jest/commit/f75824359f2242f53997c59c238d83a59badeea3)), closes [#676](https://github.com/jest-community/eslint-plugin-jest/issues/676)

## [24.3.2](https://github.com/jest-community/eslint-plugin-jest/compare/v24.3.1...v24.3.2) (2021-03-16)


### Bug Fixes

* **consistent-test-it:** properly handle `describe.each` ([#796](https://github.com/jest-community/eslint-plugin-jest/issues/796)) ([035bd30](https://github.com/jest-community/eslint-plugin-jest/commit/035bd30af43f1215e65bf1b26c2ef2e6d174d3c8)), closes [#795](https://github.com/jest-community/eslint-plugin-jest/issues/795)

## [24.3.1](https://github.com/jest-community/eslint-plugin-jest/compare/v24.3.0...v24.3.1) (2021-03-13)


### Bug Fixes

* **no-focused-tests:** report on `skip` instead of `concurrent` ([#791](https://github.com/jest-community/eslint-plugin-jest/issues/791)) ([2b65b49](https://github.com/jest-community/eslint-plugin-jest/commit/2b65b491cea2c956e4ba314a809915b9ec62933b))

# [24.3.0](https://github.com/jest-community/eslint-plugin-jest/compare/v24.2.1...v24.3.0) (2021-03-13)


### Features

* **unbound-method:** create rule ([#765](https://github.com/jest-community/eslint-plugin-jest/issues/765)) ([b1f4ed3](https://github.com/jest-community/eslint-plugin-jest/commit/b1f4ed3f6bb0264fdefb5138ba913fa2bacc725c))

## [24.2.1](https://github.com/jest-community/eslint-plugin-jest/compare/v24.2.0...v24.2.1) (2021-03-10)


### Bug Fixes

* **no-identical-titles:** support nested describes ([#790](https://github.com/jest-community/eslint-plugin-jest/issues/790)) ([ce26621](https://github.com/jest-community/eslint-plugin-jest/commit/ce26621a06169fb6728d2d015645d31401de523f))

# [24.2.0](https://github.com/jest-community/eslint-plugin-jest/compare/v24.1.10...v24.2.0) (2021-03-09)


### Features

* **no-focused-tests:** make fixable ([#787](https://github.com/jest-community/eslint-plugin-jest/issues/787)) ([040871a](https://github.com/jest-community/eslint-plugin-jest/commit/040871a866b7803e5c48b40715d48437d3906b0f))

## [24.1.10](https://github.com/jest-community/eslint-plugin-jest/compare/v24.1.9...v24.1.10) (2021-03-09)


### Bug Fixes

* **no-identical-titles:** ignore .each template cases ([#788](https://github.com/jest-community/eslint-plugin-jest/issues/788)) ([d27a6e6](https://github.com/jest-community/eslint-plugin-jest/commit/d27a6e6e013c518a47b9f219edeb5e63d7a974f9))

## [24.1.9](https://github.com/jest-community/eslint-plugin-jest/compare/v24.1.8...v24.1.9) (2021-03-08)


### Bug Fixes

* **valid-describe:** false positive with template describe.each ([#785](https://github.com/jest-community/eslint-plugin-jest/issues/785)) ([aa946a6](https://github.com/jest-community/eslint-plugin-jest/commit/aa946a6f7ae7106b78996587760d92ace33227ad))

## [24.1.8](https://github.com/jest-community/eslint-plugin-jest/compare/v24.1.7...v24.1.8) (2021-03-07)


### Bug Fixes

* **consistent-test-it:** support `it.each` in `describe.each` ([#782](https://github.com/jest-community/eslint-plugin-jest/issues/782)) ([0014da0](https://github.com/jest-community/eslint-plugin-jest/commit/0014da0e2aeb13199a9da7f969e9eb376e026c8b))

## [24.1.7](https://github.com/jest-community/eslint-plugin-jest/compare/v24.1.6...v24.1.7) (2021-03-06)


### Bug Fixes

* **no-disabled-tests:** adjust selector to match only test functions ([#777](https://github.com/jest-community/eslint-plugin-jest/issues/777)) ([c916902](https://github.com/jest-community/eslint-plugin-jest/commit/c9169022c7e4b9c7bd5f09060152f7136ee18521))
* **no-disabled-tests:** support `describe.skip.each` & `xdescribe.each` ([#778](https://github.com/jest-community/eslint-plugin-jest/issues/778)) ([6a32e87](https://github.com/jest-community/eslint-plugin-jest/commit/6a32e870c016474687e238944933a96bfe1ca01b))

## [24.1.6](https://github.com/jest-community/eslint-plugin-jest/compare/v24.1.5...v24.1.6) (2021-03-06)


### Bug Fixes

* proper support for it.each  ([#722](https://github.com/jest-community/eslint-plugin-jest/issues/722)) ([e1dc42d](https://github.com/jest-community/eslint-plugin-jest/commit/e1dc42d9f1ca59d59aca9be0a1473a1b1415e528))

## [24.1.5](https://github.com/jest-community/eslint-plugin-jest/compare/v24.1.4...v24.1.5) (2021-02-17)


### Bug Fixes

* **require-top-level-describe:** import function that actually exists ([#763](https://github.com/jest-community/eslint-plugin-jest/issues/763)) ([d10dc07](https://github.com/jest-community/eslint-plugin-jest/commit/d10dc07d9dc933fe9584b3e13704001527896859))

## [24.1.4](https://github.com/jest-community/eslint-plugin-jest/compare/v24.1.3...v24.1.4) (2021-02-16)


### Bug Fixes

* **lowercase-name:** support `.each` methods ([#746](https://github.com/jest-community/eslint-plugin-jest/issues/746)) ([3d847b2](https://github.com/jest-community/eslint-plugin-jest/commit/3d847b2164425a2afb754569dbfff52411c95610))
* **require-top-level-describe:** handle `describe.each` properly ([#745](https://github.com/jest-community/eslint-plugin-jest/issues/745)) ([677be45](https://github.com/jest-community/eslint-plugin-jest/commit/677be4558a3954e364b0c4150678a4d3fd832337))

## [24.1.3](https://github.com/jest-community/eslint-plugin-jest/compare/v24.1.2...v24.1.3) (2020-11-12)


### Bug Fixes

* revert change causing regressions for test.each ([#713](https://github.com/jest-community/eslint-plugin-jest/issues/713)) ([7c8d75a](https://github.com/jest-community/eslint-plugin-jest/commit/7c8d75a4fcbd2c6ce005cf4f57d676c7c44ce0b2)), closes [#710](https://github.com/jest-community/eslint-plugin-jest/issues/710) [#711](https://github.com/jest-community/eslint-plugin-jest/issues/711)

## [24.1.2](https://github.com/jest-community/eslint-plugin-jest/compare/v24.1.1...v24.1.2) (2020-11-12)


### Bug Fixes

* **no-done-callback:** fix regression with it.each ([#708](https://github.com/jest-community/eslint-plugin-jest/issues/708)) ([2f032f8](https://github.com/jest-community/eslint-plugin-jest/commit/2f032f8d890e3717359d099b1e93e0cc6b52996a))

## [24.1.1](https://github.com/jest-community/eslint-plugin-jest/compare/v24.1.0...v24.1.1) (2020-11-12)


### Bug Fixes

* improve support for it.each involving tagged template literals ([#701](https://github.com/jest-community/eslint-plugin-jest/issues/701)) ([2341814](https://github.com/jest-community/eslint-plugin-jest/commit/2341814060b38c55728c0b456d7b432f1e0e1a11))

# [24.1.0](https://github.com/jest-community/eslint-plugin-jest/compare/v24.0.2...v24.1.0) (2020-10-05)


### Features

* **prefer-expect-assertions:** add `onlyFunctionsWithAsyncKeyword` option ([#677](https://github.com/jest-community/eslint-plugin-jest/issues/677)) ([d0cea37](https://github.com/jest-community/eslint-plugin-jest/commit/d0cea37ae0a8ab07b8082cedbaaf161bcc94c405))

## [24.0.2](https://github.com/jest-community/eslint-plugin-jest/compare/v24.0.1...v24.0.2) (2020-09-20)


### Bug Fixes

* **no-if:** check both types of function expression ([#672](https://github.com/jest-community/eslint-plugin-jest/issues/672)) ([d462d50](https://github.com/jest-community/eslint-plugin-jest/commit/d462d50aed84ad4dc536a1f47bb7af6abd3dbe92)), closes [#670](https://github.com/jest-community/eslint-plugin-jest/issues/670)

## [24.0.1](https://github.com/jest-community/eslint-plugin-jest/compare/v24.0.0...v24.0.1) (2020-09-12)


### Bug Fixes

* don't include deprecated rules in `all` config ([#664](https://github.com/jest-community/eslint-plugin-jest/issues/664)) ([f636021](https://github.com/jest-community/eslint-plugin-jest/commit/f636021c16215a713845c699858a2978211df49d)), closes [#663](https://github.com/jest-community/eslint-plugin-jest/issues/663)

# [24.0.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.20.0...v24.0.0) (2020-09-04)


### Bug Fixes

* **no-large-snapshots:** run on all files regardless of type ([#637](https://github.com/jest-community/eslint-plugin-jest/issues/637)) ([22113db](https://github.com/jest-community/eslint-plugin-jest/commit/22113db4cdc2dab42a8e7fdb236d23e7e089741d)), closes [#370](https://github.com/jest-community/eslint-plugin-jest/issues/370)
* remove Jasmine globals ([#596](https://github.com/jest-community/eslint-plugin-jest/issues/596)) ([a0e2bc5](https://github.com/jest-community/eslint-plugin-jest/commit/a0e2bc526c5c22bcf4d60160242b55d03edb571d))
* update to typescript-eslint@4 ([1755965](https://github.com/jest-community/eslint-plugin-jest/commit/175596582b3643f36363ff444f987fac08ee0f61)), closes [#590](https://github.com/jest-community/eslint-plugin-jest/issues/590)


### Code Refactoring

* **no-test-callback:** rename rule to `no-done-callback` ([#653](https://github.com/jest-community/eslint-plugin-jest/issues/653)) ([e15a8d1](https://github.com/jest-community/eslint-plugin-jest/commit/e15a8d19234b267784f87fc7acd318dc4cfcdeae))


### Features

* **no-done-callback:** support hooks ([#656](https://github.com/jest-community/eslint-plugin-jest/issues/656)) ([3e6cb44](https://github.com/jest-community/eslint-plugin-jest/commit/3e6cb442a20b9aea710d30f81bf2eb192d193823)), closes [#649](https://github.com/jest-community/eslint-plugin-jest/issues/649) [#651](https://github.com/jest-community/eslint-plugin-jest/issues/651)
* add `no-conditional-expect` to the recommended ruleset ([40cd89d](https://github.com/jest-community/eslint-plugin-jest/commit/40cd89ddf1d6ebbde8ad455f333dda7b61878ffe))
* add `no-deprecated-functions` to the recommended ruleset ([5b2af00](https://github.com/jest-community/eslint-plugin-jest/commit/5b2af001b50059e4e7b6ababe0355d664e039046))
* add `no-interpolation-in-snapshots` to the recommended ruleset ([3705dff](https://github.com/jest-community/eslint-plugin-jest/commit/3705dff9d4f77d21013e263478d8a374d9325acb))
* add `valid-title` to recommended ruleset ([41f7873](https://github.com/jest-community/eslint-plugin-jest/commit/41f7873f734e0122264ace42f6d99733e7e25089))
* drop support for node 8 ([#570](https://github.com/jest-community/eslint-plugin-jest/issues/570)) ([6788e72](https://github.com/jest-community/eslint-plugin-jest/commit/6788e72d842751400a970e72b115360ad0b12d2e))
* set `no-jasmine-globals` to `error` in recommended ruleset ([7080952](https://github.com/jest-community/eslint-plugin-jest/commit/7080952a6baaae7a02c78f60016ee21693121416))
* **no-large-snapshots:** remove `whitelistedSnapshots` option ([8c1c0c9](https://github.com/jest-community/eslint-plugin-jest/commit/8c1c0c9a3e858757b38225ccb4a624e0621b5ca2))


### BREAKING CHANGES

* **no-done-callback:** `no-done-callback` will now report hooks using callbacks as well, not just tests
* **no-test-callback:** rename `no-test-callback` to `no-done-callback`
* recommend `no-conditional-expect` rule
* recommend `no-interpolation-in-snapshots` rule
* recommend `no-deprecated-functions` rule
* recommend `valid-title` rule
* recommend erroring for `no-jasmine-globals` rule
* **no-large-snapshots:** `no-large-snapshots` runs on all files regardless of type 
* Jasmine globals are no marked as such
* Node 10+ required

# [23.20.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.19.0...v23.20.0) (2020-07-30)


### Features

* **no-large-snapshots:** deprecate `whitelistedSnapshots` for new name ([#632](https://github.com/jest-community/eslint-plugin-jest/issues/632)) ([706f5c2](https://github.com/jest-community/eslint-plugin-jest/commit/706f5c2bc54797f0f32178fab1d194d9a4309f70))

# [23.19.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.18.2...v23.19.0) (2020-07-27)


### Features

* create `no-interpolation-in-snapshots` rule ([#553](https://github.com/jest-community/eslint-plugin-jest/issues/553)) ([8d2c17c](https://github.com/jest-community/eslint-plugin-jest/commit/8d2c17c449841465630bea5269de677455ef9a8d))

## [23.18.2](https://github.com/jest-community/eslint-plugin-jest/compare/v23.18.1...v23.18.2) (2020-07-26)


### Bug Fixes

* **no-if:** report conditionals in call expressions ([4cfcf08](https://github.com/jest-community/eslint-plugin-jest/commit/4cfcf080893fbe89689bd4b283bb2f3ad09b19ff)), closes [#557](https://github.com/jest-community/eslint-plugin-jest/issues/557)

## [23.18.1](https://github.com/jest-community/eslint-plugin-jest/compare/v23.18.0...v23.18.1) (2020-07-26)


### Bug Fixes

* **no-large-snapshots:** actually compare allowed name strings to name ([#625](https://github.com/jest-community/eslint-plugin-jest/issues/625)) ([622a08c](https://github.com/jest-community/eslint-plugin-jest/commit/622a08c86a37aa9490af20b488bd23246b8be752))

# [23.18.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.17.1...v23.18.0) (2020-07-05)


### Features

* **valid-title:** support `mustMatch` & `mustNotMatch` options ([#608](https://github.com/jest-community/eslint-plugin-jest/issues/608)) ([4c7207e](https://github.com/jest-community/eslint-plugin-jest/commit/4c7207ebbb274f7b584225ad65ffb96a4328240e)), closes [#233](https://github.com/jest-community/eslint-plugin-jest/issues/233)

## [23.17.1](https://github.com/jest-community/eslint-plugin-jest/compare/v23.17.0...v23.17.1) (2020-06-23)


### Bug Fixes

* **lowercase-name:** ignore all top level describes when option is true ([#614](https://github.com/jest-community/eslint-plugin-jest/issues/614)) ([624018a](https://github.com/jest-community/eslint-plugin-jest/commit/624018aa181e7c0ce87457a4f9c212c7891987a8)), closes [#613](https://github.com/jest-community/eslint-plugin-jest/issues/613)

# [23.17.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.16.0...v23.17.0) (2020-06-23)


### Features

* **lowercase-name:** support `ignoreTopLevelDescribe` option ([#611](https://github.com/jest-community/eslint-plugin-jest/issues/611)) ([36fdcc5](https://github.com/jest-community/eslint-plugin-jest/commit/36fdcc553ca40bc2ca2e9ca7e04f8e9e4a315274)), closes [#247](https://github.com/jest-community/eslint-plugin-jest/issues/247)

# [23.16.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.15.0...v23.16.0) (2020-06-21)


### Features

* create `no-conditional-expect` rule ([aba53e4](https://github.com/jest-community/eslint-plugin-jest/commit/aba53e4061f3b636ab0c0270e183c355c6f301e0))
* deprecate `no-try-expect` in favor of `no-conditional-expect` ([6d07cad](https://github.com/jest-community/eslint-plugin-jest/commit/6d07cadd5f78ed7a64a86792931d49d3cd943d69))

# [23.15.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.14.0...v23.15.0) (2020-06-21)


### Features

* **no-standalone-expect:** support `additionalTestBlockFunctions` ([#585](https://github.com/jest-community/eslint-plugin-jest/issues/585)) ([ed220b2](https://github.com/jest-community/eslint-plugin-jest/commit/ed220b2c515f2e97ce639dd1474c18a7f594c06c))

# [23.14.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.13.2...v23.14.0) (2020-06-20)


### Bug Fixes

* **no-test-callback:** check argument is an identifier ([f70612d](https://github.com/jest-community/eslint-plugin-jest/commit/f70612d8b414575725a5831ed9dfad1eaf1e6548))
* **no-test-callback:** provide suggestion instead of autofix ([782d8fa](https://github.com/jest-community/eslint-plugin-jest/commit/782d8fa00149143f453e7cb066f90c017e2d3f61))
* **prefer-strict-equal:** provide suggestion instead of autofix ([2eaed2b](https://github.com/jest-community/eslint-plugin-jest/commit/2eaed2bf30c72b03ee205910887f8aab304047a5))


### Features

* **prefer-expect-assertions:** provide suggestions ([bad88a0](https://github.com/jest-community/eslint-plugin-jest/commit/bad88a006135258e8da18902a84bdb52a9bb9fa7))

## [23.13.2](https://github.com/jest-community/eslint-plugin-jest/compare/v23.13.1...v23.13.2) (2020-05-26)


### Bug Fixes

* add `fail` to globals ([#595](https://github.com/jest-community/eslint-plugin-jest/issues/595)) ([aadc5ec](https://github.com/jest-community/eslint-plugin-jest/commit/aadc5ec5610ec024eac4b0aa6077cc012a0ba98e))

## [23.13.1](https://github.com/jest-community/eslint-plugin-jest/compare/v23.13.0...v23.13.1) (2020-05-17)


### Bug Fixes

* **no-if:** use correct syntax for placeholder substitution in message ([6d1eda8](https://github.com/jest-community/eslint-plugin-jest/commit/6d1eda89ac48c93c2675dcf24a92574a20b2edb9))

# [23.13.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.12.0...v23.13.0) (2020-05-16)


### Features

* **valid-expect:** support `minArgs` & `maxArgs` options ([#584](https://github.com/jest-community/eslint-plugin-jest/issues/584)) ([9e0e2fa](https://github.com/jest-community/eslint-plugin-jest/commit/9e0e2fa966b43c1099d11b2424acb1590c241c03))

# [23.12.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.11.0...v23.12.0) (2020-05-16)


### Features

* deprecate `no-expect-resolves` rule ([b6a22e5](https://github.com/jest-community/eslint-plugin-jest/commit/b6a22e5aa98abcb57aac217c6d4583d0a3388e7b))
* deprecate `no-truthy-falsy` rule ([a67d92d](https://github.com/jest-community/eslint-plugin-jest/commit/a67d92d2834568122f24bf3d8455999166da95ea))
* deprecate `prefer-inline-snapshots` rule ([1360e9b](https://github.com/jest-community/eslint-plugin-jest/commit/1360e9b0e840f4f778a9d251371c943919f84600))

# [23.11.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.10.0...v23.11.0) (2020-05-12)


### Features

* create `no-restricted-matchers` rule ([#575](https://github.com/jest-community/eslint-plugin-jest/issues/575)) ([ac926e7](https://github.com/jest-community/eslint-plugin-jest/commit/ac926e779958240506ee506047c9a5364bb70aea))

# [23.10.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.9.0...v23.10.0) (2020-05-09)


### Features

* **no-deprecated-functions:** support jest `version` setting ([#564](https://github.com/jest-community/eslint-plugin-jest/issues/564)) ([05f20b8](https://github.com/jest-community/eslint-plugin-jest/commit/05f20b80ecd42b8d1f1f18ca19d4bc9cba45e22e))

# [23.9.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.8.2...v23.9.0) (2020-05-04)


### Features

* create `no-deprecated-functions` ([#560](https://github.com/jest-community/eslint-plugin-jest/issues/560)) ([55d0504](https://github.com/jest-community/eslint-plugin-jest/commit/55d0504cadc945b770d7c3b6d3cab425c9b76d0f))

## [23.8.2](https://github.com/jest-community/eslint-plugin-jest/compare/v23.8.1...v23.8.2) (2020-03-06)

### Bug Fixes

- **prefer-to-contain:** check that expect argument is defined before use
  ([#542](https://github.com/jest-community/eslint-plugin-jest/issues/542))
  ([56f909b](https://github.com/jest-community/eslint-plugin-jest/commit/56f909b326034236953d04b18dab3f64b16a2973))

## [23.8.1](https://github.com/jest-community/eslint-plugin-jest/compare/v23.8.0...v23.8.1) (2020-02-29)

### Bug Fixes

- remove tests from published package
  ([#541](https://github.com/jest-community/eslint-plugin-jest/issues/541))
  ([099a150](https://github.com/jest-community/eslint-plugin-jest/commit/099a150b87fa693ccf1c512ee501aed1457ba656))

# [23.8.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.7.0...v23.8.0) (2020-02-23)

### Bug Fixes

- **valid-title:** ensure argument node is defined before accessing props
  ([#538](https://github.com/jest-community/eslint-plugin-jest/issues/538))
  ([7730f75](https://github.com/jest-community/eslint-plugin-jest/commit/7730f757561100559509b756fd362ca33b9ab1d4))

### Features

- **no-large-snapshots:** add setting to define maxSize by snapshot type
  ([#524](https://github.com/jest-community/eslint-plugin-jest/issues/524))
  ([0d77300](https://github.com/jest-community/eslint-plugin-jest/commit/0d77300e61adc7a5aa84f34ff4ccc164075d5f41))

# [23.7.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.6.0...v23.7.0) (2020-02-07)

### Bug Fixes

- **expect-expect:** use `u` flag in regex
  ([#532](https://github.com/jest-community/eslint-plugin-jest/issues/532))
  ([c12b725](https://github.com/jest-community/eslint-plugin-jest/commit/c12b7251ef1506073d268973b93c7fc9fbcf50af))

### Features

- **valid-title:** support `disallowedWords` option
  ([#522](https://github.com/jest-community/eslint-plugin-jest/issues/522))
  ([38bbe93](https://github.com/jest-community/eslint-plugin-jest/commit/38bbe93794ed456c6e9e5d7be848b2aeb55ce0ba))

# [23.6.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.5.0...v23.6.0) (2020-01-12)

### Features

- **no-if:** support `switch` statements
  ([#515](https://github.com/jest-community/eslint-plugin-jest/issues/515))
  ([be4e49d](https://github.com/jest-community/eslint-plugin-jest/commit/be4e49dcecd64711e743f5e09d1ff24e4c6e1648))

# [23.5.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.4.0...v23.5.0) (2020-01-12)

### Features

- **expect-expect:** support glob patterns for assertFunctionNames
  ([#509](https://github.com/jest-community/eslint-plugin-jest/issues/509))
  ([295ca9a](https://github.com/jest-community/eslint-plugin-jest/commit/295ca9a6969c77fadaa1a42d76e89cae992520a6))
- **valid-expect:** refactor `valid-expect` linting messages
  ([#501](https://github.com/jest-community/eslint-plugin-jest/issues/501))
  ([7338362](https://github.com/jest-community/eslint-plugin-jest/commit/7338362420eb4970f99be2016bb4ded5732797e3))

# [23.4.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.3.0...v23.4.0) (2020-01-10)

### Features

- **expect-expect:** support chained function names
  ([#471](https://github.com/jest-community/eslint-plugin-jest/issues/471))
  ([#508](https://github.com/jest-community/eslint-plugin-jest/issues/508))
  ([beb1aec](https://github.com/jest-community/eslint-plugin-jest/commit/beb1aececee80589c182e95bc64ef01d97eb5e78))
- **rules:** add support for function declaration as test case
  ([#504](https://github.com/jest-community/eslint-plugin-jest/issues/504))
  ([ac7fa48](https://github.com/jest-community/eslint-plugin-jest/commit/ac7fa487d05705bee1b2d5264d5096f0232ae1e1))

# [23.3.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.2.0...v23.3.0) (2020-01-04)

### Features

- **rules:** add .concurrent support
  ([#498](https://github.com/jest-community/eslint-plugin-jest/issues/498))
  ([#502](https://github.com/jest-community/eslint-plugin-jest/issues/502))
  ([dcba5f1](https://github.com/jest-community/eslint-plugin-jest/commit/dcba5f1f1c6429a8bce2ff9aae71c02a6ffa1c2b))

# [23.2.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.1.1...v23.2.0) (2019-12-28)

### Features

- **valid-expect:** warn on `await expect()` with no assertions
  ([#496](https://github.com/jest-community/eslint-plugin-jest/issues/496))
  ([19798dd](https://github.com/jest-community/eslint-plugin-jest/commit/19798dd540c8a0f5ac7883f67a28ee67d9e5fc7a))

## [23.1.1](https://github.com/jest-community/eslint-plugin-jest/compare/v23.1.0...v23.1.1) (2019-11-30)

### Bug Fixes

- **no-focused-tests:** detect table format uage of `.only.each`
  ([#489](https://github.com/jest-community/eslint-plugin-jest/issues/489))
  ([d03bcf4](https://github.com/jest-community/eslint-plugin-jest/commit/d03bcf49e9e4f068bead25a4bc4c962762d56c02))

# [23.1.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.0.5...v23.1.0) (2019-11-29)

### Features

- **no-focused-tests:** check each with table format
  ([#430](https://github.com/jest-community/eslint-plugin-jest/issues/430))
  ([154c0b8](https://github.com/jest-community/eslint-plugin-jest/commit/154c0b8e5310f0c1bf715a8c60de5d84faa1bc48))

## [23.0.5](https://github.com/jest-community/eslint-plugin-jest/compare/v23.0.4...v23.0.5) (2019-11-27)

### Bug Fixes

- typo in the `require-to-throw-message` docs
  ([#487](https://github.com/jest-community/eslint-plugin-jest/issues/487))
  ([3526213](https://github.com/jest-community/eslint-plugin-jest/commit/35262135e3bb407b9c40991d2651ca4b201eebff))

## [23.0.4](https://github.com/jest-community/eslint-plugin-jest/compare/v23.0.3...v23.0.4) (2019-11-14)

### Bug Fixes

- get correct ruleName without specifying file extension
  ([#473](https://github.com/jest-community/eslint-plugin-jest/issues/473))
  ([f09203e](https://github.com/jest-community/eslint-plugin-jest/commit/f09203ed05a69c83baadf6149ae17513c85b170f))

## [23.0.3](https://github.com/jest-community/eslint-plugin-jest/compare/v23.0.2...v23.0.3) (2019-11-08)

### Bug Fixes

- **no-test-callback:** don't provide fix for `async` functions
  ([#469](https://github.com/jest-community/eslint-plugin-jest/issues/469))
  ([09111e0](https://github.com/jest-community/eslint-plugin-jest/commit/09111e0c951aaa930c9a2c8e0ca84251b3196e94)),
  closes [#466](https://github.com/jest-community/eslint-plugin-jest/issues/466)

## [23.0.2](https://github.com/jest-community/eslint-plugin-jest/compare/v23.0.1...v23.0.2) (2019-10-28)

### Bug Fixes

- **prefer-todo:** ensure argument exists before trying to access it
  ([#462](https://github.com/jest-community/eslint-plugin-jest/issues/462))
  ([a87c8c2](https://github.com/jest-community/eslint-plugin-jest/commit/a87c8c29e1faf9d5364c9074d988aa95ef6cc987))

## [23.0.1](https://github.com/jest-community/eslint-plugin-jest/compare/v23.0.0...v23.0.1) (2019-10-28)

### Bug Fixes

- **valid-title:** ignore string addition
  ([#461](https://github.com/jest-community/eslint-plugin-jest/issues/461))
  ([b7c1be2](https://github.com/jest-community/eslint-plugin-jest/commit/b7c1be2f279b87366332fb2d3a3e49a71aa75711))

# [22.2.0](https://github.com/jest-community/eslint-plugin-jest/compare/v22.1.3...v22.2.0) (2019-01-29)

### Features

- **rules:** add prefer-todo rule
  ([#218](https://github.com/jest-community/eslint-plugin-jest/issues/218))
  ([0933d82](https://github.com/jest-community/eslint-plugin-jest/commit/0933d82)),
  closes [#217](https://github.com/jest-community/eslint-plugin-jest/issues/217)
