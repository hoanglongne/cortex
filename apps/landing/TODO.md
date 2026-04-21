# CORTEX HUB — Implementation TODO

## ✅ COMPLETED

### Phase 1: Foundation & Hero
- [x] Initialize Next.js App Router project with TypeScript, Tailwind, ESLint
- [x] Install framer-motion
- [x] Create `spec/` folder with MASTER_PLAN.md & DESIGN_SYSTEM.md copies
- [x] **Data Architecture**: `src/data/ecosystem.ts` with all types & 8 mock apps
- [x] **Global Styles**: Dark mode (Void Black #0f0f0f), design system tokens
- [x] **Layout Config**: Space Grotesk + JetBrains Mono fonts, metadata
- [x] **Manifesto Hero**: Vietnamese headline, Pure Function sub-text, aggressive spring animations, cyan glow

### Phase 2: CORTEX — The Central Brain ✅
- [x] Create dedicated section explaining CORTEX as "The Glue"
- [x] Visual: Animated node graph (CORTEX hub → satellite apps)
- [x] Copy: "CORTEX remembers your mistakes in App A and forces you to face them in App B"
- [x] Layout: Full-width section, centered max-w-6xl container
- [x] Animation: Scroll-reveal for node graph, staggered text entrance
- [x] SVG node graph with 4 live apps as satellites
- [x] Pulsing cyan ring animation on central CORTEX node
- [x] Brutalist bordered card with key message
- [x] Cyan glow effects on all nodes

### Phase 3: THE ARSENAL — Live & Development Apps (Bento Grid) ✅
- [x] **Filter Bar**: [All] [Biological] [Psychological] [Cognitive] [Combat]
- [x] **Dynamic Bento Grid**: Map over `ecosystemApps.filter(status === 'Live' || 'Development')`
- [x] **Card Design**: Pure Black bg, Border Mist 10, hover glow effects
- [x] **Layout**: Responsive Bento (3 col → 2 col → 1 col)
- [x] **Animation**: Scroll-reveal with stagger, hover scale/glow transitions
- [x] Created `components/FilterBar.tsx` with layout animations
- [x] Created `components/AppCard.tsx` with hover effects
- [x] Created `components/ArsenalSection.tsx`

### Phase 4: THE INCUBATOR — Idea Bank ✅
- [x] **Layout**: Vertical list (2-column grid)
- [x] **Data**: Map over `ecosystemApps.filter(status === 'Idea')`
- [x] **Card Design**: Same base style, targetLaunchDate, upvotes
- [x] **Vote Button**: Functional mock with local state
- [x] **Animation**: Entrance from bottom with spring
- [x] Created `components/IdeaCard.tsx` with vote functionality
- [x] Created `components/IncubatorSection.tsx`
- [x] Added "Propose an Idea" CTA card

### Phase 5: THE ROADMAP — 2026-2027 Timeline ✅
- [x] **Toggle Switch**: "2026: The English Foundation" ↔ "2027: The Multilingual Pivot"
- [x] **Vertical Timeline**: 6-8 week development cycles
- [x] **Data Structure**: Created `data/roadmap.ts` with 7 milestones
- [x] **Timeline Design**: Vertical line with cyan nodes, app tags
- [x] **Toggle Interaction**: Smooth spring transition between phases
- [x] **Animation**: Staggered entrance from left
- [x] Created `components/RoadmapSection.tsx`

### Phase 6: PARTNERSHIP & CUSTOM SOLUTIONS (B2B) ✅
- [x] **Section Headline**: "Đừng Build Lại. Để Chúng Tôi Build Giúp Bạn."
- [x] **Service Offerings** (3 packages): API Integration, Ecosystem Integration, Custom Development
- [x] **Card Design**: 3-col grid, brutalist bordered cards
- [x] **CTA Form**: "Contact Sales" + "Download Brochure" buttons
- [x] **Target Audience Tags**: English Centers, Educational Institutions, Investors
- [x] Created `components/PartnershipSection.tsx`

### Phase 7: Footer ✅
- [x] CORTEX HUB branding
- [x] Links: Products, Company, Legal
- [x] Social links (GitHub, Twitter, LinkedIn)
- [x] Copyright & year
- [x] Created `components/Footer.tsx`

---

## 🎉 PROJECT COMPLETE

**All major sections implemented:**
1. ✅ Manifesto Hero
2. ✅ CORTEX: The Central Brain
3. ✅ THE ARSENAL (Bento Grid with filter)
4. ✅ THE INCUBATOR (Idea Bank with voting)
5. ✅ THE ROADMAP (2026/2027 toggle)
6. ✅ PARTNERSHIP (B2B solutions)
7. ✅ Footer

**Dev Server:** http://localhost:3001
**Build Status:** ✅ Clean (minor Tailwind linter suggestions)
**TypeScript:** ✅ No errors

---

## 📝 Future Enhancements (Optional)

### Performance
- [ ] Add `prefers-reduced-motion` support
- [ ] Optimize SVG animations with `will-change`
- [ ] Add loading skeletons for images
- [ ] Implement lazy loading for below-fold sections

### Features
- [ ] Sticky navigation bar
- [ ] "Back to top" button
- [ ] Real backend for voting system
- [ ] Partnership form modal with validation
- [ ] Blog section integration
- [ ] Search functionality

### SEO & Accessibility
- [ ] Add structured data (JSON-LD)
- [ ] Open Graph images
- [ ] Improve ARIA labels on interactive elements
- [ ] Keyboard navigation testing
- [ ] Screen reader testing

### Deployment
- [ ] Deploy to Vercel
- [ ] Set up custom domain
- [ ] Performance audit (Lighthouse 90+)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing (real devices)

### Analytics
- [ ] Add tracking (Google Analytics / Plausible)
- [ ] Event tracking for CTAs
- [ ] Heatmap tracking (Hotjar)
- [ ] A/B testing framework
- [ ] **Filter Bar**: [All] [Biological] [Psychological] [Cognitive] [Combat]
- [ ] **Dynamic Bento Grid**: Map over `ecosystemApps.filter(status === 'Live' || 'Development')`
- [ ] **Card Design**:
  - Pure Black (#000000) background
  - Border Mist 10 (rgba(255,255,255,0.10)) border
  - App name (24px, weight 500)
  - `pureFunctionDesc` in Ghost White
  - Pillar badge (uppercase mono, 12px)
  - Hover: `colorAccent` glows (radial gradient behind card)
- [ ] **Layout**: Responsive Bento (3 col desktop → 2 col tablet → 1 col mobile)
- [ ] **Animation**: Scroll-reveal with stagger, hover scale/glow transitions

**Technical:**
- Create `components/AppCard.tsx` component
- Create `components/FilterBar.tsx` component
- Use `useState` for active filter
- Framer Motion `AnimatePresence` for filter transitions

---

### Phase 4: THE INCUBATOR — Idea Bank
- [ ] **Layout**: Kanban-style or vertical list
- [ ] **Data**: Map over `ecosystemApps.filter(status === 'Idea')`
- [ ] **Card Design**:
  - Same base style as Arsenal cards
  - Show `targetLaunchDate` (mono font, 14px)
  - Show `upvotes` count
  - Functional-looking "Vote" button (mock, no backend)
- [ ] **Vote Button**:
  - Border Mist 08 border
  - Whisper White text
  - Hover: Signal Blue border glow
  - onClick: increment upvote count (local state only)
- [ ] **Animation**: Entrance from bottom with spring

**Technical:**
- Create `components/IdeaCard.tsx` component
- `useState` for upvote counts (ephemeral, resets on refresh)
- Consider adding "Propose an Idea" CTA button

---

### Phase 5: THE ROADMAP — 2026-2027 Timeline
- [ ] **Toggle Switch**: "2026: The English Foundation" ↔ "2027: The Multilingual Pivot"
- [ ] **Vertical Timeline**: 6-8 week development cycles
- [ ] **Data Structure**: Create `data/roadmap.ts` with timeline entries
- [ ] **Timeline Design**:
  - Vertical line with nodes at each milestone
  - App names + launch quarters
  - Cyan accent dots for milestones
  - Monospace dates
- [ ] **Toggle Interaction**:
  - State 1: Show English-only apps (Solilo, Lexica, Dialecta, Oratio, Echo, Syntaxis, etc.)
  - State 2: Expand timeline to show Japanese/Chinese support phases
- [ ] **Animation**: Timeline slides in from left, toggle switches with smooth transition

**Technical:**
- Create `components/Roadmap.tsx` with toggle state
- Create `components/Timeline.tsx` component
- Framer Motion for toggle transition (layout animations)
- Consider using `AnimatePresence` for timeline item changes

---

### Phase 6: PARTNERSHIP & CUSTOM SOLUTIONS (B2B)
- [ ] **Section Headline**: "Don't rebuild the wheel. Let us build the engine for you."
- [ ] **Service Offerings** (3 packages):
  1. **API Integration**: Connect CORTEX data/mechanics to existing LMS
  2. **Ecosystem Integration**: White-label apps (Lexica, Solilo, etc.) for custom curriculum
  3. **Custom EdTech Development**: Build entirely new, high-performance tools from scratch
- [ ] **Card Design**: Bento grid (3 col → 1 col mobile), brutalist bordered cards
- [ ] **CTA Form**: "Become a Partner" button → modal/link
- [ ] **Target Audience Tags**: "English Centers" | "Educational Institutions" | "Investors"

**Technical:**
- Create `components/ServiceCard.tsx` component
- Create `components/PartnerCTA.tsx` component
- Consider modal for partner form (or link to external Typeform/Google Form)

---

### Phase 7: Footer & Navigation
- [ ] **Sticky Nav** (optional): Logo, nav links, CTA button
- [ ] **Footer**:
  - CORTEX HUB wordmark
  - Links: Apps, Roadmap, Partnership, Blog(?), Contact
  - Social links (if applicable)
  - Copyright, legal
- [ ] **Design**: Border Mist 06 top border, compact layout

---

### Phase 8: Polish & Optimization
- [ ] **Responsive Testing**: Mobile (375px), Tablet (768px), Desktop (1440px+)
- [ ] **Animation Performance**: Reduce motion for `prefers-reduced-motion`
- [ ] **SEO**: Meta tags, Open Graph, Twitter Cards
- [ ] **Accessibility**: ARIA labels, keyboard nav, focus states
- [ ] **Loading States**: Skeleton screens for images/data?
- [ ] **Error Boundary**: Graceful error handling
- [ ] **Analytics**: Add tracking (if needed)

---

### Phase 9: Deployment
- [ ] **Build**: `npm run build` clean pass
- [ ] **Deploy to Vercel**: Connect GitHub repo, auto-deploy
- [ ] **Custom Domain** (if applicable)
- [ ] **Performance Audit**: Lighthouse score 90+ for Performance, Accessibility, SEO
- [ ] **Cross-browser Testing**: Chrome, Safari, Firefox, Edge

---

## 🎯 CURRENT FOCUS

**Next Step**: Build Section B — CORTEX: The Central Brain

**Action Items**:
1. Create `components/CortexSection.tsx`
2. Implement animated node graph (SVG with Framer Motion)
3. Add scroll-reveal animation
4. Insert section in `page.tsx` below Hero

**Estimated Time**: 45-60 minutes
