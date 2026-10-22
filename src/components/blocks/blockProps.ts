import type { BlockOf, BlockType, PageTheme, RenderMode } from '../../types/page';

export interface BlockProps<K extends BlockType> {
  block: BlockOf<K>;
  theme: PageTheme;
  mode: RenderMode;
}