const RegisterVoter = ({ contract, account, onRegistered }) => {
  const registerVoter = async () => {
    try {
      const tx = await contract.registerVoter();
      await tx.wait();
      alert('Registered successfully!');
      onRegistered();
    } catch (error) {
      console.error('Error registering:', error);
      alert('Registration failed');
    }
  };

  return <button onClick={registerVoter}>Register as Voter</button>;
};

export default RegisterVoter;