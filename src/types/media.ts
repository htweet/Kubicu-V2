export interface MediaAsset {
  id: string;
  workspaceId: string;
  name: string;
  /** Default description, suggested wherever the image is placed. */
  alt: string;
  dataUrl: string;
  width: number;
  height: number;
  bytes: number;
  hash: string;
  createdAt: string;
  updatedAt: string;
  /**
   * Removed from the library but still referenced by the live page or version history,
   * so the data is kept until nothing points at it.
   */
  archived?: boolean;
}

export type MediaShape = 'square' | 'portrait' | 'wide';

export type MediaUseKind = 'block' | 'product' | 'live' | 'section' | 'history';

export interface MediaUse {
  kind: MediaUseKind;
  label: string;
  detail: string;
  to?: string;
}