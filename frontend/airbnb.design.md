---
version: alpha
name: Airbnb
source: "https://www.airbnb.com"
date: "2026-05-06"
description: "Airbnb homepage and search results UI: minimalist travel discovery system with a central segmented search bar, image-centered listing cards, pill-shaped controls, and Airbnb red as the sole strong accent."
colors:
  primary: "#FF385C"
  accent: "#FF385C"
  accentDark: "#E00B41"
  ink: "#222222"
  black: "#000000"
  canvas: "#FFFFFF"
  background: "#F7F7F7"
  surface: "#FFFFFF"
  surfaceMuted: "#F2F2F2"
  skeleton: "#EBEBEB"
  border: "#DDDDDD"
  borderSoft: "#EBEBEB"
  mutedText: "#6A6A6A"
  mutedTextAlt: "#717171"
  success: "#038026"
  successBg: "#E6F6E9"
  warning: "#B75F00"
  warningBg: "#FFF4E5"
  error: "#C13515"
  errorBg: "#FFF0ED"
typography:
  display:
    fontFamily: "Airbnb Cereal VF, Circular, -apple-system, system-ui, Roboto, Helvetica Neue, sans-serif"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  h1:
    fontFamily: "Airbnb Cereal VF, Circular, -apple-system, system-ui, Roboto, Helvetica Neue, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Airbnb Cereal VF, Circular, -apple-system, system-ui, Roboto, Helvetica Neue, sans-serif"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.22
    letterSpacing: "-0.01em"
  card-title:
    fontFamily: "Airbnb Cereal VF, Circular, -apple-system, system-ui, Roboto, Helvetica Neue, sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.25
  body:
    fontFamily: "Airbnb Cereal VF, Circular, -apple-system, system-ui, Roboto, Helvetica Neue, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
  meta:
    fontFamily: "Airbnb Cereal VF, Circular, -apple-system, system-ui, Roboto, Helvetica Neue, sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.33
  micro:
    fontFamily: "Airbnb Cereal VF, Circular, -apple-system, system-ui, Roboto, Helvetica Neue, sans-serif"
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.2
rounded:
  xs: 4px
  sm: 8px
  md: 12px
  card: 16px
  lg: 20px
  xl: 24px
  pill: 40px
  circle: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  section: 48px
  page: 32px
  gridGap: 24px
shadows:
  search: "0 1px 2px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.05)"
  popover: "0 8px 24px rgba(0,0,0,.10), 0 0 0 1px rgba(0,0,0,.02)"
  modal: "0 8px 28px rgba(0,0,0,.28)"
  badge: "0 2px 4px rgba(0,0,0,.18)"
  carouselControl: "0 2px 4px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,.08)"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: 14px
  button-primary-hover:
    backgroundColor: "{colors.accentDark}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: 14px
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: 14px
  button-outline:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: 12px
  search-pill:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: 12px
  filter-chip:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: 12px
  card-image:
    backgroundColor: "{colors.skeleton}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: 0px
  badge-guest-favorite:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: 8px
  badge-success:
    backgroundColor: "{colors.successBg}"
    textColor: "{colors.success}"
    rounded: "{rounded.xs}"
    padding: 4px
---

## 1. Source

- URL: https://www.airbnb.com
- Date: 2026-05-06
- Page states analyzed:
  - Homepage under German localization with header, large segmented search bar, inspiration tabs, footer and cookie dialog.
  - Search results page with compact header, filter button, listing cards, badges, wishlist buttons, image carousel indicators and card/map area.
- Short description: Airbnb is visually not a classic marketing layout, but a travel discovery interface. The brand is carried by an extremely reduced color palette, generous white space, pill-shaped search controls and emotional image cards.

## 2. Brand DNA

### Visual Identity

Airbnb feels warm, approachable and very product-oriented. The surface uses almost exclusively white, neutral grays and the distinctive Airbnb accent `#FF385C`. The brand does not appear through decorative graphics, but through recurring product forms: segmented search, round icon buttons, image cards with hearts, guest favorite badges and compact travel metadata.

