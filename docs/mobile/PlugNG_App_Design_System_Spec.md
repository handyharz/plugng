# PlugNG App Design System Spec

## Purpose
Define the visual and interaction system that will make the PlugNG app feel consistent, premium, and implementation-ready across all screens.

This document covers:

- color tokens
- typography
- spacing
- surfaces
- buttons
- inputs
- cards
- badges
- navigation
- motion

## Design Intent
PlugNG mobile should feel:

- premium
- fast
- trustworthy
- dark and polished
- expressive without becoming noisy

The design system should preserve the best parts of the web brand while becoming calmer and more legible on mobile.

## Brand Keywords

- midnight
- electric
- sharp
- premium
- confident
- commerce-native
- trustworthy

## Core Visual Direction

### Keep

- deep black background
- electric blue accent
- glass-card surfaces
- high-contrast product imagery
- uppercase micro-label moments
- subtle glow

### Refine

- reduce visual competition
- increase hierarchy clarity
- keep motion purposeful
- make trust cues calmer and more transactional

## Color System

## Core Background Tokens

- `bg.canvas = #090909`
- `bg.surface = #111214`
- `bg.surfaceElevated = #17191D`
- `bg.overlay = rgba(5, 8, 12, 0.82)`
- `bg.glass = rgba(255, 255, 255, 0.06)`

## Text Tokens

- `text.primary = #F5F7FA`
- `text.secondary = #A3ADBF`
- `text.tertiary = #6F7A8D`
- `text.inverse = #0A0A0A`
- `text.link = #6CA7FF`

## Border Tokens

- `border.soft = rgba(255, 255, 255, 0.08)`
- `border.default = rgba(255, 255, 255, 0.12)`
- `border.strong = rgba(255, 255, 255, 0.20)`
- `border.brand = rgba(59, 130, 246, 0.45)`

## Brand Accent Tokens

- `brand.primary = #3B82F6`
- `brand.primaryHover = #4A8EFF`
- `brand.primaryPressed = #2E6FDB`
- `brand.primarySoft = rgba(59, 130, 246, 0.12)`

## Support Accent Tokens

- `accent.purple = #8B5CF6`
- `accent.rose = #F43F5E`
- `accent.emerald = #10B981`
- `accent.amber = #F59E0B`

## Status Tokens

- `status.success = #10B981`
- `status.warning = #F59E0B`
- `status.error = #EF4444`
- `status.info = #3B82F6`

## Color Usage Rules

- electric blue is the primary action color
- rose is used for wishlist and urgency
- emerald is used for success, paid, delivered, and wallet-positive states
- amber is used for caution, pending states, and limited offers
- do not use all accent colors equally on the same screen

## Gradients

### Hero / Brand Glow

- `linear-gradient(135deg, rgba(59,130,246,0.22), rgba(139,92,246,0.14))`

### Wallet Promo

- `linear-gradient(135deg, rgba(59,130,246,0.18), rgba(16,185,129,0.14))`

### Subtle Surface

- `linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`

## Typography System

## Tone
Typography should feel:

- crisp
- compact
- premium
- readable

Use dramatic display moments sparingly. Most commerce tasks need clarity first.

## Type Scale

- `display.l = 36 / 40`
- `display.m = 30 / 34`
- `heading.l = 24 / 30`
- `heading.m = 20 / 26`
- `heading.s = 18 / 24`
- `body.l = 16 / 24`
- `body.m = 14 / 21`
- `body.s = 12 / 18`
- `meta = 10 / 14`

## Weight Guidance

- display: 800 to 900
- section titles: 700 to 800
- body: 400 to 500
- metadata: 700

## Typography Rules

- uppercase is reserved for metadata, status, and small labels
- italic styling is used selectively for brand personality and hero moments
- long descriptive text should never be all caps
- price text should be bold and highly legible

## Spacing System

Use a consistent spacing scale:

- `4`
- `8`
- `12`
- `16`
- `20`
- `24`
- `32`
- `40`

## Spacing Rules

- vertical section spacing should usually be `24` or `32`
- card internal padding should usually be `16` or `20`
- compact chips use `8` to `12`
- modal and sheet padding should usually be `20` to `24`

## Radius System

- `radius.s = 12`
- `radius.m = 16`
- `radius.l = 20`
- `radius.xl = 24`
- `radius.hero = 28`

## Radius Rules

- chips and small controls: `12`
- buttons and inputs: `16`
- standard cards: `20`
- large promos and sheets: `24` to `28`

## Surface System

## Surface Types

### 1. Base Surface
Use for:

- screen backgrounds
- large layout wrappers

Style:

- dark flat or slightly textured

### 2. Glass Surface
Use for:

- feature cards
- wallet promo cards
- elevated list items

Style:

- translucent background
- subtle border
- soft blur
- gentle glow only when important

### 3. Utility Surface
Use for:

- input backgrounds
- compact info rows
- control groups

Style:

- slightly lighter than canvas
- low blur or no blur
- clear border definition

## Elevation System

