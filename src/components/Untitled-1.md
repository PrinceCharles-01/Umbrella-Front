
The error occurs because the CSS file is being processed by a tool that does not understand Tailwind's @apply directive; to fix this, you should ensure your build pipeline uses PostCSS with Tailwind, or replace @apply usages with the equivalent CSS.

Au niveau de apply