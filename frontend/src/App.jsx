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
  const [newCandidateInfo, setNewCandidateInfo] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [voterList, setVoterList] = useState([]);
  const [votedCandidate, setVotedCandidate] = useState(null);
  const [electionFinalized, setElectionFinalized] = useState(false);

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
        const [voterAddresses, votes] = await contract.getVoterList();
        const voterList = voterAddresses.map((address, index) => ({
          address,
          vote: votes[index]
        }));
        setVoterList(voterList);
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
    const sortedCandidates = candidates.sort((a, b) => b.voteCount - a.voteCount).slice(0, 4);
    setTopCandidates(sortedCandidates);
    setElectionFinalized(true);
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
      setVotedCandidate(candidates.find(candidate => candidate.id === selectedCandidate));
      const updatedCandidates = await loadCandidates(contract);
      setCandidates(updatedCandidates);
    } else {
      alert('Please select a candidate to vote for.');
    }
  };

  const addCandidate = async () => {
    if (newCandidateName && newCandidateInfo) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.addCandidate(newCandidateName, newCandidateInfo);
      await tx.wait();
      const candidates = await loadCandidates(contract);
      setCandidates(candidates);
    }
  };

  const checkAdminPassword = () => {
    if (adminPassword === '123456') {
      setIsAdmin(true);
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <div className="App">
      <h1>Simple Voting DApp</h1>
      {!account ? (
        <button onClick={connectWallet} disabled={electionFinalized}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected account: {account}</p>
          {!voterStatus.registered && !electionFinalized ? (
            <div>
              <input
                type="text"
                placeholder="Enter your name"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
              />
              <button onClick={registerVoter}>Register as Voter</button>
            </div>
          ) : (
            <div>
              <h2>Candidates</h2>
              <div className="candidate-grid">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="candidate-box">
                    <h3>{candidate.name}</h3>
                    <p>{candidate.voteCount || 0} votes</p>
                    <p className="candidate_info">{candidate.info}</p>
                    {!voterStatus.voted && !electionFinalized && (
                      <button onClick={() => setSelectedCandidate(candidate.id)}>Vote</button>
                    )}
                  </div>
                ))}
              </div>
              {!voterStatus.voted && !electionFinalized ? (
                <button onClick={castVote} disabled={selectedCandidate === null}>
                  Cast Vote
                </button>
              ) : (
                <p>You have already voted for {votedCandidate ? votedCandidate.name : 'a candidate'}.</p>
              )}
            </div>
          )}
          {electionFinalized && (
            <div className="results">
              <h2>Top 4 Candidates</h2>
              <div className="candidate-grid">
                {topCandidates.map((candidate) => (
                  <div key={candidate.id} className="candidate-box">
                    <h3>{candidate.name}</h3>
                    <p>{candidate.voteCount} votes</p>
                    <p className="candidate_info">{candidate.info}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!electionFinalized && (
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
                      placeholder="Candidate Information"
                      value={newCandidateInfo}
                      onChange={(e) => setNewCandidateInfo(e.target.value)}
                    />
                    <button onClick={addCandidate}>Add Candidate</button>
                  </div>
                  <div className="candidate-list-2">
                    <h2>Candidates</h2>
                    <div className="candidate-grid">
                      {candidates.map((candidate) => (
                        <div key={candidate.id} className="candidate-box">
                          <h3>{candidate.name}</h3>
                          <p>{candidate.voteCount} votes</p>
                          <p className="candidate_info">{candidate.info}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={finalizeElection}>Finalize Election</button>
                </>
              )}
            </div>
          )}
          {!electionFinalized && (
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
          )}
        </div>
      )}
    </div>
  );
}

export default App;