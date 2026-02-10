import type { UserConfig } from '~/types'

export const userConfig: Partial<UserConfig> = {
  // Override the default config here
  site: {
    title: '二律背反',
    subtitle: 'Antinomy',
    author: 'Shen Dong',
    description: 'Rediscory the beauty of typography',
    website: 'https://RabbitCabbage.github.io/',
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
