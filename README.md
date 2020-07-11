# PayID-Sign

  

## What?

A small informal extension to the PayID specification that allows for a BTC, ETH or XRPL address to sign its own PayID, such that additional PKI is not required to verify the PayID.  

## Why?

PayID suffers from a DDoS attack vector. A sufficiently resourced adversary could prevent anyone looking up the PayID of a targeted company or user via persistent layer 7 resource exhaustion. Delivering PayID over DNS is therefore desirable but lacks the PKI provided with HTTPS. However signing the PayID with the public key of the crypto address solves this issue.
  
## How?
Step één:
```bash
npm install payid-sign
```
Step twee:
```javascript
const ps = require('payid-sign')
payload = ps.create_signed_payid( 'me$numbergoup.com', 'xrpl', 'mainnet', 'shEwq87XFGZnFm6qiNdjuhRx44ELZ' )
console.log(payload)
verified = ps.verify_signed_payid( 'me$numbergoup.com', payload )
console.log(verified) 
```
