import type { HelpCategory } from '../../types/help';

/** Help for the expanded block library (D166–D173). */
export const canvasBlocksHelp: HelpCategory[] = [
{
  id: 'blocks-library',
  title: 'Blocks, looks & sections',
  summary: 'Find the right block, use ready-made looks and sections, and lay blocks out side by side.',
  icon: 'blocks',
  group: 'Build',
  articles: [
  {
    id: 'find-block',
    q: 'How do I find a block?',
    a: 'Search in everyday words — “appointment” finds Booking, “photo” finds Image and Gallery — or pick a category. Switch between a compact list and a grid of previews with the buttons beside “Adds below…”.',
    where: 'Canvas → Blocks'
  },
  {
    id: 'looks',
    q: 'What is a ready-made look?',
    a: 'The same block with different starting settings — for example “Waitlist signup” is the Newsletter block with waitlist wording. All 120 block ideas are in the picker as blocks or looks, and everything stays editable after you add it.',
    where: 'Canvas → Blocks → any category → Ready-made looks'
  },
  {
    id: 'sections',
    q: 'How do ready-made sections work?',
    a: 'A section adds several real blocks at once, already arranged. Anything only you can supply is marked [Add …]; your page can’t be published until you replace those.',
    steps: ['Open Blocks and tap the Sections chip.', 'Pick a section — it’s added below the selected block.', 'Replace every [Add …] and remove blocks you don’t need.'],
    where: 'Canvas → Blocks → Sections'
  },
  {
    id: 'containers',
    q: 'How do I put blocks side by side or in tabs?',
    a: 'Add a Columns, Tabs or Section block, then add up to four blocks inside it. Columns stack on phones; tabs become an accordion on phones. Move blocks in and out with the buttons in the settings panel — no dragging needed.',
    steps: ['Add Columns (or Tabs, or Section).', 'With it selected, add blocks from the library — they go inside.', 'Use “Move out” on a block to put it back on the page.'],
    where: 'Canvas → Blocks → Layout',
    plan: 'Columns and Tabs: Creator and above'
  },
  {
    id: 'change-type',
    q: 'Can I change a block into a different one?',
    a: 'Yes, where the content carries across — for example a gallery into a carousel, or a link into a call to action. Use the ⇄ button at the top of the block’s settings. You’ll be told what, if anything, didn’t carry over, and Undo puts it back.',
    where: 'Canvas → select a block → ⇄'
  },
  {
    id: 'smart-blocks',
    q: 'Are the Smart blocks AI?',
    a: 'No. Smart button, Campaign spotlight and Recommendations follow simple rules you set: where the visitor came from, your dates, and your own picks. The AI FAQ assistant and Voice to content are listed as Planned and can’t be added yet.',
    where: 'Canvas → Blocks → Smart'
  },
  {
    id: 'unpublished',
    q: 'What does “Unpublished” on a block mean?',
    a: 'The block has changed since you last published, so visitors still see the old version. Publish to put your changes live.'
  }]

}];