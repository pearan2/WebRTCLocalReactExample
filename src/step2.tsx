import { useEffect, useRef } from "react";
import adapter from "webrtc-adapter";

// 볼륨 컨트롤러 만들기 https://stackoverflow.com/questions/33322681/checking-microphone-volume-in-javascript

const App = () => {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const localPeerConnection = useRef<RTCPeerConnection | null>(null);
  const remotePeerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (localVideo.current && remoteVideo.current) {
      const logVideoLoaded = (event: Event) => {
        const video = event.target as HTMLVideoElement;
        console.log(
          `${video.id} videoWidth: ${video.videoWidth}px, videoHeight: ${video.videoHeight}px`
        );
      };

      localVideo.current!.addEventListener("loadedmetadata", logVideoLoaded);
      remoteVideo.current!.addEventListener("loadedmetadata", logVideoLoaded);
    }
  }, [localVideo.current, remoteVideo.current]);

  const startAction = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    // define constraints
    const mediaStreamConstraints: MediaStreamConstraints = {
      video: true,
      audio: false,
    };

    navigator.mediaDevices
      .getUserMedia(mediaStreamConstraints)
      .then((mediaStream: MediaStream) => {
        localVideo.current!.srcObject = mediaStream;
        localStream.current = mediaStream;
        console.log("Received local Stream");
      })
      .catch((error) => {
        console.log(`getUserMedia Error : ${error.toString()}`);
      });
  };

  const callAction = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    console.log("Call Action Started..");
    // Get local media stream tracks.
    const videoTracks = localStream.current!.getVideoTracks();
    const audioTracks = localStream.current!.getAudioTracks();
    if (videoTracks.length > 0) {
      console.log(`Using video device: ${videoTracks[0].label}`);
    }
    if (audioTracks.length > 0) {
      console.log(`Using audio device: ${audioTracks[0].label}`);
    }

    // Create peer connections and add behavior
    localPeerConnection.current = new RTCPeerConnection();
    console.log("Created local peer connection object");
    remotePeerConnection.current = new RTCPeerConnection();
    console.log("Created remote peer connection object");

    const handleConnection = (event: RTCPeerConnectionIceEvent) => {
      console.log("handleConnection fired");
      const peerConnection = event.target as RTCPeerConnection;
      const icecandidate = event.candidate;

      if (icecandidate) {
        const newIceCandidate = new RTCIceCandidate(icecandidate);
        const otherPeer =
          peerConnection === localPeerConnection.current!
            ? remotePeerConnection.current!
            : localPeerConnection.current!;

        otherPeer
          .addIceCandidate(newIceCandidate)
          .then(() => {
            console.log(`addIceCandidate success.`);
          })
          .catch((error) => {
            console.log(
              peerConnection === localPeerConnection.current!
                ? "local"
                : "remote"
            );
            console.log(`failed to add ICE candidate ${error.toString()}`);
          });
      }
    };

    localPeerConnection.current.addEventListener(
      "icecandidate",
      handleConnection
    );
    localPeerConnection.current.addEventListener(
      "connectionstatechange",
      (event) => {
        const peerConnection = event.target as RTCPeerConnection;
        console.log(peerConnection.connectionState);
      }
    );
    remotePeerConnection.current.addEventListener(
      "connectionstatechange",
      (event) => {
        const peerConnection = event.target as RTCPeerConnection;
        console.log(peerConnection.connectionState);
      }
    );

    remotePeerConnection.current.addEventListener(
      "icecandidate",
      handleConnection
    );
    remotePeerConnection.current.addEventListener("track", (event) => {
      console.log("addstream event call");
      console.log(event.streams.length);
      remoteVideo.current!.srcObject = event.streams[0];
    });

    localPeerConnection.current.addTrack(
      localStream.current!.getTracks()[0],
      localStream.current!
    );

    const offerOptions: RTCOfferOptions = {
      offerToReceiveVideo: true,
    };
    localPeerConnection.current
      .createOffer(offerOptions)
      .then((description: RTCSessionDescriptionInit) => {
        console.log(`Offer from localPeerConnection`);
        console.log("localPeerConnection setLocalDescription start");
        localPeerConnection
          .current!.setLocalDescription(description)
          .then(() => {
            console.log("set LocalDescription Success");
          })
          .catch((error) => {
            console.log(`set LocalDescription Fail ${error.toString()}`);
          });

        remotePeerConnection
          .current!.setRemoteDescription(description)
          .then(() => {
            console.log("set remoteDescription Success");
            console.log("remotePeerConnection createAnswer start");
          })
          .catch((error) => {
            console.log(`set remoteDescription Fail ${error.toString()}`);
          });
        remotePeerConnection.current!.createAnswer().then((desc) => {
          console.log(`Answer from remotePeerConnection`);
          console.log("remotePeerConnection setLocalDescription start.");
          remotePeerConnection
            .current!.setLocalDescription(desc)
            .then(() => {
              console.log("set remote Description Success");
            })
            .catch((error) => {
              console.log(`set remoteDescription Fail ${error.toString()}`);
            });

          console.log("localPeerConnection setRemoteDescription start");
          localPeerConnection
            .current!.setRemoteDescription(desc)
            .then(() => {
              console.log("set localDesc from remote success");
            })
            .catch((error) => {
              console.log(
                `set localDesc from remote fail : ${error.toString()}`
              );
            });
        });
      });
  };

  const callHangUp = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    remotePeerConnection.current!.close();
  };

  return (
    <>
      <video
        style={{ width: "320px" }}
        autoPlay
        playsInline
        ref={localVideo}
      ></video>
      <video
        style={{ width: "320px" }}
        autoPlay
        playsInline
        ref={remoteVideo}
      ></video>
      <div>
        <button onClick={startAction}>Start</button>
        <button onClick={callAction}>Call</button>
        <button onClick={callHangUp}>Hang Up</button>
      </div>
    </>
  );
};

export default App;