### Layout Principles

- Search first: The most important entry point is always a horizontal, segmented search bar.
- Image before container: Listing cards have no classic card surface with border or shadow. The photo is the card.
- Meta compression: Location, title, host type, date, price, cancellation and rating are made readable in very few lines.
- Rounded corners as system language: Search, filter, header icons, badges, image cards and carousel controls are round or pill-shaped.
- Shadows sparingly: Depth is only used for floating search, popover, modal, badges and carousel controls. Cards remain flat.

### Mood / Product Feel

- Trustworthy, bright, friendly, conversion-oriented.
- Little visual distraction, strong prioritization of search intent and listing images.
- Premium but not luxurious: high-quality micro details, but no heavy gradients or ornamental effects.

## 3. Semantic Tokens

| Role | Token | Value | Observation |
|---|---:|---:|---|
| accent | `--airbnb-accent` | `#FF385C` | Logo, brand accent, central search |
| accent dark | `--airbnb-accent-dark` | `#E00B41` | Search button background per CSS snapshot |
| ink/text | `--airbnb-ink` | `#222222` | Primary text, active tabs, dark buttons |
| canvas/background | `--airbnb-canvas` | `#FFFFFF` | Header, page canvas, card background |
| app background | `--airbnb-bg` | `#F7F7F7` | Footer and light page surfaces |
| surface/card | `--airbnb-surface` | `#FFFFFF` | Search, popovers, modal surfaces |
| muted surface | `--airbnb-muted-surface` | `#F2F2F2` | Round header icon buttons |
| skeleton/media | `--airbnb-skeleton` | `#EBEBEB` | Image skeletons, map placeholder |
| border | `--airbnb-border` | `#DDDDDD` | Search bar dividers, footer lines |
| muted text | `--airbnb-muted` | `#6A6A6A` | Secondary text, inactive tabs |
| success | `--airbnb-success` | `#038026` | Savings/credit hints in result lists |
| warning | `--airbnb-warning` | `#B75F00` | Derived for warning hints, not prominently visible |
| error | `--airbnb-error` | `#C13515` | Derived for form errors, not prominently visible |

## 4. Typography

- Observed font family: `Airbnb Cereal VF, Circular, -apple-system, system-ui, Roboto, Helvetica Neue, sans-serif`.
- The UI primarily uses 14px and 15px. 16px appears for standard UI, 22px to 28px for headings.
- Weight: 400 as base, 500 for labels/tabs/card titles, 700 for headings and select strong accents.
- Hierarchy is compact: Airbnb achieves readability more through position, spacing and weight than through large type jumps.
- Card typography:
  - Card title: approx. 15px, 500, `#222222`.
  - Description, host, date: approx. 15px, 400, `#6A6A6A`.
  - Price: approx. 15px, partly 500, often underlined `Total price`.
  - Rating: compact on the right of the title line, star + value.
- Search typography:
  - Field label: 12px to 14px, 500, dark.
  - Placeholder/value: 14px, 400, gray.

## 5. Layout System

- Desktop header: 80px height on homepage, white background, logo left, primary tabs center, profile navigation right.
- Homepage search: large horizontal pill, centered, approx. 850px width, 64px height, radius 32px to 40px.
- Search result header: compact sticky header with search chip and filter chip, bottom border.
- Content grid:
  - Homepage inspiration links: 6 columns on desktop, link width approx. 196px, row gap approx. 24px.
  - Search results: two-column card grid left, map/placeholder area right.
  - Cards: image as 4:3 to slightly square, radius 16px to 20px, text below without container surface.
- Max-width / page padding:
  - Airbnb uses wide layouts with 32px outer margin on desktop.
  - Documentation preview should use `max-width: 1120px`, but product patterns intentionally show wider cards.
- Section rhythm:
  - 48px to 80px between large sections.
  - 12px to 16px within cards.
  - 4px to 8px between meta lines.

## 6. Components

### Buttons

