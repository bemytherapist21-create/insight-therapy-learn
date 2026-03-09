

## Plan

### 1. Add "Blog" to navigation after "About"

In `src/components/Navigation.tsx`, add a Blog nav item after About in the `navItems` array:
```
{ name: "Blog", path: "/blog", prominent: false },
```

Also update the nav link logic: currently all items use hash-based `Link`. For "Blog", it should navigate to `/blog` directly. For Home page hash links (Services, About, Contact), we need scroll-to-section behavior that works even when navigating from another page.

### 2. Fix navigation scroll behavior for About, Services, Contact

Currently the nav uses `/#services`, `/#about`, `/#contact` paths. These need to:
- Navigate to `/` if not already there
- Scroll to the corresponding section (`id="services"`, `id="about"`, `id="contact"`)

I'll add a click handler in `Navigation.tsx` that checks if we're on `/`, and if so scrolls to the element; otherwise navigates to `/#section` and lets the Home page handle scrolling on mount.

### 3. Add Black Mirror Gadgets as a new blog post

- Add the blog post metadata to `blogPosts` array in `src/pages/Blog.tsx`
- Create a new dedicated page component `src/pages/BlackMirrorGadgets.tsx` adapted from the uploaded JSX (converted to TypeScript with Tailwind styling to match the site, or kept as-is with inline styles since the original has a very distinctive dark/monospace aesthetic)
- Add route in `App.tsx` or handle via the existing `/blog/:slug` route in `BlogPost.tsx`

I'll check how `BlogPost.tsx` renders content to decide the best approach.

### 4. Files to modify

1. **`src/components/Navigation.tsx`** — Add "Blog" item, improve scroll-to-section handling
2. **`src/pages/Blog.tsx`** — Add Black Mirror Gadgets blog post metadata
3. **`src/pages/BlackMirrorGadgets.tsx`** — New page with the uploaded content (converted to TSX)
4. **`src/App.tsx`** — Add route for the new blog post page (or integrate with existing BlogPost slug routing)

### Technical details

- The uploaded JSX uses inline styles and a standalone component. I'll keep its aesthetic but wrap it in the site's layout (with proper padding for the fixed nav).
- Navigation hash scrolling: use `scrollIntoView({ behavior: 'smooth' })` with a click handler that prevents default Link behavior for hash routes.
- Blog nav item will be a standard route link (not hash-based).

