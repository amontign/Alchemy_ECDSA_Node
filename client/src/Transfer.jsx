import { useState } from "react";
import server from "./server";
import { keccak256 } from 'ethereum-cryptography/keccak';
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { utf8ToBytes } from "ethereum-cryptography/utils";

function Transfer({ privateKey, setBalance, address }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [nonce, setNonce] = useState(0);

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    
    const message = {
      nonce: nonce,
      to: recipient,
      amount: parseInt(sendAmount),
    }

    const hashedMessage = keccak256(utf8ToBytes(JSON.stringify(message)));
    const signature = secp256k1.sign(hashedMessage, privateKey);

    const signatureObject = {
      r: signature.r.toString(),
      s: signature.s.toString(),
      recovery: signature.recovery.toString(),
    };

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        signature: JSON.stringify(signatureObject),
        amount: parseInt(sendAmount),
        recipient: recipient,
        nonce: nonce,
      });
      setBalance(balance);
      setNonce(nonce + 1);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>💸 Send Transaction</h1>

      <label>
        🧾 Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        📭 Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
