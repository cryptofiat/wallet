import eth from 'ethereumjs-util';
import crypto from 'crypto';
import AES from 'crypto-js/aes';
import CryptoJS from 'crypto-js';

export class Application {

    constructor() {
         var _secretChallenge = "QUICKBROWNMOOSEJUMPEDOVERTHEFENCEANDBROKEHERLEG"; //some random text would
         var _storage;
         var _secret;
    }

    attachStorage(storage) {
         this._storage = storage;
         return this;
    }
    hasAddresses() {
         //mock
         //let _keys = this._storage.getItem("keys");
         //if(sizeof(_keys) > 0) return true else return false;
         return true;
    }
    
    keys() {
         //mock
         //if(sizeof(_keys) > 0) return true else return false;

         // returns array?
         if (!this.isUnlocked()) { return false };

         let _enckeys = JSON.parse(this._storage.getItem("keys"));
         let _openkeys = _enckeys.map( (k) => {
	    return eth.toBuffer("0x"+AES.decrypt(k,this._secret).toString(CryptoJS.enc.Utf8));
         })
         return _openkeys;
    }

    addresses() {
         let _keys = this.keys();
         console.log("keys: ", _keys);
         let _addr = _keys.map( function(k) {
            return eth.bufferToHex(pubToAddress(privateToPublic(k)));
         })
         return _addr;
    }

    storeNewKey(newKeyHex) {
	// if newKeyHex is applied, then it is added, otherwise new key generated

	if (!this.isUnlocked()) { return false; }
        let keysArray = JSON.parse(this._storage.getItem("keys"));
	let newPriv;
        if (newKeyHex) {
            newPriv=eth.toBuffer(newKeyHex);
        } else {
            newPriv = generatePrivate();
        }
	console.log("key: ",newPriv);
        if (!keysArray) { keysArray = []; }

        let encryptedKey = AES.encrypt(newPriv.toString("hex"),this._secret);
        keysArray.push(encryptedKey.toString());
        console.log("printkeys:",keysArray);
        this._storage.setItem("keys", JSON.stringify(keysArray));
	return pubToAddress(privateToPublic(newPriv));
    }

    isUnlocked() {
         if (this._secret) { return true } else {return false }; // boolean
    }

    unlock(secret) {
         if (AES.decrypt(this._storage.getItem("encryptedChallenge"),secret) == this._secretChallenge) { 
             this._secret = secret;
             return true; 
         }
         return false;
    }

    initLocalStorage(secret) {
        this._secret = secret;
        this._storage.setItem("encryptedChallenge", AES.encrypt(this._secretChallenge, this._secret));
    }

    send(toIdCode,amount) {

        //call id.euro2.ee/v1/get/toIDCode to get 38008030201

        //figure out which address has enough balance to send from

        //call wallet.euro2.ee:8080/vi/get/delegateNonce for the address

        //sign with the key relating to the address

        //send to wallet.euro2.ee

    }


    balanceOfAddress(address) {
        //ask balance from wallet
        return 155.22
    }

    isAddressApproved(address) {

	//ask that from wallete
	return true;
    }

    balances() {

        let _addresses = this.addresses();
        
	let address_data = _addresses.reduce( (prev,curr) => {
            prev[curr] = {"balance":this.balanceOfAddress(curr),"approved":this.isAddressApproved(curr)}
	    return prev;
        }, {} );
        return address_data;
    }

    importKey(keyHex) {

        //TODO:should check if it is valid hex with 0x

        keyHex
    }

}

export function generatePrivate() {
    let buf;
    do buf = crypto.randomBytes(32); while (!eth.isValidPrivate(buf));
    return buf;
}

export function privateToPublic(privateKey) {
    return eth.privateToPublic(privateKey)
}

export function pubToAddress(publicKey) {
    return eth.pubToAddress(publicKey)
}

/*mock*/
export function balanceMock() {
    return 123.45;
}

export function identityCodeMock() {
    return 38008030123;
}

/*let privateKey = _generatePrivate();
 let publicKey = _privateToPublic(privateKey);
 let addr = _pubToAddress(publicKey);

 document.querySelector('body').innerHTML = addr.toString("hex");*/

var app = new Application();
app.attachStorage(window.localStorage);
app.initLocalStorage("mypass");
console.log(app.isUnlocked());

/*

var trialkey = generatePrivate();
console.log("trialkey: ", trialkey);
console.log("trialkey-hex: ", trialkey.toString("hex"));

var testcrypt = AES.encrypt(trialkey.toString("hex"),"mypass").toString();
console.log("testcrypt: ", testcrypt);

var decrypted = AES.decrypt(testcrypt,"mypass").toString(CryptoJS.enc.Utf8);
console.log("decrypted ",decrypted);
console.log(parseInt(decrypted,16));
console.log(decrypted.toString(16));
console.log(eth.toBuffer("0x"+decrypted));

//console.log(AES.decrypt(testcrypt,"mypass").toString(CryptoJS.enc.Utf8));
*/

var addr = app.storeNewKey();
app.storeNewKey("0x0faf1af8b4cbeadb3b8fc2c2dfa2e3642575cd0c166cda731738227371768595");
var addrs = app.addresses();
console.log(addrs);
console.log(app.balances());
document.querySelector('body').innerHTML = addr.toString("hex");
