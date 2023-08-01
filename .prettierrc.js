module.exports = {
  printWidth: 80,
  trailingComma: "es5",
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  plugins: [require.resolve("@trivago/prettier-plugin-sort-imports")],
  importOrder: ["^@graphprotocol/(.*)$", "^@treasure/(.*)$", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
