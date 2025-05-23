module.exports = {
  pathPrefix: `/planning-poker`,

  siteMetadata: {
    title: `Planning Poker`,
    description: 'Planning poker',
    author: '@psykzz',
    siteUrl: `https://psykzz.github.io/planning-poker`,
  },

  flags: {
    FAST_DEV: true,
    PARALLEL_SOURCING: true,
  },

  plugins: ['gatsby-plugin-netlify'],
};
