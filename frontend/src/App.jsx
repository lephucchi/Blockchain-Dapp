import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContract, loadCandidates, checkVoterStatus } from './utils/contract';
import './app.css';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [voterStatus, setVoterStatus] = useState({ registered: false, voted: false });
  const [voterName, setVoterName] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [account, setAccount] = useState(null);
  const [topCandidates, setTopCandidates] = useState([]);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateImageUrl, setNewCandidateImageUrl] = useState('');
  const [renameVoterAddress, setRenameVoterAddress] = useState('');
  const [renameVoterNewName, setRenameVoterNewName] = useState('');
  const [removeCandidateId, setRemoveCandidateId] = useState('');
  const [removeVoterAddress, setRemoveVoterAddress] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [voterList, setVoterList] = useState([]);

  const adminAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  useEffect(() => {
    async function fetchData() {
      if (account) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = getContract(signer);
        const candidates = await loadCandidates(contract);
        setCandidates(candidates);
        const status = await checkVoterStatus(contract, account);
        setVoterStatus(status);
      }
    }
    fetchData();
  }, [account]);

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } else {
      alert('Please install MetaMask!');
    }
  };

  const registerVoter = async () => {
    if (voterName) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.registerVoter(voterName);
      await tx.wait();
      const status = await checkVoterStatus(contract, account);
      setVoterStatus(status);
    }
  };

  const finalizeElection = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = getContract(signer);
    const tx = await contract.finalizeElection();
    await tx.wait();
    const candidates = await loadCandidates(contract);
    const sortedCandidates = candidates.sort((a, b) => b.voteCount - a.voteCount).slice(0, 10);
    setTopCandidates(sortedCandidates);
  };

  const castVote = async () => {
    if (selectedCandidate !== null) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.vote(selectedCandidate);
      await tx.wait();
      const status = await checkVoterStatus(contract, account);
      setVoterStatus(status);
    } else {
      alert('Please select a candidate to vote for.');
    }
  };

  const addCandidate = async () => {
    if (newCandidateName && newCandidateImageUrl) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.addCandidate(newCandidateName, newCandidateImageUrl);
      await tx.wait();
      const candidates = await loadCandidates(contract);
      setCandidates(candidates);
    }
  };

  const renameVoter = async () => {
    if (renameVoterAddress && renameVoterNewName) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.renameVoter(renameVoterAddress, renameVoterNewName);
      await tx.wait();
    }
  };

  const removeCandidate = async () => {
    if (removeCandidateId) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.removeCandidate(removeCandidateId);
      await tx.wait();
      const candidates = await loadCandidates(contract);
      setCandidates(candidates);
    }
  };

  const removeVoter = async () => {
    if (removeVoterAddress) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.removeVoter(removeVoterAddress);
      await tx.wait();
    }
  };

  const checkAdminPassword = () => {
    if (adminPassword === '123456') {
      setIsAdmin(true);
    } else {
      alert('Incorrect password');
    }
  };

  const loadVoterList = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = getContract(signer);
    const [voterAddresses, votes] = await contract.getVoterList();
    const voterList = voterAddresses.map((address, index) => ({
      address,
      vote: votes[index]
    }));
    setVoterList(voterList);
  };

  return (
    <div className="App">
      <h1>Simple Voting DApp</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected account: {account}</p>
          {!voterStatus.registered ? (
            <div>
              <input
                type="text"
                placeholder="Enter your name"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
              />
              <button onClick={registerVoter}>Register as Voter</button>
            </div>
          ) : voterStatus.voted ? (
            <p>You have already voted.</p>
          ) : (
            <div>
              <h2>Candidates</h2>
              <ul className="candidate-list">
                {candidates.map((candidate) => (
                  <li key={candidate.id} className="candidate-item">
                    <p>{candidate.name} - {candidate.voteCount || 0} votes</p>
                    <button onClick={() => setSelectedCandidate(candidate.id)}>Vote</button>
                  </li>
                ))}
              </ul>
              <button onClick={castVote} disabled={selectedCandidate === null}>
                Cast Vote
              </button>
            </div>
          )}
          <div className="admin-panel">
            <h2>Admin Panel</h2>
            <div>
              <input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              <button onClick={checkAdminPassword}>Submit</button>
            </div>
            {isAdmin && (
              <>
                <div>
                  <input
                    type="text"
                    placeholder="Candidate Name"
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Candidate Image URL"
                    value={newCandidateImageUrl}
                    onChange={(e) => setNewCandidateImageUrl(e.target.value)}
                  />
                  <button onClick={addCandidate}>Add Candidate</button>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Voter Address"
                    value={renameVoterAddress}
                    onChange={(e) => setRenameVoterAddress(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="New Voter Name"
                    value={renameVoterNewName}
                    onChange={(e) => setRenameVoterNewName(e.target.value)}
                  />
                  <button onClick={renameVoter}>Rename Voter</button>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Candidate ID"
                    value={removeCandidateId}
                    onChange={(e) => setRemoveCandidateId(e.target.value)}
                  />
                  <button onClick={removeCandidate}>Remove Candidate</button>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Voter Address"
                    value={removeVoterAddress}
                    onChange={(e) => setRemoveVoterAddress(e.target.value)}
                  />
                  <button onClick={removeVoter}>Remove Voter</button>
                </div>
                <button onClick={finalizeElection}>Finalize Election</button>
                <button onClick={loadVoterList}>Load Voter List</button>
                <div className="voter-list">
                  <h2>Voter List</h2>
                  <ul>
                    {voterList.map((voter, index) => (
                      <li key={index}>
                        {voter.address} voted for candidate ID: {voter.vote}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
          <div className="candidate-list">
            <h2>Candidates</h2>
            <ul>
              {candidates.map((candidate) => (
                <li key={candidate.id}>
                  {candidate.name} - {candidate.voteCount} votes
                </li>
              ))}
            </ul>
          </div>
          {topCandidates.length > 0 && (
            <div className="results">
              <h2>Top 10 Candidates</h2>
              <ul>
                {topCandidates.map((candidate) => (
                  <li key={candidate.id}>
                    {candidate.name} - {candidate.voteCount} votes
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;