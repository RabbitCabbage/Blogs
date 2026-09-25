import type { UserConfig } from '~/types'

export const userConfig: Partial<UserConfig> = {
  // Override the default config here
  site: {
    title: 'アンチノミー',
    subtitle: 'Antinomy',
    author: 'Shen, 1024th',
    description: 'Aren\'t learning new things and doing research an antinomy?',
    website: 'https://RabbitCabbage.github.io/Blogs',
    footer: [
      '© %year <a target="_blank" rel="noopener noreferrer" href="https://rabbitcabbage.github.io/RabbitCabbage">Shen</a>, <a target="_blank" rel="noopener noreferrer" href="https://1024th.top/">1024th</a>',
      'Theme <a target="_blank" href="https://github.com/Moeyua/astro-theme-typography">Typography</a> by <a target="_blank" href="https://moeyua.com">Moeyua</a>',
      'Proudly published with <a target="_blank" href="https://astro.build/">Astro</a>',
    ],
    socialLinks: [
      {
        name: 'github',
        href: 'https://github.com/RabbitCabbage/Blogs',
      },
      {
        name: 'rss',
        href: `${import.meta.env.BASE_URL}/atom.xml`,
      },
    ],
  },
  seo: { twitter: '' },
}
