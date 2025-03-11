import * as ethers from 'ethers'; 

const ConnectWallet = ({ onConnect }) => {
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      console.error('MetaMask not detected');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Accounts retrieved:', accounts);

      const provider = new ethers.providers.Web3Provider(window.ethereum); // Giữ nguyên
      const signer = provider.getSigner();
      const account = accounts[0];

      console.log('Connected account:', account);
      onConnect(provider, signer, account);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error.message);
      if (error.code === 4001) {
        alert('You rejected the connection request in MetaMask.');
      } else {
        alert('Failed to connect wallet: ' + error.message);
      }
    }
  };

  return <button onClick={connectWallet}>Connect Wallet</button>;
};

export default ConnectWallet;