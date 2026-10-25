---
name: "Guillermo Omar — Personal Workspace"
description: "A small personal development environment in deep ink, warm chalk and working text."
colors:
  desktop: "#090f1b"
  surface: "#0c1421"
  chrome: "#182231"
  line: "#39475b"
  line-quiet: "#253246"
  ink: "#eeeae5"
  muted: "#a3afc3"
  orange: "#ff9852"
  lilac: "#c39af4"
  link: "#9ebeff"
  control-close: "#ff706b"
  control-minimize: "#eac463"
  control-maximize: "#69bd7b"
typography:
  display:
    fontFamily: "Geist Mono, monospace"
    fontSize: "clamp(11px, 3.2cqw, 24px)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "0"
  headline:
    fontFamily: "Geist Mono, monospace"
    fontSize: "clamp(13px, 2.3cqw, 18px)"
    fontWeight: 500
    lineHeight: 1.6
  title:
    fontFamily: "Geist Mono, monospace"
    fontSize: "11px"
    fontWeight: 400
  body:
    fontFamily: "Geist Mono, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.9
  terminal:
    fontFamily: "Geist Mono, monospace"
    fontSize: "14px"
    fontWeight: 400
  label:
    fontFamily: "Geist Mono, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.8
  signature:
    fontFamily: "La Belle Aurore, cursive"
    fontSize: "29px"
    fontWeight: 400
    lineHeight: 1
rounded:
  window: "10px"
  window-compact: "8px"
  path: "4px"
  control: "50%"
  input: "0"
spacing:
  controls: "8px"
  inline: "12px"
  content: "16px"
  desktop: "24px"
  terminal: "28px"
components:
  path-primary:
    textColor: "{colors.orange}"
    rounded: "{rounded.path}"
    padding: "3px 12px 3px 0"
  path-default:
    textColor: "{colors.ink}"
    rounded: "{rounded.path}"
    padding: "3px 12px 3px 0"
  command-input:
    textColor: "{colors.ink}"
    typography: "{typography.terminal}"
    rounded: "{rounded.input}"
    padding: "0"
    height: "29px"
  window-controls:
    rounded: "{rounded.control}"
    size: "12px"
  document-window:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.window}"
  task-navigation:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    height: "38px"
    padding: "0 15px"
  file-link:
    textColor: "{colors.link}"
    typography: "{typography.body}"
    padding: "0"
  contact-action:
    textColor: "{colors.orange}"
    typography: "{typography.body}"
    padding: "3px 0"
---

# Design System: Guillermo Omar — Personal Workspace

## Overview

**Creative North Star: "A Small Personal Development Environment"**

The workspace is a quiet, working desktop: deep ink outside, opaque blue-black windows inside, warm chalk text and a small handwritten signature behind the windows. A generous background terminal carries the real ASCII lettering, prompt and file paths. About and Contact start open in front of it, with About active.

Window chrome is restrained and familiar. Orange identifies the current path, focus and selected task; lilac distinguishes the prompt and directories. The layout leaves room around a centered welcome, then becomes denser when commands produce useful output. Markdown documents share the same visual language and overlap the terminal as working windows.

**Key Characteristics:**

- Real character-based identity and navigation.
- Opaque, bordered windows on a deep ink desktop.
- Warm chalk reading text with orange activity and lilac prompts.
- A small script signature reserved for the desktop background.
- Recoverable windows and one active surface on compact screens.

## Colors

The palette combines cool, layered blue-black surfaces with warm text and selective bright state colors. The frontmatter contains the normative values; names below describe their use.

### Primary

- **Active Orange** (`orange`): selected welcome path, ASCII slash, command caret, keyboard focus, Markdown heading marks, contact actions and the current task underline.

### Secondary

- **Prompt Lilac** (`lilac`): prompt identity, directory listings and secondary Markdown heading marks.
- **Link Blue** (`link`): inline document links and clickable file results.

### Neutral

- **Deep Ink** (`desktop`): base canvas beneath the subtle desktop gradient.
- **Window Blue-Black** (`surface`): opaque terminal and document interiors.
- **Chrome Slate** (`chrome`): title bars, separated from content by a quiet rule.
- **Window Line** (`line`): window perimeter; **Quiet Line** (`line-quiet`): inactive documents, dividers and taskbar separation.
- **Warm Chalk** (`ink`): principal text and ASCII letters; **Muted Slate** (`muted`): supporting copy, status, hints and desktop labels.

