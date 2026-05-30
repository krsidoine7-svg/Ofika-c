# 📝 Plan de Commits Git - Feature Dynamic Templates

Branch: `feature/dynamic-onboarding-templates`

---

## ✅ Commits Réalisés (Phase 1-3)

### Commit 1: feat(db): add template_schemas and profile_template_data tables

```bash
git add supabase/migrations/20250105_dynamic_templates_schema.sql
git commit -m "feat(db): add template_schemas and profile_template_data tables

- Create template_schemas table for storing template definitions
- Create profile_template_data table for storing profile-specific template data
- Add RLS policies for security (users can only access their own data)
- Add triggers for auto-updating updated_at timestamps
- Add GIN indexes for JSON field searches
- Add validation function for template schema structure

BREAKING CHANGE: Requires database migration"
```

---

### Commit 2: feat(db): seed template schemas with initial 8 templates

```bash
git add supabase/migrations/20250105_seed_template_schemas.sql
git commit -m "feat(db): seed template schemas with initial 8 templates

- Add design1 (Professional)
- Add design2 (Modern/Creative)
- Add design3 (Creative/Artistic)
- Add design4 (Minimal)
- Add influencer (with followers metrics)
- Add ecommerce (with store fields)
- Add design7 (Dark Elegant)
- Add freelance (with services/rates)
- Add helper views and functions
- Add migration function for existing profiles"
```

---

### Commit 3: feat(types): add template schema types and validators

```bash
git add lib/types/template.ts
git commit -m "feat(types): add template schema types and validators

- Add TemplateField interface for field definitions
- Add TemplateSchema interface for complete templates
- Add ProfileTemplateData for profile-specific data
- Add ProfileWithTemplate for enriched profiles
- Add CreateProfileWithTemplatePayload for API
- Add UpdateProfileWithTemplatePayload for updates
- Add type guards and utility types
- Add analytics event types"
```

---

### Commit 4: feat(validation): add zod schemas for base and template fields

```bash
git add lib/validation/profile-schemas.ts
git commit -m "feat(validation): add zod schemas for base and template fields

- Add baseProfileSchema for universal fields validation
- Add createDynamicTemplateSchema() for runtime schema generation
- Add field-level validation helpers
- Add custom URL validation with reserved words check
- Add sanitization utilities
- Support all field types: text, number, url, email, boolean, select
- Add comprehensive error messages"
```

---

### Commit 5: feat(api): add GET /api/templates endpoint

```bash
git add app/api/templates/route.ts
git commit -m "feat(api): add GET /api/templates endpoint

- List all active templates with schemas
- Include metadata (features, stats, category)
- Return typed TemplateSchema objects
- Add error handling"
```

---

### Commit 6: feat(api): add GET /api/templates/[slug] endpoint

```bash
git add app/api/templates/[slug]/route.ts
git commit -m "feat(api): add GET /api/templates/[slug] endpoint

- Fetch specific template by slug
- Return 404 if not found
- Include full schema definition
- Add error handling"
```

---

### Commit 7: feat(api): add POST /api/profiles with template data support

```bash
git add app/api/profiles/route.ts
git commit -m "feat(api): add POST /api/profiles with template data support

- Validate base fields with baseProfileSchema
- Validate template fields with dynamic schema
- Check custom_url uniqueness and reserved words
- Generate unique username if needed
- Save profile + template_data atomically
- Return enriched profile with template
- Add comprehensive error handling
- TODO: Add analytics tracking"
```

---

### Commit 8: feat(api): add GET/PUT/DELETE /api/profiles/[id] endpoints

```bash
git add app/api/profiles/[id]/route.ts
git commit -m "feat(api): add GET/PUT/DELETE /api/profiles/[id] endpoints

- GET: Fetch profile with template and template_data
- PUT: Update base fields and/or template fields
- DELETE: Soft delete profile (set is_active=false)
- Validate ownership (user can only modify their profiles)
- Merge template fields on update
- Track changed fields
- Add comprehensive error handling"
```

---

### Commit 9: docs: add implementation plan and architecture

```bash
git add DYNAMIC_TEMPLATES_IMPLEMENTATION_PLAN.md
git commit -m "docs: add implementation plan and architecture

- Document complete architecture (current + target)
- Detail 18 planned commits with code examples
- Define database schema structure
- Explain validation strategy
- Plan component hierarchy
- Define OAuth integration approach
- List KPIs and analytics events
- Add deployment strategy"
```

---

### Commit 10: docs: add API documentation with examples

