# **Simple Voting DApp**  
A decentralized application (DApp) for a simple voting system built on the Ethereum blockchain. It includes a smart contract written in Solidity and a frontend built with React and ethers.js.  

## **Features**  
✅ Register as a voter  
✅ Add candidates  
✅ Vote for candidates  
✅ Admin panel for managing candidates and voters  
✅ Finalize the election and display the top candidates  

---

## **Prerequisites**  
🔹 [Node.js](https://nodejs.org/) and npm  
🔹 [MetaMask](https://metamask.io/) extension for your browser  
🔹 An Ethereum test network (e.g., Rinkeby, Ropsten)  
🔹 Hardhat

---

## **Getting Started**  

### **1️⃣ Smart Contract**  
#### **Install Dependencies**  
```sh
npm install
```

#### **Compile and Deploy the Contract**  
Update the `.env` file with your Ethereum node URL and private key:  
```
ABI="your_ABI"
PRIVATE_KEY="your_private_key"
```

Then, compile and deploy the contract:  
```sh
npx hardhat compile
```

#### **Start the Backend Server**  
```sh
npm install
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

---

### **2️⃣ Frontend**  
#### **Install Dependencies**  
```sh
cd frontend
npm install
```

#### **Start the React App**  
```sh
npm run dev
```

---

## **Project Structure**  
```
.
├── smartcontract
│   ├── contracts
│   │   └── SimpleVoting.sol
│   ├── scripts
│   │   └── deploy.js
│   ├── artifacts
│   ├── node_modules
│   ├── .env
│   ├── hardhat.config.js
│   ├── package.json
│   └── index.js
├── frontend
│   ├── public
│   ├── src
│   │   ├── App.jsx
│   │   ├── app.css
│   │   ├── index.js
│   │   └── utils
│   │       └── contract.js
│   ├── node_modules
│   ├── package.json
│   └── .env
└── README.md
```

---

## **Usage**  

### **🔗 Connect Wallet**  
Open the frontend in your browser and click **"Connect Wallet"** to link your MetaMask wallet.  

### **📝 Register as a Voter**  
Enter your name and click **"Register as Voter"**.  

### **🗳️ Add Candidates (Admin Only)**  
Enter the candidate's **name** and **image URL**, then click **"Add Candidate"**.  

### **✅ Vote for Candidates**  
Select a candidate and click **"Vote"**.  

### **⚙️ Admin Panel**  
- **Start Voting Phase**: Click **"Start Voting Phase"** to begin the voting period.  
- **Finalize Election**: Click **"Finalize Election"** to end the voting and display the results.  
- **Manage Voters**: Admin can rename or remove voters.  

---

## **Smart Contract**  
The smart contract is located in **`SimpleVoting.sol`**. It includes functions for:  
✔ Registering voters  
✔ Adding/removing candidates  
✔ Casting votes  
✔ Finalizing the election  

---

## **Frontend**  
The frontend is built with **React** and **ethers.js**. It includes components for:  
🔹 Connecting to MetaMask  
🔹 Registering voters  
🔹 Adding candidates  
🔹 Casting votes  
🔹 Displaying election results  


---

## **Acknowledgements**  
🚀 Built with:  
- [Ethereum](https://ethereum.org/)  
- [MetaMask](https://metamask.io/)  
- [React](https://reactjs.org/)  
- [ethers.js](https://docs.ethers.org/)
- [hardhat](https://hardhat.org/tutorial)
- [nodejs](https://nodejs.org/docs/latest/api/)
- [solidity](https://soliditylang.org)
