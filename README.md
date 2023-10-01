# ECDSA Node

## Description

Web application that simulates the operation of an ECDSA (Elliptic Curve Digital Signature Algorithm) node for the creation and management of cryptographic transactions. The application consists of a React client for the frontend and a Node.js server for sending information and verifying transactions.

## Features

- Generation of public/private key pairs.
- Encryption of transactions.
- Verification of transaction validity using signatures.

## Installation

To install and use the ECDSA Node, follow the steps below:

```sh
git clone https://github.com/amontign/Alchemy_ECDSA_Node.git
cd Alchemy_ECDSA_Node
```

## Usage

After compiling the project, you can launch the server using:

```sh
cd server
npm install
node index
```

Then you can launch the client using:

```sh
cd client
npm install
node index.js
```

To create public/private key pairs, do:

```sh
cd server
cd scripts
node key-gen.js
```

After this you can replace the public keys in the `server/index.js` file and enjoy the web app !