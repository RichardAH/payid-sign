const ps = require('./payid-sign.js')
const assert = require('assert')

var a = ps.create_signed_payid('test$example.com', 'btc', 'mainnet', 'D5B7E39DB627FD33EE4A86629D189C03FFB10C66E38F6004703234F4B0D0A0B7')
assert( ps.verify_signed_payid('test$example.com', a) )

var b = ps.create_signed_payid('test$example.com', 'xrpl', 'mainnet', 'snq4Gh9VHU9ueWbrwkLuB2BkboJYv')
assert( ps.verify_signed_payid('test$example.com', b ) )