Close, minimize and maximize retain their conventional coral, gold and green control colors. These colors belong to window controls rather than general content emphasis.

**The Activity Rule.** Use orange to identify an action, current state or focus; retain warm chalk for sustained reading.

## Typography

**Display, body and interface font:** Geist Mono, with a monospace fallback. The variable font is self-hosted with weights (100–900); the current interface uses regular and medium text, with bold control symbols.

**Signature font:** La Belle Aurore, with a cursive fallback, self-hosted at regular weight (400). Its role is the small desktop signature.

The monospaced family connects the actual character artwork, terminal, file paths and documents. Hierarchy comes from size, spacing, color and medium weight, without introducing a second text family for reading.

- **Display:** preformatted ASCII lettering; preserve spaces, line breaks, zero letter spacing and the orange slash. The container-relative size is defined in the frontmatter.
- **Headline:** the welcome's personal name, centered below the ASCII mark. Compact and short-container sizes are described under Layout.
- **Title:** centered, single-line window filename or terminal path, with ellipsis when space is limited.
- **Body:** Markdown reading text; paragraphs have a maximum line length (70ch). Document headings use medium text (15px) with a line height (1.6).
- **Terminal:** prompt and input; output text and listings use a smaller size (12px) and a line height (1.8).
- **Label:** small supporting hints; titlebar metadata and terminal status may be smaller (9–10px).
- **Signature:** handwritten name at the lower-left of the background; it remains behind the windows and does not intercept input.

**The Character Integrity Rule.** Render the identity as preformatted text in Geist Mono; preserve the character grid as the terminal changes size.

## Layout

The desktop fills the viewport (100dvh). The page itself does not scroll; terminal output and document content scroll within their windows. A top metadata line, window area, background signature and persistent bottom task strip define the outer frame.

The default window area has insets (52px top, 24px sides, 105px bottom). Startup and Reset open the terminal behind About and Contact at every desktop width. About is active and sits above Contact, which sits above the terminal. Window bounds enforce a desktop minimum (300 × 180px), limited by the available area, and keep the whole window within that area. Newly opened documents start near the center with a small stagger; their preferred size is (590 × 500px), bounded to available space.

The startup model anchors the terminal at the area's top-left, with a preferred width (78% of area width, clamped between 920px and 1040px) and height (area height minus 20px). About and Contact are inset from the right edge (20px), visibly overlapping the terminal. About starts near the top (12px), with a preferred width (40%, clamped between 440px and 520px). Contact starts near the bottom (12px), with a preferred width (31%, clamped between 390px and 420px). Contact's preferred height is (43% of area height, clamped between 180px and 280px); About uses the remaining height minus a gap allowance (52px), clamped between (180px and 400px). All rectangles are fitted to the available area. This shared startup model replaces the former wide-only column arrangement.

At widths (700px or below), only the active window is visible, and it fills the window area. About is shown initially; Terminal and Contact remain open in state and reachable from the task strip. Compact insets are (44px top, 10px sides, 99px bottom); the taskbar grows from (54px) to (58px), plus the device safe-area inset. Dragging, resizing and maximizing are unavailable; the maximize control and resize corner disappear. Task buttons remain visible and horizontally scroll when necessary. The secondary top label and taskbar prefix disappear, while Reset remains available.

At short viewport heights (660px or below), the area uses top and bottom insets (40px and 87px), and the welcome's spacing compresses. A terminal container height (610px or below) also compacts the ASCII, headline and navigation independently of viewport width. The ASCII size then caps at (16px), the headline becomes (13px), and path rows have a minimum height (28px). In compact layouts outside that container rule, the ASCII cap is (17px), the headline is (12px), and path rows retain their minimum height (36px).

The rhythm is deliberately local: narrow gaps for controls, moderate gaps between text actions, and generous interior space around the welcome. Terminal padding is (22px 28px 15px), changing to (16px 16px 10px) on compact screens. Document padding is (23px 25px 28px), changing to (22px) on compact screens. Contact has its own denser reading treatment (16px 20px 20px padding; line height 1.7) so its email action stays near the top of the short startup panel.

**The Recoverable Workspace Rule.** Keep the task strip and Reset accessible as windows move, close or minimize; compact screens show one active window at a time.

## Elevation & Depth

Depth comes from an opaque window surface, a lighter title bar, thin borders and a structural ambient shadow. The desktop alone has a subtle radial blue-black gradient. Windows use neither translucent interiors nor backdrop blur. Focus raises the window in the stack and strengthens its perimeter; it does not recolor the document surface.

