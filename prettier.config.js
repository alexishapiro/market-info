/** @type {import('prettier').Config} */
const config = {
    plugins: ["prettier-plugin-tailwindcss"],
    tailwindConfig: "./tailwind.config.js",
    tailwindcss: {
      config: "./tailwind.config.js",
    },
  };
  
  export default config;