# Developer Checklist

## ✅ Setup Checklist

### Initial Setup
- [ ] Clone/copy project to your workspace
- [ ] Run `npm install` to install dependencies
- [ ] Verify Node.js version (>=18.0.0)
- [ ] Check port 5004 is available
- [ ] Review `README.md` for architecture overview

### Configuration
- [ ] Update `API_BASE_URL` in `src/services/apiClient.ts` if backend runs on different port
- [ ] Configure Tailwind theme in `tailwind.config.js` if needed
- [ ] Review TypeScript settings in `tsconfig.json`
- [ ] Check ESLint rules in `eslint.config.js`

### Development
- [ ] Run `npm run dev` to start development server
- [ ] Open http://localhost:5004 in browser
- [ ] Verify hot module replacement (HMR) works
- [ ] Test sign up/sign in flows
- [ ] Check browser console for errors

## 📝 Before Adding New Features

### Planning
- [ ] Identify which atomic level the component belongs to
- [ ] Check if similar component already exists
- [ ] Review design system tokens (colors, spacing, typography)
- [ ] Plan component props and API

### Implementation
- [ ] Create TypeScript interface in `types/` if needed
- [ ] Add API endpoint to appropriate service if needed
- [ ] Create custom hook in `hooks/` for business logic if needed
- [ ] Build component in correct atomic level folder
- [ ] Export from layer's `index.ts`
- [ ] Test component in isolation

## 🧩 Component Creation Checklist

### Creating an Atom
- [ ] Component is truly atomic (can't be broken down further)
- [ ] Props interface is defined
- [ ] Styling uses Tailwind utility classes
- [ ] Design tokens are consistent with other atoms
- [ ] Component is exported from `atoms/index.ts`
- [ ] No business logic (only presentation)
- [ ] Variants are clearly defined

### Creating a Molecule
- [ ] Composed of 2+ atoms
- [ ] Props interface is defined
- [ ] Imports atoms from `atoms/`
- [ ] No direct API calls
- [ ] Component is exported from `molecules/index.ts`
- [ ] Callbacks passed via props
- [ ] Reusable across different contexts

### Creating an Organism
- [ ] Complex component with state/logic
- [ ] Uses custom hook for business logic
- [ ] Props interface is defined
- [ ] Imports from `atoms/`, `molecules/`, `hooks/`
- [ ] Component is exported from `organisms/index.ts`
- [ ] Handles loading/error states
- [ ] User interactions are handled

### Creating a Template
- [ ] Defines page layout structure
- [ ] Uses organisms for sections
- [ ] Props for dynamic content
- [ ] Responsive design implemented
- [ ] Component is exported from `templates/index.ts`
- [ ] No business logic
- [ ] Reusable across multiple pages

### Creating a Page
- [ ] Uses template for layout
- [ ] Connects to React Router
- [ ] Handles route parameters if needed
- [ ] Component is exported from `pages/index.ts`
- [ ] Navigation logic implemented
- [ ] Protected route if authentication required

## 🪝 Hook Creation Checklist

### Creating a Custom Hook
- [ ] Named with `use` prefix
- [ ] Returns object with data and actions
- [ ] Handles loading state
- [ ] Handles error state
- [ ] Uses service for API calls
- [ ] TypeScript return type defined
- [ ] Exported from `hooks/index.ts`
- [ ] No UI logic (pure business logic)

## 🌐 Service Creation Checklist

### Creating a Service
- [ ] Named with `Service` suffix
- [ ] Uses `apiClient` for HTTP calls
- [ ] Returns typed responses
- [ ] Handles errors appropriately
- [ ] Exported from `services/index.ts`
- [ ] Methods are async
- [ ] RESTful naming conventions

## 📝 Type Definition Checklist

### Creating Types
- [ ] Matches Prisma schema if entity type
- [ ] Properties are correctly typed
- [ ] Optional properties marked with `?`
- [ ] Exported from `types/index.ts`
- [ ] Used consistently across app

## 🎨 Styling Checklist

### Using Tailwind
- [ ] Uses utility classes (no custom CSS)
- [ ] Follows design tokens (colors, spacing)
- [ ] Responsive classes for mobile-first design
- [ ] Hover/focus states where appropriate
- [ ] Consistent with other components
- [ ] Accessibility classes (sr-only, etc.)

### Design System
- [ ] Colors: blue (primary), gray (neutral), red (danger), green (success)
- [ ] Spacing: 2/4/6/8/12/16 (4px grid)
- [ ] Typography: xs/sm/base/lg/xl/2xl
- [ ] Border radius: md/lg/full
- [ ] Shadows: md/lg

## 🧪 Testing Checklist (Future)

### Unit Tests
- [ ] Atoms tested in isolation
- [ ] Molecules tested with mocked atoms
- [ ] Hooks tested with mocked services
- [ ] Services tested with mocked fetch

### Integration Tests
- [ ] Organisms tested with mocked hooks
- [ ] Templates tested with real organisms
- [ ] Pages tested with full flow

### E2E Tests
- [ ] Sign up flow
- [ ] Sign in flow
- [ ] Create project flow
- [ ] Create task flow
- [ ] Toggle task flow
- [ ] Add comment flow

## 🚀 Pre-Deployment Checklist

### Code Quality
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] All console.logs removed
- [ ] No unused imports
- [ ] No commented-out code