### Elevation 0

- flat background

### Elevation 1

- subtle border
- small shadow

### Elevation 2

- stronger border
- modest shadow
- slight glow when branded

### Elevation 3

- reserved for hero cards, modals, and focused overlays

## Shadows and Glow

### Soft Shadow

- `0 8 24 rgba(0,0,0,0.28)`

### Brand Glow

- `0 0 28 rgba(59,130,246,0.18)`

### Wallet Glow

- `0 0 28 rgba(16,185,129,0.14)`

## Component Tokens

## Buttons

### Primary Button

- background: `brand.primary`
- text: `text.primary`
- radius: `16`
- height: `52`

Use for:

- main purchase CTA
- continue actions
- place order

### Secondary Button

- background: `bg.glass`
- border: `border.default`
- text: `text.primary`

Use for:

- secondary actions
- save
- filters

### Ghost Button

- transparent or low-opacity
- text-forward

Use for:

- header actions
- tertiary actions

### Destructive Button

- soft red tint
- clear destructive label

Use for:

- remove address
- delete payment method
- remove item where confirmation is needed

## Input Fields

### Input Style

- dark utility surface
- border visible by default
- stronger brand border on focus
- height: `52`
- radius: `16`

### Input States

- default
- focus
- success
- error
- disabled

### Search Input

- visually larger than standard inputs
- high prominence
- supports icon leading and clear action trailing

## Chips

### Filter Chip

- pill shape
- low emphasis by default
- blue or white-emphasis when active

### Status Chip

- compact
- strongly readable
- color-coded with text plus background

## Cards

### Product Card
Must support:

- image
- title
- price
- discount
- wishlist
- quick add

### Wallet Card
Must support:

- balance
- perk messaging
- action CTA

### Address Card
Must support:

- recipient
- address
- label
- selected state

### Order Card
Must support:

- order number
- status
- total
- preview items

## Badges

Use badges sparingly.

Recommended badge types:

- sale
- wallet perk
- new
- delivered
- pending
- paid

Rules:

- badges should not overwhelm product imagery
- no more than 2 strong badges on most cards

## Navigation Design

## Header

- compact
- brand left or centered depending on screen
- action icons right
- consistent vertical rhythm

## Bottom Navigation

- 5 tabs max
- icon plus label
- active state uses brand color
- inactive state uses muted text
- blur or glass background allowed, but keep clarity high

## Sticky Bottom Bars

Use on:

- product detail
- cart
- checkout

Rules:

- strong separation from content
- action always visible
- price or summary may appear in bar when helpful

## Motion System

## Motion Principles

- fast
- smooth
- restrained
- feedback-oriented

## Motion Categories

### Ambient

- subtle glow shifts
- small shimmer

Use rarely.

### Transitional

- screen push
- bottom sheet slide
- search expansion
- add-to-cart confirmation

### Feedback

- button press
- successful wallet top-up
- saved-to-wishlist state
- applied coupon

## Motion Timing

- fast interaction: `120ms to 180ms`
- standard transition: `220ms to 300ms`
- modal or sheet: `280ms to 360ms`

## Motion Rules

- avoid strong motion on checkout and support flows
- do not stack too many animated elements on the same screen
- motion should confirm state change, not distract from task completion

## Icons

Icon direction should be:

- clean
- minimal
- slightly tech-forward
- consistent stroke weight

Use icons for:

- navigation
- trust cues
- status
- quick actions

Avoid using icons to replace text when clarity would suffer.

## Imagery

Product imagery should be:

- highly legible
- centered on product
- premium-lit
- visually consistent across listings

Rules:

- use clean backgrounds where possible
- avoid cluttered product images on small cards
- product image should dominate card design more than decorative backgrounds

## Accessibility Requirements

- strong contrast for key text
- minimum touch targets around `44px`
- clear focus states
- color should not be the only status indicator
- readable price and CTA sizing
- support reduced motion later

## Screen-Level Visual Guidance

## Home

- visually rich but not chaotic
- one strong wallet card max
- search is the strongest element

## Search

- cleaner than Home
- utility-first
- highly readable

## Product Detail

- product image dominates
- trust and compatibility are early

## Cart

- calm, readable, summary-driven

## Checkout

- low noise
- high trust
- minimum decorative motion

## Wallet

- premium and financial
- simpler than discovery screens

## Do / Don't Rules

## Do

- keep contrast high
- use glow strategically
- make primary actions obvious
- keep content blocks well-separated
- preserve the PlugNG dark-premium mood

## Don't

- overuse multiple accent colors on one screen
- make every card equally loud
- overload mobile screens with long web-style content stacks
- use decorative blur where it hurts readability

## Priority Tokens to Implement First

1. colors
2. text styles
3. spacing
4. radii
5. button variants
6. input styles
7. card variants
8. status badges
9. bottom nav styles
10. sticky action bar styles

## Next Step
After this design system spec, the strongest implementation document is a reusable component spec with:

- component purpose
- prop expectations
- variants
- states
- where each component is used