```bash
git add docs/API_TEMPLATES_DOCUMENTATION.md
git commit -m "docs: add API documentation with examples

- Document all 6 API endpoints
- Add request/response examples
- Include cURL commands
- Add Postman collection JSON
- Document error codes
- Add complete use case examples (influencer, ecommerce, freelance)
- Provide troubleshooting guide"
```

---

### Commit 11: docs: add PR summary and project status

```bash
git add FEATURE_DYNAMIC_TEMPLATES_PR_SUMMARY.md
git commit -m "docs: add PR summary and project status

- Summary of implemented phases (1-3: 50% complete)
- List all created files (13 total)
- Detail remaining work (phases 4-8)
- Add testing instructions
- Document breaking changes
- Define migration strategy
- Add PR checklist"
```

---

### Commit 12: docs: add comprehensive README for dynamic templates

```bash
git add README_DYNAMIC_TEMPLATES.md
git commit -m "docs: add comprehensive README for dynamic templates

- Quick start guide
- Complete template structure explanation
- List of 8 available templates
- API usage examples
- Architecture diagrams
- Guide to add new templates
- Troubleshooting section
- Next steps for contributors"
```

---

### Commit 13: docs: add git commits plan

```bash
git add GIT_COMMITS_PLAN.md
git commit -m "docs: add git commits plan

- Document all 12 completed commits
- Plan remaining 6+ commits for phases 4-8
- Conventional commits format
- Clear commit messages with breaking changes"
```

---

## 🔄 Commits À Faire (Phases 4-8)

### Phase 4: Components

#### Commit 14: feat(components): add DynamicFormField component

```bash
# Fichiers à créer:
components/features/profiles/DynamicFormField.tsx

git commit -m "feat(components): add DynamicFormField component

- Render field based on TemplateField definition
- Support all field types (text, number, url, email, boolean, select)
- Show validation errors inline
- Integrate with react-hook-form
- Add help text display
- Add social import button for oauth fields"
```

---

#### Commit 15: feat(components): add TemplateSpecificForm component

```bash
# Fichiers à créer:
components/features/profiles/TemplateSpecificForm.tsx

git commit -m "feat(components): add TemplateSpecificForm component

- Dynamic form generation from template schema
- Integrate with react-hook-form + zod resolver
- Render DynamicFormField for each field
- Handle form submission
- Show validation errors
- Support pre-filling with initial data (for edit mode)"
```

---

#### Commit 16: feat(components): add BaseProfileForm component

```bash
# Fichiers à créer:
components/features/profiles/BaseProfileForm.tsx

git commit -m "feat(components): add BaseProfileForm component

- Form for universal profile fields
- Separated from template-specific fields
- Validation with baseProfileSchema
- Custom URL validation with debounce
- Image upload support
- Social links section"
```

---

### Phase 5: Onboarding

#### Commit 17: refactor(onboarding): split into 3-step flow with base form

```bash
# Fichiers à créer/modifier:
app/onboarding/profile/page.tsx (NEW)
components/features/profiles/OnboardingSteps.tsx (NEW)

git commit -m "refactor(onboarding): split into 3-step flow with base form

BREAKING CHANGE: New onboarding flow

- Step 1: BaseProfileForm (universal fields)
- Step 2: TemplateSelection (choose from 8 templates)
- Step 3: TemplateSpecificForm (conditional, only if template has fields)
- Add stepper UI component
- Add progress indicator
- Save draft to localStorage
- Navigate between steps
- Call POST /api/profiles on completion"
```

---

#### Commit 18: feat(onboarding): integrate template selection with API

```bash
# Fichiers à modifier:
components/features/profiles/TemplateSelectionStep.tsx

git commit -m "feat(onboarding): integrate template selection with API

- Fetch templates from GET /api/templates
- Display live preview with user data
- Show template metadata (stats, features)
- Handle template selection
- Pass selected template to step 3
- Add loading states
- Add error handling"
```

---

### Phase 6: Profile Edit

#### Commit 19: feat(profile-edit): add edit page with template sections

```bash
# Fichiers à créer:
app/dashboard/profiles/[id]/edit/page.tsx

git commit -m "feat(profile-edit): add edit page with template sections

- Fetch profile with GET /api/profiles/[id]
- Section 1: Base fields (BaseProfileForm)
- Section 2: Template fields (TemplateSpecificForm)
- Independent save buttons or single save
- Show template name and description
- Pre-fill forms with current data
- Call PUT /api/profiles/[id] on save
- Add success/error toasts"
```

---

### Phase 7: OAuth (Optionnel)

#### Commit 20: feat(oauth): add Instagram OAuth integration

```bash
# Fichiers à créer:
app/api/oauth/instagram/route.ts
lib/hooks/useSocialImport.ts

git commit -m "feat(oauth): add Instagram OAuth integration

- OAuth flow for Instagram Graph API
- Fetch followers count automatically
- Store access token securely
- Prefill form field with fetched data
- Handle OAuth errors
- Add loading state during fetch"
```

