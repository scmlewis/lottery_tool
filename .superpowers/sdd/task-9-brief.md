# Task 9: Cleanup and Testing

**Files:**
- Modify: Remove old vanilla JS files
- Test: Run npm run build and npm run lint

**Interfaces:**
- Consumes: All components
- Produces: Working production build

- [ ] **Step 1: Remove old vanilla JS files**

```bash
rm -rf js/ styles.css serve.js tests/
```

- [ ] **Step 2: Run build to verify**

```bash
npm run build
```

- [ ] **Step 3: Run lint to check TypeScript**

```bash
npm run lint
```

- [ ] **Step 4: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove old vanilla JS files and cleanup"
```