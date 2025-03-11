const PhaseControl = ({ contract, phase, setPhase, onFinalize }) => {
  const startVotingPhase = async () => {
    try {
      const tx = await contract.startVotingPhase();
      await tx.wait();
      setPhase(1);
      alert('Voting phase started!');
    } catch (error) {
      console.error('Error starting voting phase:', error);
    }
  };

  const finalizeElection = async () => {
    try {
      const tx = await contract.finalizeElection();
      await tx.wait();
      setPhase(2);
      onFinalize();
      alert('Election finalized!');
    } catch (error) {
      console.error('Error finalizing election:', error);
    }
  };

  return (
    <div>
      {phase === 0 && <button onClick={startVotingPhase}>Start Voting Phase</button>}
      {phase === 1 && <button onClick={finalizeElection}>Finalize Election</button>}
    </div>
  );
};

export default PhaseControl;