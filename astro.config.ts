import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import swup from '@swup/astro'
import robotsTxt from 'astro-robots-txt'
import { defineConfig } from 'astro/config'
import rehypeKatex from 'rehype-katex'
import { remarkMark } from 'remark-mark-highlight'
import remarkMath from 'remark-math'
import UnoCSS from 'unocss/astro'
import devtoolsJson from 'vite-plugin-devtools-json'
import { themeConfig } from './src/.config'

// https://astro.build/config
export default defineConfig({
  site: themeConfig.site.website,
  prefetch: true,
  base: '/Blogs',
  vite: {
    plugins: [
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      devtoolsJson(),
    ],
  },
  markdown: {
    remarkPlugins: [
      remarkMath,
      remarkMark,
    ],
    rehypePlugins: [
      rehypeKatex,
    ],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
    },
  },
  integrations: [
    UnoCSS({ injectReset: true }),
    mdx({}),
    robotsTxt(),
    sitemap(),
    swup({
      containers: ['main', '#page-sidebar'],
      theme: false,
      animationClass: 'transition-swup-',
      cache: true,
      preload: true,
      accessibility: true,
      smoothScrolling: false,
      updateHead: true,
      updateBodyClass: true,
    }),
  ],
})
