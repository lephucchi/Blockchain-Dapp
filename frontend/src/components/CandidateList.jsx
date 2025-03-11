const CandidateList = ({ candidates, contract, onVoteCast }) => {
  const castVote = async (candidateId) => {
    try {
      const tx = await contract.vote(candidateId);
      await tx.wait();
      alert('Vote cast successfully!');
      onVoteCast();
    } catch (error) {
      console.error('Error voting:', error);
      alert('Voting failed');
    }
  };

  return (
    <div>
      <h2>Candidates</h2>
      {candidates.map((candidate) => (
        <div key={candidate.id}>
          <p>{candidate.name} - Votes: {candidate.voteCount}</p>
          <button onClick={() => castVote(candidate.id)}>Vote</button>
        </div>
      ))}
    </div>
  );
};

export default CandidateList;