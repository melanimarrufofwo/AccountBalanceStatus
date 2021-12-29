import { BigInt } from "@graphprotocol/graph-ts"
import {
  Tesra,
  FrozenFunds,
  Transfer,
  Approval,
  Burn
} from "../generated/Tesra/Tesra"
import { ExampleEntity, AccountAction, AccountBalance } from "../generated/schema"

export function handleFrozenFunds(event: FrozenFunds): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count.plus(BigInt.fromI32(1))

  // Entity fields can be set based on event parameters
  entity.target = event.params.target
  entity.frozen = event.params.frozen

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.name(...)
  // - contract.approve(...)
  // - contract.totalSupply(...)
  // - contract.transferFrom(...)
  // - contract.decimals(...)
  // - contract.burn(...)
  // - contract.sellPrice(...)
  // - contract.balanceOf(...)
  // - contract.burnFrom(...)
  // - contract.buyPrice(...)
  // - contract.owner(...)
  // - contract.symbol(...)
  // - contract.transfer(...)
  // - contract.frozenAccount(...)
  // - contract.approveAndCall(...)
  // - contract.allowance(...)
}

export function handleTransfer(event: Transfer): void {
  let account0 = AccountBalance.load(event.params.to.toHex())
  let account1 = AccountBalance.load(event.transaction.from.toHex())

    if (!account0) {
      account0 = new AccountBalance(event.params.to.toHex())
      account0.balance = BigInt.fromI32(0)
    }
    if (!account1) {
      account1 = new AccountBalance(event.transaction.from.toHex())
      account1.balance = BigInt.fromI32(0)
    }
  if(event.params.to.toHex() != event.transaction.from.toHex()){
    account0.balance = account0.balance.plus(event.params.value)
    account1.balance = account1.balance.minus(event.params.value)
    account0.save()
    account1.save()
  }
  let entity0 = AccountAction.load(event.params.to.toHex()+"0")
  let entity1 = AccountAction.load(event.transaction.from.toHex()+"1")
  if (!entity0) {
    entity0 = new AccountAction(event.params.to.toHex()+"0")
    entity0.count = BigInt.fromI32(0)
  }
  if (!entity1) {
    entity1 = new AccountAction(event.transaction.from.toHex()+"1")
    entity1.count = BigInt.fromI32(0)
  }
  entity0.address = event.params.to.toHex()
  entity0.count = entity0.count.plus(BigInt.fromI32(1))
  entity0.inOrOut = false
  entity0.timestamp = event.block.timestamp
  entity0.balance = account0.balance
  entity0.save()

  entity1.address = event.transaction.from.toHex()
  entity1.count = entity1.count.plus(BigInt.fromI32(1))
  entity1.inOrOut = true
  entity1.timestamp = event.block.timestamp
  entity1.balance = account1.balance
  entity1.save()

}

export function handleApproval(event: Approval): void {}

export function handleBurn(event: Burn): void {}
