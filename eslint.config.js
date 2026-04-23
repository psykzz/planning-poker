import nextConfig from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      // These are valid "fetch-on-mount" patterns — async helpers called from
      // useEffect that ultimately call setState. The new rule is too strict here.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default eslintConfig;