1. Round search button - `#E00B41`/`#FF385C`, white icon, 48px to 56px, circle/pill.
2. Primary CTA - Airbnb red, white text, pill radius, hover darker.
3. Dark consent/action - `#222222` with white text, 8px radius.
4. Host button - text button with very light hover background, 40px height, pill.
5. Header icon button - 40x40, `#F2F2F2`, round shape, black icon.
6. Filter chip - white, 1px `#DDDDDD`, pill, sliders icon + label.
7. Ghost link button - underlined text, no surface.
8. Disabled/muted button - `#F2F2F2`, `#6A6A6A`, no strong shadow.

### Cards

9. Listing card - no outer border, image + text stack.
10. Image carousel card - media area with radius 16px to 20px, dots below.
11. Skeleton media card - `#EBEBEB` with subtle dark gradient at bottom.
12. Guest favorite badge card - white badge on image, shadow, top left.
13. Superhost badge card - gray/pill badge, less dominant.
14. Price/discount row - current price + old strikethrough price.
15. Rating row - star + value right-aligned in title line.
16. Map placeholder panel - large light gray panel with 20px to 24px radius.
17. Inspiration link tile - destination + category, two lines, no border.
18. Footer link column - clear three-column information architecture.

### Nav

19. Desktop brand header - logo left, product tabs center, profile right.
20. Product tab - active dark text, inactive gray text, new features with mini label.
21. Profile dropdown - white popover, radius 12px, shadow, stacked links.
22. Language/currency dialog trigger - globe icon, round button.
23. Footer bottom bar - copyright, legal links, language, currency, social icons.

### Hero

24. Search hero - no classic hero graphic, search bar as hero component.
25. Search segment - label + secondary value, divider line, active surface gray.
26. Destination suggestions - popup with list of suggested locations and reason.

### Forms

27. Destination search input - transparent input in search segment.
28. Date picker trigger - button opens calendar/date selector.
29. Guest counter trigger - button opens guests popover.
30. Filter modal entry - filter button opens detailed input controls.
31. Consent modal - white dialog with dark action buttons and text link.
32. Focus ring - on visible focus dark ring plus white offset, observed on cookie button.

### Modals/Dropdowns

33. Cookie consent modal - white, 8px to 12px radius, strong shadow `0 8px 28px rgba(0,0,0,.28)`.
34. Profile menu - compact dropdown, links with hover surface.
35. Search suggestions panel - large white dropdown surface, scrollable location suggestions, strongly product-oriented.
36. Filter modal - derived from filter button, Airbnb-typical with bottom actions and many chips.

## 7. Brand-specific Product Patterns

1. Search is the brand: The search bar replaces the classic marketing hero. It contains location, time, guests and search action in a single, heavily rounded surface.
2. Photo as primary trust anchor: Results are not enclosed in classic cards. The image is the visual weight, followed only by compact meta information below.
3. Quality badges over media: Guest favorite, superhost and similar badges sit on images rather than beside them. This makes them feel like context for the specific object.
4. Wishlist as persistent action: The heart is always on the image, top right, without disrupting the text flow.
5. Carousel dots without visible arrows: Dots signal depth, arrows likely appear only on hover. This reduces visual noise.
6. Rating right in the title line: Trust is embedded very space-efficiently.
7. Price clarity with legal wording: `Total price` is strongly emphasized/underlined, discounts use strikethrough instead of colored promo volume.
8. Search result split view: Cards left, map right. The map area is an independent product panel, not merely an additional graphic.
9. Destination inspiration grid: At the bottom of the homepage, destinations are offered as quick text links in a dense grid, not as large teasers.
10. Soft focus instead of hard outlines: Active search segments are highlighted by light gray pill surfaces.

## 8. Motion / Interaction

Directly observed or derivable from visible states:

- Hover on header buttons likely produces light gray pill surfaces.
- Search segments switch to an active light gray state on click.
- Search button has a darker hover state (`#E00B41`).
- Listing images likely show round carousel arrows on hover; buttons were visible in the DOM.
- Wishlist heart changes state and without login likely opens a login/wishlist dialog.
- Filter opens a modal or panel.
- Profile menu opens a dropdown with shadow and stacked links.
- Cookie button showed visible focus with 2px white ring and 4px dark outer ring.
- Image/map skeletons indicate progressive loading states.