### Configuration
- [ ] Environment variables configured
- [ ] API base URL set correctly
- [ ] Build output optimized
- [ ] Source maps configured

### Performance
- [ ] Large lists are virtualized if needed
- [ ] Images are optimized
- [ ] Code splitting implemented
- [ ] Lazy loading for routes

### Security
- [ ] No sensitive data in localStorage
- [ ] HTTPS in production
- [ ] CORS configured correctly
- [ ] JWT expiration handled

### Accessibility
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG standards

## 📚 Documentation Checklist

### Code Documentation
- [ ] Complex logic has comments
- [ ] Component props are documented
- [ ] API endpoints are documented
- [ ] Hook usage examples provided

### Project Documentation
- [ ] README.md is up to date
- [ ] ARCHITECTURE.md reflects changes
- [ ] New features documented
- [ ] Migration guide if needed

## 🔄 Pull Request Checklist

### Before Creating PR
- [ ] Feature works locally
- [ ] Code follows Atomic Design principles
- [ ] TypeScript types are correct
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Cross-browser testing done

### PR Description
- [ ] Clear title describing change
- [ ] Description of what changed
- [ ] Screenshots if UI change
- [ ] Breaking changes noted
- [ ] Migration steps if needed

## 🐛 Debugging Checklist

### Component Not Rendering
- [ ] Check import path
- [ ] Verify export from index.ts
- [ ] Check component is used in parent
- [ ] Review React DevTools component tree

### State Not Updating
- [ ] Check useState is called
- [ ] Verify setState is called correctly
- [ ] Check useEffect dependencies
- [ ] Review hook return values

### API Call Failing
- [ ] Check Network tab in DevTools
- [ ] Verify API endpoint URL
- [ ] Check authentication token
- [ ] Review CORS settings
- [ ] Check request payload

### Styling Not Applied
- [ ] Verify Tailwind class names
- [ ] Check className prop is passed
- [ ] Review browser DevTools styles
- [ ] Ensure Tailwind build is working

## 🎯 Best Practices Reminder

### Atomic Design
- ✅ Start small, build up (atoms → organisms)
- ✅ Keep atoms truly atomic
- ✅ Molecules should be simple combinations
- ✅ Organisms handle complexity
- ✅ Pages orchestrate, don't implement

### React Hooks
- ✅ Extract logic to custom hooks
- ✅ Keep components focused on UI
- ✅ Use useEffect for side effects only
- ✅ Memoize expensive computations
- ✅ Clean up effects properly

### TypeScript
- ✅ Define all prop interfaces
- ✅ Use strict mode
- ✅ Avoid `any` type
- ✅ Leverage type inference
- ✅ Use generics where appropriate

### Performance
- ✅ Lazy load routes
- ✅ Memoize components when needed
- ✅ Debounce expensive operations
- ✅ Optimize re-renders
- ✅ Use React DevTools Profiler

## 📞 Getting Help

### Resources
- [ ] Review `README.md` for overview
- [ ] Check `ARCHITECTURE.md` for detailed explanation
- [ ] See `COMPONENT_TREE.md` for hierarchy
- [ ] Read `QUICKSTART.md` for common tasks
- [ ] Compare with `COMPARISON.md` for alternatives

### Common Issues
- [ ] Port already in use → Kill process on 5004
- [ ] Dependencies not installing → Delete node_modules, reinstall
- [ ] TypeScript errors → Check tsconfig.json
- [ ] Tailwind not working → Check postcss.config.js
- [ ] Hot reload broken → Restart dev server

## ✨ Quality Standards

### Code Quality
- [ ] Single responsibility per component
- [ ] DRY (Don't Repeat Yourself)
- [ ] KISS (Keep It Simple, Stupid)
- [ ] Consistent naming conventions
- [ ] Proper error handling

### UI/UX
- [ ] Consistent design language
- [ ] Responsive on all screen sizes
- [ ] Accessible to all users
- [ ] Fast and performant
- [ ] Intuitive user flow

### Maintainability
- [ ] Clear component hierarchy
- [ ] Self-documenting code
- [ ] Minimal dependencies
- [ ] Easy to extend
- [ ] Easy to test

---

**Remember**: Atomic Design is about building a consistent, scalable design system. Every component should serve a clear purpose and follow the established patterns.

**When in doubt**: Start simple, refactor later. It's easier to combine small components than to break apart large ones.

**Ask yourself**:
1. Is this component at the right atomic level?
2. Can this be reused in other contexts?
3. Does this follow our design system?
4. Is the logic separated from UI?
5. Will this be easy to maintain?

**Last Updated**: 2026-05-09
