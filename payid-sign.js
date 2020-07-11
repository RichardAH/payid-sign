/**
    A small module using the public key of a BTC, ETH or XRP crypto addresses as the basis for verifying a PayID address ... intended for use with PayID over DNS  
    
    Version 1.0
    Author: Richard Holland
    Date: 11 Jul 2020
**/

const address_codec = require('ripple-address-codec')
const secp256k1 = require('secp256k1')
const kp = require('ripple-keypairs')
const btc = require('bitcoinjs-lib');
const eth = require('ethereum-public-key-to-address')
const assert = require('assert')

const fromHexString = hexString => //https://stackoverflow.com/a/50868276
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))

const toHexString = bytes => //https://stackoverflow.com/a/50868276
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')

function address_from_public_key( network, publicKey ) {
    assert(network == 'xrpl' || network == 'xrp' || network == 'btc' || network == 'eth', 'network must be xrpl, btc or eth')
    if (network == 'xrp') network = 'xrpl'
    if (network == 'xrpl') {
        return kp.deriveAddress(publicKey)
    } else if (network == 'btc') {
        return btc.payments.p2pkh({ pubkey: Buffer.from(publicKey, 'hex') }).address;
    } else if (network == 'eth') {
        return eth(publicKey)
    }
}

function create_signed_payid( payid, network, environment, familySeedOrSecp256k1PrivateKey ) {
    assert(network == 'xrpl' || network == 'xrp' || network == 'btc' || network == 'eth', 'network must be xrpl, btc or eth')
    assert(environment == 'testnet' || environment == 'mainnet', 'environment must be testnet or mainnet')
    assert(familySeedOrSecp256k1PrivateKey.slice(0,1) == 's' || familySeedOrSecp256k1PrivateKey.length == 64, 'familySeedOrSecp256k1PrivateKey must be either 64 hex digits or a family seed starting with a lowercase s')
    network = network.toLowerCase()
    environment = environment.toLowerCase()
    if (network == 'xrp') network = 'xrpl'
    var publicKey = null
    var privateKey = familySeedOrSecp256k1PrivateKey
    if (familySeedOrSecp256k1PrivateKey.slice(0,1) == 's') { // if this is an xrpl seed then process using ripple-keypairs
        keys = kp.deriveKeypair(familySeedOrSecp256k1PrivateKey)
        privateKey = keys.privateKey
        publicKey = keys.publicKey
        if (address == null) kp.deriveAddress(publicKey)
    } else {
        publicKey = toHexString(secp256k1.publicKeyCreate(fromHexString(privateKey))).toUpperCase()
    }
    var address = address_from_public_key(network, publicKey) 
    signature = kp.sign(toHexString(address_codec.codec.sha256(payid)), privateKey)
    return '{"paymentNetwork":"'+network+'","environment":"'+environment+'","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"'+address+'"},"signature":"'+signature+'","publicKey":"'+publicKey+'"}';
}

function verify_signed_payid( payid, json ) {
    payload = JSON.parse(json)
    assert('signature' in payload, 'no signature field in supplied payid json')
    assert('addressDetails' in payload && 'address' in payload.addressDetails, 'no addressDetails field present')
    assert('addressDetailsType' in payload && payload.addressDetailsType == 'CryptoAddressDetails', 'addressDetailsType wrong or missing, should be CryptoAddressDetails')
    assert('publicKey' in payload, 'publicKey field not present')
    assert('paymentNetwork' in payload &&  ( payload.paymentNetwork == 'xrpl' || payload.paymentNetwork == 'xrp' || payload.paymentNetwork == 'btc' || payload.paymentNetwork == 'eth' ), 'unknown payment network specified, should be xrpl, btc or eth')
    address = address_from_public_key( payload.paymentNetwork, payload.publicKey )
    assert(address == payload.addressDetails.address, "address derived from public key does not match address in json payload")
    // execution to here means we can do the verifcation
    return kp.verify( toHexString(address_codec.codec.sha256(payid)), payload.signature, payload.publicKey )
}

module.exports = {
    verify_signed_payid: verify_signed_payid,
    create_signed_payid: create_signed_payid
}
