const App = () => {
  const peerConnection = new RTCPeerConnection();
  peerConnection.addEventListener("icecandidate", (event) => {
    if (event.candidate) {
      // 교환을 위하여 Signaling server 를 통해 연결을 원하는 Peer 에게 전송
    } else {
      console.log("checking candidate...");
    }
  });

  return <div>Hello</div>;
};

export default App;
