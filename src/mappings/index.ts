/* eslint-disable prefer-const */
import { Transfer } from '../types/Factory0x56687cf29ac9751ce2a4e764680b6ad7e668942e/ERC20'
import { Token, TokenHolder } from '../types/schema'
import { Address } from '@graphprotocol/graph-ts'
import { convertTokenToDecimal, fetchTokenDecimals, fetchTokenTotalSupply, ZERO_BD, ADDRESS_ZERO } from './utils'

function instantiateToken(address: Address): void {
  let token = Token.load(address.toHexString())
  if (token === null) {
    // instantiate the token
    token = new Token(address.toHexString())
    token.totalSupply = fetchTokenTotalSupply(address)
    token.decimals = fetchTokenDecimals(address)
    // ignore tokens with weird decimals or total supplies
    if (token.decimals !== null && token.totalSupply !== null) {
      token.save()
    }
  }
}

function instantiateTokenHolder(address: Address, token: Token): void {
  let tokenHolder = TokenHolder.load(address.toHexString())
  if (tokenHolder === null && tokenHolder.id !== ADDRESS_ZERO) {
    tokenHolder = new TokenHolder(address.toHexString())
    tokenHolder.token = token.id
    tokenHolder.balance = ZERO_BD
    tokenHolder.save()
  }
}

export function handleTransfer(event: Transfer): void {
  // fetch or create the token entity
  instantiateToken(event.address)
  let token = Token.load(event.address.toHexString())

  // if token is null, dont do anything, it had weird decimals or total supply
  if (token !== null) {
    // get the sender and reciever accounts
    instantiateTokenHolder(event.params.from, token as Token)
    instantiateTokenHolder(event.params.to, token as Token)
    let fromHolder = TokenHolder.load(event.params.from.toHexString())
    let toHolder = TokenHolder.load(event.params.to.toHexString())

    // format the amount
    let amount = convertTokenToDecimal(event.params.value, token.decimals)

    // update the balances for the holders (unless its null from 0x00 address)
    if (fromHolder !== null) {
      fromHolder.balance = fromHolder.balance.minus(amount)
    }
    if (toHolder !== null) {
      toHolder.balance = toHolder.balance.plus(amount)
    }

    // save entities
    fromHolder.save()
    toHolder.save()
  }
}
