import createDomPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDomPurify(window);

export const sanitize = (input: string) => DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });