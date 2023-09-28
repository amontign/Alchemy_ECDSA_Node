const { keccak256 } = require('ethereum-cryptography/keccak');
const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const { utf8ToBytes } = require('ethereum-cryptography/utils');
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "032cc694248e9e74d4eccb581d256d4c165309ea5d63c8cffd34b3bb087e99a050": 100,
  "0278271a2d08d5eee0b106082e7d50998ee63e8177c202eed73e80c17bd8c3b9b5": 50,
  "0224e4b22b4ca17a59e1951196923e9e39127bd1f098326b04f0bdfa328ae1f145": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.post("/send", (req, res) => {
  const { sender, signature, recipient, amount, nonce } = req.body;

  const message = {
    nonce: nonce,
    to: recipient,
    amount: amount,
  }

  const signatureObject = JSON.parse(signature);

  const recoveredSignature = {
    r: BigInt(signatureObject.r),
    s: BigInt(signatureObject.s),
    recovery: parseInt(signatureObject.recovery),
  };

  const messageHash = keccak256(utf8ToBytes(JSON.stringify(message)));
  const isSigned = secp256k1.verify(recoveredSignature, messageHash, sender);
  console.log(isSigned);
  if (isSigned) {
    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } else {
    res.status(400).send({ message: "Signature verification failed!" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
