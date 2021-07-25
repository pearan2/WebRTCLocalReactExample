import { useEffect, useRef } from "react";

//
// navigator.mediaDevices.getUserMedia(constraints)
//	.then(successCB(mediaStream: MediaStream))
//  .catch(failCB(error :any))

// constraints : MediaStreamConstraints = {}
// 이 안에 들어가는 옵션은 https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints 참조

// MediaStream.getVideoTracks() 로 비디오 트랙 배열을 가져올 수 있다
// 그리고 여기서 비디오 트랙으로 접근해서 세팅값을 알아 볼 수 있다
// MediaStream.getVideoTracks().getSettings()

// 그리고 <video> 에 style 값에 filter 를 이리 저리 만져서 재미있는 필터를 씌울 수 있다.
// filter : blur(4px) invert(1) opacity(0.5) hue-rotate(180deg) saturate(200%)
//           블러        색반전       투명도          색 전환            색대비

const App = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    let localMediaStream: MediaStream | null = null;
    if (videoRef.current) {
      const mediaStreamConstraints: MediaStreamConstraints = {
        video: true,
      };
      navigator.mediaDevices
        .getUserMedia(mediaStreamConstraints)
        .then((mediaStream: MediaStream) => {
          localMediaStream = mediaStream;
          console.log(localMediaStream.getVideoTracks()[0].getSettings());
          videoRef.current!.srcObject = mediaStream;
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [videoRef.current]);

  return (
    // style 에서 width 를 정해주지 않으면 영상의 크기에 따라 비디오 늘어난다.
    <video style={{ width: "320px" }} autoPlay ref={videoRef}></video>
  );
};

export default App;
