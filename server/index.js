const { keccak256 } = require('ethereum-cryptography/keccak');
const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const { hexToBytes, utf8ToBytes, toHex } = require('ethereum-cryptography/utils');
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "03c54f8c18a46321587fc0946ae89f220a4b2e31d81029b8729f6592d5ca686708": 100, //a509a3e382dba2ef7fd0a4b783b189747c9621768b97f0d40679a45420cf2030
  "0244666d762019f12345c28333af49b0308cf2c27cca922e31fbb32ab5a962759f": 50, //8633d3a1a9a4bdca39ea6abe2fd70c54811fe3ecd575f2b663619a838038a680
  "037d07594e0d461d93e21abf36a89502809e00059bdf29c04e195fa19e80fab575": 75, //67fb295ce5d69fec7e5d5da354008a90d4693ab9004f99480efdd6c0841c09d4
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

  const recoveredSignature = new secp256k1.Signature(BigInt(signatureObject.r), BigInt(signatureObject.s), parseInt(signatureObject.recovery));

  const messageHash = keccak256(utf8ToBytes(JSON.stringify(message)));
  let trueSender = 0;
  const senderRecover = toHex(recoveredSignature.recoverPublicKey(messageHash).toRawBytes());
  if (sender && senderRecover && sender === senderRecover) {
    trueSender = 1;
  }
  const isSigned = secp256k1.verify(recoveredSignature, messageHash, sender);
  if (isSigned && trueSender) {
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
    res.status(400).send({ message: "Verification failed!" });
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
