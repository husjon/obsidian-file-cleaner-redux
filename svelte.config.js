/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    warningFilter: (warning) => {
      // const ignore = [
      //   // list of svelte warnings to ignore
      // ];
      // if (ignore.includes(warning.code)) return false;

      return true;
    },
  },
};

export default config;
