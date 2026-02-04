import type { UserConfig } from '~/types'

export const userConfig: Partial<UserConfig> = {
  // Override the default config here
  site: {
    title: '活版印字',
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
