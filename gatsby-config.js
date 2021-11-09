module.exports = {
  pathPrefix: `/planning-poker`,

  siteMetadata: {
    title: `Planning Poker`,
    description: 'Planning poker',
    author: '@psykzz',
    siteUrl: `https://psykzz.github.io/planning-poker`,
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-nprogress',
    'gatsby-plugin-sitemap',
    'gatsby-plugin-robots-txt',
  ],
};
