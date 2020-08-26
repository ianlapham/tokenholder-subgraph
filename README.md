# Token Holder Subgraph

#### What

Tracks token holders and their balances across a list of ERC20 tokens. Only tokens that
meet the ERC20 standard will work.

#### List?

The list is stored as TOKENS in `generateYaml.js`. Each token must specify the token address
and the block the contract was created at.

#### How to build?

`yarn install`

`node generateYaml.js`

This will create the subgraph.yaml file based on token list in `generateYaml.js`