- **Window shadow:** (`0 22px 62px #01040a70`) separates each window from the desktop.
- **Active perimeter:** a brighter slate border (`#63728a`) identifies the active window; inactive documents use Quiet Line.
- **Arrival:** a brief brightness animation (240ms, `cubic-bezier(.16, 1, .3, 1)`) runs only when the user has no reduced-motion preference. Window movement and resizing follow direct input.

## Shapes

Windows are simple rectangles with modest corners; use the window radius from the frontmatter, with the smaller compact radius on narrow screens. Thin borders define their silhouette. Title bars follow the top edge and content is clipped inside the window. Small path actions have subtle corners; the command input remains square and visually integrated into its prompt row.

The three window controls are circular, with a larger invisible interaction area around each colored dot. Their symbols become visible on control-group hover or keyboard focus. A small right-angle mark identifies the resize corner on desktop.

## Components

### Welcome paths and inline actions

File paths are plain text actions, arranged vertically. The primary path carries an orange chevron; other rows reserve that same alignment space. The `cv/` path opens the CV directory listing, whose Markdown files open through the same file actions as the rest of the workspace. Hover and keyboard focus add a faint orange background and orange text. The `help` action is underlined within the hint. Keep labels as useful filenames or commands rather than promotional button copy.

### Command input

The prompt and borderless input share a baseline. Lilac identifies the user, a lighter lilac identifies the current path, and muted punctuation separates them. The caret is orange; focus places an orange rule beneath the entire input row. Tab completes entered commands or paths, arrow keys traverse command history, and output remains selectable text.

### Windows and title bars

Terminal and document windows share opaque surfaces, thin borders and titlebar controls. The titlebar is a three-column grid: controls at left, truncated title at center, and a small help action or file type at right. Close, minimize and maximize have accessible labels. The task strip reopens or restores windows; Reset restores the initial arrangement.

On desktop, dragging the titlebar moves a window and dragging the lower-right corner resizes it. Double-clicking the titlebar or pressing Enter while it is focused maximizes or restores it. Focused titlebars also support arrow-key movement, Shift plus arrow-key resizing, and Home to center. Movement and resize steps are (16px). These controls preserve the bounds described in Layout.

### Markdown documents and terminal results

Document windows show readable Markdown headings, paragraphs, lists, links, inline code and rules. Orange heading prefixes and list markers continue the terminal vocabulary. Content wraps within the window; code blocks preserve text without forcing page overflow. Rendering constructs text and semantic nodes instead of inserting raw HTML.

Clickable directory results use lilac; file results use Link Blue and an underline. Hover turns either orange. Long listings add muted permissions aligned beside names. Commands and equivalent clicks open the same documents and use the same content. The CV consists of a Markdown README plus experience, education and skills documents. Document identity follows the full virtual path, so the home README and CV README can stay open independently despite sharing a filename.

### Task navigation

The bottom strip is a stable, dark band with a thin top border. Initial tasks retain the Terminal, about.md and contact.md labels, with About selected. New document tasks use readable document titles such as CV and Experience, distinguishing documents that share a filename. The active task gains warm text and a short orange underline. Minimized windows use muted text. Keyboard focus retains the shared orange outline. A separated Reset action anchors the right edge and restores About as the active window.

### Contact action

Reveal email, the revealed address and Copy use orange underlined text, with warm-chalk hover. The action appears before the social links. Supporting status appears below in muted small type and reserves no height while empty. In the short Contact panel, tighter heading and paragraph margins keep the action visible; social links form a wrapping horizontal row without list markers. Keep these controls visually consistent with document links.

## Do's and Don'ts

### Do:

- Do keep the ASCII identity as selectable, preformatted character text in the same monospaced family as the terminal.
- Do keep window interiors opaque and use borders, title bars and the structural shadow to separate layers.
- Do use orange for activity and focus, lilac for prompt identity and directories, and Link Blue for file and document links.
- Do preserve visible keyboard focus and equivalent click access to files and help.
- Do retain the persistent task strip and Reset, including the compact single-window layout.
- Do keep the handwritten signature small, behind the windows and out of the interaction path.

### Don't:

- Don't stretch or replace the ASCII lettering with a raster imitation.
- Don't introduce glass or blur into the opaque window surfaces.
- Don't spread the script face into commands, documents or interface labels.
- Don't use the window-control coral, gold and green as unrelated content accents.
- Don't hide document text overflow; scroll it inside the window and keep the outer desktop stable.
- Don't require motion to understand focus, window state or navigation.
