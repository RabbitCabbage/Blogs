import type { UserConfig } from '~/types'

export const userConfig: Partial<UserConfig> = {
  // Override the default config here
  site: {
    title: 'アンチノミー',
    subtitle: 'Antinomy',
    author: 'Shen, 1024th',
    description: 'Aren\'t learning new things and doing research an antinomy?',
    website: 'https://RabbitCabbage.github.io/Blogs',
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
