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
  terminal-separator:
    textColor: "{colors.muted}"
    width: "144px"
    height: "44px"
    padding: "6px 0 0"
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

Window chrome is restrained and familiar. Orange identifies the current path, focus and selected task; lilac distinguishes the prompt and directories. The desktop composition stays centered as the viewport widens. The layout leaves room around a centered welcome, then becomes denser as command results and the next prompt follow one another in a single transcript. Markdown documents overlap the terminal on desktop; compact screens keep a document above a persistent lower terminal.

**Key Characteristics:**

- Real character-based identity and navigation.
- Opaque, bordered windows on a deep ink desktop.
- Warm chalk reading text with orange activity and lilac prompts.
- A small script signature reserved for the desktop background.
- Recoverable windows and a persistent, expandable terminal below compact document views.

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

The desktop fills the viewport (100dvh). On compact screens, the available visual viewport height can replace that value as the keyboard changes the visible area. The page itself does not scroll; the terminal transcript and document content scroll within their windows. A top metadata line, window area, background signature and persistent bottom task strip define the outer frame.

The default window area has insets (52px top, 24px sides, 105px bottom). Startup and Reset open the terminal behind About and Contact at every desktop width. About is active and sits above Contact, which sits above the terminal. Window bounds enforce a desktop minimum (300 × 180px), limited by the available area, and keep the whole window within that area. Newly opened documents start near the center with a small stagger; their preferred size is (590 × 500px), bounded to available space.

The startup model centers one composition with a maximum width (1320px) and equal outer horizontal margins. The terminal starts at the composition's left edge, with a preferred width (78% of composition width, clamped between 920px and 1040px) and height (area height minus 20px). About and Contact align to the composition's right edge and visibly overlap the terminal. About starts near the top (12px), with a preferred width (40%, clamped between 440px and 520px). Contact starts near the bottom (12px), with a preferred width (31%, clamped between 390px and 420px). Contact's preferred height is (43% of area height, clamped between 180px and 280px); About uses the remaining height minus a gap allowance (52px), clamped between (180px and 400px). All rectangles are fitted to the available area, so ultrawide monitors add outside space rather than separating the windows.

At widths (700px or below), one document occupies the upper part of the window area and the terminal remains visible below it. About is the initial document; Contact and other documents replace that upper view through the task strip or file actions. The terminal starts at roughly one third of a normal work area (34%), separated from the document by a gap (8px). In short areas, the terminal minimum is the smaller of (150px) and (70% of available height); the document minimum is the smaller of (100px) and (25%). These usable heights take priority over the requested proportion, and the gap can reduce. Below an available height (150px), the terminal fills the work area instead of leaving an unusable split. The terminal can also expand manually to full height. Opening a document from a manually expanded state restores the split, and no remaining document means a full-height terminal.

Compact insets are (44px top, 10px sides); the bottom inset is the taskbar height plus the device safe-area inset and an 8px gap. The taskbar grows from (54px) to (58px). The background signature is hidden on mobile so its former space belongs to the workspace. General window dragging, resizing and maximizing are unavailable. The terminal instead has a dedicated draggable separator and expand control; its close and minimize dots are hidden so the lower console remains recoverable. Task buttons remain visible and horizontally scroll when necessary. The secondary top label and taskbar prefix disappear, while Reset remains available. The visual-viewport height adjustment supports keyboard-constrained work areas; the on-screen keyboard still needs a check on a physical phone.

At short viewport heights (660px or below), the top inset becomes (40px) and the welcome's spacing compresses. Desktop keeps a bottom inset (87px); mobile retains its taskbar-relative bottom inset. A terminal container height (610px or below) also compacts the ASCII, headline and navigation independently of viewport width. The ASCII size then caps at (16px), the headline becomes (13px), and path rows have a minimum height (28px). In compact layouts outside that container rule, the ASCII cap is (17px), the headline is (12px), and path rows retain their minimum height (36px).

When a compact terminal is particularly short (190px or below), its title bar reduces to (44px), the status footer disappears and docked interior padding becomes (6px 12px). This reserves more of a keyboard-constrained pane for the transcript and prompt.

The rhythm is deliberately local: narrow gaps for controls, moderate gaps between text actions, and generous interior space around the welcome. Terminal padding is (22px 28px 15px), changing to (16px 16px 10px) on compact screens and (10px 14px) in the lower split. That docked console reduces the welcome to its useful command hint; expanding it reveals the full ASCII welcome and navigation. Document padding is (23px 25px 28px), changing to (22px) on compact screens. Contact has its own denser reading treatment (16px 20px 20px padding; line height 1.7) so its email action stays near the top of the short startup panel.

**The Recoverable Workspace Rule.** Keep the task strip and Reset accessible as windows move, close or minimize; compact screens retain the terminal below the selected document or allow it to expand fully.

## Elevation & Depth

Depth comes from an opaque window surface, a lighter title bar, thin borders and a structural ambient shadow. The desktop alone has a subtle radial blue-black gradient. Windows use neither translucent interiors nor backdrop blur. Focus raises the window in the stack and strengthens its perimeter; it does not recolor the document surface.

