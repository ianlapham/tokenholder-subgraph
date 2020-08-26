import fs from 'fs'
import yaml from 'js-yaml'

const TOKENS = [
  { address: '0x56687cf29ac9751ce2a4e764680b6ad7e668942e', startBlock: 9482300 },
  {
    address: '0xa19a40fbd7375431fab013a4b08f00871b9a2791',
    startBlock: 9437878
  }
]

const formattedTokens = []
TOKENS.map(token => {
  formattedTokens.push({
    kind: 'ethereum/contract',
    name: 'Factory' + token.address,
    network: 'mainnet',
    source: {
      address: token.address,
      abi: 'ERC20',
      startBlock: token.startBlock
    },
    mapping: {
      kind: 'ethereum/events',
      apiVersion: '0.0.3',
      language: 'wasm/assemblyscript',
      file: './src/mappings/index.ts',
      entities: ['Token'],
      abis: [{ name: 'ERC20', file: './abis/ERC20.json' }],
      eventHandlers: [{ event: 'Transfer(indexed address,indexed address,uint256)', handler: 'handleTransfer' }]
    }
  })
})

const data = {
  specVersion: '0.0.2',
  description: 'Uniswap is a decentralized protocol for automated token exchange on Ethereum.',
  repository: 'https://github.com/ianlapham/tokenholder-subgraph',
  schema: {
    file: './schema.graphql'
  },
  dataSources: [...formattedTokens]
}

const yamlStr = yaml.safeDump(data)
fs.writeFileSync('subgraph.yaml', yamlStr, 'utf8')
