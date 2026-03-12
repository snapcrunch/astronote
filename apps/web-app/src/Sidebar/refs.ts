import { createRef } from "react";

export const omnibarRef = createRef<HTMLInputElement>();

/** Populated by useNoteList, consumed by Omnibar for keyboard navigation */
export const omnibarKeyDownHandler: {
  current: ((e: React.KeyboardEvent<HTMLInputElement>) => void) | null;
} = { current: null };