- **Window shadow:** (`0 22px 62px #01040a70`) separates each window from the desktop.
- **Active perimeter:** a brighter slate border (`#63728a`) identifies the active window; inactive documents use Quiet Line.
- **Arrival:** a brief brightness animation (240ms, `cubic-bezier(.16, 1, .3, 1)`) runs only when the user has no reduced-motion preference. Window movement and resizing follow direct input.
- **Terminal response:** results appear in a rapid row sequence with a maximum insertion budget (750ms), and each arriving row has a short fade (140ms, `ease-out`). Reduced-motion preferences make insertion immediate and omit the fade. A new command, Clear or Reset cancels an earlier insertion sequence before it can append stale output.

## Shapes

Windows are simple rectangles with modest corners; use the window radius from the frontmatter, with the smaller compact radius on narrow screens. Thin borders define their silhouette. Title bars follow the top edge and content is clipped inside the window. Small path actions have subtle corners; the command input remains square and visually integrated into its prompt row.

The three window controls are circular, with a larger invisible interaction area around each colored dot. Their symbols become visible on control-group hover or keyboard focus. A small right-angle mark identifies the resize corner on desktop.

## Components

### Welcome paths and inline actions

File paths are plain text actions, arranged vertically. The primary path carries an orange chevron; other rows reserve that same alignment space. The `cv/` path opens the CV directory listing, whose Markdown files open through the same file actions as the rest of the workspace. Hover and keyboard focus add a faint orange background and orange text. The `help` action is underlined within the hint. Keep labels as useful filenames or commands rather than promotional button copy.

### Command input

The prompt and borderless input share a baseline. Lilac identifies the user, a lighter lilac identifies the current path, and muted punctuation separates them. The caret is orange; focus places an orange rule beneath the entire input row. Output and the current prompt use one scrolling transcript: submitting a command prints that line, inserts its response, then reveals the next prompt directly after the result. The input is not pinned to the window bottom. Output remains selectable text, and arrow keys traverse command history.

A faint continuation suggests a local command or path without becoming submitted text. An empty prompt suggests `help`. Tab or the visible Tab action accepts the continuation; Enter runs the entered command. Suggestions come from the local command list and virtual filesystem, with no AI request. On mobile the prompt, input, prediction and command echoes share the terminal body size (12px).

### Windows and title bars

Terminal and document windows share opaque surfaces, thin borders and titlebar controls. The titlebar is a three-column grid: controls at left, truncated title at center, and a small help action or file type at right. Close, minimize and maximize have accessible labels. The task strip reopens or restores windows; Reset restores the initial arrangement.

On desktop, dragging the titlebar moves a window and dragging the lower-right corner resizes it. Double-clicking the titlebar or pressing Enter while it is focused maximizes or restores it. Focused titlebars also support arrow-key movement, Shift plus arrow-key resizing, and Home to center. Movement and resize steps are (16px). These controls preserve the bounds described in Layout.

The compact terminal's top separator changes the split directly as it is dragged. It has a large interaction area (144 × 44px) around a small grip, a separator role and a current-size announcement. Focus it and use Up/Down to change height, Home or Escape to restore the default split, End to expand fully, and Enter or Space to toggle expansion. The separate expand control and double-clicking the separator provide the same full-height toggle. Terminal window dots stay hidden in this compact mode; document controls remain available.

### Markdown documents and terminal results

Document windows show readable Markdown headings, paragraphs, lists, links, inline code and rules. Orange heading prefixes and list markers continue the terminal vocabulary. Content wraps within the window; code blocks preserve text without forcing page overflow. Rendering constructs text and semantic nodes instead of inserting raw HTML.

Clickable directory results use lilac; file results use Link Blue and an underline. Hover turns either orange. Long listings add muted permissions aligned beside names. Commands and equivalent clicks open the same documents and use the same content. The CV consists of a Markdown README plus experience, education and skills documents. Document identity follows the full virtual path, so the home README and CV README can stay open independently despite sharing a filename.

### Task navigation

The bottom strip is a stable, dark band with a thin top border. Initial tasks retain the Terminal, about.md and contact.md labels, with About selected. New document tasks use readable document titles such as CV and Experience, distinguishing documents that share a filename. The active task gains warm text and a short orange underline. Minimized windows use muted text. On compact screens, choosing a document changes the upper pane and brings it back above an expanded terminal. Keyboard focus retains the shared orange outline. A separated Reset action anchors the right edge and restores About as the active window and the default terminal split.

### Contact action

Reveal email, the revealed address and Copy use orange underlined text, with warm-chalk hover. The action appears before the social links. Supporting status appears below in muted small type and reserves no height while empty. In the short Contact panel, tighter heading and paragraph margins keep the action visible; social links form a wrapping horizontal row without list markers. Keep these controls visually consistent with document links.

## Do's and Don'ts

### Do:

- Do keep the ASCII identity as selectable, preformatted character text in the same monospaced family as the terminal.
- Do keep window interiors opaque and use borders, title bars and the structural shadow to separate layers.
- Do use orange for activity and focus, lilac for prompt identity and directories, and Link Blue for file and document links.
- Do preserve visible keyboard focus and equivalent click access to files and help.
- Do retain the persistent task strip and Reset, with the compact terminal available below documents or expanded to full height.
- Do keep the handwritten signature small, behind the windows and out of the interaction path.

### Don't:

- Don't stretch or replace the ASCII lettering with a raster imitation.
- Don't introduce glass or blur into the opaque window surfaces.
- Don't spread the script face into commands, documents or interface labels.
- Don't use the window-control coral, gold and green as unrelated content accents.
- Don't hide document text overflow; scroll it inside the window and keep the outer desktop stable.
- Don't require motion to understand focus, window state or navigation.
