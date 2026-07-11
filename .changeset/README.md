# Changesets

Every user-visible package change must include a changeset:

```bash
npm run changeset
```

During preview releases, enter prerelease mode before versioning:

```bash
npx changeset pre enter beta
npm run version
```

This produces versions such as `0.1.1-beta.0`. To leave prerelease mode:

```bash
npx changeset pre exit
npm run version
```

Publishing is handled by the release workflow after the version pull request is merged.
