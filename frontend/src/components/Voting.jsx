import { useState, useEffect } from 'react';
import ConnectWallet from './ConnectWallet';
import RegisterVoter from './RegisterVoter';
import CandidateList from './CandidateList';
import PhaseControl from './PhaseControl';
import { getContract, loadCandidates, checkVoterStatus } from '../utils/contract';

const Voting = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [phase, setPhase] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [voterStatus, setVoterStatus] = useState({ registered: false, voted: false });

  const handleConnect = async (provider, signer, account) => {
    setProvider(provider);
    setSigner(signer);
    setAccount(account);

    const contractInstance = getContract(signer);
    setContract(contractInstance);

    const owner = await contractInstance.owner();
    setIsOwner(account.toLowerCase() === owner.toLowerCase());

    const currentPhase = await contractInstance.phase();
    setPhase(Number(currentPhase));

    const candidateList = await loadCandidates(contractInstance);
    setCandidates(candidateList);

    const status = await checkVoterStatus(contractInstance, account);
    setVoterStatus(status);

    console.log('Account:', account);
    console.log('Phase:', Number(currentPhase));
    console.log('Candidates:', candidateList);
    console.log('Voter Status:', status);
  };
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          const newAccount = accounts[0];
          setAccount(newAccount);
          if (contract) {
            checkVoterStatus(contract, newAccount).then((status) => {
              setVoterStatus(status);
              console.log('Updated voter status for new account:', status);
            });
          }
        } else {
          setAccount('');
          setVoterStatus({ registered: false, voted: false });
        }
      });
    }
  }, [contract]);

  const handleRegistered = async () => {
    const status = await checkVoterStatus(contract, account);
    setVoterStatus(status);
  };

  const handleVoteCast = async () => {
    const candidateList = await loadCandidates(contract);
    setCandidates(candidateList);
    const status = await checkVoterStatus(contract, account);
    setVoterStatus(status);
  };

  const handleFinalize = async () => {
    const candidateList = await loadCandidates(contract);
    setCandidates(candidateList);
  };

  return (
    <div>
      {!account ? (
        <ConnectWallet onConnect={handleConnect} />
      ) : (
        <div>
          <p>Connected Account: {account}</p>
          <p>Phase: {['Registration', 'Voting', 'Finalized'][phase]}</p>

          {phase === 0 && !voterStatus.registered && (
            <RegisterVoter contract={contract} account={account} onRegistered={handleRegistered} />
          )}
          {voterStatus.registered && <p>You are registered!</p>}

          {isOwner && (
            <PhaseControl
              contract={contract}
              phase={phase}
              setPhase={setPhase}
              onFinalize={handleFinalize}
            />
          )}

          {phase === 1 && voterStatus.registered && !voterStatus.voted && (
            <CandidateList
              candidates={candidates}
              contract={contract}
              onVoteCast={handleVoteCast}
            />
          )}

          {phase === 2 && (
            <div>
              <h2>Final Results</h2>
              {candidates.map((candidate) => (
                <p key={candidate.id}>
                  {candidate.name}: {candidate.voteCount} votes
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Voting;