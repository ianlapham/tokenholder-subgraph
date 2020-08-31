/* eslint-disable prefer-const */
import { Transfer } from '../types/Factory0x56687cf29ac9751ce2a4e764680b6ad7e668942e/ERC20'
import { Token, Balance } from '../types/schema'
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

function instantiateBalance(address: Address, token: Token): void {
  let balanceId = address
    .toHexString()
    .concat('-')
    .concat(token.id.toString())
  let balance = Balance.load(balanceId)
  if (balance === null && balance.id !== ADDRESS_ZERO) {
    balance = new Balance(balanceId)
    balance.token = token.id
    balance.user = address
    balance.amount = ZERO_BD
    balance.save()
  }
}

export function handleTransfer(event: Transfer): void {
  // fetch or create the token entity
  instantiateToken(event.address)
  let token = Token.load(event.address.toHexString())

  // ghet the balance id

  // if token is null, dont do anything, it had weird decimals or total supply
  if (token !== null) {
    // get the sender and reciever accounts
    instantiateBalance(event.params.from, token as Token)
    instantiateBalance(event.params.to, token as Token)
    let fromBalance = Balance.load(
      event.params.from
        .toHexString()
        .concat('-')
        .concat(token.id.toString())
    )
    let toBalance = Balance.load(
      event.params.to
        .toHexString()
        .concat('-')
        .concat(token.id.toString())
    )

    // format the amount
    let amount = convertTokenToDecimal(event.params.value, token.decimals)

    // update the balances for the holders (unless its null from 0x00 address)
    if (fromBalance !== null) {
      fromBalance.amount = fromBalance.amount.minus(amount)
    }
    if (toBalance !== null) {
      toBalance.amount = toBalance.amount.plus(amount)
    }

    // save entities
    fromBalance.save()
    toBalance.save()
  }
}
