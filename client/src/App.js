import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";
import greenLED from "./images/greenLED.png";
import progressGif from "./images/ezgif-3-5a8433053891.gif";
import { MessageBox } from "./messageBox.js";
import { WinnersBox } from "./winnersBox";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [totalWaves, setTotalWaves] = useState(0);
  const [allWaves, setAllWaves] = useState([]);
  const [progressTextArray, setProgressTextArray] = useState([]);
  const [shouldShowGif, setShouldShowGif] = useState(false);
  const [ethScanURL, setEthScanURL] = useState("");
  const [messageBoxText, setMessageBoxText] = useState("enter a message here");
  const [winnersList, setWinnersList] = useState([]);

  //const contractAddress = "0x324959544492243926B052c800939F7b408eef31"; //Local ganache
  const contractAddress = "0x5B4803f3A52792cF6333aB29d69E6F0740aD7811"; //rinkeby

  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);

        retrieveWaveCount();
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const retrieveWaveCount = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        /*
         * You're using contractABI here
         */
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setTotalWaves(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllWinners = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        /*
         * You're using contractABI here
         */
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        );

        let winners = await wavePortalContract.getWinners();
        console.log("Retrieved Winners", winners);
        setWinnersList(winners);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        setAllWaves([]);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        );

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);

        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          const newWave = {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message,
          };

          setAllWaves((prevState) => [...prevState, newWave]);
          setAllWaves((prevState) =>
            prevState.filter(
              (v, i, a) =>
                a.findIndex((t) => JSON.stringify(t) === JSON.stringify(v)) ===
                i
            )
          );

          retrieveWaveCount();
          console.log("all waves", allWaves);
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        setProgressTextArray([]);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await wavePortalContract.wave(messageBoxText, {
          gasLimit: 300000,
        });
        console.log("Mining...", waveTxn.hash);
        setProgressTextArray((oldArray) => [...oldArray, "Mining..."]);
        setShouldShowGif(true);
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        setEthScanURL("https://rinkeby.etherscan.io/tx/" + waveTxn.hash);
        setProgressTextArray((oldArray) => [...oldArray, "Mined!"]);
        console.log(progressTextArray);
        retrieveWaveCount(); //Update wave count after mining

        wavePortalContract.on("NewWinner", (from, message) => {
          setWinnersList((prev) => [...prev, from]);
          console.log(
            "NewWinner",
            from,
            message,
            "current account",
            currentAccount
          );
          if (currentAccount.toLowerCase === from.toLowerCase) {
            alert("Whoohoo!! You won 0.0001 eth!");
          }
        });
        //getAllWaves();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (event) => {
    setMessageBoxText(event.target.value);
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getAllWaves();
    getAllWinners();
  }, []);

  return (
    <div className="mainContainer">
      {
        //Only render the indicator if account is connected.
        currentAccount && (
          <div className="connectedIndicator">
            <img src={greenLED} className="greenLED" />
            Connected to address ...{currentAccount.slice(-4)}
          </div>
        )
      }

      <div className="dataContainer">
        <MessageBox className="messageBox" waveListArray={allWaves} />
        <WinnersBox className="messaeBox" winnersList={winnersList} />
        <div className="waveCount">
          <h1>Total waves receieved: {totalWaves}</h1>
        </div>
        <div className="header">
          Welcome to the <span>(vapor) </span>
          <div className="wavePortalText">WAVE PORTAL</div>
        </div>

        <div className="bio">
          Welcome to the (vapor) wave portal. The most ??????????????????????????? way to
          send messages over the blockchain! Each message gives the winner a 50%
          chance of winning 0.0001 eth!
        </div>
        <div className="center">
          <input
            className="inputBox"
            type="text"
            value={messageBoxText}
            onChange={handleChange}
          />
          <button className="waveButton" onClick={wave}>
            Wave at Me
          </button>
        </div>
        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <div className="progressText">
          <ul>
            {progressTextArray.map((str) => (
              <li>{str}</li>
            ))}
          </ul>
        </div>
        {ethScanURL && (
          <div className="ethScanURLText">
            See this transaction on{" "}
            <a href={ethScanURL} target="_blank" rel="noopener noreferrer">
              ethscan
            </a>
          </div>
        )}

        {shouldShowGif && (
          <div className="progressGif">
            <img src={progressGif} />
          </div>
        )}
        <div className="aboutSection">
          Deployed to the Rinkeby network at
          <a
            href="https://rinkeby.etherscan.io/address/0x5B4803f3A52792cF6333aB29d69E6F0740aD7811"
            target="_blank"
            rel="noopener noreferrer"
          >
            0x5B4803f3A52792cF6333aB29d69E6F0740aD7811
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;
