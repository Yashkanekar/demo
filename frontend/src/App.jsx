import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Poll from '../../build/contracts/Poll.json';

function App() {
  const [web3, setWeb3] = useState(null);
  const [pollContract, setPollContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOpen, setPollOpen] = useState(false);
  const [yesVotes, setYesVotes] = useState(0);
  const [noVotes, setNoVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function connectToBlockchain() {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3 = new Web3(window.ethereum);
          setWeb3(web3);
        } catch (error) {
          console.error(error);
        }
      }
    }

    connectToBlockchain();
  }, []);

  useEffect(() => {
    async function loadAccounts() {
      if (web3) {
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
      }
    }

    loadAccounts();
  }, [web3]);

  useEffect(() => {
    async function loadPollContract() {
      if (web3) {
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = Poll.networks[networkId];
        const contract = new web3.eth.Contract(
          Poll.abi,
          deployedNetwork && deployedNetwork.address,
        );
        setPollContract(contract);
      }
    }

    loadPollContract();
  }, [web3]);

  useEffect(() => {
    async function loadPollStatus() {
      if (pollContract) {
        const pollOpen = await pollContract.methods.pollOpen().call();
        setPollOpen(pollOpen);
        const yesVotes = await pollContract.methods.yesVotes().call();
        setYesVotes(yesVotes);
        const noVotes = await pollContract.methods.noVotes().call();
        setNoVotes(noVotes);
      }
    }

    loadPollStatus();
  }, [pollContract]);

  useEffect(() => {
    async function checkHasVoted() {
      if (pollContract && pollOpen) {
        try {
          const hasVoted = await pollContract.methods.hasVoted(accounts[0]).call();
          setHasVoted(hasVoted);
        } catch (error) {
          console.error(error);
        }
      }
    }

    checkHasVoted();
    const interval = setInterval(() => {
      checkHasVoted();
    }, 1000);
    return () => clearInterval(interval);
  }, [pollContract, pollOpen, accounts]);

  async function createPoll() {
    setLoading(true);
    try {
      await pollContract.methods.createPoll(pollQuestion).send({ from: accounts[0] });
      setPollOpen(true);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  async function vote(choice) {
    setLoading(true);
  
    try {
      const accounts = await web3.eth.getAccounts();
      const pollContract = new web3.eth.Contract(Poll.abi, "0x37504964A0cb4fE928E9498CC6f30932C9cC3E1c");
      const method = choice ? pollContract.methods.voteYes() : pollContract.methods.voteNo();
      await method.send({ from: accounts[0] });
      const [yes, no] = await Promise.all([
        pollContract.methods.yesVotes().call(),
        pollContract.methods.noVotes().call(),
      ]);
      setYesVotes(parseInt(yes));
      setNoVotes(parseInt(no));
      setHasVoted(true);
    } catch (error) {
      console.error(error);
    }
  
    setLoading(false);
  }
  
  return (
    <div>
      <h1>React Poll DApp</h1>
      <div>
        <label htmlFor="poll-question">Poll Question: </label>
        <input type="text" id="poll-question" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} />
      </div>
      <button onClick={createPoll} disabled={!web3 || loading}>Create Poll</button>
      {pollOpen ? (
        <div>
          <h2>{pollQuestion}</h2>
          <div>
            <button onClick={() => vote(true)} disabled={!web3 || loading || hasVoted}>Yes</button>
            <button onClick={() => vote(false)} disabled={!web3 || loading || hasVoted}>No</button>
          </div>
          <p>Yes Votes: {yesVotes}</p>
          <p>No Votes: {noVotes}</p>
        </div>
      ) : (
        <p>No active polls</p>
      )}
    </div>
  );
}
export default App