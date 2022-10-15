module.exports.createPages = async ({ actions }) => {
  actions.createPage({
    component: require.resolve('./src/templates/ssr.jsx'),
    path: '/ssr',
  });
};