## 9. Implementation Notes

### Concrete CSS Tokens

```css
:root {
  --airbnb-accent: #FF385C;
  --airbnb-accent-dark: #E00B41;
  --airbnb-ink: #222222;
  --airbnb-muted: #6A6A6A;
  --airbnb-canvas: #FFFFFF;
  --airbnb-bg: #F7F7F7;
  --airbnb-surface-muted: #F2F2F2;
  --airbnb-skeleton: #EBEBEB;
  --airbnb-border: #DDDDDD;
  --airbnb-success: #038026;
  --airbnb-radius-sm: 8px;
  --airbnb-radius-card: 16px;
  --airbnb-radius-lg: 20px;
  --airbnb-radius-pill: 40px;
  --airbnb-shadow-search: 0 1px 2px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.05);
  --airbnb-shadow-popover: 0 8px 24px rgba(0,0,0,.10), 0 0 0 1px rgba(0,0,0,.02);
  --airbnb-shadow-modal: 0 8px 28px rgba(0,0,0,.28);
}
```

### Component Structure

- `AirbnbHeader`
  - `BrandLogo`
  - `ProductTabs`
  - `ProfileNav`
- `SearchPill`
  - `SearchSegment(location)`
  - `SearchSegment(date)`
  - `SearchSegment(guests)`
  - `SearchSubmitButton`
- `ListingGrid`
  - `ListingCard`
    - `MediaCarousel`
    - `ListingBadge`
    - `WishlistButton`
    - `CarouselDots`
    - `ListingMeta`
    - `PriceRow`
    - `Rating`
- `FilterChip` / `FilterModal`
- `DestinationInspirationTabs`
- `FooterColumns`

### Do

- Use Airbnb red only for logo, search and few primary CTAs.
- Keep cards flat and borderless on the outside. Use image radius instead of card shadows.
- Give search and filter elements pill shapes and compact label/value hierarchy.
- Use clear grayscale, no colorful secondary palettes apart from functional success/error states.
- Work with real product signals: heart, badges, dots, rating, price, date, host type.

### Don't

- Don't build generic SaaS cards with colorful gradients.
- No heavy shadow around every listing card.
- No large marketing illustrations as the main element when search/product UI suffices.
- Don't use `#FF385C` for all icons or all headings.
- No square forms or hard borders as default.

## 10. Accuracy Check

### Directly Observed

- Brand color in logo and CSS: `#FF385C`.
- Dark search button background in CSS snapshot: `rgb(224, 11, 65)` = `#E00B41`.
- Primary text: `#222222`.
- Secondary text: `#6A6A6A`.
- Footer/surface gray: `#F7F7F7`, `#F2F2F2`, `#EBEBEB`, `#DDDDDD`.
- Font family: `Airbnb Cereal VF, Circular, -apple-system, system-ui, Roboto, Helvetica Neue, sans-serif`.
- Common font sizes: 14px, 15px, 16px, 22px, 28px.
- Radii in CSS snapshot: 4px, 8px, 20px, 28px, 40px, 50%.
- Search/popover/modal shadow values from CSS snapshot.
- Components: header, tabs, search, footer, cookie modal, search result cards, badges, hearts, carousel dots, filter button, map placeholder.

### Derived

- Hover behavior of carousel arrows, wishlist and filter modal from DOM/product convention.
- Error/warning tokens, as no error forms were visible in the observed page states.
- Exact sizes of individual card elements from screenshot and bounding box impression, not from final CSS class source.

### Uncertain

- Some images and the map were visible as skeleton/placeholder. Therefore map markers and loaded map colors are not fully observed.
- Filter modal was not reliably opened in the visible state. Filter components are therefore partly derived from Airbnb product patterns and button trigger.
- Localization redirected to airbnb.de. The extracted UI corresponds to Airbnb.com with German region/localization.

Source: www.designmd-store.com
