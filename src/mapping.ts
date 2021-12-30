import { BigInt } from "@graphprotocol/graph-ts"
import {
  Tesra,
  FrozenFunds,
  Transfer,
  Approval,
  Burn
} from "../generated/Tesra/Tesra"
import { ExampleEntity, AccountAction } from "../generated/schema"

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
  let entity0_id = event.params.to.toHex()
  let entity1_id = event.transaction.from.toHex()
  let time = event.block.timestamp
  let entity0 = AccountAction.load(entity0_id)
  let entity1 = AccountAction.load(entity1_id)
  if (!entity0) {
    entity0 = new AccountAction(entity0_id)
    entity0.inCount = BigInt.fromI32(0)
    entity0.outCount = BigInt.fromI32(0)
    entity0.balance = BigInt.fromI64(0)
  }
  if (!entity1) {
    entity1 = new AccountAction(entity1_id)
    entity1.inCount = BigInt.fromI32(0)
    entity1.outCount = BigInt.fromI32(0)
    entity1.balance = BigInt.fromI64(1000000000000000)
  }

  entity0.inCount = entity0.inCount.plus(BigInt.fromI32(1))
  entity0.inUpdateTime = time
  entity0.timestamp = time
  entity0.handleType = true

  entity1.outCount = entity1.outCount.plus(BigInt.fromI32(1))
  entity1.outUpdateTime = time
  entity1.timestamp = time
  entity1.handleType = true

  if(entity0.id != entity1.id){
    entity0.balance = entity0.balance.plus(event.params.value)
    entity1.balance = entity1.balance.minus(event.params.value)
  }

  entity0.save()
  entity1.save()

}

export function handleApproval(event: Approval): void {}

export function handleBurn(event: Burn): void {
  let entity1_id = event.transaction.from.toHex()
  let entity1 = AccountAction.load(entity1_id)
  if (!entity1) {
    entity1 = new AccountAction(entity1_id)
  }
  entity1.timestamp = event.block.timestamp
  entity1.handleType = false
  entity1.balance = entity1.balance.minus(event.params.value)
  entity1.save()
}