---

### Phase 8: Tests

#### Commit 21: test: add unit tests for validation schemas

```bash
# Fichiers à créer:
__tests__/lib/validation/profile-schemas.test.ts

git commit -m "test: add unit tests for validation schemas

- Test baseProfileSchema validation
- Test createDynamicTemplateSchema with various field types
- Test validateField function
- Test validateCustomUrl (reserved words, format)
- Test sanitization helpers
- Achieve >80% coverage"
```

---

#### Commit 22: test: add integration tests for API routes

```bash
# Fichiers à créer:
__tests__/app/api/profiles/route.test.ts
__tests__/app/api/templates/route.test.ts

git commit -m "test: add integration tests for API routes

- Test POST /api/profiles (success, validation errors, conflicts)
- Test GET /api/profiles/[id] (success, not found, unauthorized)
- Test PUT /api/profiles/[id] (success, validation, merge)
- Test DELETE /api/profiles/[id]
- Test GET /api/templates
- Mock Supabase client
- Use node-mocks-http for request/response"
```

---

#### Commit 23: test: add React component tests

```bash
# Fichiers à créer:
__tests__/components/DynamicFormField.test.tsx
__tests__/components/TemplateSpecificForm.test.tsx

git commit -m "test: add React component tests

- Test DynamicFormField renders correctly for each type
- Test form validation errors display
- Test TemplateSpecificForm submission
- Test dynamic field rendering
- Use React Testing Library
- Mock react-hook-form"
```

---

## 📊 Résumé des Commits

**Total prévu**: ~23 commits

### Répartition par Phase

- **Phase 1** (DB Schema): 2 commits ✅
- **Phase 2** (Types): 2 commits ✅
- **Phase 3** (API): 4 commits ✅
- **Phase 4** (Components): 3 commits 🔄
- **Phase 5** (Onboarding): 2 commits 🔄
- **Phase 6** (Edit): 1 commit 🔄
- **Phase 7** (OAuth): 1 commit 🔄
- **Phase 8** (Tests): 3 commits 🔄
- **Docs**: 5 commits ✅

### Par Type

- `feat`: 14 commits
- `docs`: 5 commits
- `test`: 3 commits
- `refactor`: 1 commit

---

## 🎯 Convention de Commits

Format: `<type>(<scope>): <subject>`

**Types**:
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, pas de changement de code
- `refactor`: Refactoring sans ajout de feature
- `test`: Ajout/modification de tests
- `chore`: Tâches de maintenance

**Scopes**:
- `db`: Database/migrations
- `types`: TypeScript types
- `validation`: Validation schemas
- `api`: API routes
- `components`: React components
- `onboarding`: Onboarding flow
- `profile-edit`: Profile editing
- `oauth`: OAuth integration

**Breaking Changes**:
Ajouter `BREAKING CHANGE:` dans le body du commit si nécessaire.

---

## 🚀 Commandes Git

### Créer la branch

```bash
git checkout -b feature/dynamic-onboarding-templates
```

### Ajouter les fichiers existants

```bash
git add supabase/migrations/20250105_*.sql
git add lib/types/template.ts
git add lib/validation/profile-schemas.ts
git add app/api/templates/
git add app/api/profiles/
git add *.md docs/
git commit -m "feat: implement dynamic templates system (phases 1-3)

Complete implementation of:
- Database schema with 2 new tables
- 8 initial templates (influencer, ecommerce, freelance, etc.)
- TypeScript types and Zod validation
- REST API endpoints for templates and profiles
- Comprehensive documentation

See FEATURE_DYNAMIC_TEMPLATES_PR_SUMMARY.md for details"
```

### Push

```bash
git push origin feature/dynamic-onboarding-templates
```

### Créer la PR

```bash
gh pr create \
  --title "feat: Dynamic Templates System for Profiles" \
  --body-file FEATURE_DYNAMIC_TEMPLATES_PR_SUMMARY.md \
  --label "feature,enhancement,backend,needs-review"
```

---

## ✅ Checklist Avant Push

- [ ] Toutes les migrations SQL sont syntaxiquement correctes
- [ ] Les types TypeScript compilent sans erreur (`npm run type-check`)
- [ ] Pas de linting errors (`npm run lint`)
- [ ] Documentation à jour
- [ ] Commit messages suivent la convention
- [ ] Pas de secrets/credentials dans les fichiers
- [ ] `.gitignore` à jour si nécessaire

---

**Date**: 2025-01-05  
**Auteur**: Cascade AI
