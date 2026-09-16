// Shared by the review form (browser) and the review Server Action.

export const MAX_REVIEW_PHOTOS = 4;
/** Per photo, after resizing in the browser. Matches the review-images bucket limit. */
export const MAX_REVIEW_PHOTO_BYTES = 2 * 1024 * 1024;
export const REVIEW_PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";
