require('dotenv').config();
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
app.use(
    fileUpload({
        extended: true
    })
);
app.use(express.static(__dirname));
app.use(express.json());
const path = require("path");
const ethers = require('ethers');

var port = 3000;

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const { abi } = require('./artifacts/contracts/SimpleVoting.sol/SimpleVoting.json');
const provider = new ethers.providers.JsonRpcProvider(API_URL);

const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/addCandidate", async (req, res) => {
    const { name, imageUrl } = req.body;
    try {
        const tx = await contractInstance.addCandidate(name, imageUrl);
        await tx.wait();
        res.send("Candidate added successfully");
    } catch (error) {
        console.error("Error adding candidate", error);
        res.status(500).send("Error adding candidate");
    }
});

app.post("/removeCandidate", async (req, res) => {
    const { candidateId } = req.body;
    try {
        const tx = await contractInstance.removeCandidate(candidateId);
        await tx.wait();
        res.send("Candidate removed successfully");
    } catch (error) {
        console.error("Error removing candidate", error);
        res.status(500).send("Error removing candidate");
    }
});

app.post("/renameVoter", async (req, res) => {
    const { voterAddress, newName } = req.body;
    try {
        const tx = await contractInstance.renameVoter(voterAddress, newName);
        await tx.wait();
        res.send("Voter renamed successfully");
    } catch (error) {
        console.error("Error renaming voter", error);
        res.status(500).send("Error renaming voter");
    }
});

app.post("/removeVoter", async (req, res) => {
    const { voterAddress } = req.body;
    try {
        const tx = await contractInstance.removeVoter(voterAddress);
        await tx.wait();
        res.send("Voter removed successfully");
    } catch (error) {
        console.error("Error removing voter", error);
        res.status(500).send("Error removing voter");
    }
});

app.post("/vote", async (req, res) => {
    const { candidateId } = req.body;
    try {
        const tx = await contractInstance.vote(candidateId);
        await tx.wait();
        res.send("Vote cast successfully");
    } catch (error) {
        console.error("Error casting vote", error);
        res.status(500).send("Error casting vote");
    }
});

app.post("/startVotingPhase", async (req, res) => {
    try {
        const tx = await contractInstance.startVotingPhase();
        await tx.wait();
        res.send("Voting phase started successfully");
    } catch (error) {
        console.error("Error starting voting phase", error);
        res.status(500).send("Error starting voting phase");
    }
});

app.post("/finalizeElection", async (req, res) => {
    try {
        const tx = await contractInstance.finalizeElection();
        await tx.wait();
        const candidates = await contractInstance.getTopCandidates(10);
        res.send(candidates);
    } catch (error) {
        console.error("Error finalizing election", error);
        res.status(500).send("Error finalizing election");
    }
});

app.listen(port, function () {
    console.log("App is listening on port 3000");
});